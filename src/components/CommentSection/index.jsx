// CommentSection.jsx - Mobile-first Enhanced version
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Send, 
  Heart, 
  MoreHorizontal, 
  Trash2, 
  ThumbsUp, 
  MessageCircle,
  Edit3,
  Flag,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import profilePic from "../../images/profilepic.png";

const reactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' }
];

const CommentSection = ({
  postId,
  onClose,
  onCommentCountChange
}) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [commentLikes, setCommentLikes] = useState({});
  const [showReactions, setShowReactions] = useState({});
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const profile = useSelector((state) => state.profile);

  // Load comments
  const loadComments = async (pageNum = 1, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/postComment/post/${postId}?page=${pageNum}&limit=10`
      );
      
      if (response.data.success) {
        const newComments = response.data.data;
        setComments(reset ? newComments : [...comments, ...newComments]);
        setHasMore(response.data.pagination.hasNext);
        
        // Load like status for each comment
        newComments.forEach(comment => {
          checkCommentLike(comment._id);
        });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Check if user liked a comment
  const checkCommentLike = async (commentId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/postComment/${commentId}/like/${profile._id}`
      );
      if (response.data.success) {
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  // Load replies for a comment
  const loadReplies = async (commentId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/postComment/replies/${commentId}`
      );
      if (response.data.success) {
        setReplies(prev => ({
          ...prev,
          [commentId]: response.data.data
        }));
        setShowReplies(prev => ({
          ...prev,
          [commentId]: true
        }));
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  useEffect(() => {
    if (postId) {
      loadComments(1, true);
    }
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (!content.trim()) {
      setError('Comment cannot be blank');
      return;
    }
    setError('');
    setIsLoading(true);
    console.log("postid comment function", postId)
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/postComment`, {
        postId: postId,
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        content: content.trim(),
        profilePicture: profile.profilePicture,
      });

      if (response.data.success) {
        setContent('');
        loadComments(1, true);
        onCommentCountChange && onCommentCountChange();
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyContent.trim()) return;
    setIsLoading(true); // Add this line
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/postComment`, {
        postId: postId,
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        content: replyContent.trim(),
        profilePicture: profile.profilePicture,
        parentCommentId: parentCommentId
      });

      if (response.data.success) {
        setReplyContent('');
        setReplyToCommentId(null);
        loadReplies(parentCommentId);
        loadComments(1, true);
        toast.success('Reply added successfully!');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
     finally {
    setIsLoading(false); // Add this line
  }
  };

  const handleCommentLike = async (commentId, reaction = 'like') => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/postComment/${commentId}/like`,
        { userId: profile._id, reaction }
      );
      
      if (response.data.success) {
        checkCommentLike(commentId);
        setShowReactions(prev => ({
          ...prev,
          [commentId]: false
        }));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/postComment/${commentId}`);
      if (response.data.success) {
        loadComments(1, true);
        onCommentCountChange && onCommentCountChange();
        toast.success('Comment deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleCommentReport = async (commentId) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/postComment/${commentId}/report`);
      if (response.data.success) {
        toast.success('Comment reported successfully');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast.error('Failed to report comment');
    }
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

  const renderComment = (comment, isReply = false) => {
    const commentLike = commentLikes[comment._id] || { isLiked: false, likeCount: 0 };
    
    return (
      <div key={comment._id} className={`${isReply ? 'ml-6 sm:ml-8 md:ml-12' : ''} mb-3 sm:mb-4`}>
        <div className="flex gap-2 sm:gap-3 group">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <img
              src={comment?.userId?.profilePicture || profilePic}
              alt={comment?.userName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Bubble */}
            <div className=" bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 relative  hover:shadow-sm transition-all duration-300 ">
              {/* Options Menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="">
                  <button
                    className="p-1.5 rounded-full hover:bg-white/80 text-gray-400 hover:text-gray-600 transition-all duration-200 backdrop-blur-sm"
                    onClick={() => {/* Toggle options menu */}}
                  >
                    <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-2 mb-1 sm:mb-2 pr-6">
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{comment.userName}</h4>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimeAgo(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400 hidden sm:inline">(edited)</span>
                )}
              </div>
              
              {/* Comment Content */}
              <p className="text-sm leading-relaxed pr-6 whitespace-pre-wrap text-gray-800">
                {comment.content}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 ml-1 sm:ml-2">
              {/* Like Button with Reactions */}
              <div className="relative">
                <button
                  onClick={() => handleCommentLike(comment._id)}
                  className={`flex items-center gap-1 sm:gap-1.5 text-xs font-medium transition-all duration-200 hover:text-blue-600 ${
                    commentLike.isLiked ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <ThumbsUp className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${commentLike.isLiked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Like</span>
                  {commentLike.likeCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs min-w-[1.25rem] text-center">
                      {commentLike.likeCount}
                    </span>
                  )}
                </button>
                
                {/* Reaction Picker */}
                {showReactions[comment._id] && (
                  <div 
                    className="absolute bottom-full mb-2 left-0 flex gap-1 bg-white border border-gray-200 rounded-full shadow-2xl p-1.5 sm:p-2 z-20 animate-in slide-in-from-bottom-2"
                    onMouseLeave={() => setShowReactions({ ...showReactions, [comment._id]: false })}
                  >
                    {reactions.map((reaction, index) => (
                      <button
                        key={index}
                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-lg hover:scale-125 transition-transform rounded-full hover:bg-gray-100"
                        onClick={() => handleCommentLike(comment._id, reaction.emoji)}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Button */}
              {!isReply && (
                <button
                  onClick={() => setReplyToCommentId(
                    replyToCommentId === comment._id ? null : comment._id
                  )}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Reply</span>
                  {comment.replyCount > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs min-w-[1.25rem] text-center">
                      {comment.replyCount}
                    </span>
                  )}
                </button>
              )}

              {/* Delete Button */}
              {(comment.userId === profile._id || profile.profileLevel === 0) && (
                <button
                  onClick={() => handleCommentDelete(comment._id)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>

            {/* Reply Input */}
            {replyToCommentId === comment._id && (
              <div className="mt-3 sm:mt-4 animate-in slide-in-from-top-2">
                <div className="flex gap-2 sm:gap-3">
                  <img
                    src={profile.profilePicture || profilePic}
                    alt="Your profile"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-blue-400 focus-within:shadow-lg transition-all overflow-hidden">
                      <textarea
                        className="w-full p-2 sm:p-3 bg-transparent outline-none text-sm placeholder-gray-500 resize-none"
                        placeholder={`Reply to ${comment.userName}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 sm:px-3 pb-2 bg-gray-50/50 gap-2 sm:gap-0">
                        <span className="text-xs text-gray-400 text-center sm:text-left">
                          {replyContent.length}/500
                        </span>
                        <div className="flex gap-2 justify-center sm:justify-end">
                          <button
                            onClick={() => {
                              setReplyToCommentId(null);
                              setReplyContent('');
                            }}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplySubmit(comment._id)}
                            disabled={!replyContent.trim()}
                            className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show Replies */}
            {!isReply && comment.replyCount > 0 && (
              <div className="mt-2 sm:mt-3">
                <button
                  onClick={() => {
                    if (showReplies[comment._id]) {
                      setShowReplies({ ...showReplies, [comment._id]: false });
                    } else {
                      loadReplies(comment._id);
                    }
                  }}
                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium ml-1 sm:ml-2"
                >
                  {showReplies[comment._id] ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      <span className="hidden sm:inline">Hide replies</span>
                      <span className="sm:hidden">Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span className="hidden sm:inline">Show {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
                      <span className="sm:hidden">{comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
                    </>
                  )}
                </button>

                {/* Replies */}
                {showReplies[comment._id] && replies[comment._id] && (
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 border-l-2 border-blue-100 pl-3 sm:pl-4 ml-4 sm:ml-6">
                    {replies[comment._id].map(reply => renderComment(reply, true))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


const CommentSkeleton = ({ isReply = false }) => (
  <div className={`${isReply ? 'ml-6 sm:ml-8 md:ml-12' : ''} mb-3 sm:mb-4`}>
    <div className="flex gap-2 sm:gap-3">
      {/* Profile Image Skeleton */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 animate-pulse"></div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Comment Bubble Skeleton */}
        <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
          {/* User Info Skeleton */}
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-1 sm:space-y-2">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 ml-1 sm:ml-2">
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const CommentInputSkeleton = () => (
  <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
    <div className="flex gap-3 sm:gap-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl p-3 sm:p-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);


  return (
    <div className="bg-white border-t border-gray-200 rounded-b-2xl shadow-lg">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <span className="hidden sm:inline">Comments ({comments?.length || 0})</span>
            <span className="sm:hidden">({comments?.length || 0})</span>
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

    {/* Comment Input */}
{loading ? (
  <CommentInputSkeleton />
) : (
  <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
    <div className="flex gap-3 sm:gap-4">
      <img
        src={profile.profilePicture || profilePic}
        alt="Your profile"
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md"
      />
      <div className="flex-1">
        {error && (
          <div className="mb-3 sm:mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-700 text-sm animate-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-blue-400 focus-within:shadow-xl transition-all duration-300 overflow-hidden">
          <textarea
            className="w-full p-3 sm:p-4 bg-transparent outline-none text-sm resize-none placeholder-gray-500"
            placeholder={`What are your thoughts, ${profile.firstName}?`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if(e.target.value.trim()) setError('');
            }}
            rows={3}
            maxLength={1000}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-3 sm:px-4 pb-2 sm:pb-3 bg-gray-50/50 gap-2 sm:gap-0">
            <span className="text-xs text-gray-400 text-center sm:text-left">
              {content.length}/1000 characters
            </span>
            <button
              onClick={handleCommentSubmit}
              disabled={isLoading || !content.trim()}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                isLoading || !content.trim()
                  ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Posting...</span>
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
)}

     {/* Comments List */}
<div className="px-4 sm:px-6 py-3 sm:py-4 max-h-[70vh] sm:max-h-[600px] overflow-y-auto">
  {loading ? (
    // Show skeleton loaders while loading
    <div className="space-y-1">
      {[...Array(3)].map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </div>
  ) : comments.length > 0 ? (
    <div className="space-y-1">
      {comments.map(comment => renderComment(comment))}
      
      {/* Load More */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              loadComments(nextPage);
            }}
            disabled={loading}
            className="px-4 sm:px-6 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                Loading...
              </div>
            ) : (
              'Load more comments'
            )}
          </button>
        </div>
      )}
      
      {/* Show skeleton for loading more comments */}
      {loading && page > 1 && (
        <div className="space-y-1">
          {[...Array(2)].map((_, index) => (
            <CommentSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="text-center py-12 sm:py-16">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
      </div>
      <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No comments yet</h4>
      <p className="text-sm text-gray-500 max-w-md mx-auto px-4">
        Be the first to share your thoughts! Your comment could start an interesting discussion.
      </p>
    </div>
  )}
</div>

    </div>
  );
};

export default CommentSection;
