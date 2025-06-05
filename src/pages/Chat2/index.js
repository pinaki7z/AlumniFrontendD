// src/components/Chat2.jsx
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
// import baseUrlsssss from  "../../config";
import socket from "../../socket";    // singleton import
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function Chat2() {
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState("");
  const [onlineUsers, setOnline]  = useState([]);
  const[currentSelectedUserData, setCurrentSelectedUserData] = useState(null);
  const scrollRef = useRef();
  const currentUserId = useSelector((state) => state.profile._id);
  const otherUserId = useParams().userId;
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/messages/${currentUserId}/${otherUserId}`, { withCredentials: true })
      .then(res => setMessages(res.data))
      .catch(console.error);

    socket.on("receive-message", msg => {
      if (msg.sender === otherUserId && msg.recipient === currentUserId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    socket.on("online-users", list => setOnline(list));
    fetchUserData();

    return () => {
      socket.off("receive-message");
      socket.off("online-users");
    };

  }, [otherUserId]);

  const fetchUserData = ()=>{
    axios
      .get(`${process.env.REACT_APP_API_URL}/alumni/${otherUserId}`, { withCredentials: true })
      .then(res => setCurrentSelectedUserData(res.data))
      .catch(console.error);
  }
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const payload = { recipient: otherUserId, text };
    console.log("send-message payload:", payload, "currentUserId", currentUserId);
    socket.emit("send-message", payload);
    setMessages(prev => [
      ...prev,
      { ...payload, sender: currentUserId, createdAt: new Date() }
    ]);
    setText("");
  };

  return (
    <div className="flex flex-col h-[85vh] md:h-full bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center">
          {currentSelectedUserData?.profilePicture ? (
            <Avatar
              src={currentSelectedUserData.profilePicture}
              alt={currentSelectedUserData.firstName + " " + currentSelectedUserData.lastName}
              className="mr-2"
              sx={{ width: 48, height: 48 }}
            />
          ) : (
            <Avatar className="mr-2" sx={{ width: 48, height: 48 }}>
              {currentSelectedUserData?.firstName?.[0]}
              {currentSelectedUserData?.lastName?.[0]}
            </Avatar>
          )}
          <h3 className="text-lg font-semibold">{currentSelectedUserData?.firstName + " " + currentSelectedUserData?.lastName}</h3>
        </div>
        <span className={`text-sm ${
          onlineUsers.includes(otherUserId) ? "text-green-500" : "text-gray-400"
        }`}>
          {/* {onlineUsers.includes(otherUserId) ? "Online" : "Offline"} */}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 h p-4 overflow-y-auto thin-scroller space-y-4 bg-gray-100">
        {messages.map((m, i) => {
          const isMe = m.sender === currentUserId;
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`
                max-w-[70%] 
                px-4 py-2 
                rounded-lg 
                relative
                ${isMe 
                  ? "bg-blue-500 text-white rounded-br-none" 
                  : "bg-white text-gray-800 rounded-bl-none"}
              `}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className={`
                  block text-xs mt-1 
                  ${isMe ? "text-blue-200" : "text-gray-400"}
                `}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex items-center p-4 bg-gray-50 border-t">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
