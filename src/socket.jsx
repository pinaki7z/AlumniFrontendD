


// src/socket.js
import { io } from "socket.io-client"; 

const token = document.cookie.split(';').reduce((c, cookie) => {
  const [name, value] = cookie.split('=').map(v => v.trim());
  return name === 'token' ? value : c;
}, '');
console.log("🔌Connecting socket to", process.env.REACT_APP_API_URL, "with token:", token);

const socket = io(process.env.REACT_APP_API_URL, {
  autoConnect: true,            // connect immediately
  transports: ["websocket"],    // no polling fallbacks
  auth: { token },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  pingInterval: 10000,          // send a ping every 10 s
  pingTimeout: 20000,           // wait up to 20 s for a pong
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
