import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Feeed from "../../components/Feeed";
import picture from "../../images/d-cover.jpg";
import about from "../../images/about.svg";
import work from "../../images/work.svg";
import location from "../../images/location.svg";
import profilePic from "../../images/profilepic.jpg";
import time from "../../images/Time.svg";
import arrowRight from "../../images/arrowRight.svg";
import { HiMiniCheckBadge } from "react-icons/hi2";
import baseUrl from "../../config";
import axios from "axios";
import { updateProfile } from "../../store/profileSlice";
import { toast } from "react-toastify";

const Profile = () => {
  const { id } = useParams();
  const members = useSelector((state) => state.member);
  // const member = members.find((member) => member._id === id);
  const [member, setMember ] = useState({});
  const profile = useSelector((state) => state.profile);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  let [isAdded, setIsAdded] = useState();
 

  // useEffect(() => {
  //   const checkFollowingStatus = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/alumni/${profile._id}/following/all`
  //       );
  //       const followingDetails = response.data.followingDetails;
  //       const isUserFollowing = followingDetails.some(
  //         (detail) => detail.userId === member._id
  //       );
  //       setIsFollowing(isUserFollowing);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error checking following status:", error);
  //     }
  //   };

  //   checkFollowingStatus();
  // }, [member._id, profile._id]);

  const getAlumni =async()=>{
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/alumni/${id}`
    );
    setMember(response.data)
  }
  useEffect(()=>{
    getAlumni();
  },[])


  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (!isFollowing) {
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${member._id}/follow`, {
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
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/alumni/${member._id}/follow`, {
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

  const isGroupURL = window.location.href.includes("http://localhost:3000/groups/");
  const isForumURL = window.location.href.includes("http://localhost:3000/forums/");

  const currentWork = member?.workExperience?.find(
    (exp) => exp.endMonth.toLowerCase() === "current"
  );
  if (!member) {
    return <div className="p-4 text-center">Member not found</div>;
  }
  return (
    <div className="container mx-auto p-4 space-y-3">
      {/* Cover & Avatar */}
      <div className="relative rounded-lg overflow-hidden shadow-lg ">
        <div
          className="h-60 bg-cover bg-center"
          style={{ backgroundImage: `url(${member.coverPicture || picture})` }}
        />

      </div>
      {/* Profile Card */}
      <div className="relative bg-white rounded-lg shadow-lg -mt-24 pt-24 pb-10 mb-10 px-6">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <img src={member.profilePicture || profilePic} alt="profile" className="w-40 h-40 rounded-full border-4 border-white object-cover" />

          </div>
        </div>
        <div className="bg-white-100 b-6 ">
          <div className="text-center ">
            <h2 className="text-2xl font-bold text-gray-800">
              {member.firstName} {member.lastName}
            </h2>
            <p className="text-sm uppercase text-gray-600 mb-6">
              {member.profileLevel === 1
                ? "ADMIN"
                : member.profileLevel === 2
                  ? "ALUMNI"
                  : member.profileLevel === 3
                    ? "STUDENT"
                    : "SUPERADMIN"}
            </p>
            <p className="text-base text-gray-700">
              {member.aboutMe ||
                "No bio provided."}
            </p>
            <div className="flex justify-center space-x-4">
              {/* <button className="px-4 py-2 underline text-violet-500 font-semibold ">
                Message
              </button> */}
              <button
  onClick={handleFollowToggle}
  className={`px-4 py-2  underline font-semibold ${isFollowing?"text-red-500":"text-blue-500"}`}
> 
  {isFollowing ? "Unfollow" : "Follow"}
</button>
            </div>
            <div className="flex justify-around mt-6">
              <div className="text-center">
                <p className="font-medium text-gray-600">Groups</p>
                <p className="text-xl font-semibold text-gray-800">
                  {member.groupNames?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-600">Followers</p>
                <p className="text-xl font-semibold text-gray-800">
                  {member.followers?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-600">Following</p>
                <p className="text-xl font-semibold text-gray-800">
                  {member.following?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>



      </div>



      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {/* Feed */}
        <div className="flex-1">
          <Feeed
            entityType="posts"
            showCreatePost={false}
            showDeleteButton={true}
            userId={id}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center space-x-3 bg-[#0A3A4C] p-4">
              <img src={about} alt="About icon" className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-white">
                About {member.firstName}
              </h3>
            </div>
            <div className="bg-gray-100 p-4">
              <p className="text-gray-700">
                {member.aboutMe || "User has not updated his Bio"}
              </p>
            </div>
          </div>

          {/* Current Work Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center space-x-3 bg-[#0A3A4C] p-4">
              <img src={work} alt="Work icon" className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-white">
                Currently Working As
              </h3>
            </div>
            <div className="bg-gray-100 p-4 space-y-2">
              <p className="font-medium text-gray-700">
                {currentWork?.title ||
                  "User has not updated his current work title"}
              </p>
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold">
                  {currentWork?.companyName ||
                    "User has not updated his current work place"}
                </p>
                {currentWork?.startMonth && currentWork?.startYear && (
                  <div className="flex items-center space-x-2">
                    <img src={time} alt="Time icon" className="w-4 h-4" />
                    <p className="text-gray-600">
                      {`${currentWork.startMonth} ${currentWork.startYear} - ${currentWork.endMonth}`}
                    </p>
                  </div>
                )}
                {currentWork?.location && currentWork?.locationType && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={location}
                      alt="Location icon"
                      className="w-4 h-4"
                    />
                    <p className="text-gray-600">
                      {`${currentWork.location} - ${currentWork.locationType}`}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t-2 border-dotted border-green-500 pt-3 cursor-pointer">
                <span className="text-gray-700">Work Experience</span>
                <img src={arrowRight} alt="arrow" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
