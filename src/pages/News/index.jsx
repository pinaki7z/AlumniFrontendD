import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from "react-router-dom";
import Feed from '../../components/Feeed';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar, 
  TrendingUp, 
  Bell,
  BookOpen,
  Users,
  Globe,
  Star,
  Clock,
  Eye,
  Settings,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const News = () => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('feed');

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // Sample categories for news filtering
  const categories = [
    { value: 'all', label: 'All News', icon: <Globe size={16} /> },
    { value: 'announcements', label: 'Announcements', icon: <Bell size={16} /> },
    { value: 'events', label: 'Events', icon: <Calendar size={16} /> },
    { value: 'achievements', label: 'Achievements', icon: <Star size={16} /> },
    { value: 'alumni-stories', label: 'Alumni Stories', icon: <Users size={16} /> },
    { value: 'academic', label: 'Academic', icon: <BookOpen size={16} /> },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First', icon: <Clock size={16} /> },
    { value: 'popular', label: 'Most Popular', icon: <TrendingUp size={16} /> },
    { value: 'trending', label: 'Trending', icon: <Eye size={16} /> },
  ];

  const activeFiltersCount = [selectedCategory, sortBy !== 'latest'].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('latest');
  };

  const getStatsCard = (title, value, icon, color) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Newspaper size={20} className="sm:size-6 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175]">
                    News & Updates
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80 mt-1">
                    Stay informed with the latest updates, inspiring stories, and exclusive opportunities from our alumni community.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => navigate("/home/news/manage")}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm sm:text-base"
                    >
                      <Settings size={16} />
                      <span className="hidden sm:inline">Manage</span>
                    </button>
                    <button
                      onClick={() => navigate("/home/news/createNews")}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 text-sm sm:text-base font-medium"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline text-nowrap">Create News</span>
                      <span className="sm:hidden">Create</span>
                    </button>
                  </>
                )}
                {!isAdmin && (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                    <Bell size={16} className="text-[#0A3A4C]" />
                    <span className="text-sm font-medium text-[#0A3A4C]">Stay Updated</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards (for admins) */}
        {isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {getStatsCard("Total News", "24", <Newspaper size={20} className="text-blue-600" />, "bg-blue-100")}
            {getStatsCard("This Month", "8", <Calendar size={20} className="text-green-600" />, "bg-green-100")}
            {getStatsCard("Popular", "12", <TrendingUp size={20} className="text-purple-600" />, "bg-purple-100")}
            {getStatsCard("Views", "1.2k", <Eye size={20} className="text-orange-600" />, "bg-orange-100")}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 text-sm sm:text-base"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown size={16} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                  >
                    <RefreshCw size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Quick Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {categories.map(category => (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value === selectedCategory ? '' : category.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                            selectedCategory === category.value
                              ? 'border-[#0A3A4C] bg-[#0A3A4C]/5 text-[#0A3A4C]'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          {category.icon}
                          <span className="hidden sm:inline">{category.label}</span>
                          <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for Non-Admin Users */}
        {!isAdmin && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                to="/home/news/subscribe"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Subscribe to Updates</p>
                  <p className="text-xs text-gray-600">Get notified of new articles</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </Link>
              
              <Link
                to="/home/news/suggest"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Suggest News</p>
                  <p className="text-xs text-gray-600">Share your story ideas</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </Link>
              
              <Link
                to="/home/news/archive"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">News Archive</p>
                  <p className="text-xs text-gray-600">Browse past articles</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>
        )}

        {/* Featured News Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Featured News</h2>
              </div>
              <Link
                to="/home/news/featured"
                className="text-sm text-[#0A3A4C] hover:text-[#0A3A4C]/80 font-medium"
              >
                View All
              </Link>
            </div>
            
            {/* Featured news cards would go here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* News Feed */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Latest News</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            <Feed 
              showCreatePost={false} 
              showCreateButton={false} 
              entityType="news" 
              entityId="id" 
              showDeleteButton={isAdmin} 
              searchQuery={searchQuery}
              category={selectedCategory}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
