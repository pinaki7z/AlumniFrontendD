"use client"

import { useState, useEffect } from "react"
import picture from "../../images/profilepic.jpg"
import { Users, UserPlus, Trash2, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useCookies } from "react-cookie"
import { orbit } from "ldrs"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { updateProfile } from "../../store/profileSlice"
import { toast } from "react-toastify"

orbit.register()

const Profilecard = ({ member, name, addButton, groupMembers, owner, deleteButton, handleDelete }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [cookie, setCookie] = useCookies(["access_token"])
  const [loading, setLoading] = useState(true)
  const { _id, id } = useParams()
  const dispatch = useDispatch()
  const [isAdded, setIsAdded] = useState()
  const profile = useSelector((state) => state.profile)

  let admin
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true
  }

  const isFollowPresent = window.location.href.includes("follow")
  const isGroupURL = window.location.href.includes("http://localhost:3000/groups/")
  const isForumURL = window.location.href.includes("http://localhost:3000/forums/")

  useEffect(() => {
    if (isForumURL) {
      setIsAdded(groupMembers.includes(member._id))
    }
  }, [isGroupURL, groupMembers, member._id])

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/${profile._id}/following/all`)
        const followingDetails = response.data.followingDetails
        const isUserFollowing = followingDetails.some((detail) => detail.userId === member._id)
        setIsFollowing(isUserFollowing)
        setLoading(false)
      } catch (error) {
        console.error("Error checking following status:", error)
      }
    }

    checkFollowingStatus()
  }, [member._id, profile._id, isAdded])

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

  const handleAddMember = async (groupId, memberId) => {
    console.log("handle add ", groupId, memberId)
    setLoading(true)
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/${isGroupURL ? `groups/members/${groupId}` : isForumURL ? `forums/members/${groupId}` : ""}`,
        {
          userId: memberId,
        },
      )
      if (response.status === 200) {
        const { isUserAdded } = response.data
        if (isUserAdded === true) {
          setIsAdded(true)
          setLoading(false)
        }
        if (isUserAdded === false) {
          setIsAdded(false)
          setLoading(false)
        }
        console.log("User added/removed to/from the group:", isUserAdded)
      } else {
        console.error("Failed to add/remove user to/from the group")
      }
    } catch (error) {
      console.error("Error adding/removing user to/from the group:", error)
    }
  }

  const isOwner = member._id === owner

  const getRoleInfo = (profileLevel) => {
    switch (profileLevel) {
      case 0:
        return { label: "SUPER ADMIN", color: "bg-red-100 text-red-800 border-red-200" }
      case 1:
        return { label: "ADMIN", color: "bg-orange-100 text-orange-800 border-orange-200" }
      case 2:
        return { label: "ALUMNI", color: "bg-blue-100 text-blue-800 border-blue-200" }
      case 3:
        return { label: "STUDENT", color: "bg-green-100 text-green-800 border-green-200" }
      default:
        return { label: "STUDENT", color: "bg-green-100 text-green-800 border-green-200" }
    }
  }

  const roleInfo = getRoleInfo(member.profileLevel)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Header with action buttons */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 pb-0">
        {addButton && (
          <button
            onClick={isOwner ? null : () => handleAddMember(_id || id, member._id)}
            disabled={isOwner}
            className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              isOwner
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : isAdded
                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
            }`}
          >
            {isOwner ? (
              <span className="flex items-center gap-1">
                <Users size={10} />
                Owner
              </span>
            ) : isAdded ? (
              "Remove"
            ) : (
              <UserPlus size={12} />
            )}
          </button>
        )}

        {/* Profile Image Section */}
        <div className="flex flex-col items-center relative">
          <div className="relative">
            <img
              src={member.profilePicture || picture}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md ring-2 ring-gray-100"
            />

            {admin && deleteButton && !(profile.profileLevel === 1 && member.profileLevel === 1) && (
              <div className="absolute -top-1 -right-1">
                {member.accountDeleted ? (
                  <button
                    onClick={handleDelete}
                    className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md flex items-center justify-center transition-colors duration-200"
                  >
                    <RotateCcw size={12} />
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center justify-center transition-colors duration-200"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col justify-between p-3 pt-2">
        <Link 
          to={isFollowPresent ? `/home/members/${member.userId}` : `/home/members/${member._id}`}
          className="block h-[90px] text-center group-hover:scale-[1.02] transition-transform duration-200"
        >
          <h3 className="text-base font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors truncate">
            {member.userName || `${member.firstName} ${member.lastName}`}
          </h3>

          {/* Role Badge */}
          <div className="flex justify-center mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>

          {/* Department and Year */}
          <div className="space-y-1 mb-2">
            {member.department && <p className="text-xs text-gray-600 font-medium truncate">{member.department}</p>}
            {(member.graduatingYear || member.class) && (
              <p className="text-xs text-gray-500">Class of {member.graduatingYear || member.class}</p>
            )}
          </div>
        </Link>

        {/* Follow Button */}
        {name !== "follow" && (
          <div className="mt-2">
            {loading ? (
              <div className="flex justify-center py-2">
                <l-orbit size="20" speed="1.5" color="#0A3A4C"></l-orbit>
              </div>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    : "bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white hover:opacity-90 shadow-sm"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Users size={14} />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profilecard
