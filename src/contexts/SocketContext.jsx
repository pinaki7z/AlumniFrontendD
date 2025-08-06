// src/contexts/SocketContext.jsx
import React, { createContext, useContext } from "react";
import socket from "../socket";

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);

export const useSocket = () => useContext(SocketContext);
