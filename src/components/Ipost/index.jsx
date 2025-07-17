import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import CommentSection from '../CommentSection';
import { Menu, MenuItem } from '@mui/material';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';

import profilePic from '../../images/profilepic.jpg';
import liked from '../../images/liked.svg';
import unliked from '../../images/unliked.svg';
import commentIcon from '../../images/comment.svg';
import share from '../../images/share.svg';
import { IoLogoLinkedin } from "react-icons/io5";
import baseUrl from '../../config';
import './Ipost.css';
import Post from '../Post';
import { useSelector } from 'react-redux';
// import { profile } from 'console';

export const Ipost = () => {
  const location = useLocation();
  const {_id } = useParams(); // Get postId from the URL
  const { postId: statePostId, username: stateUsername, text: stateText, timestamp: stateTimestamp, image: stateImage = [], video: stateVideo } = location.state || {};
  const profile = useSelector((state)=>state.profile);
  const postId = statePostId || _id;
  const [visibleComments, setVisibleComments] = useState(false);

  const toggleComments = (postId) => {
    setVisibleComments((prev)=>!prev);
  };
  const [postData, setPostData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userId,setUserId] = useState('');
  const [comments,setComments] = useState([]);
  const shareUrl = window.location.href;
  console.log('comment s', comments)




  const fetchPostData = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        console.log()
        const data = await response.json();
        console.log('Fetched post data:', data);
        setUserId(data.userId)
        setComments(data.comments)
        setPostData(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };
  useEffect(() => {
    // If postId exists but no data from state, fetch the post
   

    fetchPostData();
  }, [statePostId, _id]);

  useEffect(()=>{
    fetchPostData();
  }, [])

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

  // const { username, text, timestamp, image, video } = postData;

  // console.log("postData",postData)
  return (
    <>
    <div className='w-full flex justify-center '>
    <div className=' mb-4 rounded-xl w-full md:w-full xl:w-[850px] my-5 '>
    { postData && <Post
                  userId={postData?.userId?._id}
                  post={postData}
                  postId={_id}
                  username={`${postData?.userId?.firstName} ${postData?.userId?.lastName}` || 'Old user'}
                  text={postData.description}
                  image={postData.picturePath}
                  profilePicture={postData?.userId?.profilePicture}
                  video={postData.videoPath}
                  timestamp={postData.createdAt}
                  likes={postData.likes}
                  entityType={"posts"}
                  admin={profile.profileLevel === 0? true : false}
                  // showDeleteButton={showDeleteButton}
                  handleLikes={handleLike}
                  onCommentIconClick={() => toggleComments(postData._id)}
                  // onDeletePost={() => handleDeletePost(postData._id)}
                  groupID={postData.groupID}
                />}
             {visibleComments &&   <CommentSection
                    entityId={postData._id}
                    entityType="posts"
                    comments={postData.comments.filter(c => !c.reported)}
                    onCommentSubmit={fetchPostData}
                    onDeleteComment={fetchPostData}
                    onClose={() => toggleComments(postData._id)}
                  />}
    </div>
    </div>
    
    </>
  );
};

export default Ipost;


// const OldIndiPost = ()=>{
//   return (
// <div className="ipost">
//       <div className="top">
//         <img src={profilePic} alt="Profile" className="profile-pic" />
//         <div className="info">
//           <h4>{username}</h4>
//           <span className="timestamp">{new Date(timestamp).toLocaleString()}</span>
//         </div>
//       </div>

//       <div className="post-content">
//         {text && <p className="post-text">{text}</p>}

//         {image.length > 1 ? (
//           <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} autoplay={true} autoplaySpeed={2000}>
//             {image.map((img, index) => (
//               <div key={index} className="image">
//                 <img src={img} alt={`Post Image ${index + 1}`} />
//               </div>
//             ))}
//           </Slider>
//         ) : image.length === 1 ? (
//           <img src={image[0]} alt="Post" className="single-image" />
//         ) : null}

//         {video && (
//           <div className="video">
//             <video autoPlay={false} controls>
//               <source src={`${process.env.REACT_APP_API_URL}/${video.videoPath}`} type="video/mp4" />
//             </video>
//             <div className="play-button">
//               <PlayCircleOutlineRoundedIcon fontSize="large" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Bottom Actions: Like, Comment, Share */}
//       <div className="bottomAction">
//         <div className="action" onClick={toggleComments}>
//           <img src={commentIcon} alt="comment-icon" className="postAction grey" />
//           <h4>Comment</h4>
//         </div>
//         <div className="action" onClick={handleLike}>
//           {isLiked ? <img src={liked} alt="Liked" /> : <img src={unliked} alt="Like" />}
//           <h4>{isLiked ? 'Liked' : 'Like'}</h4>
//         </div>
//         <div className="action" onClick={handleShareClick}>
//           <img src={share} alt="share-icon" className="postAction grey" />
//           <h4>Share</h4>
//         </div>
//       </div>

//       <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleShareClose}>
//         <MenuItem>
//           <FacebookShareButton url={shareUrl}>
//             <FacebookIcon size={32} round />
//           </FacebookShareButton>
//         </MenuItem>
//         <MenuItem onClick={handleLinkedInShare}>
//           <IoLogoLinkedin style={{ width: '33px', height: '33px' }} />
//         </MenuItem>
//         <MenuItem>
//           <TwitterShareButton url={shareUrl}>
//             <TwitterIcon size={32} round />
//           </TwitterShareButton>
//         </MenuItem>
//         <MenuItem>
//           <WhatsappShareButton url={shareUrl}>
//             <WhatsappIcon size={32} round />
//           </WhatsappShareButton>
//         </MenuItem>
//       </Menu>
//     {  visibleComments &&  <CommentSection
//                     entityId={_id}
//                     entityType="posts"
//                     //onCommentSubmit={refreshComments}
//                     postUserId={userId}
//                     //onDeleteComment={refreshComments}
//                     comments={comments ? comments.filter(comment => !comment.reported) : null}
//                     onClose={() => toggleComments()}
//                     individualPost={true}
//                   />}
//     </div>
//   )
// }