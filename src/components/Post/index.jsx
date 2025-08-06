import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams, Link, useNavigate } from "react-router-dom";
import { MessageCircle, Share2, ThumbsUp, MoreHorizontal, Trash2, Heart, Clock, Users } from "lucide-react";
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton, WhatsappShareButton } from "react-share";
import { FacebookIcon, LinkedinIcon, TwitterIcon, WhatsappIcon } from "react-share";
import { Menu, MenuItem } from '@mui/material';
import profilePic from "../../images/profilepic.png";
import { IoLogoLinkedin } from "react-icons/io5";


function Post({ userId, postId, profilePicture, username, text, timestamp, image, video, handleLikes, onDeletePost, entityType, showDeleteButton, groupID, onCommentIconClick, post }) {
  const navigate = useNavigate();
  const { _id } = useParams();
  const [isliked, setLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false); // New state for like loading
  const [showFullText, setShowFullText] = useState(false);
  const profile = useSelector((state) => state.profile);
  const loggedInUserId = profile._id;
  const shareUrl = `https://alumnify.in/home/posts/${postId}`;
  const [likes, setLikes] = useState(0);


  // Mobile-first slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    dotsClass: "slick-dots mobile-dots",
    customPaging: () => <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
  };



  const countLikes = async ()=>{
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/postLike/counts/${postId}`
      )
      setLikes(response.data?.data?.like);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  }


  
  const checkLike = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/postLike/check/${postId}/${loggedInUserId}`
      )
      if (response.data) {
        setLiked(response.data?.data?.isLiked);
      }
      console.log(response.data);


    } catch (error) {
      console.error("Error liking post:", error);
    }
  }


  useEffect(() => {
    if (loggedInUserId && postId) {
      checkLike();
      countLikes();
    }
  }, [loggedInUserId, postId]);



  const handleLike = async () => {
    setLikeLoading(true); // Start loading
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/postLike/`,
        { userId: loggedInUserId, userName: username, postId: postId, likeType: 'like' },
        { headers: { "Content-Type": "application/json" } }
      );
      checkLike();
      countLikes();
      const id = await response.data._id;
      // handleLikes(id);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikeLoading(false); // Stop loading
    }
  };


  const handleDeletePost = async (userId) => {
    if (userId === profile._id || profile.profileLevel === 0) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/${entityType}/${postId}`);
        onDeletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };


  const formatCreatedAt = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));


    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;


    return postTime.toLocaleDateString();
  };


  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const handleShareClose = () => {
    setAnchorEl(null);
  };


  const truncateText = (text, maxLength = 140) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };


  return (
    <div className="w-full  bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200 mb-3">
      {loading ? (
        <div className="p-4 sm:p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#71be95] mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Header - Mobile optimized */}
          <div className="p-3 sm:p-4">
            <div className='flex items-center justify-between'>
              <Link to={`/home/members/${userId}`} className="flex items-center gap-2 sm:gap-3 no-underline text-gray-800 hover:text-[#71be95] transition-colors min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <img
                    src={profilePicture || profilePic}
                    alt="profile"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{username}</h4>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs">{formatCreatedAt(timestamp)}</span>
                  </div>
                </div>
              </Link>


              {((profile.profileLevel === 0) || (userId === profile._id)) && (
                <button
                  onClick={() => handleDeletePost(userId)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>


          {/* Content - Mobile optimized */}
          <div className="px-3 sm:px-4">
            <div
              onClick={() => navigate(`/home/posts/${postId}`)}
              className="cursor-pointer"
            >
              {text && (
                <div className="mb-3">
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {showFullText ? text : truncateText(text, 120)}
                  </p>
                  {text.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullText(!showFullText);
                      }}
                      className="text-[#71be95] text-sm mt-1 hover:underline font-medium"
                    >
                      {showFullText ? 'Show less' : '... See more'}
                    </button>
                  )}
                </div>
              )}


              {/* Images - Mobile optimized */}
              {image && image.length > 1 ? (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <Slider {...settings}>
                    {image.map((img, index) => (
                      img && (
                        <div key={index} className="relative">
                          <img src={img} alt={`Post Image ${index + 1}`} className="w-full h-48 sm:h-64 lg:h-80 object-cover" />
                        </div>
                      )
                    ))}
                  </Slider>
                </div>
              ) : image && image.length === 1 && image[0] ? (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img src={image[0]} alt="Post" className="w-full  object-cover" />
                </div>
              ) : null}


              {/* YouTube Video - Mobile optimized */}
              {post.youtubeVideoId && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${post.youtubeVideoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Like count - Mobile optimized with improved styling */}
          {likes > 0 && (
            <div className="px-3 sm:px-4 py-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 fill-[#71be95] text-[#71be95]" />
                  <span className="font-medium text-gray-700">{likes}</span>
                </div>
                <span className="text-gray-500">
                  {likes === 1 ? 'person likes this' : 'people like this'}
                </span>
              </div>
            </div>
          )}


          {/* Actions - Mobile optimized with like loader */}
          {entityType === 'posts' && (
            <div className="border-t border-gray-100 mx-3 sm:mx-4 mt-2">
              <div className="flex items-center justify-around py-2">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md font-medium transition-all duration-200 flex-1 justify-center relative ${
                    isliked
                      ? 'text-[#71be95]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#71be95]'
                    } ${likeLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {likeLoading ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-300 border-t-[#71be95]"></div>
                      <span className="text-xs sm:text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${isliked ? 'fill-current' : ''}`} />
                      <span className="text-xs sm:text-sm">Like</span>
                    </>
                  )}
                </button>


                <button
                  onClick={onCommentIconClick}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md font-medium text-gray-600 hover:bg-gray-50 hover:text-[#71be95] transition-all duration-200 flex-1 justify-center"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Comment</span>
                </button>


                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md font-medium text-gray-600 hover:bg-gray-50 hover:text-[#71be95] transition-all duration-200 flex-1 justify-center"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Share</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}


      {/* Share Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleShareClose}
        PaperProps={{
          className: 'rounded-lg shadow-lg'
        }}
      >
        <MenuItem className="p-2 sm:p-3 min-w-[120px]">
          <FacebookShareButton url={shareUrl} className="flex items-center gap-2">
            <FacebookIcon size={20} round />
            <span className="text-sm">Facebook</span>
          </FacebookShareButton>
        </MenuItem>
        <MenuItem className="p-2 sm:p-3">
          <LinkedinShareButton url={shareUrl} className="flex items-center gap-2">
            <LinkedinIcon size={20} round />
            <span className="text-sm">LinkedIn</span>
          </LinkedinShareButton>
        </MenuItem>
        <MenuItem className="p-2 sm:p-3">
          <TwitterShareButton url={shareUrl} className="flex items-center gap-2">
            <TwitterIcon size={20} round />
            <span className="text-sm">Twitter</span>
          </TwitterShareButton>
        </MenuItem>
        <MenuItem className="p-2 sm:p-3">
          <WhatsappShareButton url={shareUrl} className="flex items-center gap-2">
            <WhatsappIcon size={20} round />
            <span className="text-sm">WhatsApp</span>
          </WhatsappShareButton>
        </MenuItem>
      </Menu>
    </div>
  );
}


export default Post;
