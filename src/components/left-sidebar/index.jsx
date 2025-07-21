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

    // Determine if sidebar should show full content
    // Mobile: always show full if expanded, Desktop: show full only on hover
    const showFullContent = isMobile ? isExpanded : hovered;

    return (
        <div 
            className={`h-full bg-gradient-to-b from-[#0A3A4C] to-[#174873] text-white flex flex-col transition-all duration-300 ease-in-out ${
                isMobile 
                    ? 'w-72' 
                    : showFullContent 
                        ? 'w-72' 
                        : 'w-20'
            }`}
            onMouseEnter={() => !isMobile && setHovered(true)}
            onMouseLeave={() => !isMobile && setHovered(false)}
        >
            {/* Logo Section */}
            <div className={`text-center transition-all duration-300 ${
                showFullContent ? 'p-6' : 'p-6'
            }`}>
                <Link 
                    to="/home" 
                    className="block"
                    onClick={handleNavigation}
                >
                    {showFullContent ? (
                        <div className='h-[70px]'>

                       </div>
                    ) : (
                       <div className='h-[70px]'>

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
                                    flex items-center rounded-lg transition-all duration-200 group/item relative
                                    ${showFullContent ? 'px-4 py-3' : 'px-2 py-3 justify-center'}
                                    ${isActive(item.path) 
                                        ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium' 
                                        : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                    }
                                `}
                            >
                                <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${
                                    isActive(item.path) ? 'scale-110' : 'group-hover/item:scale-105'
                                } ${showFullContent ? 'mr-4' : ''}`}>
                                    {item.icon}
                                </span>
                                
                                {showFullContent && (
                                    <>
                                        <span className="font-medium truncate text-sm">
                                            {item.label}
                                        </span>
                                        {isActive(item.path) && (
                                            <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                                        )}
                                    </>
                                )}
                            </Link>
                            
                            {/* Tooltip for collapsed state - only show on desktop when not expanded */}
                            {!isMobile && !showFullContent && (
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </div>
                    ))}

                    {adminItems.map((item, idx) =>
                        item.roles.includes(profile.profileLevel) && (
                            <div key={`admin-${idx}`}>
                                <div className="border-t border-white/10 my-3"></div>
                                <div className="relative group">
                                    <Link
                                        to={item.path}
                                        onClick={handleNavigation}
                                        className={`
                                            flex items-center rounded-lg transition-all duration-200 group/item relative
                                            ${showFullContent ? 'px-4 py-3' : 'px-2 py-3 justify-center'}
                                            ${isActive(item.path) 
                                                ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium' 
                                                : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${
                                            isActive(item.path) ? 'scale-110' : 'group-hover/item:scale-105'
                                        } ${showFullContent ? 'mr-4' : ''}`}>
                                            {item.icon}
                                        </span>
                                        
                                        {showFullContent && (
                                            <>
                                                <span className="font-medium truncate text-sm">
                                                    {item.label}
                                                </span>
                                                {isActive(item.path) && (
                                                    <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                                                )}
                                            </>
                                        )}
                                    </Link>
                                    
                                    {/* Tooltip for collapsed state */}
                                    {!isMobile && !showFullContent && (
                                        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
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

            {/* Footer Section - Only show when expanded */}
            {showFullContent && (
                <div className="p-4 border-t border-white/10">
                    <div className="text-center">
                        <p className="text-xs text-white/60">
                            © 2025 InsideOut Platform
                        </p>
                    </div>
                </div>
            )}

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
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default LeftSidebar;
