// src/pages/MessagingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import UserList from "./UserList";
import Chat2 from "./index";
import { useSelector } from "react-redux";
import { Container } from "@mui/material";
import "./style.css";
import { Route, Routes } from "react-router-dom";
export default function MessagingPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentSelectedUserData, setCurrentSelectedUserData] = useState(null);
  const userRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const currentUserId = profile._id;
  console.log('profile', profile);

  useEffect(() => {
    console.log('selectedUser', selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentSelectedUserData]);

  return (
    <Container maxWidth="xl">
      <div className="flex h-[80vh]">
      <div className="w-1/4 border-r overflow-y-auto thin-scroller" style={{ maxHeight: '100%' }}>
          <UserList
            currentUserId={currentUserId}
            selectedUserId={selectedUser}
            onSelectUser={setSelectedUser}
            setCurrentSelectedUserData={setCurrentSelectedUserData}
          />
        </div>
      <div  className="flex-1">
          <Routes>
          <Route path="/:userId" element={
            <div className="flex-1">
              <Chat2
                currentUserId={currentUserId}
                otherUserId={selectedUser}
                currentSelectedUserData={currentSelectedUserData}
              />
            </div>
          } />
          <Route path="/" element={
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an alumnus to start chatting
            </div>
          } />
        </Routes>
      </div>
      </div>
    </Container>
  );
}

