import React, { useState, useEffect, useRef } from 'react';
import { ThumbUpRounded, ChatBubbleOutlineRounded, NearMeRounded, DeleteRounded } from '@mui/icons-material';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Avatar, TextField, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import './Post.scss';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams, Link } from "react-router-dom";
import deleteButton from "../../images/delete.svg";
import commentIcon from "../../images/comment.svg";
import share from "../../images/share.svg";
import liked from "../../images/liked.svg";
import unliked from "../../images/unliked.svg";
import postDelete from "../../images/post-delete.svg";
import baseUrl from "../../config";
import profilePic from "../../images/profilepic.jpg";
import { IoLogoLinkedin } from "react-icons/io5";
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton, WhatsappShareButton } from "react-share";
import { FacebookIcon, LinkedinIcon, TwitterIcon, WhatsappIcon } from "react-share";

function Post({ userId, postId, profilePicture, username, text, timestamp, image, video, likes, handleLikes, onDeletePost, entityType, showDeleteButton, groupID, onCommentIconClick }) {
  const PrevButton = ({ onClick }) => {
    return <button className="slick-arrow slick-prev bg-gray-800 text-white py-1 px-3 rounded" onClick={onClick}>Previous</button>;
  };

  const NextButton = ({ onClick }) => {
    return <button className="slick-arrow slick-next bg-gray-800 text-white py-1 px-3 rounded" onClick={onClick}>Next</button>;
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    prevArrow: <PrevButton />,
    nextArrow: <NextButton />
  };

  const { _id } = useParams();
  const [isliked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [cookie] = useCookies(['access_token']);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const loggedInUserId = profile._id;
  let admin;
  if (profile.profileLevel === 0) {
    admin = true;
  }
  const shareUrl = `https://alumnify.in/home/posts/${postId}`;

  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handlePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        try {
          await videoRef.current.pause();
          setIsPlaying(false);
        } catch (error) {
          console.error('Error playing video:', error);
        }
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (loggedInUserId && postId) {
      const postLiked = likes.some((like) => like.userId === loggedInUserId);
      setLiked(postLiked);
    }
  }, [likes, loggedInUserId, postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/${postId}/comments`);
      const fetchedComments = response.data.comments;
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

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
    if (userId === profile._id) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/${entityType}/${postId}`);
        onDeletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    } else {
      console.log("Cannot Delete");
    }
  };

  const formatCreatedAt = (timestamp) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
    const dateString = new Date(timestamp).toLocaleDateString();
    return `${dateString} ${timeString}`;
  };

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleShare = (platform) => {
    const postUrl = `${window.location.href}/posts/${postId}`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      instagram: `https://www.instagram.com/`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(username)}&summary=${encodeURIComponent(text)}`,
    };
    const url = shareUrls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    handleShareClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-400 p-4">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <Link to={`/home/members/${userId}`} className="flex items-center gap-4 no-underline text-black">
              <img src={profilePic} alt="profile" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex flex-col">
                <h4 className="font-semibold">{username}</h4>
                <span className="text-sm text-gray-600">{formatCreatedAt(timestamp)}</span>
              </div>

            </Link>
            {(admin || userId === profile._id) && (
              <img
                onClick={() => handleDeletePost(userId)}
                className="w-6 h-6 cursor-pointer"
                src={postDelete}
                alt="delete"
              />
            )}
          </div>
          <div className="mt-4">
            <Link to={`/home/posts/${postId}`} state={{ postId, userId, username, profilePicture, text, timestamp, image, video, likes }} className="no-underline">
              {text && (
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{text}</p>
                </div>
              )}
              {image && image.length > 1 ? (
                <Slider {...settings}>
                  {image.map((img, index) => (
                    img && (
                      <div key={index} className="overflow-hidden rounded-lg">
                        <img src={img} alt={`Post Image ${index + 1}`} className="w-full object-cover" />
                      </div>
                    )
                  ))}
                </Slider>
              ) : image && image.length === 1 && image[0] ? (
                <div className="overflow-hidden rounded-lg">
                  <img src={image[0]} alt="Post" className="w-full object-cover" />
                </div>
              ) : null}
              {video && (
                <div className="relative mt-4">
                  <video
                    ref={videoRef}
                    autoPlay={isPlaying}
                    preload="auto"
                    controls={false}
                    onClick={handlePlay}
                    className="w-full rounded-lg"
                  >
                    <source src={video.videoPath} type='video/mp4' />
                    Your browser does not support the video tag.
                  </video>
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={handlePlay}
                  >
                    <PlayCircleOutlineRoundedIcon fontSize='large' className="text-white" />
                  </div>
                </div>
              )}
            </Link>
          </div>
          {entityType === 'posts' && (
            <div className="flex justify-between items-center mt-4 px-2 py-3 border-t border-gray-200">
              <div onClick={onCommentIconClick} className="flex items-center gap-2 cursor-pointer hover:bg-green-100 p-2 rounded"  >
                <img src={commentIcon} alt="comment-icon" className="w-5" />
                <h4 className="hidden md:block font-semibold text-green-700">Comments</h4>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-green-100 p-2 rounded font-semibold" onClick={handleLike}>
                {isliked ? (
                  <img src={liked} alt="liked" className="w-5" />
                ) : (
                  <img src={unliked} alt="unliked" className="w-5" />
                )}
                <h4 className="hidden md:block">{isliked ? 'Liked' : 'Like'}</h4>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-green-100 p-2 rounded font-semibold" onClick={handleShareClick}>
                <img src={share} alt="share-icon" className="w-5" />
                <h4 className="hidden md:block">Share</h4>
              </div>
            </div>
          )}
        </>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleShareClose}>
        <MenuItem>
          <FacebookShareButton url={shareUrl}><FacebookIcon /></FacebookShareButton>
        </MenuItem>
        <MenuItem onClick={handleLinkedInShare}>
          <IoLogoLinkedin className="w-16 h-16" />
        </MenuItem>
        <MenuItem>
          <TwitterShareButton url={shareUrl}><TwitterIcon /></TwitterShareButton>
        </MenuItem>
        <MenuItem>
          <WhatsappShareButton url={shareUrl}><WhatsappIcon /></WhatsappShareButton>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default Post;
