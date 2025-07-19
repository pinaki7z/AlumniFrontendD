// NotificationsP.jsx - Enhanced Active Notifications Component
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Search, 
  User, 
  Users, 
  FileText, 
  Briefcase, 
  Image, 
  MessageCircle,
  CheckCircle, 
  X, 
  Eye,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Calendar,
  Building,
  Mail,
  Phone, Bell
} from 'lucide-react';

export const NotificationsP = ({ sendNotificationCount, topBar }) => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [searchUser, setSearchUser] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const isAdmin = profile.profileLevel === 0;

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/requests/req`);
      const filtered = response.data.filter((n) => n.status === false);
      setNotificationList(filtered);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (notificationId, action, additionalData = {}) => {
    setProcessing(prev => ({ ...prev, [notificationId]: action }));
    
    try {
      // Different handling based on notification type and action
      if (additionalData.type === 'link' && action === 'accept') {
        await handleAddLink(notificationId, additionalData.link, additionalData.department);
      } else if (additionalData.type === 'comment') {
        await handleComment(
          additionalData.commentId,
          additionalData.forumId,
          additionalData.userId,
          notificationId,
          action === 'reject'
        );
      } else if (action === 'accept') {
        await handleAddMember(
          notificationId,
          additionalData.groupId,
          additionalData.userId,
          additionalData.type,
          false,
          additionalData.userName
        );
      } else if (action === 'reject') {
        if (additionalData.type === 'ID' || additionalData.type === 'Job') {
          await handleAddMember(
            notificationId,
            additionalData.groupId,
            additionalData.userId,
            additionalData.type,
            true
          );
        } else {
          await handleDeleteNotification(notificationId);
        }
      }
      
      await getNotifications();
      toast.success(`Successfully ${action}ed request`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessing(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleAddLink = async (notificationId, link, department) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/images/addLink`, {
      notificationId,
      link,
      userId: profile._id,
      department,
    });
    return response.data;
  };

  const handleAddMember = async (notificationId, groupId, memberId, type, toDelete, requestedUserName) => {
    let url = "";
    let payload = { notificationId, toDelete };

    switch (type) {
      case "forum":
        url = `${process.env.REACT_APP_API_URL}/forums/members/${groupId}`;
        payload.userId = memberId;
        break;
      case "group":
        url = `${process.env.REACT_APP_API_URL}/groups/members/${groupId}`;
        payload.members = {
          userId: memberId,
          profilePicture: profile.profilePicture,
          userName: requestedUserName,
        };
        break;
      case "ID":
        url = `${process.env.REACT_APP_API_URL}/alumni/alumni/validateId`;
        payload.userId = memberId;
        break;
      case "Job":
        url = `${process.env.REACT_APP_API_URL}/jobs/${groupId}`;
        payload.approved = !toDelete;
        break;
      default:
        throw new Error("Invalid type provided");
    }

    const response = await axios.put(url, payload);
    return response.data;
  };

  const handleComment = async (commentId, forumId, userId, notificationId, deleteComment) => {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/forums/${forumId}/removeBlock`, {
      commentId,
      userId,
      notificationId,
      deleteComment,
    });
    return response.data;
  };

  const handleDeleteNotification = async (notificationId) => {
    const response = await axios.delete(`${process.env.REACT_APP_API_URL}/alumni/alumni/deleteNotification`, {
      data: { notificationId },
    });
    return response.data;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchUser.trim()) {
      getNotifications();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search/search/notifications?keyword=${searchUser}`
      );
      setNotificationList(
        response.data.filter((notification) => notification.status === false)
      );
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.link) return <Image size={20} className="text-purple-600" />;
    if (notification.ID) return <User size={20} className="text-blue-600" />;
    if (notification.businessVerification) return <Building size={20} className="text-green-600" />;
    if (notification.job !== undefined) return <Briefcase size={20} className="text-orange-600" />;
    if (notification.commentId) return <MessageCircle size={20} className="text-red-600" />;
    return <Users size={20} className="text-gray-600" />;
  };

  const getNotificationTypeText = (notification) => {
    if (notification.link) return "Photo Gallery Link";
    if (notification.ID) return "ID Validation";
    if (notification.businessVerification) return "Business Verification";
    if (notification.job !== undefined) return "Job/Internship Post";
    if (notification.commentId) return "Comment Unblock";
    return notification.groupName ? "Group Join" : "Forum Join";
  };

  const filteredNotifications = isAdmin
    ? notificationList.filter(n => filterType === 'all' || getNotificationTypeText(n).toLowerCase().includes(filterType))
    : notificationList.filter((n) => n.ownerId === profile._id);

  sendNotificationCount(filteredNotifications.length);

  const NotificationCard = ({ notification }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getNotificationIcon(notification)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {getNotificationTypeText(notification)}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="text-gray-900 mb-3">
            <Link
              to={`/members/${notification.userId}`}
              className="font-medium text-[#0A3A4C] hover:underline"
            >
              {notification.requestedUserName}
            </Link>
            <span className="ml-1">
              {notification.link ? (
                <>
                  has requested to add{" "}
                  <a
                    href={notification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A3A4C] hover:underline inline-flex items-center gap-1"
                  >
                    this link <ExternalLink size={12} />
                  </a>{" "}
                  to the photo gallery.
                </>
              ) : notification.ID ? (
                <>
                  has requested ID validation.{" "}
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
              ) : notification.businessVerification ? (
                <>
                  has requested business verification.{" "}
                  <a
                    href={`${process.env.REACT_APP_API_URL}/uploads/${notification.businessVerification}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A3A4C] hover:underline inline-flex items-center gap-1"
                  >
                    <Download size={12} /> View Document
                  </a>
                </>
              ) : notification.job !== undefined ? (
                <>
                  has requested to post a job/internship.{" "}
                  <Link
                    to={
                      notification.job
                        ? `/jobs/${notification.jobId}/Jobs`
                        : `/internships/${notification.jobId}/Internships`
                    }
                    className="text-[#0A3A4C] hover:underline inline-flex items-center gap-1"
                  >
                    <Eye size={12} /> View Post
                  </Link>
                </>
              ) : notification.commentId ? (
                <>
                  has requested to unblock from{" "}
                  <span className="font-medium">{notification.forumName}</span> forum.
                  {notification.comment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm italic">
                      "{notification.comment}"
                    </div>
                  )}
                </>
              ) : (
                <>
                  has requested to join{" "}
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
              onClick={() => handleAction(notification._id, 'accept', {
                type: notification.link ? 'link' : 
                      notification.ID ? 'ID' :
                      notification.job !== undefined ? 'Job' :
                      notification.commentId ? 'comment' :
                      notification.forumId ? 'forum' : 'group',
                link: notification.link,
                department: notification.department,
                groupId: notification.forumId || notification.groupId || notification.jobId,
                userId: notification.userId,
                userName: notification.requestedUserName,
                commentId: notification.commentId,
                forumId: notification.forumId
              })}
              disabled={processing[notification._id]}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            >
              {processing[notification._id] === 'accept' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>Accept</span>
            </button>
            
            <button
              onClick={() => handleAction(notification._id, 'reject', {
                type: notification.link ? 'link' : 
                      notification.ID ? 'ID' :
                      notification.job !== undefined ? 'Job' :
                      notification.commentId ? 'comment' :
                      notification.forumId ? 'forum' : 'group',
                groupId: notification.forumId || notification.groupId || notification.jobId,
                userId: notification.userId,
                commentId: notification.commentId,
                forumId: notification.forumId
              })}
              disabled={processing[notification._id]}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            >
              {processing[notification._id] === 'reject' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <X size={16} />
              )}
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
      <p className="text-gray-600">You're all caught up! No pending notifications at the moment.</p>
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
        {!topBar && (
          <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
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

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter by type:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C]"
                  >
                    <option value="all">All Types</option>
                    <option value="group">Groups</option>
                    <option value="forum">Forums</option>
                    <option value="job">Jobs</option>
                    <option value="photo">Photo Gallery</option>
                    <option value="validation">Validations</option>
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notifications List */}
        {loading ? (
          <LoadingState />
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard key={notification._id} notification={notification} />
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
