import React, { useEffect, useState, useCallback } from "react";
import { Eye, X, CheckCircle, AlertCircle, Bell, Clock, Users, Building, ExternalLink, Upload, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socket from '../../socket'; // Adjust path to your socket file

const typeIcons = {
  job: <Building className="text-blue-600" size={20} />,
  internship: <Users className="text-pink-700" size={20} />,
  event: <Clock className="text-yellow-700" size={20} />,
  post: <Bell className="text-green-700" size={20} />,
  admin: <AlertCircle className="text-red-600" size={20} />,
};

function NotificationCenterPage() {
  const profile = useSelector(state => state.profile);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // **Fetch notifications from API**
  const fetchNotifications = useCallback(async () => {
    if (!profile._id) return;
    
    setLoading(true);
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/user/${profile._id}`);
      const result = await resp.json();
      
      if (result.success) {
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  }, [profile._id]);

  // **Mark notification as read**
  const markAsRead = async (notifId) => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/${notifId}/read`, { 
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (resp.ok) {
        // Update local state immediately (optimistic update)
        setNotifications(prev => 
          prev.map(n => n._id === notifId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // **Remove notification**
  const removeNotif = async (notifId) => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/${notifId}`, { 
        method: "DELETE" 
      });
      
      if (resp.ok) {
        // Update local state immediately (optimistic update)
        setNotifications(prev => prev.filter(n => n._id !== notifId));
      }
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  // **Handle notification click**
  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate to relevant page if URL is provided
    if (notification.meta?.url) {
      navigate(notification.meta.url);
    }
  };

  // **Request browser notification permission**
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  };

  // **Show browser notification**
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico', // Adjust path as needed
        tag: notification._id,
        badge: '/favicon.ico',
        requireInteraction: notification.priority === 'critical' || notification.priority === 'high',
        silent: false
      });

      // Auto-close after 5 seconds (unless it requires interaction)
      if (!browserNotif.requireInteraction) {
        setTimeout(() => browserNotif.close(), 5000);
      }

      // Handle click on browser notification
      browserNotif.onclick = () => {
        window.focus();
        handleNotificationClick(notification);
        browserNotif.close();
      };
    }
  };

  // **Real-time socket event handlers**
  useEffect(() => {
    if (!profile._id) return;

    console.log("🔌 Setting up notification socket listeners for user:", profile._id);

    // **Socket connection status**
    const handleConnect = () => {
      console.log("✅ Socket connected for notifications");
      setIsConnected(true);
      // Join notification room
      socket.emit("join-notification-room", profile._id);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("🔴 Socket connection error:", error);
      setIsConnected(false);
    };

    // **Listen for new notifications**
    const handleNewNotification = (notification) => {
      console.log("📧 New notification received:", notification);
      
      // Add to notifications list (at the top)
      setNotifications(prev => {
        // Avoid duplicates
        const exists = prev.find(n => n._id === notification._id);
        if (exists) return prev;
        
        return [notification, ...prev];
      });
      
      // Show browser notification
      showBrowserNotification(notification);
      
      // Play notification sound (optional)
      // const audio = new Audio('/notification-sound.mp3');
      // audio.play().catch(e => console.log('Could not play notification sound'));
    };

    // **Listen for notification read updates**
    const handleNotificationRead = ({ notificationId }) => {
      console.log("👁️ Notification marked as read:", notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    };

    // **Listen for notification removals**
    const handleNotificationRemoved = ({ notificationId }) => {
      console.log("🗑️ Notification removed:", notificationId);
      setNotifications(prev => 
        prev.filter(n => n._id !== notificationId)
      );
    };

    // Set up socket event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new-notification", handleNewNotification);
    socket.on("notification-read", handleNotificationRead);
    socket.on("notification-removed", handleNotificationRemoved);

    // Check if already connected
    if (socket.connected) {
      handleConnect();
    }

    // Request notification permission on mount
    requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up notification socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("new-notification", handleNewNotification);
      socket.off("notification-read", handleNotificationRead);
      socket.off("notification-removed", handleNotificationRemoved);
    };
  }, [profile._id]);

  // **Initial fetch on mount**
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // **Notification styling**
  const getNotificationStyle = (notification) => {
    if (notification.title === "ID Verification Required") {
      return "bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500";
    }
    
    if (notification.title === "ID Verification Approved") {
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500";
    }
    
    if (notification.title === "ID Verification Rejected") {
      return "bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500";
    }
    
    if (notification.title === "New ID Verification Request") {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500";
    }

    return notification.read ? 'bg-gray-50' : 'bg-gradient-to-br from-[#F2F6FA] to-[#E7EFFA]';
  };

  // **Filter notifications**
  const getStickyWarningNotifications = () => {
    return notifications.filter(n => 
      n.title === "ID Verification Required" && 
      (n.userId === profile._id || n.global)
    );
  };

  const getRegularNotifications = () => {
    return notifications.filter(n => 
      !(n.title === "ID Verification Required" && (n.userId === profile._id || n.global))
    );
  };

  const stickyWarnings = getStickyWarningNotifications();
  const regularNotifications = getRegularNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* **Header with connection status** */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#0A3A4C]">Notification Center</h2>
          
          {/* Connection status indicator */}
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button 
            onClick={fetchNotifications}
            className="text-gray-500 hover:text-[#0A3A4C] transition-colors"
            title="Refresh notifications"
          >
            <Bell size={20} />
          </button>
          
          {/* Unread count */}
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* **Loading state** */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A3A4C]"></div>
          <span className="ml-2 text-gray-600">Loading notifications...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* **Sticky Warning Notifications** */}
          {stickyWarnings.map(notif => (
            <div key={`sticky-${notif._id}`} className="relative">
              <div 
                className={`${getNotificationStyle(notif)} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 animate-pulse-slow`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-red-800 text-lg">{notif.title}</h4>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        URGENT
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        LIVE
                      </span>
                    </div>
                    <div className="text-red-700 text-sm font-medium mb-2">{notif.message}</div>
                    <div className="text-red-600 text-xs mb-3">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-red-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/home/profile/profile-settings');
                        }}
                      >
                        <Upload size={12} className="mr-1 inline" />
                        Upload ID Now
                      </button>
                      <span className="text-xs text-red-600">
                        Days left: {notif.meta?.daysLeft || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* **Regular Notifications** */}
          <div className="divide-y divide-gray-200 rounded-lg shadow border bg-white">
            {regularNotifications.length === 0 && stickyWarnings.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <Bell size={36} className="mx-auto mb-2 text-[#0A3A4C]" />
                <p>No notifications yet.</p>
                <p className="text-sm mt-1">You'll see new notifications here in real-time.</p>
              </div>
            )}
            
            {regularNotifications.map(notif => (
              <div key={notif._id}
                className={`flex items-start gap-3 p-4 transition hover:bg-gray-50 cursor-pointer ${getNotificationStyle(notif)} ${
                  !notif.read ? 'animate-fade-in' : ''
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex-shrink-0">
                  {typeIcons[notif.type] || <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    {notif.global && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Global
                      </span>
                    )}
                    {notif.priority === 'high' && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        High Priority
                      </span>
                    )}
                    {notif.priority === 'critical' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 text-sm">{notif.message}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                  
                  {/* Action buttons for specific notification types */}
                  {notif.title === "New ID Verification Request" && (
                    <button 
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/home/admin/user-verification');
                      }}
                    >
                      <ExternalLink size={12} className="mr-1 inline" />
                      Review Request
                    </button>
                  )}
                  
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#174873] mt-2 hover:underline"
                    >
                      <CheckCircle size={12} /> Mark as read
                    </button>
                  )}
                </div>
                
                {!notif.global && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotif(notif._id);
                    }}
                    className="text-gray-400 hover:text-red-600 ml-1 transition flex-shrink-0"
                    title="Delete notification"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenterPage;
