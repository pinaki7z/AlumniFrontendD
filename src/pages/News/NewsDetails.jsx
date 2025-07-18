import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Trash2, 
  Edit, 
  Share2, 
  Bookmark, 
  Clock, 
  Tag,
  Heart,
  MessageCircle,
  Building,
  Globe,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
  Check,
  AlertCircle,
  ThumbsUp,
  Download,
  Loader2,
  MoreHorizontal
} from 'lucide-react';

const NewsDetails = () => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const location = useLocation();
  const { postId: urlPostId } = useParams();
  
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Get data from location state or fetch from API
  const stateData = location.state || {};
  const postId = urlPostId || stateData.postId;

  useEffect(() => {
    if (stateData && Object.keys(stateData).length > 0) {
      setNewsData(stateData);
      setLoading(false);
      calculateReadingTime(stateData.description);
    } else if (postId) {
      fetchNewsData();
    }
  }, [postId, stateData]);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/news/news/${postId}`);
      setNewsData(response.data);
      calculateReadingTime(response.data.description);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news article');
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (text) => {
    if (!text) return;
    const wordsPerMinute = 200;
    const words = text.replace(/<[^>]*>/g, '').split(' ').length;
    const time = Math.ceil(words / wordsPerMinute);
    setReadingTime(time);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/news/${postId}`);
      toast.success('Article deleted successfully');
      navigate('/home/news');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/home/news/edit/${postId}`, { state: newsData });
  };

  const handleShare = async () => {
    const shareData = {
      title: newsData?.title || 'News Article',
      text: newsData?.description?.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShowShareMenu(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    // Add API call to update likes
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    // Add API call to update bookmarks
  };

  const getCategoryColor = (category) => {
    const colors = {
      'announcement': 'bg-blue-100 text-blue-800',
      'event': 'bg-green-100 text-green-800',
      'achievement': 'bg-purple-100 text-purple-800',
      'alumni-story': 'bg-orange-100 text-orange-800',
      'academic': 'bg-indigo-100 text-indigo-800',
      'general': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const canEdit = newsData?.userId === profile._id || profile.profileLevel === 0;
  const canDelete = newsData?.userId === profile._id || profile.profileLevel === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#0A3A4C] mx-auto mb-4" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article not found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/home/news')}
            className="px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header Navigation */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/home/news')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to News</span>
          </button>
        </div>

        {/* Main Article */}
        <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Category and Tags */}
            <div className="flex items-center gap-2 mb-4">
              {newsData.category && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(newsData.category)}`}>
                  <Tag size={14} />
                  {newsData.category.replace('-', ' ')}
                </span>
              )}
              {newsData.tags && newsData.tags.length > 0 && (
                <div className="flex gap-1">
                  {newsData.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {newsData.title || 'News Article'}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">By {newsData.author}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{moment(newsData.createdAt).format('MMMM D, YYYY')}</span>
                </div>
                {readingTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{readingTime} min read</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{views} views</span>
                </div>
              </div>
            </div>

            {/* Department */}
            {newsData.department && (
              <div className="flex items-center gap-2 mb-6">
                <Building size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{newsData.department}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-start sm:items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span>{likes}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isBookmarked 
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
                  <span className="hidden sm:inline">Bookmark</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Admin Actions */}
              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {(newsData.picture || newsData.picturePath) && (
            <div className="px-4 sm:px-6 lg:px-8 mb-6">
              <img
                src={newsData.picture || newsData.picturePath}
                alt={newsData.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Video */}
          {newsData.videoPath && (
            <div className="px-4 sm:px-6 lg:px-8 mb-6">
              <video
                controls
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
                poster={newsData.picture || newsData.picturePath}
              >
                <source src={newsData.videoPath} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Article Content */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: newsData.description || 'No content available.' }}
              />
            </div>
          </div>

          {/* Article Footer */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Published {moment(newsData.createdAt).fromNow()}</span>
                {newsData.updatedAt && newsData.updatedAt !== newsData.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {moment(newsData.updatedAt).fromNow()}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        <div className="mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Related Articles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for related articles */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Menu Modal */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Article</h3>
            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <Copy size={20} />
                <span>{copied ? 'Link copied!' : 'Copy link'}</span>
              </button>
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(newsData.title)}`)}
                className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <ExternalLink size={20} />
                <span>Share on Twitter</span>
              </button>
              <button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}
                className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <ExternalLink size={20} />
                <span>Share on Facebook</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetails;
