import React from 'react';
import { ThumbUpRounded, ChatBubbleOutlineRounded, NearMeRounded, DeleteRounded } from '@mui/icons-material';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Avatar, TextField, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import './Post.scss';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams } from "react-router-dom";
import deleteButton from "../../images/delete.svg";
import commentIcon from "../../images/comment.svg";
import share from "../../images/share.svg";
import liked from "../../images/liked.svg";
import unliked from "../../images/unliked.svg";
import { Link } from 'react-router-dom';
import postDelete from "../../images/post-delete.svg";
import baseUrl from "../../config";
import profilePic from "../../images/profilepic.jpg";
import { IoLogoLinkedin } from "react-icons/io5";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton
} from "react-share";

import {
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon
} from "react-share";

function Post({ userId, postId, profilePicture, username, text, timestamp, image, video, likes, handleLikes, handleComments, className, onDeletePost, entityType, showDeleteButton, groupID }) {
  console.log('video pathh', video)


  const PrevButton = ({ onClick }) => {
    return <button className="slick-arrow slick-prev" style={{ background: 'black' }} onClick={onClick}>Previous</button>;
  };

  const NextButton = ({ onClick }) => {
    return <button className="slick-arrow slick-next" style={{ background: 'black' }} onClick={onClick}>Next</button>;
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
  const [cookie, setCookie] = useCookies(['access_token']);
  const [anchorEl, setAnchorEl] = useState(null);


  const [loading, setLoading] = useState(false)
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
      const response = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const fetchedComments = response.data.comments;
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };


  const handleLike = async (e) => {
    setLiked(!isliked);
    try {

      const response = await axios.patch(
        `${baseUrl}/posts/${postId}/likes`,
        {
          userId: loggedInUserId,
          userName: username,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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
        await axios.delete(`${baseUrl}/${entityType}/${postId}`);
        onDeletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
    else {
      console.log("Cannot Delete")
    }
  };
  const formatCreatedAt = (timestamp) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
    const dateString = new Date(timestamp).toLocaleDateString();

    return `${dateString} ${timeString}`;
  };

  // if (!groupID && groupID !== _id) {
  //   console.log("SKIPPPP")
  //   return null; 
  // }

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
      instagram: `https://www.instagram.com/`, // Instagram does not allow direct sharing via URL
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(username)}&summary=${encodeURIComponent(text)}`,
    };

    const url = shareUrls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    handleShareClose();
  };

  return (
    <div className={``}>
      {loading ? (<div> Loading...</div>) : (<>
        <Link
          to={`/home/members/${userId}`}
          style={{ textDecoration: "none", color: "black" }}
        >
          <div className='top'>
            <img src={profilePic} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            <div className='info'>
              <h4>{username}</h4>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#0a3a4c' }}>{formatCreatedAt(timestamp)}</span>
            </div>
            {(admin || userId === profile._id) && (
              // <IconButton onClick={() => handleDeletePost(userId)} className='delete-button'>
                <img className='delete-button' src={postDelete} />
              // </IconButton>
            )}

          </div>
        </Link>
        <div>
          <Link to={`/home/posts/${postId}`} state={{ postId, userId, username, profilePicture, text, timestamp, image, video, likes }} style={{ textDecoration: 'none' }}>
            {text && (
              <div className='texxt'>
                <p>{text}</p>
              </div>
            )}
            {image && image.length > 1 ? (
              <Slider {...settings}>
                {image.map((img, index) => (
                  img ? (
                    <div key={index} className='image'>
                      <img src={img} alt={`Post Image ${index + 1}`} />
                    </div>
                  ) : null
                ))}
              </Slider>
            ) : image && image.length === 1 && image[0] ? (
              <div>
                <img src={image[0]} alt={`image`}  />
              </div>
            ) : null}


            {video && (
              <div className='video'>
                <video
                  ref={videoRef}
                  autoPlay={isPlaying}
                  preload="auto"
                  controls={false}
                  onClick={handlePlay}
                >
                  <source src={video.videoPath} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
                <div className={`play-button ${isPlaying ? '' : ''}`} onClick={handlePlay}>
                  <PlayCircleOutlineRoundedIcon fontSize='large' />
                </div>
              </div>
            )}
          </Link>
        </div>
        {console.log('entity type1', entityType)}
        {entityType === 'posts' && (
          <div className='flex justify-between px-2 md:px-5  py-3'>
            <div className='flex gap-1 text-[#136175] cursor-pointer hover:bg-[#6fbc9461] py-2 px-2 rounded-lg '>
              <img src={commentIcon} alt='comment-icon' className='h-[20px]'  />
              <h4 className='font-semibold hidden md:block'>Comments</h4>
            </div>
            <div className='flex gap-1 text-[#136175] cursor-pointer hover:bg-[#6fbc9461] py-2 md:px-2 rounded-lg font-semibold ' onClick={handleLike}>{
              isliked ? (
                <img src={liked} alt="" srcset="" />
              ) : (
                <img src={unliked} alt="" srcset="" />
              )
            } <h4 className='hidden md:block'>{isliked ? 'Liked' : 'Like'}</h4>
            </div>

            <div className='flex gap-1 text-[#136175] cursor-pointer hover:bg-[#6fbc9461] py-2 px-2 rounded-lg font-semibold' onClick={handleShareClick}>
              <img src={share} alt='share-icon' className={`postAction grey`} />
              <h4 className='hidden md:block'>Share</h4>
            </div>
          </div>
        )}
      </>)}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleShareClose}>
        <MenuItem>
          <FacebookShareButton url={shareUrl}><FacebookIcon /></FacebookShareButton>
        </MenuItem>
        {/* <MenuItem onClick={() => handleShare('instagram')}>Share to Instagram</MenuItem> */}
        <MenuItem onClick={handleLinkedInShare}>
          <IoLogoLinkedin style={{ width: '70px', height: '70px' }} />
        </MenuItem>
        <MenuItem >
          <TwitterShareButton url={shareUrl}><TwitterIcon /></TwitterShareButton>
        </MenuItem>
        <MenuItem >
          <WhatsappShareButton url={shareUrl}><WhatsappIcon /></WhatsappShareButton>
        </MenuItem>
      </Menu>
    </div>
  );
}


export default Post;
