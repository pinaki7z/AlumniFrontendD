"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Feeed from "../../components/Feeed"
import picture from "../../images/d-cover.jpg" // Default cover image
import profilePic from "../../images/profilepic.jpg" // Default profile picture
import axios from "axios"
import { updateProfile } from "../../store/profileSlice"
import { toast } from "react-toastify"
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  UserPlus, 
  Users, 
  Loader2,
  Calendar,
  Building,
  Award,
  Star
} from "lucide-react"

const Profile = () => {
  const { id } = useParams()
  const [member, setMember] = useState({})
  const profile = useSelector((state) => state.profile)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  const getAlumni = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/${id}`)
      setMember(response.data)
      const followingResponse = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/${profile._id}/following/all`)
      const followingDetails = followingResponse.data.followingDetails
      const isUserFollowing = followingDetails.some((detail) => detail.userId === response.data._id)
      setIsFollowing(isUserFollowing)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching alumni details or following status:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getAlumni()
  }, [id, profile._id])

  const handleFollowToggle = async () => {
    setLoading(true)
    try {
      if (!isFollowing) {
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${member._id}/follow`, {
          userId: profile._id,
        })
        if (response.status === 200) {
          const responseData = await response.data
          const { alumni } = responseData
          dispatch(updateProfile(alumni))
          toast.success("Followed")
          setIsFollowing(true)
          setLoading(false)
        }
      } else {
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${member._id}/follow`, {
          userId: profile._id,
        })
        if (response.status === 200) {
          const responseData = await response.data
          const { alumni } = responseData
          dispatch(updateProfile(alumni))
          toast.success("Unfollowed")
          setIsFollowing(false)
          setLoading(false)
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error)
      setLoading(false)
    }
  }

  const currentWork = member?.workExperience?.find((exp) => exp.endMonth?.toLowerCase() === "current")

  if (!member || Object.keys(member).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center border border-white/20">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 size={24} className="animate-spin text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  const getRoleBadge = (level) => {
    let label = ""
    let colorClass = ""
    let icon = null
    switch (level) {
      case 0:
        label = "SUPER ADMIN"
        colorClass = "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25"
        icon = <Star size={12} className="text-white" />
        break
      case 1:
        label = "ADMIN"
        colorClass = "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
        icon = <Award size={12} className="text-white" />
        break
      case 2:
        label = "ALUMNI"
        colorClass = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
        icon = <Users size={12} className="text-white" />
        break
      case 3:
        label = "STUDENT"
        colorClass = "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
        icon = <Users size={12} className="text-white" />
        break
      default:
        label = "UNKNOWN"
        colorClass = "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/25"
        icon = <Info size={12} className="text-white" />
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${colorClass}`}>
        {icon}
        {label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="md:max-w-6xl mx-auto p-4 space-y-6">
        {/* Profile Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {/* Cover Image with Overlay */}
          <div className="relative h-48 md:h-60 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700 hover:scale-110"
              style={{ backgroundImage: `url(${member.coverPicture || picture})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          </div>

          {/* Profile Picture */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[-228%] md:translate-y-[-105%] lg:left-8 lg:translate-x-[0%]">
            <div className="relative">
              <div className="w-28 h-28 md:w-[138px] md:h-[138px] rounded-full border-4 border-white shadow-xl overflow-hidden bg-white transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={member.profilePicture || profilePic} 
                  alt="profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 pt-16 lg:pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Section - Profile Info */}
              <div className="lg:col-span-2 text-center lg:text-left lg:pl-36">
                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-start gap-2 md:ml-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h1>
                    {member.isVerified && (
                      <div className="relative">
                        <CheckCircle size={24} className="text-blue-500" />
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center lg:justify-start md:ml-4">
                    {getRoleBadge(member.profileLevel)}
                  </div>
                  
                
                </div>
              </div>

              {/* Right Section - Action Button */}
              <div className="flex justify-center lg:justify-end items-start">
                <button
                  onClick={handleFollowToggle}
                  disabled={loading}
                  className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isFollowing 
                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-red-500/25" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/25"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <Users size={18} />
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:inline">Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Follow</span>
                      </>
                    )}
                  </div>
                  
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="mt-4 grid grid-cols-3 gap-6 border-t pt-2">
              <div className="text-center group cursor-pointer">
               
                <p className="text-2xl font-bold text-gray-900 mb-1">{member.groupNames?.length || 0}</p>
                <p className="text-gray-600 font-medium text-sm">Groups</p>
              </div>
              
              <div className="text-center group cursor-pointer">
                
                <p className="text-2xl font-bold text-gray-900 mb-1">{member.followers?.length || 0}</p>
                <p className="text-gray-600 font-medium text-sm">Followers</p>
              </div>
              
              <div className="text-center group cursor-pointer">
                
                <p className="text-2xl font-bold text-gray-900 mb-1">{member.following?.length || 0}</p>
                <p className="text-gray-600 font-medium text-sm">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Section */}
          <div className="lg:col-span-2">
            <div className=" flex justify-center flex-col items-center overflow-hidden">
              <div className="bg-gradient-to-r  rounded-t-2xl mb-3  from-gray-900 to-gray-800 p-4  w-full md:w-full xl:w-[650px]">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-white" />
                  </div>
                  Recent Activity
                </h2>
                <p className="text-gray-300 mt-1 text-sm">Latest posts and updates</p>
              </div>
              <div className="">
                <Feeed profilePage={true} entityType="posts" showCreatePost={false} showDeleteButton={true} userId={id} />
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20 transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Info size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">About {member.firstName}</h3>
                    <p className="text-blue-100 text-xs">Get to know them better</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 leading-relaxed">
                  {member.aboutMe || "🌟 This user hasn't shared their story yet. Every great story starts with a single step!"}
                </p>
              </div>
            </div>

            {/* Enhanced Current Work Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20 transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Briefcase size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Current Role</h3>
                    <p className="text-emerald-100 text-xs">Professional journey</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Briefcase size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {currentWork?.title || "🚀 Ready for new opportunities"}
                      </h4>
                      <p className="text-gray-600">
                        {currentWork?.companyName || "Looking for the perfect role"}
                      </p>
                    </div>
                  </div>
                  
                  {currentWork && (
                    <>
                      {currentWork.startMonth && currentWork.startYear && (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2">
                          <Calendar size={16} className="text-blue-500" />
                          <span className="font-medium text-sm">
                            {`${currentWork.startMonth} ${currentWork.startYear} - ${currentWork.endMonth}`}
                          </span>
                        </div>
                      )}
                      
                      {currentWork.location && currentWork.locationType && (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2">
                          <MapPin size={16} className="text-emerald-500" />
                          <span className="font-medium text-sm">
                            {`${currentWork.location} • ${currentWork.locationType}`}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <Link
                  to={`/home/members/${id}/experience`}
                  className="group flex items-center justify-between w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <span>View Full Experience</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Profile
