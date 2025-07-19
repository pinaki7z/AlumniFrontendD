// NotificationsDeclined.jsx - Enhanced Declined Notifications Component
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Download,
  AlertCircle,
  Calendar,
  User,
  X,
  Loader2
} from 'lucide-react';

export const NotificationsDeclined = ({ sendDeclinedCount }) => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [searchUser, setSearchUser] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getDeclinedNotifications();
  }, []);

  const getDeclinedNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/requests/req`);
      const filteredData = response.data.filter(notification => notification.status === true);
      setNotificationList(filteredData);
      if (sendDeclinedCount) {
        sendDeclinedCount(filteredData.length);
      }
    } catch (error) {
      console.error('Error fetching declined notifications:', error);
      toast.error('Failed to load declined notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (notificationId, groupId, memberId, type) => {
    setProcessing(prev => ({ ...prev, [notificationId]: 'restore' }));
    
    try {
      let url = '';
      if (type === 'forum') {
        url = `${process.env.REACT_APP_API_URL}/forums/members/${groupId}`;
      } else if (type === 'group') {
        url = `${process.env.REACT_APP_API_URL}/groups/members/${groupId}`;
      } else if (type === 'ID') {
        url = `${process.env.REACT_APP_API_URL}/alumni/alumni/validateId`;
      }

      await axios.put(url, {
        userId: memberId,
        notificationId: notificationId,
        toDelete: false
      });

      toast.success('Notification restored successfully');
      await getDeclinedNotifications();
    } catch (error) {
      console.error('Error restoring notification:', error);
      toast.error('Failed to restore notification');
    } finally {
      setProcessing(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to permanently delete this notification?')) {
      return;
    }

    setProcessing(prev => ({ ...prev, [notificationId]: 'delete' }));
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/alumni/alumni/deleteNotification`, {
        data: { notificationId }
      });
      
      toast.success('Notification deleted permanently');
      await getDeclinedNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error('Failed to delete notification');
    } finally {
      setProcessing(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchUser.trim()) {
      getDeclinedNotifications();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/search/search/notifications?keyword=${searchUser}`);
      setNotificationList(response.data.filter(notification => notification.status === true));
    } catch (error) {
      console.error("Error searching:", error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const DeclinedNotificationCard = ({ notification }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={20} className="text-red-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Declined
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} />
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="text-gray-900 mb-3">
            <Link
              to={`/members/${notification.userId}`}
              className="font-medium text-[#0A3A4C] hover:underline inline-flex items-center gap-1"
            >
              <User size={14} />
              {notification.requestedUserName}
            </Link>
            <span className="ml-1">
              {notification.ID ? (
                <>
                  requested ID validation.{" "}
                  <button
                    onClick={() => {
                      setSelectedImage(notification.ID);
                      setShowImageModal(true);
                    }}
                    className="text-[#0A3A4C] hover:underline inline-flex items-center gap-1"
                  >
                    <Eye size={12} /> View ID
                  </button>
                </>
              ) : (
                <>
                  requested to join{" "}
                  <span className="font-medium">
                    {notification.groupName || notification.forumName}
                  </span>{" "}
                  {notification.groupName ? "group" : "forum"}.
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleRestore(
                notification._id,
                notification.forumId || notification.groupId || '',
                notification.userId,
                notification.ID ? 'ID' : (notification.forumId ? 'forum' : 'group')
              )}
              disabled={processing[notification._id]}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            >
              {processing[notification._id] === 'restore' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RotateCcw size={16} />
              )}
              <span>Restore</span>
            </button>
            
            <button
              onClick={() => handleDelete(notification._id)}
              disabled={processing[notification._id]}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            >
              {processing[notification._id] === 'delete' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Declined Notifications</h3>
      <p className="text-gray-600">No declined notifications found.</p>
    </div>
  );

  const LoadingState = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
            >
              Search
            </button>
          </form>
        </div>

        {/* Notifications List */}
        {loading ? (
          <LoadingState />
        ) : notificationList.length > 0 ? (
          <div className="space-y-4">
            {notificationList.map((notification) => (
              <DeclinedNotificationCard key={notification._id} notification={notification} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">View Document</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="Document"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};