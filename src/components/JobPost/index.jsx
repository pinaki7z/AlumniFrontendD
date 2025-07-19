import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import dummy from "../../images/d-group.jpg";
import baseUrl from "../../config";
import { 
  DollarSign,
  Building,
  MapPin,
  Clock,
  Users,
  Star,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Archive,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  Briefcase,
  Home,
  X,
  Info,
  ExternalLink,
  Share2,
  Heart,
  Tag,
  TrendingUp,
  Shield,
  Loader2
} from 'lucide-react';

const JobPost = ({ 
  job,
  userId, 
  id, 
  jobTitle, 
  title, 
  titleS, 
  description, 
  salaryMin, 
  createdAt, 
  picture, 
  salaryMax, 
  duration, 
  jobType, 
  questions, 
  category, 
  currency, 
  attachments, 
  appliedCandidates, 
  searchQuery, 
  type, 
  locationType, 
  company, 
  verified, 
  employmentType,
  viewMode = 'grid'
}) => {
  const profile = useSelector((state) => state.profile);
  const navigateTo = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [archiveModalShow, setArchiveModalShow] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwner = userId === profile._id;
  const isAdmin = profile.profileLevel === 0;
  const canManage = isOwner || isAdmin;

  const handleClick = () => {
    navigateTo(`/home/jobs/${id}/Jobs`);
  };

  const formatSalary = (min, max, currency = 'INR') => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) {
      return `${currency === 'INR' ? '₹' : '$'}${formatNumber(min)} - ${formatNumber(max)}`;
    }
    return `${currency === 'INR' ? '₹' : '$'}${formatNumber(min || max)}`;
  };

  const formatNumber = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getEmploymentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full time':
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part time':
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'internship':
        return 'bg-purple-100 text-purple-800';
      case 'freelance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeIcon = (locationType) => {
    if (!locationType) return <MapPin size={14} />;
    if (locationType.remote) return <Home size={14} />;
    if (locationType.onsite) return <Building size={14} />;
    if (locationType.hybrid) return <MapPin size={14} />;
    return <MapPin size={14} />;
  };

  const getLocationTypeText = (locationType) => {
    if (!locationType) return 'Location not specified';
    if (locationType.remote) return 'Remote';
    if (locationType.onsite) return 'On-site';
    if (locationType.hybrid) return 'Hybrid';
    return Object.keys(locationType).find(key => locationType[key]) || 'Location not specified';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${type + 's'}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        toast.success('Job archived successfully');
        setArchiveModalShow(false);
        window.location.reload();
      } else {
        toast.error('Failed to archive job');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${type + 's'}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        toast.success('Job deleted successfully');
        setDeleteModalShow(false);
        window.location.reload();
      } else {
        toast.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStar = (e) => {
    e.stopPropagation();
    setIsStarred(!isStarred);
    toast.success(isStarred ? 'Removed from starred' : 'Added to starred');
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const getApplicationStatus = () => {
    const application = appliedCandidates?.find(candidate => candidate.userId === profile._id);
    if (!application) return null;

    const statusColors = {
      'applied': 'bg-blue-100 text-blue-800',
      'reviewing': 'bg-yellow-100 text-yellow-800',
      'interview': 'bg-purple-100 text-purple-800',
      'selected': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };

    return {
      status: application.status,
      comment: application.comment,
      color: statusColors[application.status.toLowerCase()] || 'bg-gray-100 text-gray-800'
    };
  };

  const applicationStatus = getApplicationStatus();

  // Enhanced Modal Components
  const Modal = ({ show, onClose, title, children, actions }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="mb-6">
              {children}
            </div>
            {actions && (
              <div className="flex gap-3 justify-end">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
        <div onClick={handleClick} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={job?.coverImage || dummy}
                alt={jobTitle}
                className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 sm:top-1 sm:right-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(employmentType)}`}>
                  {employmentType || type}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-[#0A3A4C] transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{jobTitle}</span>
                    {verified && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                  </div>
                </h3>
                <p className="text-gray-600 font-medium">{company}</p>
              </div>
              
              {canManage && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuVisible(!menuVisible); }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <MoreHorizontal size={16} className="text-gray-500" />
                  </button>
                  {menuVisible && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setArchiveModalShow(true); setMenuVisible(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteModalShow(true); setMenuVisible(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <DollarSign size={14} />
                <span>{formatSalary(salaryMin, salaryMax, currency)}</span>
              </div>
              <div className="flex items-center gap-2">
                {getLocationTypeIcon(locationType)}
                <span>{getLocationTypeText(locationType)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{getTimeAgo(createdAt)}</span>
              </div>
              {duration && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{duration}</span>
                </div>
              )}
            </div>

            {applicationStatus && (
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${applicationStatus.color}`}>
                  {applicationStatus.status}
                </span>
                {applicationStatus.comment && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Info size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons for non-owners */}
        {!canManage && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleStar}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                isStarred ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star size={14} className={isStarred ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                isBookmarked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
            </button>
          </div>
        )}

        {/* Modals */}
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Application Status"
        >
          <p className="text-gray-700">{applicationStatus?.comment}</p>
        </Modal>

        <Modal
          show={archiveModalShow}
          onClose={() => setArchiveModalShow(false)}
          title="Archive Job"
          actions={
            <>
              <button
                onClick={() => setArchiveModalShow(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                Archive
              </button>
            </>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to archive this job? It will be moved to your archived jobs section.
          </p>
        </Modal>

        <Modal
          show={deleteModalShow}
          onClose={() => setDeleteModalShow(false)}
          title="Delete Job"
          actions={
            <>
              <button
                onClick={() => setDeleteModalShow(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium mb-1">This action cannot be undone</p>
                <p className="text-red-700 text-sm">You will lose access to all data including CVs received under this job. Consider archiving instead.</p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer transform hover:scale-105">
      <div onClick={handleClick}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={job?.coverImage || dummy}
            alt={jobTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(employmentType)}`}>
              {employmentType || type}
            </span>
            {verified && (
              <div className="bg-green-500 text-white p-1 rounded-full">
                <CheckCircle size={12} />
              </div>
            )}
          </div>

          {/* Time badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {getTimeAgo(createdAt)}
            </span>
          </div>

          {/* Quick actions for non-owners */}
          {!canManage && (
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleStar}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                  isStarred ? 'bg-yellow-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white'
                }`}
              >
                <Star size={14} className={isStarred ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                  isBookmarked ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white'
                }`}
              >
                <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#0A3A4C] transition-colors duration-200 line-clamp-2">
                {jobTitle}
              </h3>
              <p className="text-gray-600 font-medium truncate">{company}</p>
            </div>
            
            {canManage && (
              <div className="relative ml-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuVisible(!menuVisible); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
                {menuVisible && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setArchiveModalShow(true); setMenuVisible(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Archive size={14} />
                        Archive
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteModalShow(true); setMenuVisible(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <DollarSign size={14} />
              <span className="truncate">{formatSalary(salaryMin, salaryMax, currency)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              {getLocationTypeIcon(locationType)}
              <span className="truncate">{getLocationTypeText(locationType)}</span>
            </div>
            {duration && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock size={14} />
                <span className="truncate">{duration}</span>
              </div>
            )}
          </div>

          {/* Application Status */}
          {applicationStatus && (
            <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${applicationStatus.color}`}>
                {applicationStatus.status}
              </span>
              {applicationStatus.comment && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Info size={14} />
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              <span>{getTimeAgo(createdAt)}</span>
            </div>
            {appliedCandidates && (
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{appliedCandidates.length} applied</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Application Status"
      >
        <p className="text-gray-700">{applicationStatus?.comment}</p>
      </Modal>

      <Modal
        show={archiveModalShow}
        onClose={() => setArchiveModalShow(false)}
        title="Archive Job"
        actions={
          <>
            <button
              onClick={() => setArchiveModalShow(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
              Archive
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to archive this job? It will be moved to your archived jobs section.
        </p>
      </Modal>

      <Modal
        show={deleteModalShow}
        onClose={() => setDeleteModalShow(false)}
        title="Delete Job"
        actions={
          <>
            <button
              onClick={() => setDeleteModalShow(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium mb-1">This action cannot be undone</p>
              <p className="text-red-700 text-sm">You will lose access to all data including CVs received under this job. Consider archiving instead.</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobPost;
