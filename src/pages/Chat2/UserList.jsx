import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../socket";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle, Users as UsersIcon } from "lucide-react";

export default function UserList({ currentUserId, selectedUserId, onSelectUser, setCurrentSelectedUserData }) {
  const navigate = useNavigate();
  const profile = useSelector((s) => s.profile);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_URL;

  // Load users and initialize conversations
  useEffect(() => {
    loadUsers();
  }, [currentUserId, profile]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/alumni/all`, { withCredentials: true });
      let list = response.data.filter(u => u._id !== currentUserId);
      
      if (![0, 1].includes(profile.profileLevel)) {
        list = list.filter(u => [0, 1].includes(u.profileLevel));
      }
      
      setUsers(list);
      await initConversations(list);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const initConversations = async (list) => {
    const convs = {};
    
    await Promise.all(
      list.map(async (u) => {
        try {
          const res = await axios.get(
            `${API}/messages/${currentUserId}/${u._id}`,
            { withCredentials: true }
          );
          const msgs = res.data;
          
          if (msgs.length) {
            const last = msgs[msgs.length - 1];
            const unread = msgs.filter(m =>
              m.recipient === currentUserId && !m.read
            ).length;
            
            convs[u._id] = {
              lastMessage: last.text,
              lastMsgTime: new Date(last.createdAt).getTime(),
              unreadCount: unread,
            };
          }
        } catch (error) {
          console.error(`Error fetching messages for user ${u._id}:`, error);
        }
      })
    );
    
    setConversations(convs);
    setLoading(false);
  };

  // Listen for presence and new messages
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleReceiveMessage = (msg) => {
      setConversations(prev => {
        const conv = { ...prev };
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
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [currentUserId, selectedUserId]);

  // Clear unread count when opening a chat
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

  const markAsRead = async (userId) => {
    try {
      await axios.patch(
        `${API}/messages/${currentUserId}/${userId}/read`,
        {},
        { withCredentials: true }
      );
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  if (loading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#71be95] mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Sort by most recent and apply search filter
  const sorted = [...users].sort((a, b) => {
    const aTime = conversations[a._id]?.lastMsgTime || 0;
    const bTime = conversations[b._id]?.lastMsgTime || 0;
    return bTime - aTime;
  });
  
  const filtered = sorted.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - msgTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return msgTime.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            <p className="text-xs text-gray-500">{filtered.length} conversations</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filtered.map(u => {
              const meta = conversations[u._id] || {};
              const isSelected = u._id === selectedUserId;
              const isOnline = onlineUsers.includes(u._id);
              
              return (
                <div
                  key={u._id}
                  onClick={async () => {
                    onSelectUser(u._id);
                    setCurrentSelectedUserData(u);
                    navigate(`/home/chatv2/${u._id}`);
                    
                    // Mark as read and update local state
                    await markAsRead(u._id);
                    setConversations(prev => ({
                      ...prev,
                      [u._id]: {
                        ...prev[u._id],
                        unreadCount: 0
                      }
                    }));
                  }}
                  className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#71be95]/20 to-[#5fa080]/20 border-[#71be95]/30' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={u.profilePicture || '/images/profilepic.png'}
                      alt={`${u.firstName} ${u.lastName}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                    />
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium text-sm truncate ${
                        isSelected ? 'text-[#0A3A4C]' : 'text-gray-800'
                      }`}>
                        {u.firstName} {u.lastName}
                      </h3>
                      {meta.lastMsgTime && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(meta.lastMsgTime)}
                        </span>
                      )}
                    </div>
                    
                    {meta.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {meta.lastMessage.length > 30 
                          ? `${meta.lastMessage.slice(0, 30)}...` 
                          : meta.lastMessage
                        }
                      </p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {meta.unreadCount > 0 && (
                    <div className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {meta.unreadCount > 99 ? '99+' : meta.unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
