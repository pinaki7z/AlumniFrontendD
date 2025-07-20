import './topbar.css'
import { FaBell } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { LuMessageSquare } from "react-icons/lu";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { IoSearchSharp } from "react-icons/io5";
import { Search, ChevronDown } from "lucide-react";
import { lineSpinner } from 'ldrs';
import profilePic from "../../images/profilepic.jpg";
import { NotificationsP } from '../NotificationsP';

lineSpinner.register()

const TopBar = ({ handleLogout, onMenuClick }) => {
    const navigate = useNavigate();
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [cookie, setCookie, removeCookie] = useCookies('token');
    const navigateTo = useNavigate();
    const [loading, setLoading] = useState(true);
    const profile = useSelector((state) => state.profile);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const updateNotificationCount = (count) => {
        setNotificationCount(count);
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
                notificationsOptionsRef.current &&
                profileOptionsRef.current &&
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

    const logout = () => {
        console.log('logout', cookie.token)
        removeCookie('token');
        handleLogout();
        navigate('/login');
    };

    const handleSearch = async (e) => {
        setSearchLoading(true);
        e.preventDefault();
        console.log('handling search', searchText)

        try {
            navigateTo(`/home/?search=${encodeURIComponent(searchText)}`);
            setSearchLoading(false);
            setShowMobileSearch(false);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults(null);
        }
    };

    const handleChange = (e) => {
        setSearchText(e.target.value);
    };

    return (
        <>
            {/* Main TopBar with gradient background */}
            <div className="flex items-center justify-between h-16 px-4">
                
                {/* Left Section - Logo/Brand (Mobile) */}
                <div className="flex items-center lg:hidden">
                    <div className="flex items-center">
                        <img 
                            src="/v2/logo2.png" 
                            alt="Logo" 
                            className="h-8 w-auto"
                        />
                    </div>
                </div>

                {/* Center Section - Search Bar (Desktop) */}
                <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-[#0a3a4c]" />
                            </div>
                            <input
                                type="search"
                                name="search"
                                id="search"
                                placeholder="Search people, forums, groups..."
                                value={searchText}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-12 py-3 border-2 border-[#508f9fa3] rounded-full bg-[#E9F5EF] text-[#0a3a4c] placeholder-[#0a3a4c]/60 focus:outline-none focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-all duration-200 shadow-lg"
                            />
                            <button
                                type="submit"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {searchLoading ? (
                                    <l-line-spinner size="20" stroke="3" speed="1" color="#0a3a4c"></l-line-spinner>
                                ) : (
                                    <div className="bg-[#71be95] hover:bg-[#5fa080] text-white p-2 rounded-full transition-colors duration-200 shadow-lg">
                                        <IoSearchSharp className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-1 sm:space-x-3">
                    
                    {/* Mobile Search Button */}
                    <button
                        onClick={() => setShowMobileSearch(true)}
                        className="lg:hidden p-2 rounded-full hover:bg-white/20 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationsOptionsRef}>
                        <button
                            onClick={() => {
                                setShowProfileOptions(false);
                                setShowMessages(false);
                                setShowNotifications(!showNotifications);
                            }}
                            className="relative p-2 rounded-full bg-white/20 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                            title="Notifications"
                        >
                            <FaBell className="w-5 h-5" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse shadow-lg">
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-[95vw] sm:w-[400px] lg:w-[500px] bg-white border border-[#71be95]/30 rounded-xl shadow-2xl z-[99999] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] px-4 py-3">
                                    <h3 className="text-white font-semibold text-lg">Notifications</h3>
                                </div>
                                <div className="h-[300px] sm:h-[400px] overflow-y-auto">
                                    <NotificationsP sendNotificationCount={updateNotificationCount} topBar={true} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileOptionsRef}>
                        <button
                            onClick={() => {
                                setShowMessages(false);
                                setShowNotifications(false);
                                setShowProfileOptions(!showProfileOptions);
                            }}
                            className="flex items-center space-x-2 p-2 rounded-full bg-white/20 transition-all duration-200 group shadow-lg"
                        >
                            <div className="relative">
                                <img 
                                    src={profile.profilePicture || profilePic} 
                                    alt='profile-pic' 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/50 group-hover:border-white transition-colors duration-200 shadow-lg"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#71be95] border-2 border-white rounded-full shadow-sm"></div>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-white font-semibold text-sm max-w-[100px] truncate block drop-shadow-sm">
                                    {profile.firstName}
                                </span>
                                <span className="text-white/70 text-xs drop-shadow-sm">Online</span>
                            </div>
                            <ChevronDown className="hidden sm:block w-4 h-4 text-white/70 group-hover:text-white transition-transform duration-200 group-hover:rotate-180" />
                        </button>

                        {showProfileOptions && (
                            <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-[#71be95]/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] px-4 py-3">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={profile.profilePicture || profilePic} 
                                            alt='profile-pic' 
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <div>
                                            <p className="text-white font-semibold text-sm drop-shadow-sm">{profile.firstName} {profile.lastName}</p>
                                            <p className="text-white/80 text-xs drop-shadow-sm">View profile</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            navigate('/home/profile');
                                            setShowProfileOptions(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-[#3A3A3A] hover:bg-[#174873] hover:text-white transition-colors duration-200 flex items-center space-x-3"
                                    >
                                        <div className="w-8 h-8 bg-[#71be95]/20 rounded-full flex items-center justify-center">
                                            <span className="text-[#71be95] text-sm">👤</span>
                                        </div>
                                        <span className="font-medium">My Profile</span>
                                    </button>
                                    
                                    <div className="border-t border-[#71be95]/20 my-1"></div>
                                    
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowProfileOptions(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                                    >
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-red-600 text-sm">🚪</span>
                                        </div>
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay with gradient */}
            {showMobileSearch && (
                <div className="lg:hidden fixed inset-0 bg-white z-50 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0A3A4C] to-[#174873] shadow-lg">
                            <h2 className="text-lg font-semibold text-white drop-shadow-sm">Search</h2>
                            <button
                                onClick={() => setShowMobileSearch(false)}
                                className="p-2 rounded-full hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 bg-gradient-to-b from-[#E9F5EF]/30 to-white">
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-6 w-6 text-[#0a3a4c]/60" />
                                    </div>
                                    <input
                                        type="search"
                                        name="search"
                                        id="mobile-search"
                                        placeholder="Search people, forums, groups..."
                                        value={searchText}
                                        onChange={handleChange}
                                        autoFocus
                                        className="block w-full pl-12 pr-16 py-4 text-lg border-2 border-[#508f9fa3] rounded-2xl bg-[#E9F5EF] text-[#0a3a4c] placeholder-[#0a3a4c]/60 focus:outline-none focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-all duration-200 shadow-lg"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {searchLoading ? (
                                            <l-line-spinner size="24" stroke="3" speed="1" color="#0a3a4c"></l-line-spinner>
                                        ) : (
                                            <div className="bg-[#71be95] hover:bg-[#5fa080] text-white p-3 rounded-xl transition-colors duration-200 shadow-lg">
                                                <IoSearchSharp className="w-6 h-6" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Recent searches */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-[#0a3a4c]/70 mb-3">RECENT SEARCHES</h3>
                                <div className="space-y-2">
                                    <p className="text-[#0a3a4c]/50 text-sm italic">No recent searches</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopBar;
