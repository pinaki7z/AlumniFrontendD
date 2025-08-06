import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {useSocket} from "../../contexts/SocketContext";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Send, MoreVertical, Phone, Video } from "lucide-react";

export default function Chat2({ currentSelectedUserData, setCurrentSelectedUserData }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnline] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  const inputRef = useRef();
  const messagesContainerRef = useRef();
  const currentUserId = useSelector((state) => state.profile._id);
  const otherUserId = useParams().userId;

  // Load messages and user data when component mounts or otherUserId changes
  useEffect(() => {
    if (!otherUserId || !currentUserId) return;

    loadMessages();
    fetchUserData();
  }, [otherUserId, currentUserId]);

  // Set up socket listeners
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      // Only add messages involving current conversation
      if (
        (msg.sender === otherUserId && msg.recipient === currentUserId) ||
        (msg.sender === currentUserId && msg.recipient === otherUserId)
      ) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(existingMsg => 
            existingMsg._id === msg._id ||
            (existingMsg.text === msg.text && 
             existingMsg.sender === msg.sender && 
             Math.abs(new Date(existingMsg.createdAt) - new Date(msg.createdAt)) < 1000)
          );
          
          if (exists) return prev;
          
          // Remove any temporary messages and add the real one
          const filtered = prev.filter(m => !m.isTemporary || m.sender !== msg.sender);
          return [...filtered, msg];
        });
      }
    };

    const handleOnlineUsers = (list) => {
      setOnline(list || []);
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [otherUserId, currentUserId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle viewport height changes (mobile keyboard)
  useEffect(() => {
    const handleResize = () => {
      if (messagesContainerRef.current) {
        // Adjust messages container height on mobile when keyboard appears
        const viewportHeight = window.innerHeight;
        const headerHeight = 64; // Approximate header height
        const inputHeight = 80; // Approximate input area height
        const availableHeight = viewportHeight - headerHeight - inputHeight;
        
        if (window.innerWidth < 768) { // Mobile devices
          messagesContainerRef.current.style.height = `${availableHeight}px`;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/messages/${currentUserId}/${otherUserId}`, 
        { withCredentials: true }
      );
      
      setMessages(response.data || []);
      
      // Mark messages as read
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/messages/${currentUserId}/${otherUserId}/read`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (currentSelectedUserData?.id === otherUserId) return;
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/alumni/${otherUserId}`, 
        { withCredentials: true }
      );
      setCurrentSelectedUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async () => {
    const messageText = text.trim();
    if (!messageText) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      sender: currentUserId,
      recipient: otherUserId,
      text: messageText,
      createdAt: new Date().toISOString(),
      isTemporary: true
    };

    // Clear input immediately
    setText("");
    
    // Add temporary message to UI for immediate feedback
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send message via socket
      const payload = { 
        recipient: otherUserId, 
        text: messageText 
      };
      
      socket.emit("send-message", payload);
      
      // Focus back to input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(m => m._id !== tempId));
      
      // Restore text on error
      setText(messageText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#71be95] mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const isOnline = onlineUsers.includes(otherUserId);

  return (
    <div className="flex flex-col h-full bg-white relative custom-scrollbar">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <img
              src={currentSelectedUserData?.profilePicture || '/images/profilepic.png'}
              alt={`${currentSelectedUserData?.firstName} ${currentSelectedUserData?.lastName}`}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-100"
            />
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
              {currentSelectedUserData?.firstName} {currentSelectedUserData?.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              {isOnline ? 'Active now' : 'Last seen recently'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages - Scrollable area between header and input */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gray-50 min-h-0  h-[calc(100vh-4rem-5rem)] max-h-[calc(100vh-19rem)] md:max-h-[calc(100vh-15rem)]"
      >
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm text-center px-4">
              Start a conversation with {currentSelectedUserData?.firstName}
            </p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex justify-center mb-4">
                <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                  {formatDate(date)}
                </span>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-2">
                {msgs.map((m, i) => {
                  const isMe = m.sender === currentUserId;
                  const showTime = i === msgs.length - 1 || 
                    (i < msgs.length - 1 && msgs[i + 1].sender !== m.sender);
                  
                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`
                        max-w-[75%] sm:max-w-[70%] px-3 py-2 rounded-2xl relative
                        ${isMe 
                          ? `bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-br-md ${m.isTemporary ? 'opacity-80' : ''}` 
                          : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"}
                      `}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                          {m.text}
                        </p>
                        {showTime && (
                          <span className={`
                            block text-xs mt-1 
                            ${isMe ? "text-white/70" : "text-gray-400"}
                          `}>
                            {formatTime(m.createdAt)}
                            {m.isTemporary && isMe && (
                              <span className="ml-1">⏳</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all max-h-24 sm:max-h-32"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              style={{
                height: 'auto',
                minHeight: '36px',
                fontSize: '16px' // Prevents zoom on iOS
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, window.innerWidth < 768 ? 96 : 128)}px`;
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className={`p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
              text.trim()
                ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:shadow-lg text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>


    </div>
  );
}
