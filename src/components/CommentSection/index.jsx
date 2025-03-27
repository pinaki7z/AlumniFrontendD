import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { PiArrowBendDownLeftBold } from "react-icons/pi";
import { MdOutlineDelete } from "react-icons/md";
import baseUrl from "../../config";
import pic from "../../images/odA9sNLrE86.jpg";
import profilePic from "../../images/profilepic.jpg";

const reactions = ['😍', '😂', '😡', '😞', '🤩'];

const CommentSection = ({
  comments,
  entityId,
  entityType,
  onCommentSubmit,
  onDeleteComment,
  postUserId,
  onClose,
  individualPost,
}) => {
  const [content, setContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [reply, setReply] = useState('');
  const [cookie] = useCookies(['access_token']);
  const profile = useSelector((state) => state.profile);
  const [showReport, setShowReport] = useState({});
  const [likes, setLikes] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCommentSubmit = async () => {
    if (!content.trim()) {
      setError('Comment cannot be blank');
      return;
    }
    setError('');
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    setShowReport((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId]
    }));
  };

  const handleReport = async (commentId, userId) => {
    try {
      await axios.put(`${baseUrl}/${entityType}/${entityId}/report`, {
        commentId: commentId,
        userId: userId,
      });
      toast.success('Comment Reported');
      onCommentSubmit(entityId);
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const handleLikeToggle = (commentId, reaction = '❤️') => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [commentId]: prevLikes[commentId] === reaction ? null : reaction
    }));
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!reply.trim()) return;
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

  // Recursive function to render nested comments
  const renderComments = (commentsArray) => {
    return (
      <ul className="space-y-4">
        {commentsArray.map((comment) => (
          <li key={comment._id}>
            <div className="flex items-start gap-2">
              {/* Profile Image */}
              <img
                src={comment.profilePicture ? comment.profilePicture : profilePic}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover"
              />

              <div className="">
                {/* Comment bubble and top row */}
                <div className="bg-gray-100 rounded-lg px-3 py-2 relative">
                  {/* Ellipsis / Report button (top-right) */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleReportToggle(comment._id)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      &#8942;
                    </button>
                    {showReport[comment._id] && (
                      <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10">
                        <button
                          onClick={() => handleReport(comment._id, comment.userId)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* User Name & Content */}
                  <p className="font-semibold text-sm text-gray-800">{comment.userName}</p>
                  <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                </div>

                {/* Action buttons row: Like, Reply, Delete */}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 pl-1">
                  {/* Like with Reaction Popover */}
                  <div
                    className="relative"
                    onMouseLeave={() => setLikes({ ...likes, hoverComment: null })}
                  >
                    <button
                      onMouseEnter={() => setLikes({ ...likes, hoverComment: comment._id })}
                      onClick={() => handleLikeToggle(comment._id)}
                      className="hover:underline hover:text-blue-600 focus:outline-none transition"
                    >
                      {likes[comment._id] || 'Like'}
                    </button>
                    {likes.hoverComment === comment._id && (
                      <div className="absolute bottom-full mb-2 left-0 flex gap-2 bg-white border rounded shadow p-2 transition">
                        {reactions.map((reaction, index) => (
                          <span
                            key={index}
                            className="cursor-pointer text-xl"
                            onClick={() => handleLikeToggle(comment._id, reaction)}
                          >
                            {reaction}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reply */}
                  <button
                    onClick={() =>
                      setReplyToCommentId(
                        replyToCommentId === comment._id ? null : comment._id
                      )
                    }
                    className="hover:underline hover:text-blue-600 focus:outline-none transition"
                  >
                    Reply
                  </button>

                  {/* Delete (only owner or admin) */}
                  {(comment.userId === profile._id || profile.profileLevel === 0) && (
                    <button
                      onClick={() => handleCommentDelete(comment._id)}
                      className="hover:underline hover:text-blue-600 focus:outline-none transition"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Reply input box */}
                {replyToCommentId === comment._id && (
                  <div className="mt-2 pl-2">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <input
                        className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                        placeholder="Write a reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                      <button
                        onClick={() => handleReplySubmit(comment._id)}
                        className="ml-3 text-blue-600 font-semibold text-sm focus:outline-none"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Render nested comments if any */}
                {comment.comments && comment.comments.length > 0 && (
                  <div className="ml-10 mt-3">{renderComments(comment.comments)}</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow p-6 overflow-y-auto w-full max-w-3xl max-h-[650px] z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>

        {/* Comment input area */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <img
              src={profile.profilePicture || profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="text-base font-semibold text-gray-800">
              {profile.firstName}
            </p>
          </div>
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
          <textarea
            className="w-full mt-3 p-3 bg-gray-100 rounded focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if(e.target.value.trim()) setError('');
            }}
            rows={2}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleCommentSubmit}
              disabled={isLoading}
              className={`px-5 py-2 rounded font-semibold text-sm transition focus:outline-none ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-[#0A3A4C] hover:bg-blue-800 text-white'
              }`}
            >
              {isLoading ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="max-h-[350px] thin-scroller overflow-y-auto custom-scrollbar">
          {comments && comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <p className="text-center text-base text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
