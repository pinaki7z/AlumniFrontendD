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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 size={32} className="animate-spin text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Profile</h3>
          <p className="text-gray-600">Please wait while we fetch the profile details...</p>
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
        icon = <Star size={14} className="text-white" />
        break
      case 1:
        label = "ADMIN"
        colorClass = "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
        icon = <Award size={14} className="text-white" />
        break
      case 2:
        label = "ALUMNI"
        colorClass = "bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white shadow-lg shadow-blue-500/25"
        icon = <Users size={14} className="text-white" />
        break
      case 3:
        label = "STUDENT"
        colorClass = "bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white shadow-lg shadow-emerald-500/25"
        icon = <Users size={14} className="text-white" />
        break
      default:
        label = "UNKNOWN"
        colorClass = "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/25"
        icon = <Info size={14} className="text-white" />
    }
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full ${colorClass}`}>
        {icon}
        {label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:max-w-7xl mx-auto p-4 space-y-6">
        {/* Profile Header Section - Enhanced Design */}
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Cover Image with Overlay - Better mobile sizing */}
          <div className="relative h-40 sm:h-48 md:h-60 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700 hover:scale-110"
              style={{ backgroundImage: `url(${member.coverPicture || picture})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A3A4C]/20 to-[#174873]/20" />
          </div>

          {/* Profile Picture - Better responsive positioning */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[-290%]   md:translate-y-[-231%] lg:translate-y-[-90%] lg:left-8 lg:translate-x-[0%]">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={member.profilePicture || profilePic} 
                  alt="profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Status Indicator - Better sizing */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Profile Info - Better mobile layout */}
          <div className="px-4 sm:px-6 pb-6 pt-14 sm:pt-16 md:pt-18 lg:pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Left Section - Profile Info */}
              <div className="lg:col-span-2 text-center lg:text-left lg:pl-40 xl:pl-44">
                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h1>
                    {member.isVerified && (
                      <div className="relative">
                        <CheckCircle size={24} className="text-blue-500" />
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center lg:justify-start">
                    {getRoleBadge(member.profileLevel)}
                  </div>
                </div>
              </div>

              {/* Right Section - Action Button */}
              <div className="flex justify-center lg:justify-end items-start">
                <button
                  onClick={handleFollowToggle}
                  disabled={loading}
                  className={`group relative px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isFollowing 
                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-red-500/25" 
                      : "bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:from-[#174873] hover:to-[#0A3A4C] text-white shadow-blue-500/25"
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

            {/* Enhanced Stats - Better mobile layout */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
              <div className="text-center group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{member.groupNames?.length || 0}</p>
                <p className="text-gray-600 font-medium text-xs sm:text-sm">Groups</p>
              </div>
              
              <div className="text-center group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{member.followers?.length || 0}</p>
                <p className="text-gray-600 font-medium text-xs sm:text-sm">Followers</p>
              </div>
              
              <div className="text-center group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{member.following?.length || 0}</p>
                <p className="text-gray-600 font-medium text-xs sm:text-sm">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Section - Enhanced but keeping your exact structure */}
          <div className="lg:col-span-2">
            <div className="flex justify-center flex-col items-center overflow-hidden">
              <div className="bg-gradient-to-r rounded-t-2xl mb-3 from-[#0A3A4C] to-[#174873] p-4 sm:p-6 w-full md:w-full xl:w-[650px] shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-white" />
                  </div>
                  Recent Activity
                </h2>
                <p className="text-white/80 mt-1 text-xs sm:text-sm">Latest posts and updates</p>
              </div>
              <div className="">
                <Feeed profilePage={true} entityType="posts" showCreatePost={false} showDeleteButton={true} userId={id} />
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar - Better design but same functionality */}
          <aside className="lg:col-span-1 space-y-6">
            {/* About Section - Enhanced styling */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-[#71be95] to-[#5fa080] p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Info size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">About {member.firstName}</h3>
                    <p className="text-white/80 text-xs">Get to know them better</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {member.aboutMe || "🌟 This user hasn't shared their story yet. Every great story starts with a single step!"}
                </p>
              </div>
            </div>

            {/* Enhanced Current Work Section - Better styling but same data */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Briefcase size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Current Role</h3>
                    <p className="text-white/80 text-xs">Professional journey</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Briefcase size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">
                        {currentWork?.title || "🚀 Ready for new opportunities"}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {currentWork?.companyName || "Looking for the perfect role"}
                      </p>
                    </div>
                  </div>
                  
                  {currentWork && (
                    <>
                      {currentWork.startMonth && currentWork.startYear && (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-3">
                          <Calendar size={16} className="text-[#71be95]" />
                          <span className="font-medium text-sm">
                            {`${currentWork.startMonth} ${currentWork.startYear} - ${currentWork.endMonth}`}
                          </span>
                        </div>
                      )}
                      
                      {currentWork.location && currentWork.locationType && (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-3">
                          <MapPin size={16} className="text-[#71be95]" />
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
                  className="group flex items-center justify-between w-full bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <span className="text-sm">View Full Experience</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

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
  )
}

export default Profile
