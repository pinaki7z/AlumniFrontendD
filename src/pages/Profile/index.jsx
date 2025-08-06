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
  Star,
  Activity,
  Timer,
  ListCollapse,
  Users2,
  UserCheck,
  ExternalLink,
  Heart,
  MessageCircle,
  BookOpen,
  Eye,
  ChevronRight
} from "lucide-react"

const Profile = () => {
  const { id } = useParams()
  const [member, setMember] = useState({})
  const profile = useSelector((state) => state.profile)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)
  const dispatch = useDispatch()

  const getAlumni = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/${id}`)
      setLoading(false)
      setMember(response.data)
      const followingResponse = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/${profile._id}/following/all`)
      const followingDetails = followingResponse.data.followingDetails
      const isUserFollowing = followingDetails.some((detail) => detail.userId === response.data._id)
      setIsFollowing(isUserFollowing)
    } catch (error) {
      console.error("Error fetching alumni details or following status:", error)
      setLoading(false)
    }
  }

  // Fetch Recent Activity (mock data similar to ProfilePage)
  const fetchRecentActivity = async () => {
    setActivityLoading(true)
    try {
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
        }
      ];

      setRecentActivity(activities)
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    } finally {
      setActivityLoading(false)
    }
  }

  useEffect(() => {
    getAlumni()
    fetchRecentActivity()
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

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
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

  const getRoleBadge = () => {
    const badges = {
      0: { label: "SUPER ADMIN", color: "bg-red-600 text-white", icon: <Star size={14} /> },
      1: { label: "ADMIN", color: "bg-orange-600 text-white", icon: <Award size={14} /> },
      2: { label: "ALUMNI", color: "bg-[#0A3A4C] text-white", icon: <Users size={14} /> },
      3: { label: "STUDENT", color: "bg-[#71be95] text-white", icon: <Users size={14} /> }
    }

    const badge = badges[member.profileLevel] || badges[2]

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${badge.color} font-medium text-xs`}>
        {badge.icon}
        {badge.label}
      </div>
    )
  }

  const lines = member.aboutMe ? member.aboutMe.split('\n') : ["🌟 This user hasn't shared their story yet."]
  const displayLines = expanded ? lines : lines.slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50 md:p-4 py-2">
      <div className="mx-auto max-w-7xl">
        {/* Cover Section */}
        <div className="relative mx-2 md:mx-4 rounded-lg overflow-hidden shadow-md">
          <div
            className="h-48 sm:h-[260px] bg-cover bg-center relative"
            style={{ backgroundImage: `url(${member.coverPicture || picture})` }}
          >
            <div className="absolute inset-0 bg-opacity-30" />

            {/* Follow Button in top right */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleFollowToggle}
                disabled={loading}
                className={`px-4 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center space-x-2 ${
                  isFollowing 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-[#71be95] hover:bg-[#5fa080] text-white"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Follow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative mx-2 md:mx-4 bg-white rounded-b-lg shadow-md -mt-16 sm:-mt-10 pt-10 sm:pt-10">
          {/* Profile Picture */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-80%] sm:-translate-y-[80%]">
            <div className="relative group">
              <img
                src={member.profilePicture || profilePic}
                alt="profile"
                className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full border-4 border-white object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center px-6 sm:px-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h2>
              {member.isVerified && (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              )}
            </div>

            <div className="flex justify-center mb-4">
              {getRoleBadge()}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-3 pb-4">
            {member.followers?.length > 0 && (
              <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] md:text-sm flex items-center space-x-2">
                <span className="hidden md:inline"><Users className="w-4 h-4" /></span>
                <span>{member.followers.length} Followers</span>
              </div>
            )}
            {member.following?.length > 0 && (
              <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] md:text-sm flex items-center space-x-2">
                <span className="hidden md:inline"><UserCheck className="w-4 h-4" /></span>
                <span>{member.following.length} Following</span>
              </div>
            )}
            {member.groupNames?.length > 0 && (
              <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] md:text-sm flex items-center space-x-2">
                <span className="hidden md:inline"><Users2 className="w-4 h-4" /></span>
                <span>{member.groupNames.length} Groups</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 pb-8">
          {/* Left Column: About & Recent Activity */}
          <div className="lg:col-span-3 space-y-6">
            {/* About Me */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">About {member.firstName}</h3>
                </div>
              </div>

              <div className="p-4 text-xs">
                <div className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm">
                  {displayLines.map((line, index) => (
                    <p key={index} className="mb-2 whitespace-pre-line">
                      {line}
                    </p>
                  ))}

                  {lines.length > 2 && (
                    <span
                      className="text-[#71be95] cursor-pointer hover:text-[#5fa080] transition-colors duration-200"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? 'Show less' : '...Read more'}
                    </span>
                  )}
                </div>
                
                {/* Department & Batch Info */}
                {(member.department || member.batch) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {member.department && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Department:</span> {member.department}
                      </p>
                    )}
                    {member.batch && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Batch:</span> {member.batch}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
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
                    {[...Array(3)].map((_, i) => (
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
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 transition-colors duration-200">
                        <div className={`${activity.color} p-1.5 rounded flex-shrink-0`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">
                            {member.firstName} {activity.action}
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

                    {recentActivity.length === 0 && (
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
          <div className="lg:col-span-6">
            <div className="bg-[#0A3A4C] text-white py-3 px-4 rounded-t-lg mb-3">
              <div className="flex items-center space-x-2">
                <ListCollapse className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Posts</h3>
              </div>
              <p className="text-blue-100 text-sm mt-1">{member.firstName}'s latest updates</p>
            </div>
            <div>
              <Feeed profilePage={true} entityType="posts" showCreatePost={false} showDeleteButton={true} userId={id} />
            </div>
          </div>

          {/* Right Column: Work Experience & Profile Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Work Experience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Current Role</h3>
                </div>
              </div>

              <div className="p-4">
                {currentWork ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {currentWork.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {currentWork.companyName}
                      </p>
                    </div>
                    
                    {currentWork.location && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <MapPin className="w-4 h-4" />
                        <span>{currentWork.location} • {currentWork.locationType}</span>
                      </div>
                    )}
                    
                    {currentWork.startMonth && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>{currentWork.startMonth} {currentWork.startYear} - Current</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No current work experience</p>
                  </div>
                )}
                
                <Link
                  to={`/home/members/${id}/experience`}
                  className="mt-4 flex items-center justify-center w-full bg-[#71be95] hover:bg-[#5fa080] text-white rounded-md py-2 text-sm font-medium transition-colors duration-200"
                >
                  View Full Experience
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Profile Info</h3>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium text-gray-900">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  {member.email && (
                    <div className="pt-3 border-t border-gray-100">
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-medium transition-colors duration-200"
                      >
                        Send Email
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 text-[#71be95] animate-spin" />
              <p className="text-gray-700 font-medium">Updating...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
