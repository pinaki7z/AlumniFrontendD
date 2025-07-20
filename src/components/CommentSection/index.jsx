import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Send, Heart, MoreHorizontal, Trash2, ThumbsUp } from 'lucide-react';
import profilePic from "../../images/profilepic.jpg";

const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

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
      <div className="space-y-4">
        {commentsArray.map((comment) => (
          <div key={comment._id} className="group">
            <div className="flex gap-3">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={comment.profilePicture || profilePic}
                  alt={comment.userName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Comment Content */}
                <div className="bg-gray-50 rounded-2xl px-3 py-2 relative group/comment hover:bg-gray-100 transition-colors">
                  {/* Options Menu */}
                  <div className="absolute top-1 right-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleReportToggle(comment._id)}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                    {showReport[comment._id] && (
                      <div className="absolute right-0 top-6 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            handleReport(comment._id, comment.userId);
                            setShowReport({ ...showReport, [comment._id]: false });
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* User Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">{comment.userName}</h4>
                  </div>
                  
                  {/* Comment Text */}
                  <p className="text-sm text-gray-800 leading-relaxed pr-6">{comment.content}</p>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-4 mt-1 ml-1">
                  {/* Time */}
                  {/* <span className="text-xs text-gray-500 font-medium">
                    {formatTimeAgo(comment.createdAt)}
                  </span> */}

                  {/* Like Button with Reactions */}
                  <div className="relative">
                    <button
                      onClick={() => handleLikeToggle(comment._id)}
                      onMouseEnter={() => setShowReactions({ ...showReactions, [comment._id]: true })}
                      className={`text-xs font-semibold transition-colors hover:text-[#71be95] ${
                        likes[comment._id] ? 'text-[#71be95]' : 'text-gray-500'
                      }`}
                    >
                      {likes[comment._id] ? `${likes[comment._id]} Like` : 'Like'}
                    </button>
                    
                    {/* Reaction Picker */}
                    {showReactions[comment._id] && (
                      <div 
                        className="absolute bottom-full mb-2 left-0 flex gap-1 bg-white border border-gray-200 rounded-full shadow-lg p-2 z-10"
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
                    className="text-xs font-semibold text-gray-500 hover:text-[#71be95] transition-colors"
                  >
                    Reply
                  </button>

                  {/* Delete Button */}
                  {(comment.userId === profile._id || profile.profileLevel === 0) && (
                    <button
                      onClick={() => handleCommentDelete(comment._id)}
                      className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>

                {/* Reply Input */}
                {replyToCommentId === comment._id && (
                  <div className="mt-3 flex gap-2">
                    <img
                      src={profile.profilePicture || profilePic}
                      alt="Your profile"
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                    />
                    <div className="flex-1 flex items-center bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200 focus-within:border-[#71be95] focus-within:bg-white transition-all">
                      <input
                        className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
                        placeholder={`Reply to ${comment.userName}...`}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && reply.trim()) {
                            // handleReplySubmit(comment._id);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (reply.trim()) {
                            // handleReplySubmit(comment._id);
                          }
                        }}
                        disabled={!reply.trim()}
                        className="ml-2 p-1 rounded-full bg-[#71be95] text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors hover:bg-[#5fa080]"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Comments */}
                {comment.comments && comment.comments.length > 0 && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100">
                    {renderComments(comment.comments)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border-t border-gray-100">
      {/* Comment Input Section */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200">
        <div className="flex items-start gap-3">
          <img
            src={profile.profilePicture || profilePic}
            alt="Your profile"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
          />
          <div className="flex-1">
            {error && (
              <div className="mb-2 p-2 bg-red-50 border-l-4 border-red-400 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className=" focus-within:border-[#71be95] focus-within:shadow-sm transition-all">
              <textarea
                className="w-full p-1 bg-transparent outline-none text-sm resize-none placeholder-gray-500 rounded-2xl"
                placeholder={`What do you think, ${profile.firstName}?`}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if(e.target.value.trim()) setError('');
                }}
                rows={2}
                maxLength={500}
              />
              <div className="flex justify-between items-center px-3 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {content.length}/500
                  </span>
                </div>
                <button
                  onClick={handleCommentSubmit}
                  disabled={isLoading || !content.trim()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                    isLoading || !content.trim()
                      ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:shadow-md text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
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
      <div className="px-4 pb-4">
        {comments && comments.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {renderComments(comments)}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No comments yet</p>
            <p className="text-xs text-gray-400">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
