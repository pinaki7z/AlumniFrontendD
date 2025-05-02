import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import picture from "../../images/d-cover.jpg";

import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import axios from 'axios';
import { toast } from 'react-toastify';
import { HiMiniPlusCircle, HiMiniCheckBadge } from "react-icons/hi2";
import { MdOutlineDelete } from "react-icons/md";
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
    const file = e.target.files[0];
    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formData = new FormData();
    formData.append('image', file);
    axios.post(api, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        handleSubmit(res.data?.imageUrl, type);
      }).catch((err) => {
        toast.dismiss()
        toast.error('Upload failed');
      })
    // if (!file) return;
    // const reader = new FileReader();

    // reader.onloadend = () => handleSubmit(reader.result, type);
    // reader.readAsDataURL(file);
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
    <div className="container mx-auto p-4 space-y-3">
      {/* show validation  */}
      {(!profile.validated && ![0,1].includes(profile.profileLevel) && !profile.ID) ? <div className="flex justify-center items-center">
        {<div className="bg-red-600 p-2 cursor-pointer rounded text-white text-center" onClick={() => navigate('/home/profile/profile-settings')}>
          <p>Please upload your <span className="underline bolder text-lg ">ID</span> before <b>{new Date(profile.expirationDate).toLocaleDateString()}</b> to validate your account.</p>
        </div>}
      </div>
      // if not validated and has ID
      : !profile.validated && profile.ID ? <>
        <div>
          <div className="flex justify-center items-center">
            <div className="bg-yellow-600 p-2 cursor-pointer rounded font-semibold text-white text-center">
              <p>Your ID card has been successfully uploaded and is currently under verification.</p>
            </div>
          </div>
        </div>
      </>:null}
      {/* Cover Section */}
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        <div className="h-60 bg-cover bg-center" style={{ backgroundImage: `url(${profile.coverPicture || picture})` }} />
        <button onClick={() => handleDelete('cover')} className="absolute top-4 left-4 bg-white p-2 rounded-full shadow">
          <MdOutlineDelete className="w-6 h-6 text-gray-700" />
        </button>
        <input type="file" id="coverInput" className="hidden" onChange={e => handleFileChange(e, 'coverPicture')} />
        <button onClick={() => navigate('/home/profile/profile-settings')} className="absolute border-2 border-gray-300 shadow-xl top-4 right-[150px] bg-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100">Settings</button>
        <button onClick={() => document.getElementById('coverInput').click()} className="absolute border-2 border-gray-300 shadow-xl top-4 right-4 bg-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100">Edit Cover</button>
        {loading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">Loading...</div>}
      </div>

      {/* Profile Card */}
      <div className="relative bg-white rounded-lg shadow-lg -mt-24 pt-24 pb-6 px-6">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <img src={profile.profilePicture || "/images/profilepic.jpg"} alt="profile" className="w-40 h-40 rounded-full border-4 border-white object-cover" />
            <button onClick={() => handleDelete('profile')} className="absolute top-1 left-1 bg-white p-1 rounded-full shadow">
              <MdOutlineDelete className="w-5 h-5 text-gray-700" />
            </button>
            <input type="file" id="profileInput" className="hidden" onChange={e => handleFileChange(e, 'profilePicture')} />
            <button onClick={() => document.getElementById('profileInput').click()} className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow">
              <HiMiniPlusCircle className="w-6 h-6 text-green-500" />
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold flex items-end justify-center space-x-2">
            <p>{profile.firstName} {profile.lastName}</p>
            {profile.validated && <HiMiniCheckBadge className="text-blue-500 w-[30px] h-[30px]" />}
          </h2>
          <p className="text-gray-500 uppercase text-sm mt-1">{member.profileLevel === 1 ? 'ADMIN' : member.profileLevel === 2 ? 'ALUMNI' : 'STUDENT'}</p>
          <p className="mt-2 text-gray-700">{profile.aboutMe}</p>
        </div>


        {/* Stats */}
        <div className="mt-6 flex justify-around">
          {['Groups', 'Followers', 'Following'].map((label, i) => {
            const count = label === 'Groups' ? profile.groupNames.length : label === 'Followers' ? profile.followers.length : profile.following.length;
            const link = label === 'Groups' ? `/home/groups/${profile._id}/joined-groups` :
              label === 'Followers' ? `/home/profile/${profile._id}/followers` : `/home/profile/${profile._id}/following`;
            return (
              <Link to={link} key={i} className="text-center hover:text-blue-600">
                <p className="font-semibold">{label}</p>
                <p className="text-xl font-bold">{count}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Feeed entityType='posts' showCreatePost showDeleteButton userId={member._id} />
        </div>
        <aside className="w-full lg:w-1/3 space-y-6">
          {/* Completion */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="bg-[#0A3A4C] text-white p-4 rounded-t-lg flex items-center space-x-2">
              <p className="font-semibold">Profile Completion</p>
            </div>
            <div className="p-4">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionPct}%` }} />
              </div>
              <ul className="space-y-2 text-gray-700">
                {/* Picture */}
                <li className="flex items-center space-x-2">
                  {profile.profilePicture ? <HiMiniCheckBadge className="text-green-500" /> : <HiMiniPlusCircle className="text-gray-500" />}
                  {profile.profilePicture ? 'Profile Picture Added' : <Link to='/home/profile/profile-settings' className="underline">Add your profile picture</Link>}
                </li>
                {/* Name */}
                <li className="flex items-center space-x-2">
                  {profile.firstName ? <HiMiniCheckBadge className="text-green-500" /> : <HiMiniPlusCircle className="text-gray-500" />}
                  {profile.firstName ? `Name: ${profile.firstName}` : <Link to='/home/profile/profile-settings' className="underline">Add your name</Link>}
                </li>
                {/* Workplace */}
                <li className="flex items-center space-x-2">
                  {profile.workExperience?.length ? <HiMiniCheckBadge className="text-green-500" /> : <HiMiniPlusCircle className="text-gray-500" />}
                  {profile.workExperience?.length ? `Workplace: ${findCurrentWorkingAt()}` : <Link to='/home/profile/workExperience' className="underline">Add your workplace</Link>}
                </li>
                {/* Country */}
                <li className="flex items-center space-x-2">
                  {profile.country ? <HiMiniCheckBadge className="text-green-500" /> : <HiMiniPlusCircle className="text-gray-500" />}
                  {profile.country ? `Country: ${profile.country}` : <Link to='/home/profile/profile-settings' className="underline">Add your country</Link>}
                </li>
                {/* City */}
                <li className="flex items-center space-x-2">
                  {profile.city ? <HiMiniCheckBadge className="text-green-500" /> : <HiMiniPlusCircle className="text-gray-500" />}
                  {profile.city ? `City: ${profile.city}` : <Link to='/home/profile/profile-settings' className="underline">Add your address</Link>}
                </li>
              </ul>
            </div>
          </div>

          {/* About & LinkedIn */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="bg-[#0A3A4C] text-white p-4 rounded-t-lg flex items-center space-x-2">
              <p className="font-semibold">About Me</p>
            </div>
            <div className="p-4 text-gray-700">
              {profile.linkedIn ? <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">LinkedIn Profile</a> : 'User has not updated their Bio'}
            </div>
          </div>

          {/* Work Experience Link */}
          <Link to='/home/profile/workExperience' className=" bg-white rounded-lg shadow-lg hover:shadow-xl transition p-4 flex items-center justify-between">
            <p className="font-medium">Work Experience</p>
            <span className="text-gray-400">›</span>
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
