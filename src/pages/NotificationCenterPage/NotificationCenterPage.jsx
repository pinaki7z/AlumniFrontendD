import React, { useEffect, useState } from "react";
import { Eye, X, CheckCircle, AlertCircle, Bell, Clock, Users, Building, ExternalLink, Upload, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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

  const fetchNotifications = async () => {
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
  };

  const markAsRead = async (notifId) => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/${notifId}/read`, { 
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (resp.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const removeNotif = async (notifId) => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/notification-center/${notifId}`, { 
        method: "DELETE" 
      });
      
      if (resp.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const stickyWarnings = getStickyWarningNotifications();
  const regularNotifications = getRegularNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0A3A4C]">Notification Center</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A3A4C]"></div>
          <span className="ml-2 text-gray-600">Loading notifications...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sticky Warning Notifications */}
          {stickyWarnings.map(notif => (
            <div key={`sticky-${notif._id}`} className="relative">
              <div 
                className={`${getNotificationStyle(notif)} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200`}
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

          {/* Regular Notifications */}
          <div className="divide-y divide-gray-200 rounded-lg shadow border bg-white">
            {regularNotifications.length === 0 && stickyWarnings.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <Bell size={36} className="mx-auto mb-2 text-[#0A3A4C]" />
                No notifications yet.
              </div>
            )}
            
            {regularNotifications.map(notif => (
              <div key={notif._id}
                className={`flex items-start gap-3 p-4 transition hover:bg-gray-50 cursor-pointer ${getNotificationStyle(notif)}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex-shrink-0">
                  {typeIcons[notif.type] || <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {notif.global && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Global
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
