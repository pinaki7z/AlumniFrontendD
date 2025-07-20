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
import { useEffect } from 'react';
import { updateMember } from "../../store/membersSlice";

const LeftSidebar = ({ onNavigate }) => {
    const profile = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const location = useLocation();

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

    return (
        <div className="h-full bg-gradient-to-b from-[#0A3A4C] to-[#174873] text-white flex flex-col">
            {/* Logo Section */}
            <div className="p-6 text-center border-b border-white/10">
                <Link 
                    to="/home" 
                    className="block"
                    onClick={handleNavigation}
                >
                    <img 
                        src="/v2/logo2.png" 
                        alt="InsideOut Logo" 
                        className="w-40 h-20 mx-auto rounded-lg object-contain"
                    />
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-3 py-4 overflow-y-auto">
                <nav className="space-y-1">
                    {sidebarItems.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.path}
                            onClick={handleNavigation}
                            className={`
                                flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                                ${isActive(item.path) 
                                    ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium' 
                                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                }
                            `}
                        >
                            <span className={`text-lg mr-4 flex-shrink-0 transition-transform duration-200 ${
                                isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'
                            }`}>
                                {item.icon}
                            </span>
                            <span className="font-medium truncate text-sm">
                                {item.label}
                            </span>
                            {isActive(item.path) && (
                                <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                            )}
                        </Link>
                    ))}

                    {adminItems.map((item, idx) =>
                        item.roles.includes(profile.profileLevel) && (
                            <>
                                <div className="border-t border-white/10 my-3"></div>
                                <Link
                                    key={`admin-${idx}`}
                                    to={item.path}
                                    onClick={handleNavigation}
                                    className={`
                                        flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                                        ${isActive(item.path) 
                                            ? 'bg-[#71be95] text-white shadow-lg scale-[1.02] font-medium' 
                                            : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                        }
                                    `}
                                >
                                    <span className={`text-lg mr-4 flex-shrink-0 transition-transform duration-200 ${
                                        isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'
                                    }`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium truncate text-sm">
                                        {item.label}
                                    </span>
                                    {isActive(item.path) && (
                                        <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                                    )}
                                </Link>
                            </>
                        )
                    )}
                </nav>
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-white/10">
                <div className="text-center">
                    <p className="text-xs text-white/60">
                        © 2025 InsideOut Platform
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;
