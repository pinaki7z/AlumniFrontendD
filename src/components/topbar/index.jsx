import './topbar.css'
import { FaPlus, FaHome, FaBell } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { BiSolidBriefcase } from 'react-icons/bi';
import JobsInt from '../JobsInt';
import { useState, useEffect, useRef } from 'react';
import { HiUserGroup } from 'react-icons/hi';
import { LuMessageSquare } from "react-icons/lu";
import { BsCurrencyRupee } from 'react-icons/bs';
import { GoSponsorTiers } from 'react-icons/go';
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { Notifications } from './Notifications';
import { closeWebSocket } from '../../store/webSocketSlice';
import WebSocketUtility from '../../utils/webSocketUtility';
import { IoSearchSharp } from "react-icons/io5";
import { SearchedResults } from '../SearchedResults';
import { lineSpinner } from 'ldrs';
import baseUrl from '../../config';
import profilePic from "../../images/profilepic.jpg";
import { NotificationsP } from '../NotificationsP';
import { Drawer, IconButton } from '@mui/material';
import LeftSidebar from '../left-sidebar';

lineSpinner.register()


const TopBar = ({ handleLogout }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showPopover, setShowPopover] = useState(false);
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [cookie, setCookie, removeCookie] = useCookies('token');
    const navigateTo = useNavigate();
    const [loading, setLoading] = useState(true);
    const profile = useSelector((state) => state.profile);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);


    const updateNotificationCount = (count) => {
        setNotificationCount(count); // Update the count from the child component
    };
    const [drawerOpen, setDrawerOpen] = useState(false);


    const toggleDrawer = (open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setDrawerOpen(open);
    };



    const settings = useSelector((state) => {
        if (state.settings[0] === undefined) {
            return state.settings;
        } else {
            return state.settings[0];
        }
    });
    const { brandName, logo } = settings;
    const dispatch = useDispatch();
    const profileOptionsRef = useRef(null);
    const notificationsOptionsRef = useRef(null);

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setLoading(false);
        }
    }, [settings]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                !notificationsOptionsRef.current.contains(event.target) &&
                !profileOptionsRef.current.contains(event.target) &&
                !(event.target.closest('.notifications-card'))
            ) {
                setShowNotifications(false);
                setShowProfileOptions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);



    const onHideModal = (modalVisibility) => {
        setShowModal(modalVisibility);
    };
    const [selectedFile, setSelectedFile] = useState('');
    const handleFileInputChange = (e) => {
        setSelectedFile(e.target.files[0]);
        console.log(selectedFile)

    };
    const popover = (popoverVisibility) => {
        setShowPopover(popoverVisibility);
    }
    const logout = () => {
        console.log('logout', cookie.token)
        removeCookie('token');

        // toast.success("Logged out successfully!");
        handleLogout();
        navigate('/login');

    };

    const handleSearch = async (e) => {
        setSearchLoading(true);
        e.preventDefault();
        console.log('handling search', searchText)

        try {
            // const response = await fetch(`${process.env.REACT_APP_API_URL}/search/search?keyword=${searchText}`);
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            // const data = await response.json();
            navigateTo(`/home/?search=${encodeURIComponent(searchText)}`);
            //setSearchResults(data);
            setSearchLoading(false);
        } catch (error) {

            console.error('Error fetching search results:', error);
            setSearchResults(null);
        }
    };

    const handleChange = (e) => {
        setSearchText(e.target.value);
    };

    console.log('search data results ', searchResults)

    return (
        <>
            <div className="bg-[rgba(111,188,148,0.15)] flex justify-center sticky top-0 z-3 py-2 sm:py-4 pl-[2%]"
            >
                <div className="h-full flex items-center  text-white w-[94%] justify-between md:pr-[70px]"
                >

                    {/* Hamburger Menu for Mobile */}
                    <div className="md:hidden  " style={{ zIndex: 50 }}>
                        <IconButton onClick={toggleDrawer(true)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="36"
                                height="36"
                                fill="currentColor"
                                class="bi bi-list"
                                viewBox="0 0 16 16"
                                className="text-[#004C8A]"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                                />
                            </svg>
                        </IconButton>

                        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)} >
                            <div
                                role="presentation"
                                onClick={toggleDrawer(false)}
                                onKeyDown={toggleDrawer(false)}
                            >
                                <LeftSidebar />
                            </div>
                        </Drawer>
                    </div>

                    <div className="search" style={{ display: 'flex', width: '67%' }}>
                        <form onSubmit={handleSearch} className="flex items-center w-full">
                            <div className="relative w-full bg-[#E9F5EF] border-2 border-[#508f9fa3] rounded-md">
                                <input
                                    type="search"
                                    name="search"
                                    id="search"
                                    placeholder="Search for people, forums, and groups"
                                    value={searchText}
                                    onChange={handleChange}
                                    className="w-full  bg-transparent p-2  outline-none "
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-[#0a3a4c] p-1"
                                >
                                    {searchLoading ? (
                                        <l-line-spinner size="15" stroke="3" speed="1" color="#0a3a4c"></l-line-spinner>
                                    ) : (
                                        <IoSearchSharp className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </form>


                    </div>
                    <div className="profile-list">
                        <LuMessageSquare style={{ cursor: 'pointer', display: 'none' }} onClick={() => {
                            setShowNotifications(false);
                            setShowProfileOptions(false);
                            setShowMessages(!showMessages)
                        }} />
                        {showMessages && (
                            <div className="messages-card">
                                No New Messages
                            </div>
                        )}
                        <div className="relative" ref={notificationsOptionsRef}>
                            <button
                                onClick={() => {
                                    setShowProfileOptions(false);
                                    setShowMessages(false);
                                    setShowNotifications(!showNotifications);
                                }}
                                className="relative p-2 text-[#0a3a4c] hover:text-yellow-600 transition-colors"
                                title="Notifications"
                            >
                                <FaBell className="w-6 h-6" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-[60vw] max-w-[600px] thin-scroller bg-white border border-gray-200 rounded-md shadow-xl z-[99999] overflow-hidden ">
                                    <div className="h-[500px] overflow-y-auto thin-scroller scrollbar-track-gray-100 z-[99999] ">
                                        <NotificationsP sendNotificationCount={updateNotificationCount} topBar={true} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', cursor: 'pointer' }} ref={profileOptionsRef}
                            onClick={() => {
                                console.log('clicked image')
                                setShowMessages(false);
                                setShowNotifications(false);
                                setShowProfileOptions(!showProfileOptions);
                            }} >
                            <img src={profile.profilePicture ? profile.profilePicture : profilePic} alt='profile-pic' className="w-[40px] h-[40px] rounded-full object-cover"
                            />
                            <p className='hidden md:block' style={{ marginBottom: '0px', color: '#3A3A3A', fontWeight: '600', fontSize: '20px', lineHeight: '24.2px' }}>{profile.firstName}</p>
                        </div>
                        {showProfileOptions && (
                           <ul className="absolute top-12 right-2 bg-white list-none p-0 border border-gray-300 shadow-md z-10 w-44 sm:w-48 md:w-[13vw] text-black rounded-md">

                                <li
                                    onClick={() => navigate('/home/profile')}
                                    className="px-4 py-2 cursor-pointer hover:bg-[#174873] hover:text-white"
                                >
                                    Profile
                                </li>
                                {/* Uncomment and adapt when needed
    {(profile.profileLevel === 0 || profile.profileLevel === 1) && (
      <a href="/settings" className="no-underline text-black">
        <li className="px-4 py-2 hover:bg-[#174873] hover:text-white">Settings</li>
      </a>
    )} */}
                                <li
                                    onClick={logout}
                                    className="px-4 py-2 cursor-pointer hover:bg-[#174873] hover:text-white"
                                >
                                    <p>Log out</p>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

        </>
    )
}

export default TopBar;