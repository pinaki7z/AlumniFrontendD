import React, { useState, useEffect } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import IntJobs from "../../components/IntJobs";
import PageSubTitle from "../../components/PageSubTitle";
import JobPost from "../../components/JobPost";
import { Archive } from "./Archive";
import { StarredJobs } from "../../components/StarredJobs";
import { AppliedJobs } from "../../components/AppliedJobs";
import baseUrl from "../../config";
import { 
  Search, 
  Filter, 
  Plus, 
  Briefcase, 
  Star, 
  FileCheck, 
  Building, 
  MapPin, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Grid,
  List,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  Bookmark,
  Eye,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

const Jobs = () => {
  const [title] = useState('Jobs');
  const titleS = 'job';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const profile = useSelector((state) => state.profile);

  const jobTypes = ['All', 'Job', 'Internship', 'Part time', 'Full time'];
  const locationTypes = ['All', 'Remote', 'On-site', 'Hybrid'];
  const salaryRanges = [
    'All',
    '0-25K',
    '25K-50K',
    '50K-100K',
    '100K-200K',
    '200K+'
  ];

  const getData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/internships`);
      setJobs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Enhanced filtering logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchQuery === '' || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    const matchesLocation = locationFilter === 'All' || job.locationType === locationFilter;
    
    const matchesSalary = salaryFilter === 'All' || (() => {
      const salary = job.salaryMax || job.salaryMin || 0;
      switch (salaryFilter) {
        case '0-25K': return salary <= 25000;
        case '25K-50K': return salary > 25000 && salary <= 50000;
        case '50K-100K': return salary > 50000 && salary <= 100000;
        case '100K-200K': return salary > 100000 && salary <= 200000;
        case '200K+': return salary > 200000;
        default: return true;
      }
    })();

    return matchesSearch && matchesType && matchesLocation && matchesSalary;
  });

  const myJobs = filteredJobs.filter(job => job.userId === profile._id);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setLocationFilter('All');
    setSalaryFilter('All');
  };

  const activeFiltersCount = [typeFilter, locationFilter, salaryFilter].filter(filter => filter !== 'All').length;

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

  const EmptyState = ({ type }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Briefcase size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type || 'jobs'} found
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {type === 'my jobs' 
          ? "You haven't posted any jobs yet. Create your first job posting to get started."
          : searchQuery || activeFiltersCount > 0
          ? "Try adjusting your search criteria or filters to find relevant opportunities."
          : "No job opportunities are currently available. Check back later for new postings."
        }
      </p>
      {type === 'my jobs' && (
        <Link
          to="/home/jobs/create"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
        >
          <Plus size={16} />
          <span>Create Job</span>
        </Link>
      )}
    </div>
  );

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
          <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Briefcase size={20} className="sm:size-6 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175]">
                    Job Board
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80">
                    Discover, explore, and submit applications for job openings on the Alumni Portal.
                  </p>
                </div>
              </div>
              {[0, 1, 2].includes(profile.profileLevel) && (
                <Link
                  to="/home/jobs/create"
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create Job</span>
                  <span className="sm:hidden">Create</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {getStatsCard("Total Jobs", jobs.length, <Briefcase size={20} className="text-blue-600" />, "bg-blue-100")}
          {getStatsCard("Active", jobs.filter(j => j.status !== 'closed').length, <TrendingUp size={20} className="text-green-600" />, "bg-green-100")}
          {getStatsCard("New This Week", jobs.filter(j => new Date(j.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length, <Star size={20} className="text-yellow-600" />, "bg-yellow-100")}
          {getStatsCard("Companies", new Set(jobs.map(j => j.company)).size, <Building size={20} className="text-purple-600" />, "bg-purple-100")}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <NavLink
                to="/home/jobs"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                    isActive
                      ? 'bg-[#0A3A4C] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <Grid size={16} />
                <span>All Jobs</span>
              </NavLink>

              {profile.profileLevel === 2 && (
                <NavLink
                  to="/home/jobs/myJobs"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                      isActive
                        ? 'bg-[#0A3A4C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`
                  }
                >
                  <User size={16} />
                  <span>My Jobs</span>
                </NavLink>
              )}

              {[2, 3].includes(profile.profileLevel) && (
                <>
                  <NavLink
                    to="/home/jobs/starred"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                        isActive
                          ? 'bg-[#0A3A4C] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`
                    }
                  >
                    <Star size={16} />
                    <span>Starred</span>
                  </NavLink>

                  <NavLink
                    to="/home/jobs/applied"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                        isActive
                          ? 'bg-[#0A3A4C] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`
                    }
                  >
                    <FileCheck size={16} />
                    <span>Applied</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>

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
                placeholder="Search jobs by title, company, or description..."
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
                  <SlidersHorizontal size={16} />
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
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                  >
                    <RefreshCw size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid size={16} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={16} />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Type
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
                    >
                      {locationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Range
                    </label>
                    <select
                      value={salaryFilter}
                      onChange={(e) => setSalaryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
                    >
                      {salaryRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                    >
                      <RefreshCw size={14} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Summary */}
            {(searchQuery || activeFiltersCount > 0) && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Filter size={14} />
                    <span>
                      Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} 
                      {searchQuery && ` for "${searchQuery}"`}
                    </span>
                  </div>
                  {(searchQuery || activeFiltersCount > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <Routes>
          <Route
            path="/"
            element={
              <div>
                {loading ? (
                  <LoadingGrid />
                ) : filteredJobs.length ? (
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredJobs.map((job) => (
                      <div key={job._id} className="job-post">
                        <JobPost
                          userId={job.userId}
                          job={job}
                          id={job._id}
                          jobTitle={job.title}
                          employmentType={job.employmentType}
                          description={job.description}
                          salaryMin={job.salaryMin}
                          salaryMax={job.salaryMax}
                          picture={job.picture}
                          duration={job.duration}
                          jobType={job.jobType || job.internshipType}
                          questions={job.questions}
                          category={job.category}
                          currency={job.currency}
                          createdAt={job.createdAt}
                          attachments={job.attachments}
                          title={title}
                          titleS={titleS}
                          type={job.type}
                          searchQuery={searchQuery}
                          locationType={job.locationType}
                          company={job.company}
                          verified={job.verified}
                          viewMode={viewMode}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            }
          />
          
          <Route
            path="/myJobs"
            element={
              <div>
                {loading ? (
                  <LoadingGrid />
                ) : myJobs.length ? (
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {myJobs.map(job => (
                      <JobPost
                        key={job._id}
                        userId={job.userId}
                        job={job}
                        id={job._id}
                        jobTitle={job.title}
                        employmentType={job.employmentType}
                        description={job.description}
                        salaryMin={job.salaryMin}
                        salaryMax={job.salaryMax}
                        picture={job.picture}
                        duration={job.duration}
                        jobType={job.jobType || job.internshipType}
                        questions={job.questions}
                        category={job.category}
                        currency={job.currency}
                        createdAt={job.createdAt}
                        attachments={job.attachments}
                        title={title}
                        titleS={titleS}
                        type={job.type}
                        searchQuery={searchQuery}
                        locationType={job.locationType}
                        company={job.company}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="my jobs" />
                )}
              </div>
            }
          />
          
          <Route
            path="/archive"
            element={
              <div>
                {loading ? (
                  <LoadingGrid />
                ) : filteredJobs.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                      <Archive
                        key={job._id}
                        userId={job.userId}
                        id={job._id}
                        jobTitle={job.title}
                        employmentType={job.employmentType}
                        description={job.description}
                        salaryMin={job.salaryMin}
                        salaryMax={job.salaryMax}
                        picture={job.picture}
                        duration={job.duration}
                        jobType={job.employmentType}
                        questions={job.questions}
                        category={job.category}
                        currency={job.currency}
                        createdAt={job.createdAt}
                        attachments={job.attachments}
                        type={job.type}
                        title={title}
                        titleS={titleS}
                        searchQuery={searchQuery}
                        locationType={job.locationType}
                        company={job.company}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="archived jobs" />
                )}
              </div>
            }
          />
          
          <Route
            path="/starred"
            element={
              <div>
                <StarredJobs searchQuery={searchQuery} />
              </div>
            }
          />
          
          <Route
            path="/applied"
            element={
              <div>
                <AppliedJobs searchQuery={searchQuery} />
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Jobs;
