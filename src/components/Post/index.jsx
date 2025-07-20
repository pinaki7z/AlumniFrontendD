import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams, Link, useNavigate } from "react-router-dom";
import { MessageCircle, Share2, ThumbsUp, MoreHorizontal, Trash2, Heart, Clock } from "lucide-react";
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton, WhatsappShareButton } from "react-share";
import { FacebookIcon, LinkedinIcon, TwitterIcon, WhatsappIcon } from "react-share";
import { Menu, MenuItem } from '@mui/material';
import profilePic from "../../images/profilepic.jpg";
import { IoLogoLinkedin } from "react-icons/io5";

function Post({ userId, postId, profilePicture, username, text, timestamp, image, video, likes, handleLikes, onDeletePost, entityType, showDeleteButton, groupID, onCommentIconClick, post }) {
  const navigate = useNavigate();
  const { _id } = useParams();
  const [isliked, setLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const profile = useSelector((state) => state.profile);
  const loggedInUserId = profile._id;
  const shareUrl = `https://alumnify.in/home/posts/${postId}`;

  // Mobile-first slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false, // Disabled for mobile UX
    arrows: false, // Hidden on mobile
    dotsClass: "slick-dots mobile-dots",
    customPaging: () => <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
  };

  useEffect(() => {
    if (loggedInUserId && postId) {
      const postLiked = likes.some((like) => like.userId === loggedInUserId);
      setLiked(postLiked);
    }
  }, [likes, loggedInUserId, postId]);

  const handleLike = async () => {
    setLiked(!isliked);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/likes`,
        { userId: loggedInUserId, userName: username },
        { headers: { "Content-Type": "application/json" } }
      );
      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error("Error liking post:", error);
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

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 mb-3 sm:mb-4">
      {loading ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#71be95] mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Mobile Header */}
          <div className="p-3 sm:p-4 border-b border-gray-50">
            <div className='flex items-center justify-between'>
              <Link to={`/home/members/${userId}`} className="flex items-center gap-2 sm:gap-3 no-underline text-gray-800 hover:text-[#71be95] transition-colors">
                <div className="relative">
                  <img 
                    src={profilePicture || profilePic} 
                    alt="profile" 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-100" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-800 truncate">{username}</h4>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs sm:text-sm">{formatCreatedAt(timestamp)}</span>
                  </div>
                </div>
              </Link>
              
              {((profile.profileLevel === 0) || (userId === profile._id)) && (
                <button
                  onClick={() => handleDeletePost(userId)}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-3 sm:p-4">
            <div 
              onClick={() => navigate(`/home/posts/${postId}`)} 
              className="cursor-pointer"
            >
              {text && (
                <div className="mb-3 sm:mb-4">
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {showFullText ? text : truncateText(text, 120)}
                  </p>
                  {text.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullText(!showFullText);
                      }}
                      className="text-[#71be95] text-sm mt-2 hover:underline font-medium"
                    >
                      {showFullText ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}

              {/* Mobile Images */}
              {image && image.length > 1 ? (
                <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                  <Slider {...settings}>
                    {image.map((img, index) => (
                      img && (
                        <div key={index} className="relative">
                          <img src={img} alt={`Post Image ${index + 1}`} className="w-full h-48 sm:h-64 md:h-80 object-cover" />
                        </div>
                      )
                    ))}
                  </Slider>
                </div>
              ) : image && image.length === 1 && image[0] ? (
                <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                  <img src={image[0]} alt="Post" className="w-full h-48 sm:h-64 md:h-80 object-cover" />
                </div>
              ) : null}

              {/* Mobile YouTube Video */}
              {post.youtubeVideoId && (
                <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${post.youtubeVideoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg sm:h-56 md:h-64"
                  ></iframe>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Like count */}
          {likes && likes.length > 0 && (
            <div className="px-3 sm:px-4 pb-2">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-red-500 text-red-500" />
                <span>{likes.length} {likes.length === 1 ? 'like' : 'likes'}</span>
              </div>
            </div>
          )}

          {/* Mobile Actions */}
          {entityType === 'posts' && (
            <div className="border-t border-gray-50 px-2 sm:px-4 py-1 sm:py-2">
              <div className="flex justify-between items-center">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                    isliked 
                      ? 'bg-[#71be95]/10 text-[#71be95]' 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-[#71be95]'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${isliked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Like</span>
                </button>

                <button 
                  onClick={onCommentIconClick}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-[#71be95] transition-all duration-200 text-xs sm:text-sm"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Comment</span>
                </button>

                <button 
                  onClick={handleShareClick}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-[#71be95] transition-all duration-200 text-xs sm:text-sm"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Share Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleShareClose}
        PaperProps={{
          className: 'rounded-xl shadow-lg border border-gray-100'
        }}
      >
        <MenuItem className="p-2 sm:p-3">
          <FacebookShareButton url={shareUrl} className="flex items-center gap-2">
            <FacebookIcon size={24} round />
            <span className="text-sm">Facebook</span>
          </FacebookShareButton>
        </MenuItem>
        <MenuItem className="p-2 sm:p-3">
          <LinkedinShareButton url={shareUrl} className="flex items-center gap-2">
            <LinkedinIcon size={24} round />
            <span className="text-sm">LinkedIn</span>
          </LinkedinShareButton>
        </MenuItem>
        <MenuItem className="p-2 sm:p-3">
          <TwitterShareButton url={shareUrl} className="flex items-center gap-2">
            <TwitterIcon size={24} round />
            <span className="text-sm">Twitter</span>
          </TwitterShareButton>
        </MenuItem>
        <MenuItem className="p-2 sm:p-3">
          <WhatsappShareButton url={shareUrl} className="flex items-center gap-2">
            <WhatsappIcon size={24} round />
            <span className="text-sm">WhatsApp</span>
          </WhatsappShareButton>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default Post;
