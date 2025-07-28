// import { io } from 'socket.io-client';

// //const SOCKET_URL = 'http://localhost:5000'; 
// const SOCKET_URL = 'https://api.alumnify.in'; 

// const socket = io(SOCKET_URL, {
//   withCredentials: true,
//   autoConnect: false, 
// });


// export default socket;



// src/socket.js
import { io } from "socket.io-client"; 

const token = document.cookie.split(';').reduce((c, cookie) => {
  const [name, value] = cookie.split('=').map(v => v.trim());
  return name === 'token' ? value : c;
}, '');
console.log("🔌 Connecting socket to", import.meta.env.VITE_API_URL, "with token:", token);

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["polling"],
  auth: { token }
});

// Log connection events
socket.on("connect", () => {
  console.log("✅ Socket connected, id=", socket.id);
});
socket.on("connect_error", err => {
  console.error("❌ Socket connect_error:", err.message);
});
socket.on("error", err => {
  console.error("⚠️ Socket error:", err.message);
});

export default socket;
