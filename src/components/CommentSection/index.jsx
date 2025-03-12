import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import './commentSection.css';
import pic from "../../images/odA9sNLrE86.jpg";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { PiArrowBendDownLeftBold } from "react-icons/pi";
import { MdOutlineDelete } from "react-icons/md";
import replyy from "../../images/reply.svg";
import deletee from "../../images/delete.svg";
import baseUrl from "../../config";
import profilePic from "../../images/profilepic.jpg"

const reactions = ['😍', '😂', '😡', '😞', '🤩'];

const CommentSection = ({ comments, entityId, entityType, onCommentSubmit, onDeleteComment,postUserId }) => {
  const [content, setContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [reply, setReply] = useState('');
  const [cookie] = useCookies(['access_token']);
  const forumId = '64f5ce5db9cddde68ba64b75';
  const profile = useSelector((state) => state.profile);
  const [showReport, setShowReport] = useState({});
  const [likes, setLikes] = useState({});
  console.log('comments', comments)

  const handleCommentSubmit = async () => {
    if (content === ''){
      return;
    }
    try {
      const response = await axios.post(`${baseUrl}/${entityType}/${entityId}/comments`, {
        userId: profile._id,
        content: content,
        userName: `${profile.firstName} ${profile.lastName}`,
        parentCommentId: null,
        postUserId: postUserId,
        profilePicture: profile.profilePicture,
      });
      const postId = response.data._id;
      setContent('');
      onCommentSubmit(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`${baseUrl}/${entityType}/${entityId}/comments/${commentId}`);
      onDeleteComment(entityId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReportToggle = (commentId) => {
    setShowReport(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId]
    }));
  };

  const handleReport = async (commentId, userId) => {
    try {
      const response = await axios.put(`${baseUrl}/${entityType}/${entityId}/report`, {
        commentId: commentId,
        userId: userId,
      });
      toast.success('reported');
      onCommentSubmit(entityId);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLikeToggle = (commentId, reaction = '❤️') => {
    setLikes(prevLikes => ({
      ...prevLikes,
      [commentId]: prevLikes[commentId] === reaction ? null : reaction
    }));
  };

  const renderComments = (commentsArray) => {
    if (!commentsArray || commentsArray.length === 0) {
      return null;
    }

    return (
      <ul className="">
        {commentsArray.map((comment) => (
          <li key={comment._id}>
            <div className="p-2">
              <div className='bg-white px-3 py-2 rounded-lg shadow-md ' >
                {/* comment upper row */}

                <div className='flex justify-between '>
                  <div className='flex items-center gap-2'>
                    <img src={comment.profilePicture ? comment.profilePicture : profilePic} className='w-[24px] h-[24px] object-cover rounded-full' />
                    <p className='text-sm font-semibold'>{comment.userName}</p>
                  </div>
                  <div className="comment-menu">
                    <div className="menu-container">
                      <div className="menu-trigger" style={{ cursor: 'pointer' }} onClick={() => handleReportToggle(comment._id)}>&#8286;</div>
                      {showReport[comment._id] && (
                        <div className="menu-options">
                          <button onClick={() => handleReport(comment._id, comment.userId)}>Report</button>
                        </div>
                      )}
                    </div>
                  </div>



                </div>
                {/* comment text here */}
                <div>
                  <p style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>{comment.content}
                  </p>
                </div>
                {/* comment like button started here */}
                <div className="flex justify-end gap-2">
                  <div className="relative" onMouseLeave={() => setLikes({ ...likes, hoverComment: null })} >
                    <button
                      onClick={() => handleLikeToggle(comment._id)}
                      onMouseEnter={() => setLikes({ ...likes, hoverComment: comment._id })}
                      //onMouseLeave={() => setLikes({ ...likes, hoverComment: null })}
                      className='bg-[#136175] px-3 py-1 text-white rounded-lg  '

                    >
                      {likes[comment._id] || 'Like'}
                    </button>
                    {likes.hoverComment === comment._id && (
                      <div className="reaction-emojis" style={{ position: 'absolute', top: '-20px', left: '-40px', display: 'flex', gap: '5px', background: '#fff', border: '1px solid #ddd', padding: '5px', borderRadius: '5px' }}>
                        {reactions.map((reaction, index) => (
                          <span
                            key={index}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleLikeToggle(comment._id, reaction)}
                          >
                            {reaction}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {comment.userId === profile._id || profile.profileLevel === 0 ?
                    <div onClick={() => handleCommentDelete(comment._id)} className='flex gap-1 cursor-pointer bg-[#136175] px-2  text-white rounded-lg  '>
                      {/* <img src={deletee} alt="" srcset="" className='text-white' /> */}
                      <img src='/images/delete_svg.svg' className='w-[20px]' />
                      {/* <button onClick={() => handleCommentDelete(comment._id)}>Delete</button> */}
                    </div> : null}
                  <div className='flex gap-1 cursor-pointer bg-[#136175] px-2  text-white rounded-lg '>
                    {/* <img src={replyy} alt="" srcset="" /> */}
                    <button onClick={() => handleCommentReply(comment._id)}>Reply</button>
                  </div>

                </div>
              </div>


              {replyToCommentId === comment._id && (
                <div className="flex items-end bg-white rounded-lg  my-2 mx-3 px-3 py-2">
                  <input
                    className="outline-none"
                    placeholder="Reply to this comment"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    style={{ width: '100%', border: 'none', borderBottom: '1px solid #71be95', paddingTop: '25px' }}
                  />
                  <div>
                  <button onClick={() => handleReplySubmit(comment._id)} className='bg-[#136175] px-1 py-1 text-white rounded-lg ' >Reply</button>

                  </div>
                </div>
              )}
              {renderComments(comment.comments)}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const handleCommentReply = (commentId) => {
    if (!replyToCommentId) setReplyToCommentId(commentId);
    else setReplyToCommentId(null)
    setContent('');
  };

  const handleReplySubmit = async (parentCommentId) => {
    if(reply === ''){
      return;
    }
    try {
      const response = await axios.post(`${baseUrl}/${entityType}/${entityId}/comments`, {
        content: reply,
        userName: profile.firstName,
        parentCommentId: parentCommentId,
        userId: profile._id,
        profilePicture: profile.profilePicture,
      });
      const postId = response.data._id;
      setReply('');
      setReplyToCommentId(null);
      onCommentSubmit(postId);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <>
      <div className='bg-white pt-3 pb-2 px-2 rounded-lg shadow-md'>
        <div className="" >
          <div className='flex items-center gap-2' ><img src={profile.profilePicture} className='rounded-full h-[30px] w-[30px] object-cover ' />
            <p className='text-base font-semibold '>{profile.firstName}</p>
          </div>
          <input
            className=" outline-none w-full  border-b border-[#71be95] py-2"
            placeholder="Add a comment"
            value={content}
            onChange={(e) => setContent(e.target.value)} 
          />
          <div style={{ display: 'flex', justifyContent: 'end', textAlign: 'center', paddingTop: '15px' }}>
            <button onClick={handleCommentSubmit} className=' bg-[#136175] px-3  text-white text-lg rounded-lg  py-2 font-semibold'>Comment</button>
          </div>
        </div>

      </div>
      {renderComments(comments)}
    </>
  );
};

export default CommentSection;
