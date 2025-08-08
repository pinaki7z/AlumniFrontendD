import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import CommentSection from '../CommentSection';


import './Ipost.css';
import Post from '../Post';
import { useSelector } from 'react-redux';

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
  // console.log('comment s', comments)




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
                    postId={postData._id}
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


