import React, { useState, useEffect, useRef } from 'react';
import '../Post/Post.scss';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import baseUrl from "../../config";
import newsImage from "../../images/d-group.jpg";
import moment from 'moment';
import { 
  ArrowRight, 
  Calendar, 
  User, 
  Eye, 
  Trash2, 
  Edit, 
  Share2, 
  Bookmark, 
  Clock, 
  Tag,
  ExternalLink,
  Heart,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  Globe,
  Building,
  X,
  MoreHorizontal
} from 'lucide-react';

export const DisplayNews = ({ 
  userId, 
  postId, 
  title, 
  description, 
  createdAt, 
  picturePath, 
  videoPath, 
  department, 
  onDeletePost,
  author,
  picture,
  category,
  tags,
  readTime,
  views,
  likes,
  comments
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const dropdownRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();
  
  const isUserDepartment = profile.department === 'All' || profile.department === department || department === 'All';
  const isAdmin = profile.profileLevel === 0;
  const canDelete = isAdmin || (userId === profile._id);
  const canEdit = userId === profile._id;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  };

  const handleDeletePost = async () => {
    if (!canDelete) return;
    
    if (window.confirm('Are you sure you want to delete this news article?')) {
      setLoading(true);
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/news/${postId}`);
        onDeletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditPost = () => {
    navigate(`/home/news/edit/${postId}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: description.substring(0, 100) + '...',
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Add API call to update likes
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add API call to update bookmarks
  };

  const handleReadMore = () => {
    navigate(`/home/news/news/${postId}`, {
      state: {
        userId,
        postId,
        description,
        createdAt,
        picturePath,
        videoPath,
        department,
        title,
        author,
        picture,
        category,
        tags,
        readTime,
        views,
        likes,
        comments
      }
    });
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'announcement': 'bg-blue-100 text-blue-800',
      'event': 'bg-green-100 text-green-800',
      'achievement': 'bg-purple-100 text-purple-800',
      'alumni-story': 'bg-orange-100 text-orange-800',
      'academic': 'bg-indigo-100 text-indigo-800',
      'general': 'bg-gray-100 text-gray-800',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  if (!isUserDepartment) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 group">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center">
              <User size={20} className="text-[#0A3A4C]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{author}</span>
                {department && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Building size={12} />
                      {department}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{moment(createdAt).format('MMM D, YYYY')}</span>
                {readTime && (
                  <>
                    <span className="text-gray-300">•</span>
                    <Clock size={12} />
                    <span>{readTime} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <MoreHorizontal size={16} className="text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <button
                    onClick={handleBookmark}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Bookmark size={14} />
                    {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                  </button>
                  {canEdit && (
                    <button
                      onClick={handleEditPost}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDeletePost}
                      disabled={loading}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category & Tags */}
        <div className="flex items-center gap-2 mb-3">
          {category && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
              <Tag size={12} />
              {category.replace('-', ' ')}
            </span>
          )}
          {tags && tags.length > 0 && (
            <div className="flex gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0A3A4C] transition-colors duration-200">
            {title || "News Headline"}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
            {truncateDescription(description)}
          </p>
        </div>

        {/* Featured Image */}
        {(picturePath || picture) && (
          <div className="mb-4">
            <img
              src={picturePath || picture || newsImage}
              alt="News"
              className="w-full h-48 sm:h-56 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = newsImage;
              }}
            />
          </div>
        )}

        {/* Video */}
        {videoPath && (
          <div className="mb-4">
            <video
              ref={videoRef}
              src={videoPath}
              className="w-full h-48 sm:h-56 object-cover rounded-lg"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            {views && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {views}
              </span>
            )}
            {likes && (
              <span className="flex items-center gap-1">
                <Heart size={14} />
                {likes}
              </span>
            )}
            {comments && (
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {comments}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Globe size={12} />
            <span>Public</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isLiked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={14} className={isLiked ? 'fill-current' : ''} />
              <span className="hidden sm:inline">Like</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isBookmarked 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
          
          <button
            onClick={handleReadMore}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 text-sm font-medium"
          >
            <span>Read More</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
