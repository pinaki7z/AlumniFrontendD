import { Link, useLocation } from 'react-router-dom';
import { 
    FaBriefcase, 
} from 'react-icons/fa';
import { 
    HiUserGroup, 
} from 'react-icons/hi';
import { 
    BsGlobe, 
} from 'react-icons/bs';
import { 
    MdOutlineEvent, 
} from 'react-icons/md';
import { 
    BiNews 
} from 'react-icons/bi';
import { 
    GoSponsorTiers 
} from 'react-icons/go';
import { 
    RxDashboard 
} from 'react-icons/rx';
import { IoIosNotifications } from "react-icons/io";
import { LuHeartHandshake } from 'react-icons/lu';
import { GrGallery, GrUserAdmin } from "react-icons/gr";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from 'react';
import { updateMember } from "../../store/membersSlice";

const LeftSidebar = ({ onNavigate, isMobile = false, isExpanded = false }) => {
    const profile = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const location = useLocation();
    const [hovered, setHovered] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/all`);
                if (response.ok) {
                    const membersData = await response.json();
                    dispatch(updateMember(membersData));
                } else {
                    throw new Error('Failed to fetch members');
                }
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        // fetchMembers(); // Enable if needed
    }, [dispatch]);

    const sidebarItems = [
        { path: '/home', label: 'Dashboard', icon: <RxDashboard /> },
        { path: '/home/members', label: 'Members', icon: <BsGlobe /> },
        {
            path: profile.profileLevel === 0 || profile.profileLevel === 1 
                ? '/home/groups' 
                : '/home/groups/suggested-groups',
            label: 'Groups',
            icon: <HiUserGroup />
        },
        { path: '/home/news', label: 'News', icon: <BiNews /> },
        { path: '/home/donations', label: 'Business Connect', icon: <LuHeartHandshake /> },
        { path: '/home/sponsorships', label: 'Sponsorships', icon: <GoSponsorTiers /> },
        { path: '/home/events', label: 'Events', icon: <MdOutlineEvent /> },
        { path: '/home/jobs', label: 'Jobs/Internships', icon: <FaBriefcase /> },
        { path: '/home/photo-gallery', label: 'Photo Gallery', icon: <GrGallery /> },
        { path: '/home/notifications', label: 'Notifications', icon: <IoIosNotifications /> },
    ];

    // Additional admin-only item
    const adminItems = [
        {
            path: '/home/validate-user',
            label: 'Member C-Panel',
            icon: <GrUserAdmin />,
            roles: [0] // Only profileLevel 0 (super admin)
        }
    ];

    const isActive = (path) => {
        if (path === '/home') {
            return location.pathname === '/home'; // exact match only
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleNavigation = () => {
        if (onNavigate) {
            onNavigate();
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsTransitioning(true);
            setTimeout(() => {
                setHovered(true);
                setIsTransitioning(false);
            }, 100); // Small delay for smooth transition start
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsTransitioning(true);
            setHovered(false);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300); // Match transition duration
        }
    };

    return (
        <div className="relative h-full">
            {/* Base Sidebar - Always 80px wide on desktop */}
            <div 
                className={`h-full bg-gradient-to-b from-[#0A3A4C] to-[#174873] text-white flex flex-col transition-all duration-300 ease-out ${
                    isMobile ? 'w-72' : 'w-20'
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Logo Section */}
                <div className="text-center border-b border-white/10 p-4 transition-all duration-300 ease-out">
                    <Link 
                        to="/home" 
                        className="block"
                        onClick={handleNavigation}
                    >
                        {isMobile ? (
                            <img 
                                src="/v2/logo2.png" 
                                alt="InsideOut Logo" 
                                className="w-40 h-20 mx-auto rounded-lg object-contain transition-all duration-300 ease-out"
                            />
                        ) : (
                            <div className="w-12 h-12 mx-auto bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:bg-white/30 hover:scale-110">
                                <span className="text-2xl font-bold text-white transition-all duration-300 ease-out">I</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                    <nav className="space-y-1">
                        {sidebarItems.map((item, idx) => (
                            <div key={idx} className="relative group">
                                <Link
                                    to={item.path}
                                    onClick={handleNavigation}
                                    className={`
                                        flex items-center rounded-lg transition-all duration-300 ease-out group/item relative
                                        ${isMobile ? 'px-4 py-3' : 'px-2 py-3 justify-center'}
                                        ${isActive(item.path) 
                                            ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium transform' 
                                            : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:scale-105'
                                        }
                                    `}
                                >
                                    <span className={`text-lg flex-shrink-0 transition-all duration-300 ease-out ${
                                        isActive(item.path) ? 'scale-110 text-white' : 'group-hover/item:scale-125 group-hover/item:text-[#71be95]'
                                    } ${isMobile ? 'mr-4' : ''}`}>
                                        {item.icon}
                                    </span>
                                    
                                    {isMobile && (
                                        <>
                                            <span className="font-medium truncate text-sm transition-all duration-300 ease-out">
                                                {item.label}
                                            </span>
                                            {isActive(item.path) && (
                                                <div className="ml-auto w-1 h-6 bg-white rounded-full transition-all duration-300 ease-out"></div>
                                            )}
                                        </>
                                    )}
                                </Link>
                                
                                {/* Enhanced Tooltip for desktop collapsed state */}
                                {!isMobile && (
                                    <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap z-[60] shadow-xl border border-gray-700">
                                        {item.label}
                                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {adminItems.map((item, idx) =>
                            item.roles.includes(profile.profileLevel) && (
                                <div key={`admin-${idx}`}>
                                    <div className="border-t border-white/10 my-3 transition-all duration-300 ease-out"></div>
                                    <div className="relative group">
                                        <Link
                                            to={item.path}
                                            onClick={handleNavigation}
                                            className={`
                                                flex items-center rounded-lg transition-all duration-300 ease-out group/item relative
                                                ${isMobile ? 'px-4 py-3' : 'px-2 py-3 justify-center'}
                                                ${isActive(item.path) 
                                                    ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium transform' 
                                                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:scale-105'
                                                }
                                            `}
                                        >
                                            <span className={`text-lg flex-shrink-0 transition-all duration-300 ease-out ${
                                                isActive(item.path) ? 'scale-110 text-white' : 'group-hover/item:scale-125 group-hover/item:text-[#71be95]'
                                            } ${isMobile ? 'mr-4' : ''}`}>
                                                {item.icon}
                                            </span>
                                            
                                            {isMobile && (
                                                <>
                                                    <span className="font-medium truncate text-sm transition-all duration-300 ease-out">
                                                        {item.label}
                                                    </span>
                                                    {isActive(item.path) && (
                                                        <div className="ml-auto w-1 h-6 bg-white rounded-full transition-all duration-300 ease-out"></div>
                                                    )}
                                                </>
                                            )}
                                        </Link>
                                        
                                        {/* Enhanced Tooltip for desktop collapsed state */}
                                        {!isMobile && (
                                            <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap z-[60] shadow-xl border border-gray-700">
                                                {item.label}
                                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </nav>
                </div>

                {/* Footer Section - Only show on mobile */}
                {isMobile && (
                    <div className="p-4 border-t border-white/10 transition-all duration-300 ease-out">
                        <div className="text-center">
                            <p className="text-xs text-white/60 transition-all duration-300 ease-out">
                                © 2025 InsideOut Platform
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Overlay - Desktop Only with Enhanced Animations */}
            <div 
                className={`absolute top-0 left-0 h-full w-72 bg-gradient-to-b from-[#0A3A4C] to-[#174873] text-white flex flex-col shadow-2xl z-50 transition-all duration-300 ease-out transform ${
                    !isMobile && hovered 
                        ? 'translate-x-0 opacity-100 scale-100' 
                        : 'translate-x-[-100%] opacity-0 scale-95 pointer-events-none'
                }`}
                onMouseEnter={() => !isMobile && setHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    backdropFilter: 'blur(10px)',
                    background: 'linear-gradient(135deg, #0A3A4C 0%, #174873 50%, #0A3A4C 100%)'
                }}
            >
                {/* Logo Section with Slide Animation */}
                <div className="text-center border-b border-white/10 p-6 transition-all duration-300 ease-out">
                    <Link 
                        to="/home" 
                        className="block"
                        onClick={handleNavigation}
                    >
                        <img 
                            src="/v2/logo2.png" 
                            alt="InsideOut Logo" 
                            className={`w-40 h-20 mx-auto rounded-lg object-contain transition-all duration-700 ease-out transform ${
                                hovered ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
                            }`}
                            style={{ transitionDelay: hovered ? '100ms' : '0ms' }}
                        />
                    </Link>
                </div>

                {/* Navigation Items with Staggered Animation */}
                <div className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                    <nav className="space-y-1">
                        {sidebarItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.path}
                                onClick={handleNavigation}
                                className={`
                                    flex items-center px-4 py-3 rounded-lg transition-all duration-400 ease-out group/item relative transform
                                    ${isActive(item.path) 
                                        ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium' 
                                        : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-2 hover:scale-105'
                                    }
                                    ${hovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                                `}
                                style={{ 
                                    transitionDelay: hovered ? `${200 + (idx * 50)}ms` : `${(sidebarItems.length - idx) * 30}ms`
                                }}
                            >
                                <span className={`text-lg flex-shrink-0 transition-all duration-400 ease-out mr-4 ${
                                    isActive(item.path) ? 'scale-110 text-white' : 'group-hover/item:scale-125 group-hover/item:text-[#71be95]'
                                }`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium truncate text-sm transition-all duration-400 ease-out">
                                    {item.label}
                                </span>
                                {isActive(item.path) && (
                                    <div className="ml-auto w-1 h-6 bg-white rounded-full transition-all duration-400 ease-out"></div>
                                )}
                            </Link>
                        ))}

                        {adminItems.map((item, idx) =>
                            item.roles.includes(profile.profileLevel) && (
                                <div key={`admin-${idx}`}>
                                    <div className={`border-t border-white/10 my-3 transition-all duration-400 ease-out transform ${
                                        hovered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                                    }`} 
                                    style={{ 
                                        transitionDelay: hovered ? `${200 + (sidebarItems.length * 50)}ms` : '0ms',
                                        transformOrigin: 'left'
                                    }}></div>
                                    <Link
                                        to={item.path}
                                        onClick={handleNavigation}
                                        className={`
                                            flex items-center px-4 py-3 rounded-lg transition-all duration-400 ease-out group/item relative transform
                                            ${isActive(item.path) 
                                                ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium' 
                                                : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-2 hover:scale-105'
                                            }
                                            ${hovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                                        `}
                                        style={{ 
                                            transitionDelay: hovered ? `${250 + (sidebarItems.length * 50)}ms` : '0ms'
                                        }}
                                    >
                                        <span className={`text-lg flex-shrink-0 transition-all duration-400 ease-out mr-4 ${
                                            isActive(item.path) ? 'scale-110 text-white' : 'group-hover/item:scale-125 group-hover/item:text-[#71be95]'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        <span className="font-medium truncate text-sm transition-all duration-400 ease-out">
                                            {item.label}
                                        </span>
                                        {isActive(item.path) && (
                                            <div className="ml-auto w-1 h-6 bg-white rounded-full transition-all duration-400 ease-out"></div>
                                        )}
                                    </Link>
                                </div>
                            )
                        )}
                    </nav>
                </div>

                {/* Footer Section with Slide Animation */}
                <div className={`p-4 border-t border-white/10 transition-all duration-300 ease-out transform ${
                    hovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: hovered ? `${300 + (sidebarItems.length * 50)}ms` : '0ms' }}>
                    <div className="text-center">
                        <p className="text-xs text-white/60 transition-all duration-400 ease-out">
                            © 2025 InsideOut Platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    transition: background 0.3s ease;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }

                /* Enhanced transition animations */
                * {
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default LeftSidebar;
