// src/pages/MessagingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import UserList from "./UserList";
import Chat2 from "./index";
import { useSelector } from "react-redux";
import { Container } from "@mui/material";
import { useParams } from "react-router-dom";
import "./style.css";

export default function MessagingPage() {
  const { userId } = useParams(); // ✅ now works as expected
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentSelectedUserData, setCurrentSelectedUserData] = useState(null);
  const userRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const currentUserId = profile._id;

  useEffect(() => {
    console.log("userId from URL:", userId);
  }, [userId]);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSelectedUserData]);

  return (
    <Container maxWidth="xl">
      <div className="grid grid-cols-1  md:flex md:h-[85vh]">
        {/* Sidebar - visible only if userId is NOT present on small screens */}
        <div
          className={`md:w-1/4 border-r overflow-y-auto thin-scroller ${
            userId ? "hidden md:block" : ""
          }`}
          style={{ maxHeight: "100%" }}
        >
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
        <div className="flex-1">
          {userId ? (
            <div className="flex-1 h-full">
              <Chat2
                currentUserId={currentUserId}
                otherUserId={userId}
                currentSelectedUserData={currentSelectedUserData}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an alumnus to start chatting
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
