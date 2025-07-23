// CommentThread.js - Mobile-First Responsive Version
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Reply, Send, X, MessageCircle } from 'lucide-react';

const Comment = ({ c, ownerEmail, onReply, level = 0 }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText.trim(), c._id);
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 sm:gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">
            {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <span className={`text-xs sm:text-sm font-semibold ${
                c.authorEmail === ownerEmail 
                  ? 'text-[#0A3A4C] bg-[#0A3A4C]/10 px-2 py-1 rounded-lg inline-block' 
                  : 'text-gray-900'
              }`}>
                {c.authorName}
                {c.authorEmail === ownerEmail && (
                  <span className="ml-1 text-xs bg-[#0A3A4C] text-white px-1.5 py-0.5 rounded">
                    Owner
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-500">
                • {formatDistanceToNow(new Date(c.createdAt))} ago
              </span>
            </div>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">{c.text}</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 mt-2">
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A3A4C] transition-colors duration-200"
            >
              <Reply size={12} />
              <span className="hidden xs:inline">Reply</span>
            </button>
            {c.replies && c.replies.length > 0 && (
              <span className="text-xs text-gray-500">
                {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>

          {/* Reply Input Box - Mobile Optimized */}
          {showReplyBox && (
            <div className="mt-3 bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${c.authorName}...`}
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm resize-none focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText('');
                  }}
                  className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0A3A4C] text-white rounded-lg text-xs hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                  <span className="hidden xs:inline">Reply</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies - Mobile Responsive */}
      {c.replies && c.replies.length > 0 && (
        <div className="ml-4 sm:ml-8 space-y-3 border-l-2 border-gray-100 pl-2 sm:pl-4">
          {c.replies.map(reply => (
            <Comment 
              key={reply._id} 
              c={reply} 
              ownerEmail={ownerEmail} 
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentThread = ({ ownerEmail, comments, onAdd }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(text.trim());
      setText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div id="comments" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageCircle size={18} className="sm:w-5 sm:h-5" />
        Comments
        <span className="text-sm font-normal text-gray-500">
          ({comments.length})
        </span>
      </h3>
      
      {/* Add Comment - Mobile Optimized */}
      <div className="mb-6">
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Share your thoughts about this business..." 
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200" 
        />
        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 hidden sm:block">
            Press Ctrl+Enter to post quickly
          </span>
          <button 
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg text-sm hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full xs:w-auto"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="hidden xs:inline">Posting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments List - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl sm:text-2xl">💭</span>
            </div>
            <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(c => (
            <Comment 
              key={c._id} 
              c={c} 
              ownerEmail={ownerEmail}
              onReply={onAdd}
            />
          ))
        )}
      </div>
    </div>
  );
};
