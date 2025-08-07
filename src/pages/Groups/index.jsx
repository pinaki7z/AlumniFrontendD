import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import SuggestedGroups from "../../components/Groups/SuggestedGroups";
import JoinedGroups from "../../components/Groups/JoinedGroups";
import IndividualGroup from "../../components/Groups/IndividualGroup";
import AllGroups from "../../components/Groups/AllGroups";
import GroupRequest from "./GroupRequest";
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Globe, 
  Lock, 
  Settings, 
  Grid,
  UserPlus,
  Shield,
  Eye,
  ChevronDown,
  ArrowRight,
  Activity,
  RefreshCw
} from "lucide-react";

const Groups = () => {
  const profile = useSelector((state) => state.profile);
  const location = useLocation();
  const [groupType, setGroupType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // Check if we're on the main groups page or its direct children (not nested routes)
  const showHeaderAndFilters = () => {
    const path = location.pathname;
    // Show header only on main groups routes, not on individual group pages
    return (
      path === "/home/groups" ||
      path === "/home/groups/suggested-groups" ||
      path === `/home/groups/${profile._id}/joined-groups`
    );
  };

  // Navigation configuration
  const getNavigationConfig = () => {
    if (isAdmin) {
      return [
        { label: "All Groups", path: "/home/groups", icon: <Grid size={16} /> },
      ];
    } else {
      return [
        { label: "Suggested", path: "/home/groups/suggested-groups", icon: <Eye size={16} /> },
        { label: "Joined", path: `/home/groups/${profile._id}/joined-groups`, icon: <Users size={16} /> },
      ];
    }
  };

  const handleGroupTypeChange = (e) => {
    setGroupType(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setGroupType('');
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case "Public":
        return <Globe size={14} className="text-green-600" />;
      case "Private":
        return <Lock size={14} className="text-red-600" />;
      default:
        return <Grid size={14} className="text-gray-600" />;
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes("suggested-groups")) {
      return {
        title: "Suggested Groups",
        count: null,
        icon: <Eye size={16} className="text-blue-600" />
      };
    } else if (location.pathname.includes("joined-groups")) {
      return {
        title: "Joined Groups", 
        count: null,
        icon: <Users size={16} className="text-green-600" />
      };
    } else {
      return {
        title: "Groups",
        count: "Community groups",
        icon: <Grid size={16} className="text-[#0A3A4C]" />
      };
    }
  };

  const pageInfo = getPageTitle();
  const navConfig = getNavigationConfig();
  const activeFiltersCount = [groupType].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        
        {/* Conditional Header - Only show on main group pages */}
        {showHeaderAndFilters() && (
          <>
            {/* Simple Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
                  <Users size={16} className="sm:size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {pageInfo.title}
                  </h1>
                  {pageInfo.count && (
                    <p className="text-xs sm:text-sm text-gray-600">{pageInfo.count}</p>
                  )}
                </div>
              </div>
              
              {/* Create Group Button - Only for admins on main page */}
              {isAdmin && location.pathname === "/home/groups" && (
                <Link
                  to="/home/groups/create"
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium shadow-sm w-full sm:w-auto"
                >
                  <Plus size={16} />
                  <span>Create Group</span>
                </Link>
              )}
            </div>

            {/* Navigation Tabs - Only for non-admin users */}
            {!isAdmin && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                  {navConfig.map((nav, index) => (
                    <Link
                      key={index}
                      to={nav.path}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${
                        location.pathname === nav.path
                          ? "dynamic-site-bg text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {nav.icon}
                      <span>{nav.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
              {/* Search Bar */}
              <div className="relative mb-3 sm:mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for groups..."
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
                    className="flex items-center gap-2 px-3 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
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
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-2 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                    >
                      <RefreshCw size={12} />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>

                {/* Quick Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 hidden sm:inline">Type:</span>
                  <select
                    value={groupType}
                    onChange={handleGroupTypeChange}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-xs bg-white"
                  >
                    <option value="">All Groups</option>
                    <option value="Public">Public Groups</option>
                    <option value="Private">Private Groups</option>
                  </select>
                </div>
              </div>

              {/* Extended Filters */}
              {showFilters && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Group Type
                      </label>
                      <div className="space-y-2">
                        {["Public", "Private"].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="groupType"
                              value={type}
                              checked={groupType === type}
                              onChange={handleGroupTypeChange}
                              className="w-3 h-3 text-[#0A3A4C] border-gray-300 focus:ring-[#0A3A4C]"
                            />
                            <div className="flex items-center gap-2">
                              {getGroupTypeIcon(type)}
                              <span className="text-xs text-gray-700">{type}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Content Routes */}
        <Routes>
          <Route path="/:_id/*" element={<IndividualGroup />} />
          <Route path="/create" element={<GroupRequest name="group" edit={false} />} />
          <Route path="/edit/:_id" element={<GroupRequest name="group" edit={true} />} />
          
          {/* Main Content */}
          {isAdmin ? (
            <Route path="/" element={<AllGroups searchQuery={searchQuery} groupType={groupType} />} />
          ) : (
            <Route path="/" element={
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8">
                <div className="text-center py-4 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 dynamic-site-bg rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users size={24} className="sm:size-32 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Groups
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Discover suggested groups or manage your joined groups.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto">
                    <Link
                      to="/home/groups/suggested-groups"
                      className="flex items-center justify-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                    >
                      <Eye size={14} />
                      <span>Explore Groups</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      to={`/home/groups/${profile._id}/joined-groups`}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                    >
                      <Users size={14} />
                      <span>Joined Groups</span>
                    </Link>
                  </div>
                </div>
              </div>
            } />
          )}
          
          {!isAdmin && (
            <Route path="/suggested-groups" element={<SuggestedGroups searchQuery={searchQuery} groupType={groupType} />} />
          )}
          
          <Route path="/:id/joined-groups" element={<JoinedGroups searchQuery={searchQuery} groupType={groupType} />} />
          
          {/* Admin Restricted Pages */}
          {isAdmin && (
            <>
              <Route path="/suggested-groups" element={
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Shield size={24} className="sm:size-32 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Access Restricted
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    This page is not available for administrators.
                  </p>
                  <Link
                    to="/home/groups"
                    className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                  >
                    <ArrowRight size={14} />
                    <span>Go to Groups</span>
                  </Link>
                </div>
              } />
              <Route path="/:id/joined-groups" element={
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Shield size={24} className="sm:size-32 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Access Restricted
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    This page is not available for administrators.
                  </p>
                  <Link
                    to="/home/groups"
                    className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                  >
                    <ArrowRight size={14} />
                    <span>Go to Groups</span>
                  </Link>
                </div>
              } />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default Groups;
