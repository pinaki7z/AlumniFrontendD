import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import picture from "../../images/d-cover1.jpg";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import axios from 'axios';
import profilePic from "../../images/profilepic.png" // Default profile picture

import { toast } from 'react-toastify';
import {
  Plus,
  CheckCircle,
  Trash2,
  Settings,
  Camera,
  MapPin,
  Building,
  Users,
  UserPlus,
  UserCheck,
  ExternalLink,
  Briefcase,
  ChevronRight,
  Badge,
  Calendar,
  AlertTriangle,
  Clock,
  Edit3,
  Star,
  Award,
  Info,
  Loader2,
  Target,
  TrendingUp,
  Upload,
  Eye,
  Activity,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Zap,
  Timer,
  ListCollapse,
  Users2
} from "lucide-react";
import { updateProfile } from "../../store/profileSlice";
import Feeed from "../../components/Feeed";
import baseUrl from "../../config";

const ProfilePage = () => {
  const { id } = useParams();
  const members = useSelector((state) => state.member);
  const profile = useSelector((state) => state.profile);
  const member = members.find(m => m._id === profile._id) || {};
  const [workExperiences, setWorkExperiences] = useState([]);
  const [userVerification, setUserVerification] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [cookie] = useCookies(["token"]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = cookie.token;

  // compute completion
  const totalProps = 5;
  let completed = 0;
  ['profilePicture', 'firstName', 'workExperience', 'country', 'city'].forEach(prop => {
    if (prop === 'workExperience') {
      if (profile.workExperience?.length) completed++;
    } else if (profile[prop]) completed++;
  });
  const completionPct = Math.round((completed / totalProps) * 100);

  useEffect(() => {
    fetchWorkExperiences();
    fetchUserVerification();
    fetchRecentActivity();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/workExperience/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkExperiences(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Recent Activity
  const fetchRecentActivity = async () => {
    setActivityLoading(true);
    try {
      // Replace with actual API calls
      const activities = [
        {
          id: 1,
          type: 'post',
          action: 'created a new post',
          content: 'Just completed a great project at work!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: <BookOpen className="w-4 h-4" />,
          color: 'text-blue-600 bg-blue-50'
        },
        {
          id: 2,
          type: 'like',
          action: 'liked a post',
          content: 'Amazing work on the new alumni website!',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          icon: <Heart className="w-4 h-4" />,
          color: 'text-red-600 bg-red-50'
        },
        {
          id: 3,
          type: 'comment',
          action: 'commented on a post',
          content: 'Great insights! Thanks for sharing.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          icon: <MessageCircle className="w-4 h-4" />,
          color: 'text-green-600 bg-green-50'
        },
        {
          id: 4,
          type: 'join',
          action: 'joined a group',
          content: 'Tech Alumni Network',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          icon: <Users className="w-4 h-4" />,
          color: 'text-purple-600 bg-purple-50'
        },
        {
          id: 5,
          type: 'update',
          action: 'updated profile',
          content: 'Added new work experience',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          icon: <Settings className="w-4 h-4" />,
          color: 'text-gray-600 bg-gray-50'
        }
      ];

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Fetch user verification data
  const fetchUserVerification = async () => {
    setVerificationLoading(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-verification/user/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserVerification(data);
    } catch (err) {
      console.error('Error fetching user verification:', err);
      setUserVerification(null);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Get verification status from UserVerification data
  const getVerificationStatus = () => {
    if (!userVerification) {
      return {
        status: 'no-record',
        message: 'Verification record not found',
        type: 'error'
      };
    }

    const currentDate = new Date();

    if (userVerification.accountDeleted) {
      return {
        status: 'account-deleted',
        message: 'Your account has been deleted',
        type: 'error'
      };
    }

    if (userVerification.validated) {
      return {
        status: 'validated',
        message: 'Your account is verified',
        type: 'success'
      };
    }

    if (userVerification.ID && userVerification.idApprovalStatus === 'pending') {
      return {
        status: 'id-pending',
        message: 'Your ID card has been successfully uploaded and is currently under verification.',
        type: 'warning',
        uploadedAt: userVerification.idUploadedAt
      };
    }

    if (userVerification.ID && userVerification.idApprovalStatus === 'rejected') {
      return {
        status: 'id-rejected',
        message: `Your ID was rejected. ${userVerification.idRejectionReason ? `Reason: ${userVerification.idRejectionReason}` : 'Please upload a new ID.'}`,
        type: 'error'
      };
    }

    if (userVerification.expirationDate && new Date(userVerification.expirationDate) < currentDate) {
      return {
        status: 'expired',
        message: 'Your account has expired',
        type: 'error',
        expirationDate: userVerification.expirationDate
      };
    }

    if (userVerification.expirationDate) {
      const days = Math.ceil((new Date(userVerification.expirationDate) - currentDate) / (1000 * 3600 * 24));
      if (days > 0) {
        return {
          status: 'expiring',
          message: `Your account is not validated and will expire in ${days} day${days > 1 ? 's' : ''}.`,
          type: 'warning',
          daysLeft: days,
          expirationDate: userVerification.expirationDate
        };
      }
    }

    return {
      status: 'not-validated',
      message: 'Please upload your ID to validate your account.',
      type: 'warning'
    };
  };

  // Render verification banner
  const renderVerificationBanner = () => {
    if ([0, 1].includes(profile.profileLevel)) {
      return null;
    }

    if (verificationLoading) {
      return (
        null
      );
    }

    const verificationStatus = getVerificationStatus();

    if (verificationStatus.status === 'validated') {
      return null;
    }

    const getBannerStyle = () => {
      switch (verificationStatus.status) {
        case 'id-pending':
          return {
            bg: 'bg-amber-50 border-amber-200',
            textColor: 'text-amber-800',
            icon: <Clock className="w-5 h-5 text-amber-600" />,
            title: 'Verification In Progress',
            clickable: false
          };
        case 'id-rejected':
        case 'expired':
          return {
            bg: 'bg-red-50 border-red-200',
            textColor: 'text-red-800',
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
            title: verificationStatus.status === 'expired' ? 'Account Expired' : 'ID Verification Failed',
            clickable: true
          };
        case 'expiring':
          return {
            bg: 'bg-orange-50 border-orange-200',
            textColor: 'text-orange-800',
            icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
            title: 'Account Expiring Soon',
            clickable: true
          };
        case 'account-deleted':
          return {
            bg: 'bg-gray-50 border-gray-200',
            textColor: 'text-gray-800',
            icon: <AlertTriangle className="w-5 h-5 text-gray-600" />,
            title: 'Account Deleted',
            clickable: false
          };
        default:
          return {
            bg: 'bg-red-50 border-red-200',
            textColor: 'text-red-800',
            icon: <Upload className="w-5 h-5 text-red-600" />,
            title: 'Account Validation Required',
            clickable: true
          };
      }
    };

    const bannerStyle = getBannerStyle();

    const BannerContent = () => (
      <div className="flex items-center space-x-3 p-4">
        {bannerStyle.icon}
        <div className="flex-1">
          <p className={`font-semibold ${bannerStyle.textColor}`}>{bannerStyle.title}</p>
          <p className={`text-sm ${bannerStyle.textColor} opacity-80`}>
            {verificationStatus.message}
            {verificationStatus.status === 'expiring' && (
              <>
                {' '}Upload your ID before{' '}
                <span className="font-semibold">
                  {new Date(verificationStatus.expirationDate).toLocaleDateString()}
                </span> to validate your account.
              </>
            )}
          </p>

          {userVerification?.ID && (
            <div className="mt-2">
              <a
                href={userVerification.ID}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-xs ${bannerStyle.textColor} underline hover:no-underline`}
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={12} />
                View uploaded ID
              </a>
            </div>
          )}
        </div>
        {bannerStyle.clickable && <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
    );

    if (bannerStyle.clickable) {
      return (
        <div className="mx-4 mt-4 mb-6">
          <div
            className={`${bannerStyle.bg} border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200`}
            onClick={() => navigate('/home/profile/profile-settings')}
          >
            <BannerContent />
          </div>
        </div>
      );
    }

    return (
      <div className="mx-4 mt-4 mb-6">
        <div className={`${bannerStyle.bg} border rounded-lg shadow-sm`}>
          <BannerContent />
        </div>
      </div>
    );
  };

  const findCurrentWorkingAt = () => workExperiences.find(e => e.endMonth === 'current')?.companyName || 'No current work experience';

  const handleFileChange = (e, type) => {
    setLoading(true);
    const file = e.target.files[0];
    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formData = new FormData();
    formData.append('image', file);
    axios.post(api, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        handleSubmit(res.data?.imageUrl, type);
      }).catch((err) => {
        setLoading(false);
        toast.dismiss()
        toast.error('Upload failed');
      })
  };

  const handleSubmit = async (fileData, fileType) => {
    setLoading(true);
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/alumni/${profile._id}`, { [fileType]: fileData }, { headers: { Authorization: `Bearer ${token}` } });
      dispatch(updateProfile(data));
      toast.dismiss()
      toast.success(`${fileType === 'profilePicture' ? 'Profile Picture' : 'Cover Picture'} updated`);
    } catch (err) {
      toast.dismiss()
      toast.error('Upload failed');
    }
    setLoading(false);
  };

  const handleDelete = async (type) => {
    try {
      const url = type === 'cover' ? `${process.env.REACT_APP_API_URL}/alumni/delete/coverPicture` : `${process.env.REACT_APP_API_URL}/alumni/delete/profilePicture`;
      const { data } = await axios.put(url, { userId: profile._id });
      dispatch(updateProfile(data.user));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const getRoleBadge = () => {
    const badges = {
      0: { label: "SUPER ADMIN", color: "bg-red-600 text-white", icon: <Star size={14} /> },
      1: { label: "ADMIN", color: "bg-orange-600 text-white", icon: <Award size={14} /> },
      2: { label: "ALUMNI", color: "bg-[#0A3A4C] text-white", icon: <Users size={14} /> },
      3: { label: "STUDENT", color: "bg-[#71be95] text-white", icon: <Users size={14} /> }
    };

    const badge = badges[profile.profileLevel] || badges[2];

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${badge.color} font-medium text-xs`}>
        {badge.icon}
        {badge.label}
      </div>
    );
  };


  const [expanded, setExpanded] = useState(false);


  const lines = profile?.aboutMe?.split('\n');
  const displayLines = expanded ? lines : lines?.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 md:p-4 py-2">
      <div className="mx-auto max-w-7xl">
        {/* Verification Banner */}
        {renderVerificationBanner()}

        {/* Cover Section */}
        <div className="relative mx-2 md:mx-4 rounded-lg overflow-hidden shadow-md">
          <div
            className="h-48 sm:h-[260px] bg-cover bg-center relative"
            style={{ backgroundImage: `url(${profile.coverPicture || picture})` }}
          >
            <div className="absolute inset-0 bg-opacity-30" />

            {/* Cover Actions */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button
                onClick={() => handleDelete('cover')}
                className="bg-white hover:bg-gray-50 p-2 rounded-md shadow-sm transition-colors duration-200"
                title="Delete cover photo"
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/home/profile/profile-settings')}
                  className="bg-white hover:bg-gray-50 px-3 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">Settings</span>
                </button>

                <button
                  onClick={() => document.getElementById('coverInput').click()}
                  className="bg-[#71be95] hover:bg-[#5fa080] px-3 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center space-x-2 text-white"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Edit Cover</span>
                </button>
              </div>
            </div>
          </div>

          <input
            type="file"
            id="coverInput"
            className="hidden"
            onChange={e => handleFileChange(e, 'coverPicture')}
            accept="image/*"
          />
        </div>

        {/* Profile Card */}
        <div className="relative mx-2 md:mx-4 bg-white rounded-b-lg shadow-md -mt-16 sm:-mt-10 pt-10 sm:pt-10">
          {/* Profile Picture */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-80%] sm:-translate-y-[80%]">
            <div className="relative group">
              <img
                src={profile.profilePicture || profilePic}
                alt="profile"
                className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full border-4 border-white object-cover shadow-lg"
              />

              <button
                onClick={() => handleDelete('profile')}
                className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 p-1 rounded-md shadow-sm transition-colors duration-200"
                title="Delete profile picture"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>

              <input
                type="file"
                id="profileInput"
                className="hidden"
                onChange={e => handleFileChange(e, 'profilePicture')}
                accept="image/*"
              />

              <button
                onClick={() => document.getElementById('profileInput').click()}
                className="absolute -bottom-1 -right-1 bg-[#71be95] hover:bg-[#5fa080] p-1 rounded-md shadow-sm transition-colors duration-200"
                title="Change profile picture"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center px-6 sm:px-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              {userVerification?.validated && (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              )}
            </div>

            <div className="flex justify-center mb-4">
              {getRoleBadge()}
            </div>


          </div>

         {/* Stats */}
<div className="flex justify-center gap-3 pb-4">
  {profile.followers?.length > 0 && (
    <Link 
      to={`/home/profile/${profile._id}/followers`} 
      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] md:text-sm hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
    >
     <span className="hidden md:inline"> <Users className="w-4 h-4" /></span>
      <span>{profile.followers.length} Followers</span>
    </Link>
  )}
  {profile.following?.length > 0 && (
    <Link 
      to={`/home/profile/${profile._id}/following`} 
      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] md:text-sm hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
    >
       <span className="hidden md:inline"><UserCheck className="w-4 h-4" /></span>
      <span>{profile.following.length} Following</span>
    </Link>
  )}
  {profile.groupNames?.length > 0 && (
    <Link 
      to={`/home/groups/${profile._id}/joined-groups`} 
      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] md:text-sm hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
    >
       <span className="hidden md:inline"><Users2 className="w-4 h-4" /></span>
      <span>{profile.groupNames.length} Groups</span>
    </Link>
  )}
</div>
        </div>

        {/* 3-Column Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8  pb-8">





          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-3 space-y-6">
            {/* About Me */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">About Me</h3>
                </div>
              </div>

              <div className="p-4 text-xs">
                <div className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm ">
                  {displayLines?.map((line, index) => (
                    <p key={index} className="mb-2 whitespace-pre-line">
                      {line}
                    </p>
                  ))}

                  {lines?.length > 5 && (
                    <span
                      className="text-[#71be95] cursor-pointer hover:text-[#5fa080] transition-colors duration-200"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? 'Show less' : '...Read more'}
                    </span>
                  )}
                </div>
                {profile?.linkedIn ? (
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-[#71be95] hover:text-[#5fa080] transition-colors duration-200 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>LinkedIn Profile</span>
                  </a>
                ) :
                  !profile.aboutMe ? (
                    <p className="text-gray-500 text-sm italic">User has not updated their bio</p>
                  ) : null}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                </div>
              </div>

              <div className="p-4">
                {activityLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)]?.map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity?.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 transition-colors duration-200">
                        <div className={`${activity.color} p-1.5 rounded flex-shrink-0`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">
                            You {activity.action}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {activity.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            <Timer className="w-3 h-3 inline mr-1" />
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {recentActivity?.length === 0 && (
                      <div className="text-center py-6">
                        <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column: Posts Feed (Wider) */}
          <div className="lg:col-span-6 ">
            <div className="bg-[#0A3A4C] text-white py-3 px-4 rounded-t-lg mb-3">
              <div className="flex items-center space-x-2">
                <ListCollapse className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Posts</h3>
              </div>
              <p className="text-blue-100 text-sm mt-1">Share your thoughts and updates</p>
            </div>
            <div className="">
              <Feeed entityType='posts' showCreatePost showDeleteButton userId={member._id} />
            </div>
          </div>

          {/* Right Column: Profile Info & Actions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Profile Completion</h3>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-[#71be95]">{completionPct}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-[#71be95] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'profilePicture', label: 'Profile Picture', link: '/home/profile/profile-settings', icon: Camera },
                    { key: 'firstName', label: 'Name', link: '/home/profile/profile-settings', icon: UserCheck },
                    { key: 'workExperience', label: 'Workplace', link: '/home/profile/workExperience', icon: Building, custom: true },
                    { key: 'country', label: 'Country', link: '/home/profile/profile-settings', icon: MapPin },
                    { key: 'city', label: 'City', link: '/home/profile/profile-settings', icon: MapPin }
                  ]?.map((item, i) => {
                    const isCompleted = item.custom ? profile.workExperience?.length : profile[item.key];
                    const displayValue = item.custom ? findCurrentWorkingAt() :
                      item.key === 'firstName' ? profile.firstName : profile[item.key];

                    return (
                      <div key={i} className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <item.icon className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {isCompleted ? (
                            <div>
                              <span className="text-xs font-medium text-gray-900 block">{item?.label}</span>
                              <span className="text-xs text-gray-500 truncate block">{displayValue}</span>
                            </div>
                          ) : (
                            <Link
                              to={item?.link}
                              className="text-xs font-medium text-[#71be95] hover:text-[#5fa080] transition-colors duration-200"
                            >
                              Add your {item?.label.toLowerCase()}
                            </Link>
                          )}
                        </div>

                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


            {/* Work Experience */}
            <Link
              to='/home/profile/workExperience'
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#71be95] bg-opacity-10 p-2 rounded">
                      <Briefcase className="w-5 h-5 text-[#71be95]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Work Experience</h3>
                      <p className="text-xs text-gray-500">View your professional journey</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 text-[#71be95] animate-spin" />
              <p className="text-gray-700 font-medium">Uploading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
