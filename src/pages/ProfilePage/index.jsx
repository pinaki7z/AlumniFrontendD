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
  Clock
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

  useEffect(() => { fetchWorkExperiences(); }, []);

  const fetchWorkExperiences = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/workExperience/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkExperiences(data);
    } catch (err) { console.error(err); }
  };

  const renderExpirationDateMessage = () => {
    if (profile.ID && profile.expirationDate) return 'Your account is being validated';
    if (!profile.expirationDate) return null;
    const days = Math.ceil((new Date(profile.expirationDate) - new Date()) / (1000 * 3600 * 24));
    if (days > 0) return (<p>Your account is not validated and will expire in {days} days. <Link to='/profile/profile-settings' className="text-blue-600 underline">Upload your ID</Link> to validate.</p>);
    if (days < 0) return 'Your account has expired';
    return null;
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
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="mx-auto max-w-7xl">
        {/* Validation Banner */}
        {(!profile.validated && ![0,1].includes(profile.profileLevel) && !profile.ID) ? (
          <div className="mx-4 mt-4 mb-6">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-200"
              onClick={() => navigate('/home/profile/profile-settings')}
            >
              <div className="flex items-center space-x-3 p-4">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Account Validation Required</p>
                  <p className="text-sm opacity-90">
                    Please upload your <span className="underline font-semibold">ID</span> before{' '}
                    <span className="font-semibold">{new Date(profile.expirationDate).toLocaleDateString()}</span> to validate your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : !profile.validated && profile.ID ? (
          <div className="mx-4 mt-4 mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 p-4">
                <Clock className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Verification In Progress</p>
                  <p className="text-sm opacity-90">Your ID card has been successfully uploaded and is currently under verification.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Cover Section */}
        <div className="relative mx-4 rounded-2xl overflow-hidden shadow-2xl">
          <div 
            className="h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${profile.coverPicture || picture})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Cover Actions */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button 
                onClick={() => handleDelete('cover')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Trash2 className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate('/home/profile/profile-settings')}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white px-1 border border-red-800 md:px-4 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                
                <button 
                  onClick={() => document.getElementById('coverInput').click()}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white px-1 border border-red-800 md:px-4 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Cover</span>
                </button>
              </div>
            </div>
          </div>
          
          <input 
            type="file" 
            id="coverInput" 
            className="hidden" 
            onChange={e => handleFileChange(e, 'coverPicture')} 
          />
        </div>

        {/* Profile Card */}
        <div className="relative mx-4 bg-white rounded-2xl shadow-xl -mt-20 pt-[90px] pb-2">
          {/* Profile Picture */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative group">
              <img 
                src={profile.profilePicture || "/images/profilepic.jpg"} 
                alt="profile" 
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-2xl group-hover:shadow-3xl transition-shadow duration-300" 
              />
              
              <button 
                onClick={() => handleDelete('profile')}
                className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
              
              <input 
                type="file" 
                id="profileInput" 
                className="hidden" 
                onChange={e => handleFileChange(e, 'profilePicture')} 
              />
              
              <button 
                onClick={() => document.getElementById('profileInput').click()}
                className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center px-8">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800">
                {profile.firstName} {profile.lastName}
              </h2>
              {profile.validated && (
                <div className="relative">
                  <Badge className="w-8 h-8 text-green-500 fill-current" />
                  <CheckCircle className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                member.profileLevel === 1 ? 'bg-purple-100 text-purple-800' :
                member.profileLevel === 2 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {(member.profileLevel === 1 || member.profileLevel===0)? 'ADMIN' : member.profileLevel === 2 ? 'ALUMNI' : 'STUDENT'}
              </div>
            </div>
            
            {profile.aboutMe && (
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{profile.aboutMe}</p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-3 divide-x divide-gray-200">
            {[
              { label: 'Groups', count: profile.groupNames.length, icon: Users, link: `/home/groups/${profile._id}/joined-groups` },
              { label: 'Followers', count: profile.followers.length, icon: UserCheck, link: `/home/profile/${profile._id}/followers` },
              { label: 'Following', count: profile.following.length, icon: UserPlus, link: `/home/profile/${profile._id}/following` }
            ].map((stat, i) => (
              <Link 
                to={stat.link} 
                key={i} 
                className="group flex flex-col items-center py-2 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
              >
                {/* <stat.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 mb-2" /> */}
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">{stat.count}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-6 mt-8 px-4 pb-8">
          {/* Posts Feed */}
          <div className="flex-1">
            <Feeed entityType='posts' showCreatePost showDeleteButton userId={member._id} />
          </div>

          {/* Sidebar */}
          <aside className="xl:w-96 space-y-6">
            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Profile Completion</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{completionPct}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" 
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
                        
                        <div className="flex-1">
                          {isCompleted ? (
                            <span className="text-sm font-medium text-gray-800">
                              {item.label}: {displayValue}
                            </span>
                          ) : (
                            <Link 
                              to={item.link} 
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              Add your {item.label.toLowerCase()}
                            </Link>
                          )}
                        </div>
                        
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <UserCheck className="w-5 h-5" />
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
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">LinkedIn Profile</span>
                  </a>
                ) : (
                  <p className="text-gray-500 italic">User has not updated their bio</p>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <Link 
              to='/home/profile/workExperience' 
              className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600" />
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
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-700 font-medium">Uploading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
