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

lineSpinner.register()




const TopBar = ({ handleLogout }) => {
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

        toast.success("Logged out successfully!");
        handleLogout();
        window.location.href = "/";

    };

    const handleSearch = async (e) => {
        setSearchLoading(true);
        e.preventDefault();
        console.log('handling search', searchText)

        try {
            // const response = await fetch(`${baseUrl}/search/search?keyword=${searchText}`);
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
            <div className="top-bar">
                <div className="topBar">
                    {/* <div className='top'>
                        <img src={logo} alt="io" width='150px' height='40px' />
                        <div>
                            <a href="/">
                                <button style={{ cursor: 'pointer', backgroundColor: 'rgb(255 255 255 / 15%)' }}><FaHome />Home</button>
                            </a>
                        </div>
                        <div>
                            <OverlayTrigger
                                trigger="click"
                                key='bottom'
                                show={showPopover}
                                placement='bottom'
                                overlay={
                                    <Popover id={`popover-positioned-bottom`}>
                                        <Popover.Body>
                                            <div className='img-job-vide' style={{ flexDirection: 'column', gap: '10px' }}>
                                                <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                                    <a href="/groups/create" style={{ textDecoration: 'none', color: 'black' }}><HiUserGroup style={{ color: 'ffcf63' }} /> Create Group</a>
                                                </label>
                                                <button style={{ backgroundColor: '#f3f3f3', color: 'black', padding: '5px 10px' }} onClick={() => {
                                                    setShowModal(true);
                                                }}><BiSolidBriefcase style={{ color: 'black' }} />Create Job</button>
                                                {showModal && <JobsInt modalShow={showModal} onHideModal={onHideModal} popover={popover} />}
                                                <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                                    <a href="/donations/create" style={{ textDecoration: 'none', color: 'black' }}><BsCurrencyRupee style={{ color: 'c8d1da' }} /> Create Donations</a>
                                                </label>
                                                <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                                    <a href="/sponsorships/create" style={{ textDecoration: 'none', color: 'black' }}><GoSponsorTiers style={{ color: '#d8887d' }} /> Create Sponsorships</a>
                                                </label>
                                            </div>
                                        </Popover.Body>
                                    </Popover>
                                }
                            >
                                <button onClick={() => setShowPopover(!showPopover)} style={{ backgroundColor: '#174873' }}><FaPlus />Create</button>
                            </OverlayTrigger>
                        </div>
                    </div> */}

                    <div className="search" style={{ display: 'flex', width: '67%' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    type="search"
                                    name="search"
                                    id="search"
                                    placeholder="Search for people, forums and groups"
                                    value={searchText}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 40px 10px 10px', border: '1px solid #0a3a4c' }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: '#efeff0',
                                        border: 'none',
                                        padding: '5px',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {searchLoading ? (
                                        <l-line-spinner
                                            size="15"
                                            stroke="3"
                                            speed="1"
                                            color="white"
                                        ></l-line-spinner>
                                    ) : (
                                        <IoSearchSharp style={{ color: '#0a3a4c', width: '25px', height: '25px' }} />
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
                        <div ref={notificationsOptionsRef}>
                            <FaBell style={{ cursor: 'pointer', color: '#0a3a4c' }} onClick={() => {
                                setShowProfileOptions(false);
                                setShowMessages(false);
                                setShowNotifications(true);
                            }} />
                        </div>
                        {showNotifications && (
                            <div className="notifications-card">

                                <NotificationsP />
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', cursor: 'pointer' }} ref={profileOptionsRef}
                            onClick={() => {
                                console.log('clicked image')
                                setShowMessages(false);
                                setShowNotifications(false);
                                setShowProfileOptions(!showProfileOptions);
                            }} >
                            <img src={profile.profilePicture ? profile.profilePicture : profilePic} alt='profile-pic' width='40px' height='40px' style={{ borderRadius: '50%' }} />
                            <p style={{ marginBottom: '0px', color: '#3A3A3A', fontWeight: '600', fontSize: '20px', lineHeight: '24.2px' }}>{profile.firstName}</p>
                        </div>
                        {showProfileOptions && (
                            <ul className="profile-options" >
                                <a href="/home/profile" style={{ textDecoration: 'none', color: 'black' }}><li>Profile</li></a>
                                {/* {(profile.profileLevel === 0 || profile.profileLevel === 1) && (
                                    <a href="/settings" style={{ textDecoration: 'none', color: 'black' }}>
                                        <li>Settings</li>
                                    </a>
                                )} */}
                                <li onClick={logout} style={{ cursor: 'pointer' }}><p>Log out</p></li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

        </>
    )
}

export default TopBar;