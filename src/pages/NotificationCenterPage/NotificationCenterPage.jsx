import React, { useEffect, useState, useCallback } from "react";
import {
  Eye, X, CheckCircle, AlertCircle, Bell, Clock, Users, Building,
  ExternalLink, Upload, AlertTriangle, MapPin, DollarSign, Calendar,
  Heart, MessageCircle, ThumbsUp, UserPlus, Share2, Briefcase
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSocket } from "../../contexts/SocketContext";
import profilePicture from "../../images/profilepic.png";
const typeIcons = {
  job: <Building className="text-blue-600" size={20} />,
  internship: <Users className="text-pink-700" size={20} />,
  event: <Clock className="text-yellow-700" size={20} />,
  post: <Bell className="text-green-700" size={20} />,
  admin: <AlertCircle className="text-red-600" size={20} />,
};

// Dummy data for recent activities
const dummyRecentActivities = [
  {
    id: 1,
    type: 'like',
    userName: 'John Doe',
    action: 'liked your post',
    postTitle: 'My experience at Google',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    icon: <Heart className="text-red-500" size={16} />
  },
  {
    id: 2,
    type: 'comment',
    userName: 'Sarah Johnson',
    action: 'commented on your post',
    postTitle: 'Software Engineering Tips',
    comment: 'Great insights! Thanks for sharing.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    icon: <MessageCircle className="text-blue-500" size={16} />
  },
  {
    id: 3,
    type: 'share',
    userName: 'Mike Wilson',
    action: 'shared your post',
    postTitle: 'Career Advice for New Graduates',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    icon: <Share2 className="text-green-500" size={16} />
  },
  {
    id: 4,
    type: 'join',
    userName: 'Emily Chen',
    action: 'joined the group',
    groupName: 'React Developers',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    icon: <UserPlus className="text-purple-500" size={16} />
  },
  {
    id: 5,
    type: 'like',
    userName: 'David Brown',
    action: 'reacted to your comment',
    postTitle: 'Remote Work Best Practices',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: <ThumbsUp className="text-blue-500" size={16} />
  }
];

// Dummy data for job openings
const dummyJobOpenings = [
  {
    _id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    employmentType: 'Full-time',
    applyBy: '2025-08-20',
    locationType: { remote: true, onSite: false, hybrid: false },
    verified: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    _id: 2,
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY',
    salaryMin: 100000,
    salaryMax: 140000,
    currency: 'USD',
    employmentType: 'Full-time',
    applyBy: '2025-08-25',
    locationType: { remote: false, onSite: true, hybrid: true },
    verified: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 3,
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'Remote',
    salaryMin: 80000,
    salaryMax: 110000,
    currency: 'USD',
    employmentType: 'Contract',
    applyBy: '2025-08-30',
    locationType: { remote: true, onSite: false, hybrid: false },
    verified: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 4,
    title: 'Data Scientist',
    company: 'AI Solutions',
    location: 'Boston, MA',
    salaryMin: 130000,
    salaryMax: 170000,
    currency: 'USD',
    employmentType: 'Full-time',
    applyBy: '2025-09-05',
    locationType: { remote: false, onSite: true, hybrid: true },
    verified: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
];

function NotificationCenterPage() {
  const socket = useSocket();
  const profile = useSelector(state => state.profile);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(socket?.connected);
  const [recentActivities] = useState(dummyRecentActivities);
  const [jobOpenings] = useState(dummyJobOpenings);

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
        setNotifications(prev => prev.filter(n => n._id !== notifId));
      }
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  // **Handle notification click**
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

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
        icon: '/favicon.ico',
        tag: notification._id,
        badge: '/favicon.ico',
        requireInteraction: notification.priority === 'critical' || notification.priority === 'high',
        silent: false
      });

      if (!browserNotif.requireInteraction) {
        setTimeout(() => browserNotif.close(), 5000);
      }

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

    const handleConnect = () => {
      console.log("✅ Socket connected for notifications");
      setIsConnected(true);
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

    const handleNewNotification = (notification) => {
      console.log("📧 New notification received:", notification);

      setNotifications(prev => {
        const exists = prev.find(n => n._id === notification._id);
        if (exists) return prev;

        return [notification, ...prev];
      });

      showBrowserNotification(notification);
    };

    const handleNotificationRead = ({ notificationId }) => {
      console.log("👁️ Notification marked as read:", notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    };

    const handleNotificationRemoved = ({ notificationId }) => {
      console.log("🗑️ Notification removed:", notificationId);
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId)
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new-notification", handleNewNotification);
    socket.on("notification-read", handleNotificationRead);
    socket.on("notification-removed", handleNotificationRemoved);

    if (socket.connected) {
      handleConnect();
    }

    requestNotificationPermission();

    return () => {
      // Cleanup on unmount
    };
  }, [profile._id]);

  // **Initial fetch on mount**
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Update the getNotificationStyle function
  const getNotificationStyle = (notification) => {
    // Special styling for specific notification types
    if(notification.read){
       return notification.read
      ? 'bg-gray-50 border border-gray-100 opacity-70'
      : 'bg-white border-l-4 border-blue-500 shadow-sm ring-1 ring-blue-100';
    }
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

    // Enhanced styling for read/unread differentiation
    return notification.read
      ? 'bg-gray-50 border border-gray-100 opacity-70'
      : 'bg-white border-l-4 border-blue-500 shadow-sm ring-1 ring-blue-100';
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

  // **Format time ago**
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // **Format salary**
  const formatSalary = (min, max, currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    if (min) {
      return `${formatter.format(min)}+`;
    }
    return 'Salary not specified';
  };

  return (
    <div className="min-h-screen bg-gray-50 md:p-4 py-2">
      <div className="mx-auto max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8  pb-8">

          {/* **LEFT SIDEBAR - Recent Activities** */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-[#0A3A4C] mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Recent Activity
                </h3>

                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {recentActivities.slice(0, 4).map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={activity.profilePicture || profilePicture}
                        alt={activity.userName}
                        className="w-7 h-7 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {activity.icon}
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {activity.userName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                          {activity.action} {activity.postTitle && (
                            <span className="font-medium">"{activity.postTitle}"</span>
                          )}
                          {activity.groupName && (
                            <span className="font-medium">"{activity.groupName}"</span>
                          )}
                        </p>
                        {activity.comment && (
                          <p className="text-xs text-gray-500 italic mb-1 line-clamp-1">
                            "{activity.comment}"
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* **CENTER - Notifications (Wider)** */}
          <div className="lg:col-span-6 ">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#0A3A4C]">All Notifications</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNotifications}
                    className="text-gray-500 hover:text-[#0A3A4C] transition-colors p-2 rounded-lg hover:bg-gray-100"
                    title="Refresh notifications"
                  >
                    <Bell size={20} />
                  </button>

                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Loading state */}
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

                    {/* Regular Notifications */}
                    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                      {regularNotifications.length === 0 && stickyWarnings.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                          <Bell size={36} className="mx-auto mb-2 text-[#0A3A4C]" />
                          <p>No notifications yet.</p>
                          <p className="text-sm mt-1">You'll see new notifications here in real-time.</p>
                        </div>
                      )}

                      {regularNotifications.map((notif, index) => (
                        <div key={notif._id}
                          className={`flex items-start gap-3 p-4 transition-all duration-200 cursor-pointer ${getNotificationStyle(notif)} ${!notif.read ? 'hover:bg-blue-50 hover:shadow-md' : 'hover:bg-gray-100'
                            } ${index !== 0 ? 'border-t border-gray-200' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex-shrink-0">
                            <div className={`p-1 rounded-full ${!notif.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              {typeIcons[notif.type] || <Bell size={20} />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    NEW
                                  </span>
                                </div>
                              )}
                              {notif.read && (
                                <CheckCircle className="text-gray-400" size={14} />
                              )}
                              {/* Rest of your existing badges */}
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
                            <div className={`text-sm ${!notif.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                              {notif.message}
                            </div>
                            <div className={`text-xs mt-1 ${!notif.read ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(notif.createdAt).toLocaleString()}
                            </div>

                            {/* Rest of your existing content */}
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
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#174873] mt-2 hover:underline hover:text-blue-600 transition-colors"
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
                              className={`transition flex-shrink-0 ${!notif.read
                                  ? 'text-gray-400 hover:text-red-600'
                                  : 'text-gray-300 hover:text-red-500'
                                }`}
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
            </div>
          </div>

          {/* **RIGHT SIDEBAR - Job Openings** */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-[#0A3A4C] mb-4 flex items-center gap-2">
                  <Briefcase size={18} />
                  Latest Jobs
                </h3>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {jobOpenings.slice(0, 2).map(job => (
                    <div key={job._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-xs line-clamp-2">{job.title}</h4>
                        {job.verified && (
                          <CheckCircle className="text-green-500 flex-shrink-0 ml-2" size={12} />
                        )}
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <Building className="text-gray-400" size={10} />
                        <span className="text-xs text-gray-600 font-medium truncate">{job.company}</span>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="text-gray-400" size={10} />
                        <span className="text-xs text-gray-600 truncate">{job.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {job.locationType.remote && (
                          <span className="bg-green-100 text-green-700 text-xs px-1 py-0.5 rounded">
                            Remote
                          </span>
                        )}
                        {job.locationType.hybrid && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">
                            Hybrid
                          </span>
                        )}
                      </div>

                      {job.salaryMin && (
                        <div className="flex items-center gap-1 mb-2">
                          <DollarSign className="text-gray-400" size={10} />
                          <span className="text-xs text-gray-600 truncate">
                            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {job.employmentType}
                        </span>
                        <span className="text-gray-400">
                          {formatTimeAgo(new Date(job.createdAt))}
                        </span>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => navigate('/home/jobs')}
                    className="w-full bg-[#0A3A4C] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#174873] transition-colors"
                  >
                    View All Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenterPage;
