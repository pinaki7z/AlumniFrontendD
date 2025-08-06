// NewsUpdatesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Newspaper, Calendar, TrendingUp, Users, Award, MapPin, Clock,
  Heart, MessageCircle, Share2, Eye, ChevronRight, Star,
  Briefcase, GraduationCap, Building, Bell, Search, Filter,
  BookOpen, Trophy, UserCheck, Globe, ArrowRight, ExternalLink,
  Play, Image as ImageIcon, FileText, Zap, Plus, Edit, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const NewsUpdatesPage = () => {
  const navigate = useNavigate();
  const profile = useSelector(state => state.profile);

  const [activeFilter, setActiveFilter] = useState('all');
  const [likedNews, setLikedNews] = useState(new Set());
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch news data
  const fetchNews = async (category = 'all', page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'published',
        page: page.toString(),
        limit: '20'
      });

      if (category && category !== 'all') {
        params.append('category', category);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/all?${params}`);
      const result = await response.json();

      if (result.success) {
        setNewsData(result.news);
        setPagination(result.pagination);
      } else {
        toast.error('Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/stats/overview`);
      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Toggle like
  const toggleLike = async (newsId) => {
    if (!profile._id) {
      toast.error('Please login to like articles');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${newsId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id })
      });

      const result = await response.json();
      if (result.success) {
        const newLiked = new Set(likedNews);
        if (result.isLiked) {
          newLiked.add(newsId);
        } else {
          newLiked.delete(newsId);
        }
        setLikedNews(newLiked);

        // Update the news data with new like count
        setNewsData(prev => prev.map(news =>
          news._id === newsId ? { ...news, likes: result.likes } : news
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  // Fetch like statuses for current user
  const fetchLikeStatuses = async () => {
    if (!profile._id || newsData.length === 0) return;

    try {
      const likePromises = newsData.map(news =>
        fetch(`${process.env.REACT_APP_API_URL}/api/news/${news._id}/like-status/${profile._id}`)
          .then(res => res.json())
          .then(result => ({ newsId: news._id, isLiked: result.isLiked }))
      );

      const likeResults = await Promise.all(likePromises);
      const newLiked = new Set();
      likeResults.forEach(({ newsId, isLiked }) => {
        if (isLiked) newLiked.add(newsId);
      });
      setLikedNews(newLiked);
    } catch (error) {
      console.error('Error fetching like statuses:', error);
    }
  };

  useEffect(() => {
    fetchNews(activeFilter);
    fetchStats();
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchLikeStatuses();
  }, [newsData, profile._id]);

  const categories = [
    { id: 'all', label: 'All Updates', icon: Newspaper, count: stats.totalArticles || 0 },
    { id: 'achievements', label: 'Achievements', icon: Trophy, count: 0 },
    { id: 'careers', label: 'Career News', icon: Briefcase, count: 0 },
    { id: 'academics', label: 'Academic Updates', icon: GraduationCap, count: 0 },
    { id: 'alumni-spotlight', label: 'Alumni Spotlight', icon: Award, count: 0 }
  ];

  const quickStats = [
    { label: 'Total Articles', value: stats.totalArticles || 0, icon: FileText, color: 'text-blue-600' },
    { label: 'Total Views', value: stats.totalViews || 0, icon: Eye, color: 'text-green-600' },
    { label: 'Total Likes', value: stats.totalLikes || 0, icon: Heart, color: 'text-red-600' },
    { label: 'Comments', value: stats.totalComments || 0, icon: MessageCircle, color: 'text-purple-600' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                <Building size={16} className="sm:size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  News & Updates
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Stay connected with the latest happenings in our alumni community
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/home/news/create')}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium shadow-sm w-full sm:w-auto"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Create News</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/home/news/drafts')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <Edit size={16} />
              Drafts
            </button>
            <button
              onClick={() => navigate('/home/news/analytics')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <TrendingUp size={16} />
              Analytics
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news articles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <LeftSidebar
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              categories={categories}
              quickStats={quickStats}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <MainContent
              newsData={newsData}
              loading={loading}
              likedNews={likedNews}
              toggleLike={toggleLike}
              pagination={pagination}
              onLoadMore={() => fetchNews(activeFilter, pagination.current + 1)}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

// Left Sidebar Component
const LeftSidebar = ({ activeFilter, setActiveFilter, categories, quickStats }) => {
  return (
    <div className="lg:sticky lg:top-6 space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={18} className="text-[#0A3A4C]" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${activeFilter === category.id
                  ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <category.icon size={16} />
              <span className="flex-1 text-left text-sm font-medium">{category.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${activeFilter === category.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
                }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#0A3A4C]" />
          Quick Stats
        </h3>
        <div className="space-y-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color === 'text-blue-600' ? 'bg-blue-100' :
                  stat.color === 'text-green-600' ? 'bg-green-100' :
                    stat.color === 'text-red-600' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = ({ newsData, loading, likedNews, toggleLike, pagination, onLoadMore }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (category) => {
    switch (category) {
      case 'achievements': return Trophy;
      case 'careers': return Briefcase;
      case 'academics': return GraduationCap;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-48 h-32 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured News */}
      {newsData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative h-48 sm:h-64">
            <img
              src={newsData[0].featuredImage || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop"}
              alt="Featured"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-block bg-[#0A3A4C] px-3 py-1 rounded-full text-xs font-medium mb-2">
                Featured
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold mb-2 cursor-pointer hover:underline"
                onClick={() => navigate(`/home/news/${newsData[0]._id}`)}
              >
                {newsData[0].title}
              </h2>
              <p className="text-sm opacity-90 mb-3">
                {newsData[0].subtitle || newsData[0].metaDescription}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatDate(newsData[0].publishedAt || newsData[0].createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {newsData[0].views || 0} views
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="space-y-6">
        {newsData.map((news) => (
          <NewsCard
            key={news._id}
            news={news}
            isLiked={likedNews.has(news._id)}
            onToggleLike={() => toggleLike(news._id)}
            formatDate={formatDate}
            getTypeIcon={getTypeIcon}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.current < pagination.total && (
        <div className="text-center py-8">
          <button
            onClick={onLoadMore}
            className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center gap-2 mx-auto"
          >
            Load More News
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {newsData.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// News Card Component
const NewsCard = ({ news, isLiked, onToggleLike, formatDate, getTypeIcon }) => {
  const navigate = useNavigate();
  const TypeIcon = getTypeIcon(news.category);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/home/news/${news._id}`);

      // Update share count
      await fetch(`${process.env.REACT_APP_API_URL}/api/news/${news._id}/share`, {
        method: 'PATCH'
      });

      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="sm:flex">
        <div className="sm:w-48 sm:flex-shrink-0">
          <div className="relative h-48 sm:h-full">
            <img
              src={news.featuredImage || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1556761175-b413da4baf72' : '1486406146926-c627a92ad1ab'}?w=400&h=200&fit=crop`}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-[#0A3A4C] text-white px-2 py-1 rounded text-xs font-medium capitalize">
                {news.category.replace('-', ' ')}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                <TypeIcon size={12} className="text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{formatDate(news.publishedAt || news.createdAt)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{news.readTime || '5 min read'}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">by {news.authorName}</span>
          </div>

          <h2
            className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:text-[#0A3A4C] cursor-pointer transition-colors duration-200"
            onClick={() => navigate(`/home/news/${news._id}`)}
          >
            {news.title}
          </h2>

          <p className="text-gray-600 mb-4 line-clamp-2">{news.subtitle || news.metaDescription}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {news.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 cursor-pointer transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {(news.views || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {news.comments?.length || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleLike}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors duration-200 ${isLiked
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Heart size={14} className={isLiked ? 'fill-current' : ''} />
                <span className="text-sm">{news.likes || 0}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <Share2 size={14} />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// Right Sidebar Component (keeping the existing one)
const RightSidebar = () => {
  // ... existing RightSidebar implementation
  return (
    <div className="lg:sticky lg:top-6 space-y-6">
      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg shadow-sm p-4 sm:p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={18} />
          <h3 className="font-semibold">Stay Updated</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">
          Subscribe to our newsletter for weekly updates and exclusive alumni content.
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
    </div>
  );
};

export default NewsUpdatesPage;
