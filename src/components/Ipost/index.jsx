import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Menu, MenuItem } from '@mui/material';
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, LinkedinIcon, TwitterIcon, WhatsappIcon } from 'react-share';

import profilePic from '../../images/profilepic.jpg';
import liked from '../../images/liked.svg';
import unliked from '../../images/unliked.svg';
import commentIcon from '../../images/comment.svg';
import share from '../../images/share.svg';
import { useParams } from "react-router-dom";
import { IoLogoLinkedin } from "react-icons/io5";

import './Ipost.css';

export const Ipost = () => {
  const location = useLocation();
  const { postId, username, text, timestamp, image = [], video } = location.state || {};

  const [isLiked, setIsLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const shareUrl = window.location.href;
  if (!postId) {
    return <div>Post not found.</div>;
  }

  const handleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };


  return (
    <div className="ipost">
      <div className="top">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <div className="info">
          <h4>{username}</h4>
          <span className="timestamp">{new Date(timestamp).toLocaleString()}</span>
        </div>
      </div>

      <div className="post-content">
        {text && <p className="post-text">{text}</p>}

        {image.length > 1 ? (
          <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} autoplay={true} autoplaySpeed={2000}>
            {image.map((img, index) => (
              <div key={index} className="image">
                <img src={img} alt={`Post Image ${index + 1}`} />
              </div>
            ))}
          </Slider>
        ) : image.length === 1 ? (
          <img src={image[0]} alt="Post" className="single-image" />
        ) : null}

        {video && (
          <div className="video">
            <video autoPlay={false} controls>
              <source src={`${process.env.REACT_APP_API_URL}/${video.videoPath}`} type="video/mp4" />
            </video>
            <div className="play-button">
              <PlayCircleOutlineRoundedIcon fontSize="large" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions: Like, Comment, Share */}
      <div className="bottomAction">
        <div className="action">
          <img src={commentIcon} alt="comment-icon" className="postAction grey" />
          <h4>Comment</h4>
        </div>
        <div className="action" onClick={handleLike}>
          {isLiked ? <img src={liked} alt="Liked" /> : <img src={unliked} alt="Like" />}
          <h4>{isLiked ? 'Liked' : 'Like'}</h4>
        </div>
        <div className="action" onClick={handleShareClick}>
          <img src={share} alt="share-icon" className="postAction grey" />
          <h4>Share</h4>
        </div>
      </div>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleShareClose}>
        <MenuItem>
          <FacebookShareButton url={shareUrl}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
        </MenuItem>
        <MenuItem onClick={handleLinkedInShare}>
          <IoLogoLinkedin style={{ width: '33px', height: '33px' }} />
        </MenuItem>
        <MenuItem>
          <TwitterShareButton url={shareUrl}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </MenuItem>
        <MenuItem>
          <WhatsappShareButton url={shareUrl}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Ipost;
