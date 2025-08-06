// NewsDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, Calendar, Clock, Eye, Heart, MessageCircle, Share2, 
  User, Tag, BookOpen, ExternalLink, ChevronRight, Send, 
  Facebook, Twitter, Linkedin, Mail, Link, Star,
  ThumbsUp, Bookmark, Loader2, AlertCircle, TrendingUp,
  Bell, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useSelector(state => state.profile);
  
  const [newsArticle, setNewsArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);

  // Fetch article details
  useEffect(() => {
    const fetchArticleDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}`);
        const result = await response.json();

        if (result.success) {
          setNewsArticle(result.news);
        } else {
          toast.error(result.message || 'Failed to fetch article');
          setNewsArticle(null);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Failed to fetch article');
        setNewsArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleDetails();
    }
  }, [id]);

  // Fetch like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!profile._id || !id) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/like-status/${profile._id}`);
        const result = await response.json();
        
        if (result.success) {
          setIsLiked(result.isLiked);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    fetchLikeStatus();
  }, [id, profile._id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/comments`);
        const result = await response.json();
        
        if (result.success) {
          setComments(result.comments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [id]);

  // Fetch related articles
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!newsArticle) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/all?category=${newsArticle.category}&limit=3&status=published`);
        const result = await response.json();
        
        if (result.success) {
          // Filter out current article
          const related = result.news.filter(article => article._id !== id).slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (error) {
        console.error('Error fetching related articles:', error);
      }
    };

    fetchRelatedArticles();
  }, [newsArticle, id]);

  // Handle bookmark
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!profile._id) {
      toast.error('Please login to like articles');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id }),
      });

      const result = await response.json();

      if (result.success) {
        setIsLiked(result.isLiked);
        setNewsArticle(prev => ({ ...prev, likes: result.likes }));
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  // Handle share
  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = newsArticle?.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        } catch (error) {
          toast.success('Link copied to clipboard!');
        }
        break;
      default:
        break;
    }
    
    // Update share count
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/share`, {
        method: 'PATCH'
      });
      const result = await response.json();
      if (result.success) {
        setNewsArticle(prev => ({ ...prev, shares: result.shares }));
      }
    } catch (error) {
      console.error('Error updating share count:', error);
    }
    
    setShowShareModal(false);
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!profile._id) {
      toast.error('Please login to comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile._id,
          userName: `${profile.firstName} ${profile.lastName}`,
          userEmail: profile.email,
          text: newComment
        })
      });

      const result = await response.json();
      if (result.success) {
        setNewComment('');
        toast.success('Comment added successfully!');
        
        // Refresh comments
        const commentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/comments`);
        const commentsResult = await commentsResponse.json();
        if (commentsResult.success) {
          setComments(commentsResult.comments);
        }
      } else {
        toast.error(result.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentCommentId, replyText) => {
    if (!replyText.trim()) return;
    if (!profile._id) {
      toast.error('Please login to reply');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/comments/${parentCommentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile._id,
          userName: `${profile.firstName} ${profile.lastName}`,
          userEmail: profile.email,
          text: replyText
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Reply added successfully!');
        
        // Refresh comments
        const commentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}/comments`);
        const commentsResult = await commentsResponse.json();
        if (commentsResult.success) {
          setComments(commentsResult.comments);
        }
      } else {
        toast.error(result.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!newsArticle) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/home/news')}
              className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              Back to News
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/home/news')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0A3A4C] mb-6 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to News</span>
            </button>

            {/* Article Header */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Badge */}
              <div className="px-4 sm:px-6 pt-6">
                <span className="inline-block bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white px-3 py-1 rounded-full text-sm font-medium capitalize mb-4">
                  {newsArticle.category.replace('-', ' ')}
                </span>
              </div>

              {/* Title and Subtitle */}
              <div className="px-4 sm:px-6 mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {newsArticle.title}
                </h1>
                {newsArticle.subtitle && (
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    {newsArticle.subtitle}
                  </p>
                )}
              </div>

              {/* Article Meta */}
              <div className="px-4 sm:px-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-t border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{newsArticle.authorName}</p>
                      <p className="text-sm text-gray-600">Author</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(newsArticle.publishedAt || newsArticle.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {newsArticle.readTime || '5 min read'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {newsArticle.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {newsArticle.featuredImage && (
                <div className="mb-6">
                  <img
                    src={newsArticle.featuredImage}
                    alt={newsArticle.title}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="px-4 sm:px-6 mb-8">
                <div 
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: newsArticle.content }}
                />
              </div>

              {/* Additional Images Gallery */}
              {newsArticle.additionalImages && newsArticle.additionalImages.length > 0 && (
                <div className="px-4 sm:px-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {newsArticle.additionalImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              {newsArticle.externalLinks && newsArticle.externalLinks.length > 0 && (
                <div className="px-4 sm:px-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ExternalLink size={20} />
                    Related Links
                  </h3>
                  <div className="space-y-2">
                    {newsArticle.externalLinks.map((link, index) => (
                      link.url && (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#0A3A4C] hover:underline"
                        >
                          <Globe size={16} />
                          {link.title || link.url}
                          <ExternalLink size={14} />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Author Note */}
              {newsArticle.authorNote && (
                <div className="px-4 sm:px-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#0A3A4C]">
                    <h4 className="font-semibold text-gray-900 mb-2">Author's Note</h4>
                    <p className="text-gray-700">{newsArticle.authorNote}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {newsArticle.tags && newsArticle.tags.length > 0 && (
                <div className="px-4 sm:px-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newsArticle.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors duration-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Actions */}
              <div className="px-4 sm:px-6 py-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        isLiked 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                      <span className="font-medium">
                        {newsArticle.likes || 0}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Share2 size={18} />
                      <span className="font-medium">{newsArticle.shares || 0}</span>
                    </button>
                    
                    <button
                      onClick={handleBookmark}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        isBookmarked 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
                      <span className="font-medium hidden sm:inline">
                        {isBookmarked ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Last updated: {formatDate(newsArticle.updatedAt)}
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="px-4 sm:px-6 py-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <MessageCircle size={24} className="text-[#0A3A4C]" />
                  Comments ({comments.length})
                </h3>
              </div>

              {/* Add Comment */}
              <div className="px-4 sm:px-6 py-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] resize-none"
                      rows="3"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || submittingComment}
                        className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <CommentItem 
                    key={comment._id} 
                    comment={comment} 
                    onReply={handleReplySubmit}
                    formatTimeAgo={formatTimeAgo} 
                  />
                ))}
              </div>

              {comments.length === 0 && (
                <div className="px-4 sm:px-6 py-12 text-center">
                  <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
                  <p className="text-gray-600">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-6">
              
              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-[#0A3A4C]" />
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.map((article) => (
                      <div 
                        key={article._id}
                        className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                        onClick={() => navigate(`/home/news/${article._id}`)}
                      >
                        <img
                          src={article.featuredImage || `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop`}
                          alt={article.title}
                          className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="capitalize">{article.category.replace('-', ' ')}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(article.publishedAt || article.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular This Week */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#0A3A4C]" />
                  Popular This Week
                </h3>
                <div className="space-y-3">
                  {[
                    { title: 'Alumni Network Reaches 10,000 Members', views: '5.2K', category: 'milestone' },
                    { title: 'Tech Talk Series: AI Revolution', views: '3.8K', category: 'events' },
                    { title: 'Career Fair 2025 Registration Open', views: '2.9K', category: 'careers' },
                    { title: 'Research Grant Success Stories', views: '2.1K', category: 'academics' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.title}</p>
                        <p className="text-xs text-gray-600 capitalize">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 ml-2">
                        <Eye size={12} />
                        {item.views}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg shadow-sm p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={20} />
                  <h3 className="font-bold">Stay Updated</h3>
                </div>
                <p className="text-sm opacity-90 mb-4">
                  Get the latest alumni news and updates delivered to your inbox weekly.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button className="w-full bg-white text-[#0A3A4C] py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Alumni Spotlight */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star size={20} className="text-[#0A3A4C]" />
                  Alumni Spotlight
                </h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User size={24} className="text-gray-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Dr. Anita Sharma</h4>
                  <p className="text-sm text-gray-600 mb-2">Class of 2010</p>
                  <p className="text-sm text-gray-700 mb-3">
                    Leading AI researcher at Google, published 50+ papers in machine learning.
                  </p>
                  <button className="text-[#0A3A4C] text-sm font-medium hover:underline">
                    Read Full Story →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Share Article</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Facebook size={20} className="text-blue-600" />
                <span className="font-medium">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Twitter size={20} className="text-blue-400" />
                <span className="font-medium">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Linkedin size={20} className="text-blue-700" />
                <span className="font-medium">LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Link size={20} className="text-gray-600" />
                <span className="font-medium">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Comment Component
const CommentItem = ({ comment, onReply, formatTimeAgo }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <span className="font-semibold text-gray-900">{comment.authorName}</span>
            <span className="text-sm text-gray-500 ml-2">•</span>
            <span className="text-sm text-gray-500 ml-2">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{comment.text}</p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1 text-sm transition-colors duration-200 ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <ThumbsUp size={14} className={isLiked ? 'fill-current' : ''} />
              <span>Like</span>
            </button>
            
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
            >
              Reply
            </button>
            
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-[#0A3A4C] hover:underline transition-colors duration-200"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={12} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] resize-none"
                    rows="2"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim()}
                      className="text-sm bg-[#0A3A4C] text-white px-3 py-1 rounded hover:opacity-90 disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={12} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{reply.authorName}</span>
                      <span className="text-xs text-gray-500 ml-2">•</span>
                      <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{reply.text}</p>
                    <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors duration-200">
                      <ThumbsUp size={12} />
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
