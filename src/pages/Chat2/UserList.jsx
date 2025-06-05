import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../socket";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UserList({ currentUserId, selectedUserId, onSelectUser, setCurrentSelectedUserData }) {
  const navigate = useNavigate();
  const profile = useSelector((s) => s.profile);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_URL;
  // 1️⃣ Load users and initialize conversations
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/alumni/all`, { withCredentials: true })
      .then(res => {
        let list = res.data.filter(u => u._id !== currentUserId);
        if (![0, 1].includes(profile.profileLevel)) {
          list = list.filter(u => [0, 1].includes(u.profileLevel));
        }
        setUsers(list);
        return list;
      })
      .then(initConversations)
      .catch(console.error);
  }, [currentUserId, profile]);

  const initConversations = async (list) => {
    const convs = {};
    await Promise.all(
      list.map(async (u) => {
        const res  = await axios.get(
          `${API}/messages/${currentUserId}/${u._id}`,
          { withCredentials: true }
        );
        const msgs = res.data;
        if (msgs.length) {
          const last     = msgs[msgs.length - 1];
          const unread   = msgs.filter(m =>
                              m.recipient === currentUserId && !m.read
                            ).length;
          convs[u._id] = {
            lastMessage: last.text,
            lastMsgTime: new Date(last.createdAt).getTime(),
            unreadCount: unread,              // ← now persistent
          };
        }
      })
    );
    setConversations(convs);
    setLoading(false);
  };

  // 2️⃣ Listen for presence and new messages
  useEffect(() => {
    socket.on("online-users", setOnlineUsers);

    socket.on("receive-message", (msg) => {
      setConversations(prev => {
        const conv = { ...prev };
        // Determine which user this message belongs to
        const peerId = msg.sender === currentUserId ? msg.recipient : msg.sender;
        const oldMeta = conv[peerId] || { unreadCount: 0 };
        const isIncoming = msg.recipient === currentUserId;
        const newUnread = isIncoming && peerId !== selectedUserId
          ? (oldMeta.unreadCount || 0) + 1
          : oldMeta.unreadCount || 0;

        conv[peerId] = {
          lastMessage: msg.text,
          lastMsgTime: new Date(msg.createdAt).getTime(),
          unreadCount: newUnread,
        };
        return conv;
      });
    });

    return () => {
      socket.off("online-users");
      socket.off("receive-message");
    };
  }, [currentUserId, selectedUserId]);

  // 3️⃣ Clear unread count when opening a chat
  useEffect(() => {
    if (!selectedUserId) return;
    setConversations(prev => ({
      ...prev,
      [selectedUserId]: {
        ...prev[selectedUserId],
        unreadCount: 0
      }
    }));
  }, [selectedUserId]);

  if (loading) return <div className="p-4">Loading chats…</div>;

  // 4️⃣ Sort by most recent and apply search filter
  const sorted = [...users].sort((a, b) => {
    const aTime = conversations[a._id]?.lastMsgTime || 0;
    const bTime = conversations[b._id]?.lastMsgTime || 0;
    return bTime - aTime;
  });
  const filtered = sorted.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      <input
        type="text"
        className="w-full p-2 rounded-lg border-2 border-gray-300 mb-4"
        placeholder="Search by name…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ul className="space-y-2">
        {filtered.map(u => {
          const meta = conversations[u._id] || {};
          return (
            <li
              key={u._id}
              onClick={async () => {
                onSelectUser(u._id);
                setCurrentSelectedUserData(u);
                navigate(`/home/chatv2/${u._id}`);
                try {
                  await axios.patch(
                    `${API}/messages/${currentUserId}/${u._id}/read`,
                    {},
                    { withCredentials: true }
                  );
                } catch (e) {
                  console.error("Failed to mark read:", e);
                }
                setConversations(prev => ({
                  ...prev,
                  [u._id]: {
                    ...prev[u._id],
                    unreadCount: 0
                  }
                }))
              }}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition
                ${u._id === selectedUserId ? "bg-blue-200" : ""}
                ${onlineUsers.includes(u._id)
                  ? "bg-green-50 hover:bg-green-100"
                  : "hover:bg-blue-100"}`}
            >
              <Avatar
                src={u.profilePicture}
                className="w-8 h-8 mr-3"
              >
                {!u.profilePicture && `${u.firstName[0]}${u.lastName[0]}`}
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {u.firstName} {u.lastName}
                  </span>
                  {meta.lastMsgTime && (
                    <span className="text-xs text-gray-400">
                      {new Date(meta.lastMsgTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                {meta.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {meta.lastMessage.slice(0, 25) + (meta.lastMessage.length > 25 ? "…" : "")}
                  </p>
                )}
              </div>
              {meta.unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {meta.unreadCount}
                </span>
              )}
              {onlineUsers.includes(u._id) && (
                <span className="text-green-500 text-lg ml-1">●</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
