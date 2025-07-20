import './topbar.css'
import { FaBell } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { LuMessageSquare } from "react-icons/lu";
import { useCookies } from 'react-cookie';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { IoSearchSharp } from "react-icons/io5";
import { Search, ChevronDown, Users, Calendar, UsersIcon, X, Clock, TrendingUp } from "lucide-react";
import { lineSpinner } from 'ldrs';
import profilePic from "../../images/profilepic.jpg";
import { NotificationsP } from '../NotificationsP';
import axios from 'axios';

lineSpinner.register()

const TopBar = ({ handleLogout, onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [cookie, setCookie, removeCookie] = useCookies('token');
    const navigateTo = useNavigate();
    const [loading, setLoading] = useState(true);
    const profile = useSelector((state) => state.profile);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

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

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Perform search API call
    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/search?q=${encodeURIComponent(query)}`
            );
            setSearchResults(response.data || []);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchText) {
                performSearch(searchText);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const logout = () => {
        console.log('logout', cookie.token)
        removeCookie('token');
        handleLogout();
        navigate('/login');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchText.trim()) return;

        // Save to recent searches
        const newRecentSearches = [
            searchText,
            ...recentSearches.filter(s => s !== searchText)
        ].slice(0, 5);
        
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

        navigateTo(`/home/?search=${encodeURIComponent(searchText)}`);
        setShowMobileSearch(false);
        setShowSearchResults(false);
        setSearchText('');
    };

    const handleChange = (e) => {
        setSearchText(e.target.value);
        if (e.target.value.trim()) {
            setShowSearchResults(true);
        }
    };

    const handleSearchFocus = () => {
        if (searchText || recentSearches.length > 0) {
            setShowSearchResults(true);
        }
    };

    const selectSearchResult = (result) => {
        if (result.type === 'user') {
            navigate(`/home/members/${result._id}`);
        } else if (result.type === 'group') {
            navigate(`/home/groups/${result._id}`);
        } else if (result.type === 'event') {
            navigate(`/home/events/${result._id}`);
        }
        setShowSearchResults(false);
        setSearchText('');
    };

    const selectRecentSearch = (search) => {
        setSearchText(search);
        performSearch(search);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Helper function to check if a path is active
    const isActivePath = (path) => {
        return location.pathname.includes(path);
    };

    // Navigation items for desktop
    const navigationItems = [
        {
            name: 'Members',
            path: '/home/members',
            icon: Users,
            active: isActivePath('/members')
        },
        {
            name: 'Groups',
            path: '/home/groups',
            icon: UsersIcon,
            active: isActivePath('/groups')
        },
        {
            name: 'Events',
            path: '/home/events',
            icon: Calendar,
            active: isActivePath('/events')
        }
    ];

    // Trending searches (mock data - replace with real data)
    const trendingSearches = [
        'Alumni meetup',
        'Career opportunities',
        'Tech talks',
        'Entrepreneurship',
        'Networking events'
    ];

    return (
        <>
            {/* Main TopBar with gradient background */}
            <div className="flex items-center justify-between h-16 px-4">
                
                {/* Left Section - Search Bar (Desktop Only) */}
                <div className="hidden lg:flex flex-1 max-w-md" ref={searchRef}>
                    <form onSubmit={handleSearch} className="w-full relative">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-[#0a3a4c]/60" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="search"
                                name="search"
                                id="search"
                                placeholder="Search people, groups, events..."
                                value={searchText}
                                onChange={handleChange}
                                onFocus={handleSearchFocus}
                                className="block w-full pl-12 pr-16 py-3 border-2 border-white/30 rounded-2xl bg-white/90 backdrop-blur-sm text-[#0a3a4c] placeholder-[#0a3a4c]/60 focus:outline-none focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] focus:bg-white transition-all duration-200 shadow-lg"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {searchLoading ? (
                                    <l-line-spinner size="20" stroke="3" speed="1" color="#0a3a4c"></l-line-spinner>
                                ) : (
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:from-[#174873] hover:to-[#0A3A4C] text-white p-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <IoSearchSharp className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-sm">
                                {searchText && searchResults.length > 0 && (
                                    <>
                                        <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] px-4 py-2">
                                            <h3 className="text-white font-medium text-sm">Search Results</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {searchResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectSearchResult(result)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {result.type === 'user' && <Users className="w-4 h-4 text-white" />}
                                                        {result.type === 'group' && <UsersIcon className="w-4 h-4 text-white" />}
                                                        {result.type === 'event' && <Calendar className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate">
                                                            {result.name || result.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {result.type} • {result.department || result.location || 'General'}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {searchText && searchResults.length === 0 && !searchLoading && (
                                    <div className="px-4 py-6 text-center">
                                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">No results found for "{searchText}"</p>
                                        <p className="text-gray-400 text-xs mt-1">Try different keywords</p>
                                    </div>
                                )}

                                {!searchText && recentSearches.length > 0 && (
                                    <>
                                        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                                            <h3 className="text-gray-600 font-medium text-sm flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Recent Searches
                                            </h3>
                                            <button
                                                onClick={clearRecentSearches}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                        <div>
                                            {recentSearches.map((search, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectRecentSearch(search)}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 text-sm text-gray-700"
                                                >
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>{search}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {!searchText && recentSearches.length === 0 && (
                                    <>
                                        <div className="bg-gray-50 px-4 py-2">
                                            <h3 className="text-gray-600 font-medium text-sm flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Trending Searches
                                            </h3>
                                        </div>
                                        <div>
                                            {trendingSearches.map((search, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectRecentSearch(search)}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 text-sm text-gray-700"
                                                >
                                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                                    <span>{search}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Center Section - Navigation Links (Desktop Only) */}
                <div className="hidden lg:flex items-center space-x-1 flex-shrink-0">
                    {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group ${
                                    item.active
                                        ? 'bg-white/20 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <IconComponent className={`w-5 h-5 transition-all duration-200 ${
                                    item.active ? 'scale-110' : 'group-hover:scale-105'
                                }`} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </button>
                        );
                    })}
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

                    {/* Messages Button (Desktop Only) */}
                    <button
                        onClick={() => navigate('/home/chatv2')}
                        className="hidden lg:flex p-2 rounded-full bg-white/20 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                        title="Messages"
                    >
                        <LuMessageSquare className="w-5 h-5" />
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
                            className="flex items-center space-x-2 py-2 px-2 rounded-full bg-white/20 transition-all duration-200 group shadow-lg"
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
                                    
                                    {/* Mobile Messages Link - Only visible on mobile */}
                                    <div className="lg:hidden">
                                        <button
                                            onClick={() => {
                                                navigate('/home/chatv2');
                                                setShowProfileOptions(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-[#3A3A3A] hover:bg-[#174873] hover:text-white transition-colors duration-200 flex items-center space-x-3"
                                        >
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <LuMessageSquare className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="font-medium">Messages</span>
                                        </button>
                                    </div>
                                    
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

            {/* Enhanced Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="lg:hidden fixed inset-0 bg-white z-50 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0A3A4C] to-[#174873] shadow-lg">
                            <h2 className="text-lg font-semibold text-white drop-shadow-sm">Search</h2>
                            <button
                                onClick={() => setShowMobileSearch(false)}
                                className="p-2 rounded-full hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 bg-gradient-to-b from-[#E9F5EF]/30 to-white overflow-y-auto">
                            <form onSubmit={handleSearch} className="w-full mb-6">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-6 w-6 text-[#0a3a4c]/60" />
                                    </div>
                                    <input
                                        type="search"
                                        name="search"
                                        id="mobile-search"
                                        placeholder="Search people, groups, events..."
                                        value={searchText}
                                        onChange={handleChange}
                                        autoFocus
                                        className="block w-full pl-12 pr-16 py-4 text-lg border-2 border-white/50 rounded-2xl bg-white/90 backdrop-blur-sm text-[#0a3a4c] placeholder-[#0a3a4c]/60 focus:outline-none focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] focus:bg-white transition-all duration-200 shadow-lg"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {searchLoading ? (
                                            <l-line-spinner size="24" stroke="3" speed="1" color="#0a3a4c"></l-line-spinner>
                                        ) : (
                                            <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:from-[#174873] hover:to-[#0A3A4C] text-white p-3 rounded-xl transition-all duration-200 shadow-lg">
                                                <IoSearchSharp className="w-6 h-6" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Mobile Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-[#0a3a4c] mb-3 flex items-center gap-2">
                                        <Search className="w-4 h-4" />
                                        SEARCH RESULTS
                                    </h3>
                                    <div className="space-y-2">
                                        {searchResults.map((result, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    selectSearchResult(result);
                                                    setShowMobileSearch(false);
                                                }}
                                                className="w-full p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-left flex items-center space-x-3 hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-xl flex items-center justify-center flex-shrink-0">
                                                    {result.type === 'user' && <Users className="w-5 h-5 text-white" />}
                                                    {result.type === 'group' && <UsersIcon className="w-5 h-5 text-white" />}
                                                    {result.type === 'event' && <Calendar className="w-5 h-5 text-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                                        {result.name || result.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 capitalize">
                                                        {result.type} • {result.department || result.location || 'General'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent/Trending searches */}
                            <div>
                                <h3 className="text-sm font-semibold text-[#0a3a4c]/70 mb-3 flex items-center gap-2">
                                    {recentSearches.length > 0 ? (
                                        <>
                                            <Clock className="w-4 h-4" />
                                            RECENT SEARCHES
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="w-4 h-4" />
                                            TRENDING SEARCHES
                                        </>
                                    )}
                                </h3>
                                <div className="space-y-2">
                                    {(recentSearches.length > 0 ? recentSearches : trendingSearches).map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                selectRecentSearch(search);
                                                setShowMobileSearch(false);
                                            }}
                                            className="w-full p-3 bg-white/70 rounded-xl text-left flex items-center space-x-3 hover:bg-white transition-all duration-200"
                                        >
                                            {recentSearches.length > 0 ? (
                                                <Clock className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span className="text-sm text-gray-700">{search}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                {recentSearches.length > 0 && (
                                    <button
                                        onClick={clearRecentSearches}
                                        className="w-full mt-4 p-2 text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Clear recent searches
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #71be95 transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 1px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #71be95, #5fa080);
                    border-radius: 1px;
                    border: none;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #5fa080, #4d8a66);
                }
            `}</style>
        </>
    );
};

export default TopBar;
