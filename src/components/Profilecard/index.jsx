import React, { useState, useEffect } from "react";
import "./profilecard.css";
import picture from "../../images/profilepic.jpg";
import { HiUsers } from "react-icons/hi";
import { IoIosReorder } from "react-icons/io";
import { MdLocationOn } from "react-icons/md";
import { BiUserPlus } from "react-icons/bi";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { orbit } from 'ldrs';
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import delButton from "../../images/deleteButton.svg";
import profileImage from "../../images/profileImage.png";
import { MdOutlineRestore } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import baseUrl from "../../config";
import { updateProfile } from '../../store/profileSlice';
import { toast } from "react-toastify";

orbit.register()

const Profilecard = ({ member, name, addButton, groupMembers, owner, deleteButton, handleDelete }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [cookie, setCookie] = useCookies(["access_token"]);
  const [loading, setLoading] = useState(true);
  const { _id, id } = useParams();
  const dispatch = useDispatch();
  let [isAdded, setIsAdded] = useState();
  const profile = useSelector((state) => state.profile);
  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }
  const isFollowPresent = window.location.href.includes('follow');
  console.log('isFollowPresent', member)


  const isGroupURL = window.location.href.includes("http://localhost:3000/groups/");
  const isForumURL = window.location.href.includes("http://localhost:3000/forums/");

  useEffect(() => {
    // if (isGroupURL) {
    //   setIsAdded(groupMembers.includes(member._id));
    // }
    if (isForumURL) {
      setIsAdded(groupMembers.includes(member._id));
    }
  }, [isGroupURL, groupMembers, member._id]);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/alumni/${profile._id}/following/all`
        );
        const followingDetails = response.data.followingDetails;
        const isUserFollowing = followingDetails.some(
          (detail) => detail.userId === member._id
        );
        setIsFollowing(isUserFollowing);
        setLoading(false);
      } catch (error) {
        console.error("Error checking following status:", error);
      }
    };

    checkFollowingStatus();
  }, [member._id, profile._id, isAdded]);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (!isFollowing) {
        const response = await axios.patch(`${baseUrl}/alumni/${member._id}/follow`, {
          userId: profile._id,
        });
        if (response.status === 200) {
          const responseData = await response.data;
          const { alumni } = responseData;
          dispatch(updateProfile(alumni));
          toast.success('Followed');
          setIsFollowing(true);
          setLoading(false);
        }

      } else {
        const response = await axios.patch(`${baseUrl}/alumni/${member._id}/follow`, {
          userId: profile._id,
        });
        if (response.status === 200) {
          const responseData = await response.data;
          const { alumni } = responseData;
          dispatch(updateProfile(alumni));
          toast.success('Unfollowed');
          setIsFollowing(false);
          setLoading(false);
        }

      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setLoading(false);
    }
  };

  const handleAddMember = async (groupId, memberId) => {
    console.log('handle add ', groupId, memberId)
    setLoading(true)
    try {
      const response = await axios.put(
        `${baseUrl}/${isGroupURL ? `groups/members/${groupId}` : isForumURL ? `forums/members/${groupId}` : ''}`,
        {
          userId: memberId,
        }
      );



      if (response.status === 200) {
        const { isUserAdded } = response.data;
        if (isUserAdded === true) {
          setIsAdded(true);
          setLoading(false);
        }
        if (isUserAdded === false) {
          setIsAdded(false);
          setLoading(false);
        }
        console.log('User added/removed to/from the group:', isUserAdded);
      } else {

        console.error('Failed to add/remove user to/from the group');
      }
    } catch (error) {

      console.error('Error adding/removing user to/from the group:', error);
    }
  };

  const isOwner = member._id === owner;

  return (
    <>
      <div className="bg-[#E9F5EF] rounded-lg shadow-md border flex flex-col justify-between p-2 relative ">
      {addButton && (
        <button
          onClick={isOwner ? null : () => handleAddMember(_id || id, member._id)}
          disabled={isOwner}
          className={`px-4 py-1 text-white text-sm rounded-md absolute top-3 right-3 ${
            isOwner ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isOwner ? "Group Admin" : isAdded ? "Remove" : <BiUserPlus size={17} />}
        </button>
      )}
      <div className="flex flex-col items-center relative">
        <img
          src={member.profilePicture || picture}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
        />
        {admin && deleteButton && !(profile.profileLevel === 1 && member.profileLevel === 1) && (
          <>
            {member.accountDeleted ? (
              <MdOutlineRestore
                onClick={handleDelete}
                className="w-6 h-6 absolute top-2 right-2 cursor-pointer text-green-600 hover:text-green-700"
              />
            ) : (
              <img
                src={delButton}
                onClick={handleDelete}
                className="w-6 h-6 absolute top-2 right-2 bg-white cursor-pointer rounded-full shadow-md"
                alt="Delete"
              />
            )}
          </>
        )}
      </div>
      <Link
        to={isFollowPresent ? `/home/members/${member.userId}` : `/home/members/${member._id}`}
        className="text-center text-black mt-2"
      >
        <h3 className="text-lg font-semibold">{member.userName || `${member.firstName} ${member.lastName}`}</h3>
        <p className="text-sm font-light text-gray-600">
          {member.profileLevel === 1
            ? "ADMIN"
            : member.profileLevel === 2
            ? "ALUMNI"
            : member.profileLevel === 3
            ? "STUDENT"
            : "SUPER ADMIN"}
        </p>
        <p className="text-sm text-gray-600">{member.department}</p>
        <p className="text-sm text-gray-600">{member.graduatingYear || member.class}</p>
        <div className="flex justify-center gap-6 mt-3">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">Followers</p>
            <p className="text-lg font-semibold">{member?.followers?.length ? member.followers.length : null}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">Following</p>
            <p className="text-lg font-semibold">{member?.following?.length ? member.following.length : null}</p>
          </div>
        </div>
      </Link>
      <div className="mt-4">
        {loading ? (
          <div className="text-center">
            <l-orbit size="35" speed="1.5" color="black"></l-orbit>
          </div>
        ) : (
          name !== "follow" && (
            <button
              onClick={handleFollowToggle}
              className="w-full flex items-center justify-center py-3 rounded-b-lg text-lg font-medium text-white bg-[#0a3a4c] hover:bg-[#082b3a]"
            >
              {isFollowing ? "Following" : <><BiUserPlus size={17} /> Follow</>}
            </button>
          )
        )}
      </div>
    </div>
    </>
  );
};

export default Profilecard;
