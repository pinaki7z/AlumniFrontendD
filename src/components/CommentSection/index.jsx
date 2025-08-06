import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Send, Heart, MoreHorizontal, Trash2, ThumbsUp, MessageCircle } from 'lucide-react';
import profilePic from "../../images/profilepic.png";

const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const CommentSection = ({
  comments,
  entityId,
  postId=entityId,
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
  const [showReactions, setShowReactions] = useState({});
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/${entityType}/${entityId}/comments`, {
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
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/${entityType}/${entityId}/comments/${commentId}`);
      onDeleteComment(entityId);
      toast.success('Comment deleted!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
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
      await axios.put(`${process.env.REACT_APP_API_URL}/${entityType}/${entityId}/report`, {
        commentId: commentId,
        userId: userId,
      });
      toast.success('Comment reported');
      onCommentSubmit(entityId);
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast.error('Failed to report comment');
    }
  };

  const handleLikeToggle = (commentId, reaction = '👍') => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [commentId]: prevLikes[commentId] === reaction ? null : reaction
    }));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderComments = (commentsArray) => {
    return (
      <div className="space-y-3">
        {commentsArray.map((comment) => (
          <div key={comment._id} className="group">
            <div className="flex gap-3">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={comment.profilePicture || profilePic}
                  alt={comment.userName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Comment Card */}
                <div className="relative">
                  {/* Main Comment Bubble */}
                  <div className="bg-gray-50 rounded-2xl px-4 py-3 relative group/comment hover:bg-gray-100 transition-all duration-200 border border-gray-100">
                    {/* Options Menu */}
                    <div className="absolute top-2 right-3 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleReportToggle(comment._id)}
                        className="p-1.5 rounded-full hover:bg-white text-gray-400 hover:text-gray-600 transition-all duration-200 shadow-sm"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {showReport[comment._id] && (
                        <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 animate-in slide-in-from-top-2">
                          <button
                            onClick={() => {
                              handleReport(comment._id, comment.userId);
                              setShowReport({ ...showReport, [comment._id]: false });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Report
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* User Name and Time */}
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">{comment.userName}</h4>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    
                    {/* Comment Text */}
                    <p className="text-sm text-gray-800 leading-relaxed pr-8">{comment.content}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-6 mt-2 ml-2">
                    {/* Like Button with Reactions */}
                    <div className="relative">
                      <button
                        onClick={() => handleLikeToggle(comment._id)}
                        onMouseEnter={() => setShowReactions({ ...showReactions, [comment._id]: true })}
                        className={`flex items-center gap-1 text-xs font-medium transition-all duration-200 hover:text-[#71be95] ${
                          likes[comment._id] ? 'text-[#71be95]' : 'text-gray-500'
                        }`}
                      >
                        {likes[comment._id] ? (
                          <span className="text-sm">{likes[comment._id]}</span>
                        ) : (
                          <ThumbsUp className="w-3 h-3" />
                        )}
                        <span>Like</span>
                      </button>
                      
                      {/* Reaction Picker */}
                      {showReactions[comment._id] && (
                        <div 
                          className="absolute bottom-full mb-2 left-0 flex gap-1 bg-white border border-gray-200 rounded-full shadow-xl p-2 z-10 animate-in slide-in-from-bottom-2"
                          onMouseLeave={() => setShowReactions({ ...showReactions, [comment._id]: false })}
                        >
                          {reactions.map((reaction, index) => (
                            <button
                              key={index}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform rounded-full hover:bg-gray-100"
                              onClick={() => {
                                handleLikeToggle(comment._id, reaction);
                                setShowReactions({ ...showReactions, [comment._id]: false });
                              }}
                            >
                              {reaction}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply Button */}
                    <button
                      onClick={() =>
                        setReplyToCommentId(
                          replyToCommentId === comment._id ? null : comment._id
                        )
                      }
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#71be95] transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Reply</span>
                    </button>

                    {/* Delete Button */}
                    {(comment.userId === profile._id || profile.profileLevel === 0) && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyToCommentId === comment._id && (
                    <div className="mt-4 flex gap-3 animate-in slide-in-from-top-2">
                      <img
                        src={profile.profilePicture || profilePic}
                        alt="Your profile"
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm focus-within:border-[#71be95] focus-within:shadow-md transition-all">
                          <input
                            className="w-full bg-transparent outline-none text-sm placeholder-gray-500"
                            placeholder={`Reply to ${comment.userName}...`}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && reply.trim()) {
                                // handleReplySubmit(comment._id);
                              }
                            }}
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => {
                              if (reply.trim()) {
                                // handleReplySubmit(comment._id);
                              }
                            }}
                            disabled={!reply.trim()}
                            className="px-4 py-1.5 bg-[#71be95] text-white rounded-full text-xs font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all hover:bg-[#5fa080] hover:shadow-md"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested Comments */}
                  {comment.comments && comment.comments.length > 0 && (
                    <div className="mt-4 ml-6 pl-4 border-l-2 border-gray-100">
                      {renderComments(comment.comments)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50/50 rounded-b-2xl border-t border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#71be95]" />
          Comments ({comments?.length || 0})
        </h3>
      </div>

      {/* Comment Input Section */}
      <div className="p-4 bg-white">
        <div className="flex items-start gap-3">
          <img
            src={profile.profilePicture || profilePic}
            alt="Your profile"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-700 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[#71be95] focus-within:bg-white focus-within:shadow-md transition-all duration-200">
              <textarea
                className="w-full p-4 bg-transparent outline-none text-sm resize-none placeholder-gray-500 rounded-2xl"
                placeholder={`Share your thoughts, ${profile.firstName}...`}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if(e.target.value.trim()) setError('');
                }}
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center px-4 pb-3">
                <span className="text-xs text-gray-400">
                  {content.length}/500 characters
                </span>
                <button
                  onClick={handleCommentSubmit}
                  disabled={isLoading || !content.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                    isLoading || !content.trim()
                      ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:shadow-lg text-white transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="px-4 pb-4 bg-white">
        {comments && comments.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-1 custom-scrollbar">
            {renderComments(comments)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </div>
            <h4 className="text-base font-medium text-gray-600 mb-2">No comments yet</h4>
            <p className="text-sm text-gray-400">Be the first to share your thoughts on this post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
