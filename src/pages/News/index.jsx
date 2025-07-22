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
    { value: 'all', label: 'All News', icon: <Globe size={14} /> },
    { value: 'announcements', label: 'Announcements', icon: <Bell size={14} /> },
    { value: 'events', label: 'Events', icon: <Calendar size={14} /> },
    { value: 'achievements', label: 'Achievements', icon: <Star size={14} /> },
    { value: 'alumni-stories', label: 'Alumni Stories', icon: <Users size={14} /> },
    { value: 'academic', label: 'Academic', icon: <BookOpen size={14} /> },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First', icon: <Clock size={14} /> },
    { value: 'popular', label: 'Most Popular', icon: <TrendingUp size={14} /> },
    { value: 'trending', label: 'Trending', icon: <Eye size={14} /> },
  ];

  const activeFiltersCount = [selectedCategory, sortBy !== 'latest'].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('latest');
  };

  const getStatsCard = (title, value, icon, color) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${color}`}>
          {React.cloneElement(icon, { size: 16 })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              <Newspaper size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                News & Updates
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Latest news and announcements</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate("/home/news/manage")}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">Manage</span>
                </button>
                <button
                  onClick={() => navigate("/home/news/createNews")}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
                >
                  <Plus size={14} />
                  <span>Create News</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                <Bell size={14} />
                <span className="text-sm font-medium">Stay Updated</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards (for admins) - Mobile optimized */}
        {isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
            {getStatsCard("Total News", "24", <Newspaper size={16} className="text-blue-600" />, "bg-blue-100")}
            {getStatsCard("This Month", "8", <Calendar size={16} className="text-green-600" />, "bg-green-100")}
            {getStatsCard("Popular", "12", <TrendingUp size={16} className="text-purple-600" />, "bg-purple-100")}
            {getStatsCard("Views", "1.2k", <Eye size={16} className="text-orange-600" />, "bg-orange-100")}
          </div>
        )}

        {/* Search and Filters - Compact design */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
              >
                <Filter size={14} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-2 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            {/* Quick Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-xs bg-white"
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
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value === selectedCategory ? '' : category.value)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all duration-200 text-xs ${
                        selectedCategory === category.value
                          ? 'border-[#0A3A4C] bg-[#0A3A4C]/5 text-[#0A3A4C]'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {category.icon}
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden text-xs">{category.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions for Non-Admin Users - Mobile optimized */}
        {!isAdmin && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <Link
                to="/home/news/subscribe"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell size={12} className="sm:size-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Subscribe</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Get notified of new articles</p>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
              
              <Link
                to="/home/news/suggest"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus size={12} className="sm:size-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Suggest News</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Share your story ideas</p>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
              
              <Link
                to="/home/news/archive"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen size={12} className="sm:size-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Archive</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Browse past articles</p>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
            </div>
          </div>
        )}

        {/* Featured News Section - Mobile optimized */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-4">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Featured News</h2>
              </div>
              <Link
                to="/home/news/featured"
                className="text-xs sm:text-sm text-[#0A3A4C] hover:text-[#0A3A4C]/80 font-medium"
              >
                View All
              </Link>
            </div>
            
            {/* Featured news cards - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-50 rounded-lg p-3 sm:p-4 animate-pulse">
                  <div className="w-full h-24 sm:h-32 bg-gray-200 rounded-lg mb-2 sm:mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News Feed - Mobile optimized */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Latest News</h2>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <RefreshCw size={12} className="sm:size-4" />
                <span>Refresh</span>
              </button>
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
