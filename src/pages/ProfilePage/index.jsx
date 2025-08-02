import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import picture from "../../images/d-cover.jpg";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import axios from 'axios';
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
  Eye
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
      // If verification record doesn't exist, we'll handle it in the UI
      setUserVerification(null);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Get verification status from UserVerification data
  const getVerificationStatus = () => {
    if (!userVerification) {
      // No verification record exists
      return {
        status: 'no-record',
        message: 'Verification record not found',
        type: 'error'
      };
    }

    const currentDate = new Date();
    
    // Check if account is deleted
    if (userVerification.accountDeleted) {
      return {
        status: 'account-deleted',
        message: 'Your account has been deleted',
        type: 'error'
      };
    }
    
    // Check if user is validated
    if (userVerification.validated) {
      return {
        status: 'validated',
        message: 'Your account is verified',
        type: 'success'
      };
    }
    
    // Check if ID is uploaded and pending approval
    if (userVerification.ID && userVerification.idApprovalStatus === 'pending') {
      return {
        status: 'id-pending',
        message: 'Your ID card has been successfully uploaded and is currently under verification.',
        type: 'warning',
        uploadedAt: userVerification.idUploadedAt
      };
    }
    
    // Check if ID was rejected
    if (userVerification.ID && userVerification.idApprovalStatus === 'rejected') {
      return {
        status: 'id-rejected',
        message: `Your ID was rejected. ${userVerification.idRejectionReason ? `Reason: ${userVerification.idRejectionReason}` : 'Please upload a new ID.'}`,
        type: 'error'
      };
    }
    
    // Check if account is expired
    if (userVerification.expirationDate && new Date(userVerification.expirationDate) < currentDate) {
      return {
        status: 'expired',
        message: 'Your account has expired',
        type: 'error',
        expirationDate: userVerification.expirationDate
      };
    }
    
    // Check if account is expiring soon
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
    
    // Default case - not validated
    return {
      status: 'not-validated',
      message: 'Please upload your ID to validate your account.',
      type: 'warning'
    };
  };

  // Render verification banner based on UserVerification data
  const renderVerificationBanner = () => {
    // Don't show banner for admins and super admins
    if ([0, 1].includes(profile.profileLevel)) {
      return null;
    }

    if (verificationLoading) {
      return (
        <div className="mx-4 mt-4 mb-6">
          <div className="bg-gray-100 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center space-x-3 p-4">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const verificationStatus = getVerificationStatus();

    // Don't show banner if user is validated
    if (verificationStatus.status === 'validated') {
      return null;
    }

    // Determine banner style based on status
    const getBannerStyle = () => {
      switch (verificationStatus.status) {
        case 'id-pending':
          return {
            gradient: 'from-amber-500 to-orange-500',
            icon: <Clock className="w-6 h-6 flex-shrink-0" />,
            title: 'Verification In Progress',
            clickable: false
          };
        case 'id-rejected':
          return {
            gradient: 'from-red-500 to-red-600',
            icon: <AlertTriangle className="w-6 h-6 flex-shrink-0" />,
            title: 'ID Verification Failed',
            clickable: true
          };
        case 'expired':
          return {
            gradient: 'from-red-600 to-red-700',
            icon: <AlertTriangle className="w-6 h-6 flex-shrink-0" />,
            title: 'Account Expired',
            clickable: true
          };
        case 'expiring':
          return {
            gradient: 'from-orange-500 to-red-500',
            icon: <AlertTriangle className="w-6 h-6 flex-shrink-0" />,
            title: 'Account Expiring Soon',
            clickable: true
          };
        case 'account-deleted':
          return {
            gradient: 'from-gray-500 to-gray-600',
            icon: <AlertTriangle className="w-6 h-6 flex-shrink-0" />,
            title: 'Account Deleted',
            clickable: false
          };
        default:
          return {
            gradient: 'from-red-500 to-red-600',
            icon: <Upload className="w-6 h-6 flex-shrink-0" />,
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
          <p className="font-semibold">{bannerStyle.title}</p>
          <p className="text-sm opacity-90">
            {verificationStatus.message}
            {verificationStatus.status === 'expiring' && (
              <>
                {' '}Upload your <span className="underline font-semibold">ID</span> before{' '}
                <span className="font-semibold">
                  {new Date(verificationStatus.expirationDate).toLocaleDateString()}
                </span> to validate your account.
              </>
            )}
            {verificationStatus.status === 'not-validated' && (
              <>
                {' '}Please upload your <span className="underline font-semibold">ID document</span> to verify your account.
              </>
            )}
          </p>
          
          {/* Show ID view link if ID exists */}
          {userVerification?.ID && (
            <div className="mt-2">
              <a 
                href={userVerification.ID} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-md hover:bg-white/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={12} />
                View uploaded ID
              </a>
            </div>
          )}
        </div>
        {bannerStyle.clickable && <ChevronRight className="w-5 h-5" />}
      </div>
    );

    if (bannerStyle.clickable) {
      return (
        <div className="mx-4 mt-4 mb-6">
          <div 
            className={`bg-gradient-to-r ${bannerStyle.gradient} text-white rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-200`}
            onClick={() => navigate('/home/profile/profile-settings')}
          >
            <BannerContent />
          </div>
        </div>
      );
    }

    return (
      <div className="mx-4 mt-4 mb-6">
        <div className={`bg-gradient-to-r ${bannerStyle.gradient} text-white rounded-xl shadow-lg`}>
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
      0: { label: "SUPER ADMIN", gradient: "from-red-500 to-pink-600", icon: <Star size={14} /> },
      1: { label: "ADMIN", gradient: "from-orange-500 to-red-500", icon: <Award size={14} /> },
      2: { label: "ALUMNI", gradient: "from-[#0A3A4C] to-[#174873]", icon: <Users size={14} /> },
      3: { label: "STUDENT", gradient: "from-[#71be95] to-[#5fa080]", icon: <Users size={14} /> }
    };
    
    const badge = badges[profile.profileLevel] || badges[2];
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r ${badge.gradient} shadow-lg font-semibold text-sm`}>
        {badge.icon}
        {badge.label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 md:p-4 py-2">
      <div className="mx-auto max-w-7xl">
        {/* Verification Banner - Now uses UserVerification data */}
        {renderVerificationBanner()}

        {/* Cover Section */}
        <div className="relative mx-2 md:mx-4 rounded-2xl overflow-hidden shadow-xl">
          <div 
            className="h-48 sm:h-64 lg:h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${profile.coverPicture || picture})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A3A4C]/20 to-[#174873]/20" />
            
            {/* Cover Actions */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button 
                onClick={() => handleDelete('cover')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                title="Delete cover photo"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
              
              <div className="flex space-x-2 sm:space-x-3">
                <button 
                  onClick={() => navigate('/home/profile/profile-settings')}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Settings</span>
                </button>
                
                <button 
                  onClick={() => document.getElementById('coverInput').click()}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
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
        <div className="relative mx-2 md:mx-4 bg-white rounded-2xl shadow-xl -mt-16 sm:-mt-20 pt-16 sm:pt-20 ">
          {/* Profile Picture */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative group">
              <img 
                src={profile.profilePicture || "/images/profilepic.jpg"} 
                alt="profile" 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white object-cover shadow-2xl group-hover:shadow-3xl transition-all duration-300" 
              />
              
              <button 
                onClick={() => handleDelete('profile')}
                className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-red-500 hover:bg-red-600 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                title="Delete profile picture"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
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
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-[#71be95] hover:bg-[#5fa080] p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                title="Change profile picture"
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center px-6 sm:px-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                {profile.firstName} {profile.lastName}
              </h2>
              {/* Show verified badge based on UserVerification data */}
              {userVerification?.validated && (
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mb-4">
              {getRoleBadge()}
            </div>
            
            {profile.aboutMe && (
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">{profile.aboutMe}</p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-gray-200">
            {[
              { label: 'Groups', count: profile.groupNames?.length || 0, icon: Users, link: `/home/groups/${profile._id}/joined-groups` },
              { label: 'Followers', count: profile.followers?.length || 0, icon: UserCheck, link: `/home/profile/${profile._id}/followers` },
              { label: 'Following', count: profile.following?.length || 0, icon: UserPlus, link: `/home/profile/${profile._id}/following` }
            ].map((stat, i) => (
              <Link 
                to={stat.link} 
                key={i} 
                className="group flex flex-col items-center py-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-800 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 group-hover:text-[#71be95] transition-colors">{stat.count}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4 pb-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  My Posts
                </h3>
                <p className="text-white/80 text-sm mt-1">Share your thoughts and updates</p>
              </div>
              <div className="p-4 sm:p-6">
                <Feeed entityType='posts' showCreatePost showDeleteButton userId={member._id} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Profile Completion</h3>
                    <p className="text-white/80 text-sm">Complete your profile</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-[#71be95]">{completionPct}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-gradient-to-r from-[#71be95] to-[#5fa080] h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${completionPct}%` }} 
                  />
                </div>
                
                <div className="space-y-4">
                  {[
                    { key: 'profilePicture', label: 'Profile Picture', link: '/home/profile/profile-settings', icon: Camera },
                    { key: 'firstName', label: 'Name', link: '/home/profile/profile-settings', icon: UserCheck },
                    { key: 'workExperience', label: 'Workplace', link: '/home/profile/workExperience', icon: Building, custom: true },
                    { key: 'country', label: 'Country', link: '/home/profile/profile-settings', icon: MapPin },
                    { key: 'city', label: 'City', link: '/home/profile/profile-settings', icon: MapPin }
                  ].map((item, i) => {
                    const isCompleted = item.custom ? profile.workExperience?.length : profile[item.key];
                    const displayValue = item.custom ? findCurrentWorkingAt() : 
                      item.key === 'firstName' ? profile.firstName : profile[item.key];
                    
                    return (
                      <div key={i} className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <item.icon className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {isCompleted ? (
                            <span className="text-sm font-medium text-gray-800 truncate block">
                              {item.label}: {displayValue}
                            </span>
                          ) : (
                            <Link 
                              to={item.link} 
                              className="text-sm font-medium text-[#71be95] hover:text-[#5fa080] transition-colors duration-200"
                            >
                              Add your {item.label.toLowerCase()}
                            </Link>
                          )}
                        </div>
                        
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">About Me</h3>
                </div>
              </div>
              
              <div className="p-6">
                {profile.linkedIn ? (
                  <a 
                    href={profile.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center space-x-2 text-[#71be95] hover:text-[#5fa080] transition-colors duration-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>LinkedIn Profile</span>
                  </a>
                ) : (
                  <p className="text-gray-500 italic">User has not updated their bio</p>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <Link 
              to='/home/profile/workExperience' 
              className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#71be95]/10 p-3 rounded-lg">
                      <Briefcase className="w-6 h-6 text-[#71be95]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Work Experience</h3>
                      <p className="text-sm text-gray-500">View your professional journey</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </aside>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-8 h-8 text-[#71be95] animate-spin" />
              <p className="text-gray-700 font-medium">Uploading...</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #71be95 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 1px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #71be95, #5fa080);
          border-radius: 1px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #5fa080, #4d8a66);
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
