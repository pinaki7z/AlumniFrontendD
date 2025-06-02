import React, { useEffect, useState, useRef } from 'react';
import profilepic from "../../images/profilepic.jpg";
import './sideWidgets.css';
// import picture from '../../images/pexels-damon-hall-2274725.jpg';
import { HiUsers } from 'react-icons/hi';
import { TbReload } from 'react-icons/tb';
import { BsEnvelopePaperHeartFill, BsFillArrowRightSquareFill } from 'react-icons/bs';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import JobsInt from '../JobsInt';
import { HiUserGroup } from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';
import { GoSponsorTiers } from 'react-icons/go';
import { FaPlus } from 'react-icons/fa';
import { BiSolidBriefcase } from 'react-icons/bi';
import Groups from "../../images/Groups.svg";
import send from "../../images/send.svg";
import { updateProfile } from '../../store/profileSlice';
import { toast } from "react-toastify";
import { lineSpinner } from 'ldrs';
import baseUrl from '../../config';
//import io from 'socket.io-client';
import socket from '../../socket';

lineSpinner.register()

// Default values shown


const SideWidgets = () => {
    const [cookie, setCookie] = useCookies(["access_token"]);
    const profile = useSelector((state) => state.profile);
    const [notifications, setNotifications] = useState([]);
    const members = useSelector((state) => state.member);
    const [showPopover, setShowPopover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isloading, setIsLoading] = useState({});
    const [load, setLoad] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const itemsPerPage = 3;
    const dispatch = useDispatch();
    console.log('notifications1', notifications, profile);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    // const socket = io('http://localhost:5000');
    const [onlineCount, setOnlineCount] = useState(0);
    const [email, setEmail] = useState('');

    //const SOCKET_URL = "http://localhost:5000";
    //const socketRef = useRef(null);
    const socketRef = useRef(socket);


    const popover = (popoverVisibility) => {
        setShowPopover(popoverVisibility);
    };

    const onHideModal = (modalVisibility) => {
        setShowModal(modalVisibility);
    };

    const fetchNotifications = async () => {
        setLoad(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`);
            const sortedNotifications = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setNotifications(sortedNotifications);
        } catch (error) {
            console.log('error', error)
        }
        setLoad(false);
    }

    useEffect(() => {
        fetchNotifications();
    }, [isloading]);

    // useEffect(() => {
    //     return () => {
    //       socket.off('onlineUsers');
    //     };
    //   }, []);

    useEffect(() => {
        // socketRef.current = io(SOCKET_URL, {
        //   withCredentials: true,
        // });
        socketRef.current.connect();

        socketRef.current.on("connect", () => {
            console.log("Connected to socket:", socketRef.current.id);
        });
        socket.on("online-users", list => setOnlineCount(list?.length));

        // socketRef.current.on('onlineUsers', (count) => {
        //     setOnlineCount(count);
        // });


        // socketRef.current.on("message", (data) => {
        //   setMessages((prev) => [...prev, data]);
        // });

        return () => {
            //socketRef.current?.off("message");
            socketRef.current?.off("online-users");
            socketRef.current?.disconnect();
        };
    }, []);

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (
    //             //triggerRef.current &&
    //             !triggerRef.current.contains(event.target)
    //             //&&
    //             //popoverRef.current &&
    //             //!popoverRef.current.contains(event.target)
    //         ) {
    //             console.log('if clicked')
    //             setShowPopover(false);
    //         } else {
    //             console.log('else clicked')
    //             //setShowPopover(!showPopover)
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);

    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);



    const handleInvite = async () => {
        if (!email) return alert("Please enter an email address.");
    
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/invite`, { email });
          alert("Invitation sent successfully!");
          setEmail('');
        } catch (error) {
          console.error("Error sending invite:", error);
          alert("Failed to send invitation.");
        }
      };




    const followingIds = profile?.following?.map((follow) => follow.userId);
    const peopleYouMayKnow = members.filter(member => !followingIds.includes(member._id) && member._id !== profile._id);

    const displayedMembers = peopleYouMayKnow;
    console.log('peopleYouMayKnow', peopleYouMayKnow)
    console.log('followingIds', followingIds)
      console.log('members', members)
    console.log('displayedMembers', displayedMembers)
    const handleFollowToggle = async (memberId, firstName, lastName) => {
        setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: true }));
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${memberId}/follow`, {
                userId: profile._id,
                requestedUserName: `${profile.firstName} ${profile.lastName}`,
                followedUserName: `${firstName} ${lastName}`
            });

            if (response.status === 200) {
                const responseData = await response.data;
                const { alumni } = responseData;
                dispatch(updateProfile(alumni));
                console.log('followed');
                toast.success('Followed');
                if (loading) setLoading(false);
                else setLoading(true);
            }
            setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
        } catch (error) {
            console.error("Error toggling follow status:", error);
            setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
        }
    };

    const timeAgo = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    };

    return (
        <div className="sideWidget-feed">
            <div style={{ float: 'right' }} >
                {/* <OverlayTrigger
                    trigger="click"
                    key='bottom'
                    show={showPopover}
                    placement='bottom'
                    overlay={
                        <Popover id={`popover-positioned-bottom`}
                        >
                            <Popover.Body>
                                <div className='img-job-vide'
                                    style={{ flexDirection: 'column', paddingLeft: '0px' }}
                                >
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <a href="/home/groups/create" style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}><HiUserGroup style={{ color: 'ffcf63' }} /> Create Group</a>
                                    </label>
                                   
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <a href="/home/jobs/create" style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}><HiUserGroup style={{ color: 'ffcf63' }} /> Create a Job </a>
                                    </label>
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <a href="/home/donations/create" style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}><BsCurrencyRupee style={{ color: 'c8d1da' }} /> Create Donations</a>
                                    </label>
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <a href="/home/sponsorships/create" style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}><GoSponsorTiers style={{ color: '#d8887d' }} /> Create Sponsorships</a>
                                    </label>
                                </div>
                            </Popover.Body>
                        </Popover>
                    }
                >
                    <button onClick={() => setShowPopover(!showPopover)} style={{ backgroundColor: '#0a3a4c', color: '#FFFFF0', width: '125px', height: '45px', borderRadius: '8px', border: 'none', fontSize: '20px' }} ref={triggerRef}>Create</button>
                </OverlayTrigger> */}
            </div>

            <div className="w-full bg-[#6FBC9426] border border-[#e0e0e0] shadow-md rounded-lg flex flex-col items-center justify-center py-5 ">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={profile.profilePicture ? profile.profilePicture : profilepic} alt="Profile" className='rounded-full object-cover w-[70px] h-[70px]' />
                    <Link to='/home/profile' style={{ textDecoration: 'none', color: 'black' }}>
                        <p className='text-lg font-semibold mb-2'>{profile.firstName}</p>
                    </Link>
                    {/* <p className='text-sm cursor-pointer  text-green-700 bg-[#6FBC9499] rounded-lg px-1 py-1'>@{profile.firstName}</p> */}
                </div>
                <div style={{ height: '20%' }}>
                    <ul style={{ paddingLeft: '0px', marginBottom: '0px', display: 'flex', gap: '10px' }}>
                        <li style={{ display: 'inline-block', borderRight: '1px solid #e9e9e9', textAlign: 'center', paddingRight: '7px' }}><a href="/home/profile" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'black' }}><span>Posts</span><span style={{ fontWeight: '500', color: '#0a3a4c' }}>5</span></a></li>
                        <li style={{ display: 'inline-block', borderRight: '1px solid #e9e9e9', textAlign: 'center', paddingRight: '7px' }}><a href="/home/profile" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'black' }}><span>Following</span><span style={{ fontWeight: '500', color: '#0a3a4c' }}>{profile.following.length}</span></a></li>
                        <li style={{ display: 'inline-block', textAlign: 'center' }}><a href="/home/profile" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'black' }}><span>Followers</span><span style={{ fontWeight: '500', color: '#0a3a4c' }}>{profile.followers.length}</span></a></li>
                    </ul>
                </div>
            </div>

            <div className='w-full bg-[#6FBC9426] border border-[#e0e0e0] shadow-md rounded-lg flex flex-col items-center justify-center mt-4'>
                <div className="sideWidget2-post-header">
                    <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>People You May Know</p>
                    <button style={{ border: 'none', backgroundColor: '#0a3a4c' }}><TbReload style={{ color: '#F8F8FF' }} /></button>
                </div>
                <div className='w-full px-2 max-h-[300px] overflow-y-auto'>
                    {displayedMembers.map((member, index) => (
                        <div key={member._id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', border: '1px solid #e9e9e9', borderRadius: '10px', width: '100%' }}>
                            <div className='w-full'>
                                <Link
                                    to={`/home/members/${member._id}`} className='w-full'
                                    style={{ textDecoration: "none", color: "black", display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                    {
                                        member.profilePicture ?
                                            <img src={member.profilePicture} className='w-[45px] h-[45px] object-cover rounded-full ' />
                                            : <img src={profilepic} className='w-[45px] h-[45px] object-cover rounded-full ' />
                                    }
                                    <p style={{ marginBottom: '0rem', fontWeight: '500' }}>{member.firstName}</p>
                                </Link>
                            </div>
                            <button onClick={() => handleFollowToggle(member._id, member.firstName, member.lastName)} style={{ backgroundColor: '#71be95', color: 'white', borderRadius: '32px', border: 'none', marginLeft: 'auto', color: '#F8F8FF', padding: '8px 32px', pointer: 'cursor' }}>{isloading[member._id] ? <l-line-spinner
                                size="20"
                                stroke="3"
                                speed="1"
                                color="rgb(19, 97, 117)"
                            ></l-line-spinner> : <>Follow</>}</button>
                        </div>
                    ))}
                    {/* {peopleYouMayKnow.length > displayedMembers.length && (
                        <p onClick={() => setCurrentPage(currentPage + 1)} style={{ color: '#0a3a4c', borderRadius: '10px', borderColor: 'white', padding: '10px', marginTop: '10px', cursor: 'pointer', fontWeight: '500' }}>See More</p>
                    )} */}
                </div>

            </div>
            <div className='online'>
                <p style={{ marginBottom: '0rem', marginTop: '0rem', fontSize: '20px' }}>Online Users</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
                    <img src={Groups} alt='group-icon' />
                    <p style={{ marginBottom: '0rem', marginTop: '0rem' }}>{onlineCount}</p>
                </div>
            </div>
            {/* Latest Activities */}
            {/* <div className="w-full bg-[#6FBC9426] border border-[#e0e0e0] shadow-md rounded-lg flex flex-col items-center justify-center mt-4">
                <div className="sideWidget2-post-header">
                    <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>Latest Activities</p>
                    <button style={{ border: 'none', backgroundColor: '#0a3a4c' }}><TbReload onClick={fetchNotifications} style={{
                        color: '#F8F8FF'
                    }} /></button>
                </div>
                {load ? (
                    <p style={{ textAlign: 'center' }}><l-line-spinner
                        size="20"
                        stroke="3"
                        speed="1"
                        color="rgb(19, 97, 117)"
                    ></l-line-spinner></p>
                ) : notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', margin: '1rem 0' }}>No Latest Activities</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification._id} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '7px', paddingLeft: '15px', paddingRight: '5px', paddingTop: '10px', height: '11vh' }}>

                            <p style={{
                                marginBottom: '0rem', fontSize: '15px',
                                borderRadius: '18px',
                                color: '#36454F'
                            }}>
                                {notification.requestedUserName} started following {notification.followedUserName}
                            </p>
                            <p style={{
                                marginBottom: '0rem', fontSize: '12px',
                                color: '#888'
                            }}>
                                {timeAgo(notification.updatedAt)}
                            </p>
                        </div>
                    ))
                )}
            </div> */}
            <div className='invite'>
                {/* <div>
                    <p style={{ marginBottom: '0rem' }}>Invite Friends</p>
                </div> */}

                {/* <div className='sideWidget-email' style={{ position: 'relative', width: '100%' }}>
                    <input
                        type="text"
                        placeholder='Enter E-mail address'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 40px 10px 10px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={handleInvite}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            padding: '0',
                            cursor: 'pointer'
                        }}
                    >
                        <img src={send} alt='send-icon' style={{ width: '20px', height: '20px' }} />
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default SideWidgets;
