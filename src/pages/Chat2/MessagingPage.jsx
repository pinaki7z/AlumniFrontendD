import React, { useEffect, useState, useRef } from "react";
import UserList from "./UserList";
import Chat2 from "./index";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./style.css";

export default function MessagingPage() {
  const { userId } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentSelectedUserData, setCurrentSelectedUserData] = useState(null);
  const [showUserList, setShowUserList] = useState(!userId);
  const userRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const currentUserId = profile._id;
  const navigate = useNavigate();

  useEffect(() => {
    console.log("userId from URL:", userId);
    setShowUserList(!userId);
    if (userId) {
      setSelectedUser(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSelectedUserData]);

  const handleBackToList = () => {
    navigate('/home/chatv2');
    setShowUserList(true);
    setSelectedUser(null);
  };

  return (
    <div className="h-[calc(100vh-5rem)] bg-gray-50 md:p-4">
      {/* Mobile: Show either user list OR chat */}
      <div className="md:hidden h-full">
        {showUserList ? (
          <div className="h-full bg-white">
            <UserList
              currentUserId={currentUserId}
              selectedUserId={selectedUser}
              onSelectUser={(userId) => {
                setSelectedUser(userId);
                setShowUserList(false);
              }}
              setCurrentSelectedUserData={setCurrentSelectedUserData}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white">
            {/* Mobile back button */}
            <div className="flex items-center p-3 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white">
              <button 
                onClick={handleBackToList}
                className="p-2 rounded-full hover:bg-white/20 transition-colors mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <div className="flex-1">
              <Chat2
                currentUserId={currentUserId}
                otherUserId={userId}
                currentSelectedUserData={currentSelectedUserData}
                setCurrentSelectedUserData={setCurrentSelectedUserData}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Show both side by side */}
      <div className="hidden md:flex h-full max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 lg:w-1/4 border-r border-gray-200 bg-white">
          <UserList
            currentUserId={currentUserId}
            selectedUserId={selectedUser}
            onSelectUser={(userId) => {
              setSelectedUser(userId);
            }}
            setCurrentSelectedUserData={setCurrentSelectedUserData}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-gray-50">
          {userId ? (
            <Chat2
              currentUserId={currentUserId}
              otherUserId={userId}
              currentSelectedUserData={currentSelectedUserData}
              setCurrentSelectedUserData={setCurrentSelectedUserData}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose someone to start chatting with</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
