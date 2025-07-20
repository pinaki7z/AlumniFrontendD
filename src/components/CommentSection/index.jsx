import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { X, Send, Heart, MessageCircle, MoreVertical, Trash2 } from 'lucide-react';
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

  const handleLikeToggle = (commentId, reaction = '❤️') => {
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
      <div className="space-y-3 sm:space-y-4">
        {commentsArray.map((comment) => (
          <div key={comment._id} className="group">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Mobile Profile Image */}
              <div className="relative flex-shrink-0">
                <img
                  src={comment.profilePicture || profilePic}
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                {/* Mobile Comment Content */}
                <div className="bg-gray-50 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 relative">
                  {/* Mobile Options Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleReportToggle(comment._id)}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    {showReport[comment._id] && (
                      <div className="absolute right-0 mt-1 w-24 sm:w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button
                          onClick={() => {
                            handleReport(comment._id, comment.userId);
                            setShowReport({ ...showReport, [comment._id]: false });
                          }}
                          className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                        >
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-800 truncate">{comment.userName}</h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  
                  {/* Mobile Comment Text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 mt-2 ml-2">
                  {/* Mobile Like Button with Reactions */}
                  <div className="relative group/reactions">
                    <button
                      onMouseEnter={() => setLikes({ ...likes, hoverComment: comment._id })}
                      onMouseLeave={() => setLikes({ ...likes, hoverComment: null })}
                      onClick={() => handleLikeToggle(comment._id)}
                      className={`text-xs font-medium transition-colors ${
                        likes[comment._id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      {likes[comment._id] || 'Like'}
                    </button>
                    
                    {/* Mobile Reaction Picker */}
                    {likes.hoverComment === comment._id && (
                      <div className="absolute bottom-full mb-2 left-0 flex gap-1 bg-white border border-gray-200 rounded-full shadow-lg p-1.5 sm:p-2 z-10">
                        {reactions.map((reaction, index) => (
                          <button
                            key={index}
                            className="text-sm sm:text-lg hover:scale-125 transition-transform p-0.5 sm:p-1"
                            onClick={() => {
                              handleLikeToggle(comment._id, reaction);
                              setLikes({ ...likes, hoverComment: null });
                            }}
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Reply Button */}
                  <button
                    onClick={() =>
                      setReplyToCommentId(
                        replyToCommentId === comment._id ? null : comment._id
                      )
                    }
                    className="text-xs font-medium text-gray-500 hover:text-[#71be95] transition-colors"
                  >
                    Reply
                  </button>

                  {/* Mobile Delete Button */}
                  {(comment.userId === profile._id || profile.profileLevel === 0) && (
                    <button
                      onClick={() => handleCommentDelete(comment._id)}
                      className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>

                {/* Mobile Reply Input */}
                {replyToCommentId === comment._id && (
                  <div className="mt-2 sm:mt-3 ml-1 sm:ml-2">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-2">
                      <img
                        src={profile.profilePicture || profilePic}
                        alt="Your profile"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                      />
                      <input
                        className="flex-1 bg-transparent outline-none text-xs sm:text-sm placeholder-gray-500"
                        placeholder="Write a reply..."
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
                        className="p-1 rounded-full bg-[#71be95] text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Nested Comments */}
                {comment.comments && comment.comments.length > 0 && (
                  <div className="ml-4 sm:ml-6 mt-3 sm:mt-4 pl-2 sm:pl-4 border-l-2 border-gray-100">
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
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
      {/* Mobile Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Mobile Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl h-[85vh] sm:max-h-[80vh] z-10 sm:m-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Comments</h2>
            <span className="bg-white/20 text-white text-xs sm:text-sm px-2 py-1 rounded-full">
              {comments?.length || 0}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Mobile Comment Input */}
        <div className="p-3 sm:p-6 border-b border-gray-100">
          <div className="flex items-start gap-2 sm:gap-3">
            <img
              src={profile.profilePicture || profilePic}
              alt="Your profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-sm text-gray-800">
                  {profile.firstName} {profile.lastName}
                </h4>
              </div>
              
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                </div>
              )}
              
              <div className="relative">
                <textarea
                  className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#71be95] focus:border-transparent outline-none text-xs sm:text-sm resize-none transition-all"
                  placeholder="Add a thoughtful comment..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if(e.target.value.trim()) setError('');
                  }}
                  rows={2}
                />
                <div className="flex justify-between items-center mt-2 sm:mt-3">
                  <div className="text-xs text-gray-500">
                    {content.length}/500
                  </div>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={isLoading || !content.trim()}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                      isLoading || !content.trim()
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:shadow-lg text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Comments List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {comments && comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <div className="text-center py-8 sm:py-12">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No comments yet</h3>
              <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
