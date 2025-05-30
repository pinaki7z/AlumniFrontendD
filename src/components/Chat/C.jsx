// import React, { useState, useEffect, useRef } from 'react';
// import './chat.css';
// import Picture from '../../images/profilepic.jpg';
// import { FaFaceSmile } from 'react-icons/fa6';
// import { FiSend } from 'react-icons/fi';
// import Picker from 'emoji-picker-react';
// import { MdOutlineOpenInNew } from "react-icons/md";
// import { IoMdClose } from "react-icons/io";
// import { IoIosContract } from "react-icons/io";
// import { Link } from 'react-router-dom';
// import Contact from '../../pages/Chat/Contact';
// import { useSelector } from 'react-redux';
// import { useCookies } from 'react-cookie';
// import axios from 'axios';
// import { AiOutlinePaperClip } from "react-icons/ai";
// import { uniqBy } from "lodash";
// import { MdBlock } from "react-icons/md";
// import { toast } from "react-toastify";
// import { IoIosExpand } from "react-icons/io";
// import ChatM from "../../../src/pages/Chat";
// import baseUrl from '../../config';
// const Chat = () => {
//   const [isProfile, setIsProfile] = useState(false);
//   const [ws, setWs] = useState(null);
//   const [onlinePeople, setOnlinePeople] = useState({});
//   const [offlinePeople, setOfflinePeople] = useState({});
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   let [selectedUsername, setSelectedUsername] = useState('');
//   const [newMessageText, setNewMessageText] = useState('');
//   const profile = useSelector((state) => state.profile);
//   const [messages, setMessages] = useState([]);
//   const divUnderMessages = useRef();
//   const [cookie, setCookie] = useCookies('token');
//   const [showBlockModal, setShowBlockModal] = useState(false);
//   const [blockedByUsers, setBlockedByUsers] = useState([]);
//   const [blockedUsers, setBlockedUsers] = useState([]);
//   const [blockLoading, setBlockLoading] = useState(false);




//   const handleChatbox = (activity, username) => {
//     console.log('username handlechatbox', username)
//     setIsProfile(activity);
//     setSelectedUsername(username);
//     setShowBlockModal(false)
//   };




//   const [inputStr, setInputStr] = useState('');
//   const [showPicker, setShowPicker] = useState(false);

//   const onEmojiClick = (event, emojiObject) => {
//     setInputStr(prevInput => prevInput + emojiObject.emoji);
//     setShowPicker(false);
//   };

//   const fetchBlockedByUsers = async () => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/${profile._id}/blockedByUsers`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch blocked by users');
//       }
//       const data = await response.json();
//       setBlockedByUsers(data.blockedByUserIds); // Assuming the response contains an object with blockedByUserIds array
//     } catch (error) {
//       console.error('Error fetching blocked by users:', error.message);
//       // Optionally handle the error here
//     }
//   };
//   const fetchBlockedUsers = async () => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/${profile._id}/blockedUsers`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch blocked by users');
//       }
//       const data = await response.json();
//       setBlockedUsers(data.blockedUsers);
//     } catch (error) {
//       console.error('Error fetching blocked by users:', error.message);

//     }
//   };

//   console.log('blocked by', blockedByUsers)
//   console.log('blocked users', blockedUsers)



//   useEffect(() => {
//     fetchBlockedByUsers();
//     fetchBlockedUsers();
//     connectToWs();

//     return () => {
//       disconnectFromWs();
//     };
//   }, []);

//   useEffect(() => {
//     fetchBlockedByUsers();
//     fetchBlockedUsers();

//   }, [selectedUserId]);

//   const connectToWs = () => {
//     console.log("Connecting to WS");
    
//     // Ensure we don't create multiple connections
//     if (ws && ws.readyState !== WebSocket.CLOSED) {
//       console.log("WebSocket is already connected or connecting.");
//       return;
//     }
  
//     const newWs = new WebSocket('wss://54.242.12.119:5000/');
    
//     newWs.addEventListener('open', () => {
//       console.log("WebSocket connection opened.");
//     });
    
//     newWs.addEventListener('close', () => {
//       console.log("WebSocket connection closed. Attempting to reconnect...");
//       setTimeout(connectToWs, 3000); 
//     });
  
//     newWs.addEventListener('message', handleMessage);
    
//     setWs(newWs);
//   };
//   console.log('ws creation', ws)

//   const disconnectFromWs = () => {
//     console.log("Disconnecting from WS");
//     console.log('ws', ws)
//     if (ws) {
//       console.log('ws present for deletion')
//       ws.close();
//       setWs(null);
//       console.log('WebSocket connection closed');
//     }
//   };



//   const showOnlinePeople = (peopleArray) => {
//     const people = {};
//     peopleArray.forEach(({ userId, username }) => {
//       people[userId] = username;
//     })
//     setOnlinePeople(people);
//   }
//   const handleMessage = (ev) => {
//     const messageData = JSON.parse(ev.data);
//     console.log({ ev, messageData });
//     if ('online' in messageData) {
//       console.log('online')
//       showOnlinePeople(messageData.online)
//     } else if ('text' in messageData) {
//       console.log('text')

//       if (selectedUserId === null) {
//         console.log('messageData', messageData)
//         setSelectedUserId(messageData.sender);
//       }
//       console.log('selecteduserId,messageData sender', selectedUserId, messageData.sender)
//       if (messageData.sender === selectedUserId) {
//         setMessages(prev => ([...prev, { ...messageData }]))
//       }
//     }
//   }
//   console.log('selectedUserId', selectedUserId)

//   const sendMessage = async (ev, file = null) => {
//     console.log('sending message');
//     if (ev) {
//       ev.preventDefault();
//     }

//     if (!ws || ws.readyState !== WebSocket.OPEN) {
//       console.log("WebSocket is not open. Reconnecting...");
//       connectToWs();
//       return;
//     }

//     try {
//       await fetchBlockedByUsers();
//       console.log('blockedByUsers:', blockedByUsers);

//       if (blockedByUsers.includes(selectedUserId)) {
//         console.log("The user has blocked you");
//         return;
//       }

//       ws.send(JSON.stringify({
//         recipient: selectedUserId,
//         text: newMessageText,
//         file,
//       }));

//       if (file) {
//         console.log('file', file);
//         const res = await axios.get(`${process.env.REACT_APP_API_URL}/messages/${selectedUserId}`, {
//           headers: {
//             Authorization: `Bearer ${cookie.token}`,
//           },
//         });
//         console.log('message file', res.data);
//         setMessages(prev => ([
//           ...prev,
//           {
//             file: file.name,
//             sender: profile._id,
//             recipient: selectedUserId,
//             _id: Date.now(),
//             createdAt: Date.now(),
//           },
//         ]));
//       } else {
//         console.log('no file message');
//         setNewMessageText('');
//         setMessages(prev => ([
//           ...prev,
//           {
//             text: newMessageText,
//             sender: profile._id,
//             recipient: selectedUserId,
//             _id: Date.now(),
//             createdAt: Date.now(),
//           },
//         ]));
//       }
//     } catch (error) {
//       console.error('Error sending message:', error.message);
//       // Optionally handle the error here
//     }
//   };






//   const sendFile = (ev) => {
//     if (ev.target.files) {
//       const file = ev.target.files[0];
//       const fileSizeMB = file.size / (1024 * 1024);
//       if (fileSizeMB > 50) {

//         console.log('File size exceeds 50MB. Please select a smaller file.');
//         alert("File size exceeds 50MB. Please select a smaller file.")
//         return;
//       }


//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const base64Data = reader.result.split(',')[1];
//         sendMessage(null, {
//           name: file.name,
//           data: base64Data,
//         });
//       };
//     }
//   };







//   useEffect(() => {
//     const div = divUnderMessages.current;
//     if (div) {
//       div.scrollIntoView({ behavior: 'smooth', block: 'end' })
//     }

//   }, [messages])



//   useEffect(() => {
//     axios.get(`${process.env.REACT_APP_API_URL}/alumni/all/allAlumni`, {
//       headers: {
//         Authorization: `Bearer ${cookie.token}`,
//       },
//     }).then(res => {
//       const offlinePeopleArray = res.data
//         .filter(p => p._id !== profile._id)
//         .filter(p => !Object.keys(onlinePeople).includes(p._id));
//       const offlinePeople = {};
//       offlinePeopleArray.forEach(p => {
//         offlinePeople[p._id] = p;
//       });
//       setOfflinePeople(offlinePeople);
//     });

//   }, [onlinePeople])

//   useEffect(() => {
//     const div = divUnderMessages.current;
//     console.log('selected user id in useEffect', selectedUserId)
//     if (selectedUserId) {

//       axios.get(`${process.env.REACT_APP_API_URL}/messages/${selectedUserId}`, {
//         headers: {
//           Authorization: `Bearer ${cookie.token}`,
//         },
//       }).then(res => {
//         setMessages(res.data);
//       })
//     }

//   }, [selectedUserId])

//   const onlinePeopleExclOurUser = { ...onlinePeople };
//   delete onlinePeopleExclOurUser[profile._id];


//   const messagesWithoutDupes = uniqBy(messages, '_id')

//   const formatCreatedAt = (createdAt) => {
//     const options = { hour: 'numeric', minute: 'numeric', hour12: true };
//     const timeString = new Date(createdAt).toLocaleTimeString(undefined, options);
//     const dateString = new Date(createdAt).toLocaleDateString();

//     return `${timeString} ${dateString}`;
//   };
//   console.log('selected username ', selectedUsername);

//   const handleBlock = () => {
//     console.log('handling block')
//     setShowBlockModal(true);
//   }

//   const handleConfirmBlock = (userId) => {
//     const profileId = profile._id;

//     setBlockLoading(true);
//     axios.put(`${process.env.REACT_APP_API_URL}/alumni/${profileId}/blockUser`, { blockedUserId: userId })
//       .then(response => {
//         console.log('User blocked successfully');
//         setShowBlockModal(false);
//         fetchBlockedByUsers();
//         fetchBlockedUsers();
//         toast.success(`${blockedUsers.includes(selectedUserId) ? 'User unblocked' : 'User blocked'}`);
//         setBlockLoading(false);
//       })
//       .catch(error => {
//         console.error('Error blocking user:', error);
//         // Handle error, if needed
//       });
//   };
//   const handleCancelBlock = () => {
//     setShowBlockModal(false);
//   };
//   console.log('show block modal', showBlockModal)

//   //   const [isFullscreen, setIsFullscreen] = useState(false);
//   //   const toggleFullscreen = () => {
//   //     setIsFullscreen(!isFullscreen);
//   // };
//   // const chatStyle = isFullscreen ? {
//   //   position: 'fixed',
//   //   top: 0,
//   //   left: 0,
//   //   width: '100%',
//   //   height: '100%',
//   //   zIndex: 1000,
//   //   backgroundColor: '#174873',
//   //   display: 'flex',
//   //   flexDirection: 'row', // Assuming you want a column layout when fullscreen
//   // } : {
//   //   width: '100%', // '100%' should be in quotes
//   //   display: 'flex',
//   //   justifyContent: 'space-between',
//   //   padding: '10px',
//   //   backgroundColor: 'black',
//   //   borderRadius: '10px 10px 0 0', // Correct syntax for border-radius
//   //   height: '20%',
//   // };
//   // const [isFullscreen, setIsFullscreen] = useState(false);

//   // const toggleFullscreen = () => {
//   //   const elem = document.querySelector('.profile-chat'); // adjust this selector to target the specific element you want fullscreen
//   //   if (!document.fullscreenElement) {
//   //     elem.requestFullscreen().catch(err => {
//   //       alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
//   //     });
//   //     setIsFullscreen(true);
//   //   } else {
//   //     document.exitFullscreen();
//   //     setIsFullscreen(false);
//   //   }
//   // };

//   // useEffect(() => {
//   //   const handleFullscreenChange = () => {
//   //     setIsFullscreen(!!document.fullscreenElement);
//   //   };

//   //   document.addEventListener("fullscreenchange", handleFullscreenChange);

//   //   return () => {
//   //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
//   //   };
//   // }, []);
//   const [showPopup, setShowPopup] = useState(false);

//   const togglePopup = () => {
//     setShowPopup(!showPopup);
//   };
//   return (
//     <div >

//       <div className='users-ofline' >
//         {Object.keys(onlinePeopleExclOurUser).map(userId => (
//           <Contact
//             key={userId}
//             id={userId}
//             online={true}
//             username={onlinePeopleExclOurUser[userId]}
//             onClick={() => {
//               setSelectedUserId(userId)
//               handleChatbox(true, onlinePeopleExclOurUser[userId])
//             }}
//             selected={userId === selectedUserId}
//           />
//         ))}
//         {Object.keys(offlinePeople).map(userId => (
//           <Contact
//             key={userId}
//             id={userId}
//             online={false}
//             username={offlinePeople[userId].firstName}
//             onClick={() => {
//               setSelectedUserId(userId)
//               handleChatbox(true, offlinePeople[userId].firstName)
//             }}
//             selected={userId === selectedUserId}
//           />
//         ))}
//       </div>
//       {(isProfile && !!selectedUserId) && (
//         <div className='pfl-ch'>
//           <div className='profile-chat'>
//             {/* <div className='chat-style' style={chatStyle}> */}
//             <div className='chat-style' >
//               <div style={{ display: 'flex', }}>
//                 <img src={Picture} style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />
//                 <p style={{ margin: '0px', alignContent: 'center', color: 'white' }}>{selectedUsername}</p>

//               </div>
//               {/* here */}

//               <div className='c-btn' >

//                 <button onClick={togglePopup} ><IoIosExpand style={{ fontSize: '22' }} /></button>
//                 {showPopup && (
//                   <div className="popup-modal" style={{
//                     position: 'fixed',
//                     top: '10%', left: '10%', right: '10%', bottom: '10%',
//                     backgroundColor: 'white',
//                     borderRadius: '10px',
//                     boxShadow: '0 4px 8px rgba(0.5,0.5,0.5,0.5)',
//                     zIndex: 1000,
//                     height: '80%'
//                   }}>


//                     <div className="chat-details">
//                       <ChatM userId={selectedUserId} />
//                     </div>
//                     <div>
//                       <button onClick={togglePopup} style={{ position: 'absolute', top: '5px', right: '10px' }}><IoIosContract style={{ fontSize: '15' }} /></button>

//                     </div>
//                   </div>
//                 )}


//                 {selectedUsername === 'SuperAdmin' ? null : (<button style={{ position: 'relative' }} onClick={handleBlock}><MdBlock style={{ color: 'white' }} />

//                 </button>)}
//                 {showBlockModal && (
//                   <div className="block" style={{
//                     position: 'fixed', top: '50%',
//                     left: '50%', transform: 'translate(-50%, -50%)',
//                     zIndex: '999', color: 'black', fontWeight: '700', backgroundColor: 'mediumturquoise', width: '24vw', padding: '10px', border: 'solid 2px'
//                   }}>
//                     <div className="block-content">
//                       <p>Are you sure you want to {blockedUsers.includes(selectedUserId) ? 'unblock' : 'block'} this user?</p>
//                       <div className="block-buttons" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
//                         {blockLoading ? (
//                           <span>Loading...</span>
//                         ) : (
//                           <>
//                             <button style={{ padding: '0px 22px', borderRadius: '5px' }} onClick={() => handleConfirmBlock(selectedUserId)}>Yes</button>
//                             <button style={{ padding: '0px 22px', borderRadius: '5px' }} onClick={handleCancelBlock}>Cancel</button>
//                           </>
//                         )}
//                       </div>

//                     </div>
//                   </div>
//                 )}
//                 <button onClick={() => handleChatbox(false)}><IoMdClose style={{ fontSize: '22' }} /></button>
//               </div>

//             </div>
//             <div style={{ height: '65%', width: '100%', backgroundColor: '#174873' }}>
//               {!!selectedUserId && (
//                 <div style={{ position: 'relative', height: '100%' }}>
//                   <div style={{ position: 'absolute', overflowY: 'scroll', height: '100%', width: '100%' }}>
//                     {messagesWithoutDupes.map(message => (
//                       <div key={message._id} style={{ textAlign: (message.sender === profile._id ? 'right' : 'left') }}>
//                         <div className={"" + (message.sender === profile._id ? 'myChat' : 'yourChat')} style={{ textAlign: 'left', borderRadius: '6px', padding: '10px', margin: '5px' }}>
//                           {message.text} {formatCreatedAt(message.createdAt)}
//                           {message.file && (
//                             <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
//                               <AiOutlinePaperClip />
//                               <a href={`${process.env.REACT_APP_API_URL}/uploads/${message.file}`} target="_blank" rel="noopener noreferrer">{message.file}</a>
//                             </div>
//                           )
//                           }
//                         </div>
//                       </div>
//                     ))}
//                     <div ref={divUnderMessages}></div>
//                   </div>
//                 </div>

//               )}


//             </div>
//             {(blockedByUsers?.includes(selectedUserId)) ? (
//               <div>The user has blocked you. Learn <a href='#'>more</a></div>
//             ) : (blockedUsers?.includes(selectedUserId)) ? (
//               <div>You have blocked this user. Unblock to continue chat</div>
//             ) : (
//               <div className='msg'>
//                 <label style={{ padding: '10px', backgroundColor: '#e3e5e8', border: 'none', borderRadius: '10%', cursor: 'pointer', textAlign: 'center', width: '20%' }}>
//                   <input type="file" style={{ display: 'none' }} onChange={sendFile} />
//                   <AiOutlinePaperClip style={{ color: 'grey' }} />
//                 </label>
//                 <input type='text' name='text' placeholder='Type a message' value={newMessageText} onChange={ev => setNewMessageText(ev.target.value)} />
//                 <div onClick={sendMessage} style={{ textAlign: 'center', cursor: 'pointer', width: '30%', height: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#a3e3ff' }}>
//                   Send
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chat;