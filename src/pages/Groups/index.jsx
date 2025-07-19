import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import PageSubTitle from "../../components/PageSubTitle";
import SuggestedGroups from "../../components/Groups/SuggestedGroups";
import MyGroups from "../../components/Groups/MyGroups";
import JoinedGroups from "../../components/Groups/JoinedGroups";
import DonSponRequest from "../../components/DonSponRequest";
import IndividualGroup from "../../components/Groups/IndividualGroup";
import AllGroups from "../../components/Groups/AllGroups";
import { AddMembers } from "../../components/Groups/AddMembers";
import GroupMembers from "../../components/Groups/GroupMembers";
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
  Activity
} from "lucide-react";

const Groups = () => {
  const profile = useSelector((state) => state.profile);
  const location = useLocation();
  const [groupType, setGroupType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // Navigation configuration
  const getNavigationConfig = () => {
    if (isAdmin) {
      return [
        { label: "All Groups", path: "/home/groups", icon: <Grid size={16} /> },
      ];
    } else {
      return [
        { label: "Suggested Groups", path: "/home/groups/suggested-groups", icon: <Eye size={16} /> },
        { label: "Joined Groups", path: `/home/groups/${profile._id}/joined-groups`, icon: <Users size={16} /> },
      ];
    }
  };

  const handleGroupTypeChange = (e) => {
    setGroupType(e.target.value);
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case "Public":
        return <Globe size={16} className="text-green-600" />;
      case "Private":
        return <Lock size={16} className="text-red-600" />;
      default:
        return <Grid size={16} className="text-gray-600" />;
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes("suggested-groups")) {
      return {
        title: "Suggested Groups",
        subtitle: "Discover groups that match your interests and connect with like-minded people.",
        icon: <Eye size={24} className="text-blue-600" />
      };
    } else if (location.pathname.includes("joined-groups")) {
      return {
        title: "Joined Groups",
        subtitle: "Manage and interact with groups you're already part of.",
        icon: <Users size={24} className="text-green-600" />
      };
    } else {
      return {
        title: "Groups",
        subtitle: "Join communities based on interests like music, sports, and tech.",
        icon: <Grid size={24} className="text-[#0A3A4C]" />
      };
    }
  };

  const pageInfo = getPageTitle();
  const navConfig = getNavigationConfig();
  const activeFiltersCount = [groupType].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <Routes>
          <Route path="/" element={
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
              <div className="bg-[#CEF3DF] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      {pageInfo.icon}
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175]">
                        {pageInfo.title}
                      </h1>
                      <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80 mt-1">
                        {pageInfo.subtitle}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Link
                        to="/home/groups/create"
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 text-sm sm:text-base font-medium"
                      >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Create Group</span>
                        <span className="sm:hidden">Create</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          } />
          <Route path="/suggested-groups" element={
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
              <div className="bg-[#CEF3DF] p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Eye size={20} className="sm:size-6 text-[#0A3A4C]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#136175]">
                      Suggested Groups
                    </h1>
                    <p className="text-sm sm:text-base text-[#136175]/80">
                      Discover groups that match your interests and connect with like-minded people.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          } />
          <Route path="/:id/joined-groups" element={
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
              <div className="bg-[#CEF3DF] p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users size={20} className="sm:size-6 text-[#0A3A4C]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#136175]">
                      Joined Groups
                    </h1>
                    <p className="text-sm sm:text-base text-[#136175]/80">
                      Manage and interact with groups you're already part of.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>

        {/* Navigation Tabs */}
        {!isAdmin && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {navConfig.map((nav, index) => (
                  <Link
                    key={index}
                    to={nav.path}
                    className={`flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium ${
                      location.pathname === nav.path
                        ? "bg-[#0A3A4C] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {nav.icon}
                    <span>{nav.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <Routes>
          <Route path="/" element={
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                {/* Filters */}
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
                  </div>

                  {/* Quick Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">Quick filter:</span>
                    <select
                      value={groupType}
                      onChange={handleGroupTypeChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm bg-white"
                    >
                      <option value="">All Groups</option>
                      <option value="Public">Public Groups</option>
                      <option value="Private">Private Groups</option>
                    </select>
                  </div>
                </div>

                {/* Extended Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-4 h-4 text-[#0A3A4C] border-gray-300 focus:ring-[#0A3A4C]"
                              />
                              <div className="flex items-center gap-2">
                                {getGroupTypeIcon(type)}
                                <span className="text-sm text-gray-700">{type}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          } />
          <Route path="/suggested-groups" element={
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <div className="flex justify-end">
                  <select
                    value={groupType}
                    onChange={handleGroupTypeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm bg-white"
                  >
                    <option value="">All Groups</option>
                    <option value="Public">Public Groups</option>
                    <option value="Private">Private Groups</option>
                  </select>
                </div>
              </div>
            </div>
          } />
          <Route path="/:id/joined-groups" element={
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <div className="flex justify-end">
                  <select
                    value={groupType}
                    onChange={handleGroupTypeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm bg-white"
                  >
                    <option value="">All Groups</option>
                    <option value="Public">Public Groups</option>
                    <option value="Private">Private Groups</option>
                  </select>
                </div>
              </div>
            </div>
          } />
        </Routes>

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
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-[#0A3A4C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to Groups
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Discover suggested groups or manage your joined groups.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/home/groups/suggested-groups"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
                    >
                      <Eye size={16} />
                      <span>Explore Suggested Groups</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to={`/home/groups/${profile._id}/joined-groups`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Users size={16} />
                      <span>View Joined Groups</span>
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
          
          {isAdmin && (
            <Route path="/suggested-groups" element={
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Access Restricted
                </h3>
                <p className="text-gray-600 mb-6">
                  This page is not available for administrators. Please return to the main groups page.
                </p>
                <Link
                  to="/home/groups"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
                >
                  <ArrowRight size={16} />
                  <span>Go to Groups</span>
                </Link>
              </div>
            } />
          )}
        </Routes>
      </div>
    </div>
  );
};

export default Groups;
