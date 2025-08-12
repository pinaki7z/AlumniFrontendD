import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { User, Settings } from 'lucide-react';
import { IoIosNotifications } from "react-icons/io";
import { useSelector } from 'react-redux';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const MobileBottomNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const profile = useSelector((state) => state.profile);
    
    const notificationCount = 4; // Replace with actual notification count

    const bottomNavItems = [
        {
            path: '/home',
            label: 'Home',
            icon: <RxDashboard size={24} />,
            activeIcon: <RxDashboard size={24} />
        },
        {
            path: '/home/profile',
            label: 'Profile',
            icon: <User size={24} />,
            activeIcon: <User size={24} />
        },
        {
            path: '/home/notifications',
            label: 'Notifications',
            icon: <IoIosNotifications size={26} />,
            activeIcon: <IoIosNotifications size={26} />,
            badge: notificationCount
        },
        {
            path: '/home/profile/profile-settings',
            label: 'Settings',
            icon: <Settings size={22} />,
            activeIcon: <Settings size={22} />
        }
    ];

    const isActive = (path) => {
        if (path === '/home') {
            return location.pathname === '/home';
        }
        return location.pathname === path;
    };

    // Enhanced haptic feedback function with Capacitor Haptics
    const triggerHapticFeedback = async (style = ImpactStyle.Light) => {
        try {
            // Check if running in native Capacitor environment
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                await Haptics.impact({ style });
            } 
            // Fallback for web browsers
            else if ('vibrate' in navigator) {
                // Convert Capacitor impact styles to vibration patterns
                const vibrationMap = {
                    [ImpactStyle.Light]: 50,
                    [ImpactStyle.Medium]: 100,
                    [ImpactStyle.Heavy]: 200
                };
                navigator.vibrate(vibrationMap[style] || 50);
            }
        } catch (error) {
            console.log('Haptics not supported:', error);
            // Final fallback to web vibration
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        }
    };

    // Handle navigation with haptic feedback
    const handleNavigation = async (path, e) => {
        e.preventDefault(); // Prevent default link behavior
        
        // Don't navigate if already on the same page
        if (isActive(path)) {
            // Still provide haptic feedback for active tab taps
            await triggerHapticFeedback(ImpactStyle.Light);
            return;
        }
        
        // Trigger haptic feedback for navigation
        await triggerHapticFeedback(ImpactStyle.Light);
        
        // Small delay to ensure haptic feedback is felt before navigation
        setTimeout(() => {
            navigate(path);
        }, 10);
    };

    // Handle touch start for immediate visual feedback
    const handleTouchStart = async (e) => {
        e.currentTarget.classList.add('scale-95');
    };

    // Handle touch end to restore visual state
    const handleTouchEnd = async (e) => {
        e.currentTarget.classList.remove('scale-95');
    };

    return (
        <>
            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[10] lg:hidden safe-area-bottom">
                <div className="grid grid-cols-4 h-[50px]">
                    {bottomNavItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            onClick={(e) => handleNavigation(item.path, e)}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            className={`relative flex flex-col items-center justify-center space-y-1 transition-all duration-150 active:scale-95 ${
                                isActive(item.path)
                                    ? 'text-[#174873] bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                            }`}
                        >
                            {/* Top indicator for active state */}
                            {isActive(item.path) && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#174873] rounded-b-full nav-active-indicator"></div>
                            )}
                            
                            {/* Icon with badge */}
                            <div className="relative">
                                <div className={`transition-transform duration-200 ${
                                    isActive(item.path) ? 'scale-110' : 'hover:scale-105'
                                }`}>
                                    {isActive(item.path) ? item.activeIcon : item.icon}
                                </div>
                                
                                {/* Notification Badge */}
                                {item.badge ? item.badge > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </div>
                                ) : null}
                            </div>
                            
                            <span className={`text-xs font-medium ${
                                isActive(item.path) ? 'text-[#174873]' : 'text-gray-500'
                            }`}>
                                {/* {item.label} */}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
            
            {/* Spacer to prevent content from being hidden behind the bottom nav */}
            <div className="h-16 lg:hidden"></div>
        </>
    );
};

export default MobileBottomNavigation;
