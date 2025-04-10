import { io } from 'socket.io-client';

//const SOCKET_URL = 'http://localhost:5000'; 
const SOCKET_URL = 'https://api.alumnify.in'; 

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, 
});


export default socket;