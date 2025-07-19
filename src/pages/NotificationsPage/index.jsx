import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { NotificationsP } from "../../components/NotificationsP";
import { NotificationsDeclined } from "../../components/NotificationsDeclined";
import { useSelector } from "react-redux";
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Users,
  TrendingUp,
  MessageCircle,
  Clock,
  Settings,
  Filter,
  Search,
  MoreHorizontal,ExternalLink,
  Loader2
} from 'lucide-react';

const NotificationsPage = () => {
  const profile = useSelector((state) => state.profile);
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
    total: 0,
    thisWeek: 0,
    unread: 0
  });

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const updateNotificationCount = (count) => {
    setNotificationCount(count);
    setStats(prev => ({ 
      ...prev, 
      pending: count,
      total: count + prev.declined,
      unread: count
    }));
  };

  const updateDeclinedCount = (count) => {
    setDeclinedCount(count);
    setStats(prev => ({ 
      ...prev, 
      declined: count,
      total: prev.pending + count
    }));
  };

  const getStatsCard = (title, value, icon, color, description) => (
    <div className="group bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {value > 0 && title === 'Pending' && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, label, action, count, color = "bg-gray-100" }) => (
    <button
      onClick={action}
      className={`flex items-center gap-3 p-3 sm:p-4 ${color} rounded-xl hover:bg-opacity-80 transition-colors duration-200 w-full text-left`}
    >
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {count > 0 && <p className="text-sm text-gray-600">{count} items</p>}
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
            <div className="bg-[#CEF3DF] p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-white/20 rounded w-48"></div>
                    <div className="h-4 bg-white/20 rounded w-96"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bell size={20} className="sm:size-6 text-[#0A3A4C]" />
                  </div>
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175]">
                    Notifications
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80">
                    Check your latest alerts and stay informed on community updates.
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 sm:p-3 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200">
                  <Filter size={16} className="sm:size-5" />
                </button>
                {isAdmin && (
                  <button className="p-2 sm:p-3 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200">
                    <Settings size={16} className="sm:size-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {getStatsCard(
            "Pending", 
            notificationCount, 
            <Clock size={20} className="text-yellow-600" />, 
            "bg-yellow-100",
            "Awaiting action"
          )}
          {getStatsCard(
            "Approved", 
            stats.approved, 
            <CheckCircle size={20} className="text-green-600" />, 
            "bg-green-100",
            "Recently approved"
          )}
          {getStatsCard(
            "Declined", 
            declinedCount, 
            <X size={20} className="text-red-600" />, 
            "bg-red-100",
            isAdmin ? "Can be restored" : "Rejected requests"
          )}
          {getStatsCard(
            "Total", 
            stats.total, 
            <TrendingUp size={20} className="text-blue-600" />, 
            "bg-blue-100",
            "All notifications"
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickAction
                icon={<BellRing size={16} className="text-yellow-600" />}
                label="Mark All as Read"
                action={() => console.log('Mark all as read')}
                color="bg-yellow-50"
              />
              <QuickAction
                icon={<Filter size={16} className="text-blue-600" />}
                label="Filter by Type"
                action={() => console.log('Filter')}
                color="bg-blue-50"
              />
              {isAdmin && (
                <>
                  <QuickAction
                    icon={<Users size={16} className="text-green-600" />}
                    label="Bulk Approve"
                    action={() => console.log('Bulk approve')}
                    count={notificationCount}
                    color="bg-green-50"
                  />
                  <QuickAction
                    icon={<Settings size={16} className="text-gray-600" />}
                    label="Settings"
                    action={() => console.log('Settings')}
                    color="bg-gray-50"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/home/notifications"
                className={`flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base ${
                  location.pathname === '/home/notifications'
                    ? 'bg-[#0A3A4C] text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <BellRing size={16} />
                <span>All Notifications</span>
                {notificationCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    location.pathname === '/home/notifications'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {notificationCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link
                  to="/home/notifications/declined"
                  className={`flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base ${
                    location.pathname === '/home/notifications/declined'
                      ? 'bg-[#0A3A4C] text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <X size={16} />
                  <span>Declined</span>
                  {declinedCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      location.pathname === '/home/notifications/declined'
                        ? 'bg-white/20 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {declinedCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Routes */}
        <Routes>
          <Route 
            path="/" 
            element={
              <NotificationsP 
                sendNotificationCount={updateNotificationCount} 
                topBar={false}
              />
            }
          />
          {isAdmin ? (
            <Route 
              path="/declined" 
              element={
                <NotificationsDeclined 
                  sendDeclinedCount={updateDeclinedCount}
                />
              }
            />
          ) : (
            <Route 
              path="/declined" 
              element={
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 sm:p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Access Restricted
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You don't have permission to access declined notifications. This section is only available to administrators.
                    </p>
                    <Link
                      to="/home/notifications"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
                    >
                      <Bell size={16} />
                      <span>View All Notifications</span>
                    </Link>
                  </div>
                </div>
              }
            />
          )}
        </Routes>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-gray-600 text-sm">
                Learn how to manage notifications and understand different notification types.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
                <MessageCircle size={16} />
                <span>Help Center</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                <ExternalLink size={16} />
                <span>User Guide</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
