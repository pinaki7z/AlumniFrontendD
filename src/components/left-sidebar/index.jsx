import { Link, useLocation } from 'react-router-dom';
import './left-sidebar.css';
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
import io from "../../images/IO _123.png";

const LeftSidebar = () => {
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
    return (
        <div className='side-bar-resp overflow-y-auto'>
            <div style={{ textAlign: 'center', marginTop: '3em' }}>
                <a href="/home" className="flex justify-center" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                    {/* <img src={io} alt="InsideOut Logo" width="230px" height="110px" style={{ borderRadius: '8px' }} /> */}
                    <img src="/v2/logo2.png" alt="InsideOut Logo" width="230px" height="110px" style={{ borderRadius: '8px' }} />

                </a>
            </div>
            <div className='sideBar'>
                <ul className='mb-8 w-full text-lg'>
                    {sidebarItems.map((item, idx) => (
                        <li key={idx} className={`${isActive(item.path) ? 'bg-[#71be95] text-white' : 'transparent'} rounded-md mb-0.5`}>
                            <Link to={item.path} style={{ textDecoration: 'none' }} className={`${isActive(item.path) ? ' text-white' : ' text-white'} rounded-md mb-0.5`}>
                                {item.icon}
                                <p>{item.label}</p>
                            </Link>
                        </li>
                    ))}

                    {adminItems.map((item, idx) =>
                        item.roles.includes(profile.profileLevel) && (
                              <li key={`admin-${idx}`} className={`${isActive(item.path) ? 'bg-[#71be95] text-white' : 'transparent'} rounded-md mb-0.5`}>
                                <Link to={item.path} className={`${isActive(item.path) ? ' text-white' : ' text-white'} rounded-md mb-0.5`}>
                                    {item.icon}
                                    <p>{item.label}</p>
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </div>
        </div>
    );
};

export default LeftSidebar;
