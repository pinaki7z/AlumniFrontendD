import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './members.css';
import Profilecard from '../../components/Profilecard';
import { Route, Routes } from "react-router-dom";
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import profileImage from "../../images/profileImage.png";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Users, 
  Plus, 
  UserPlus, 
  ChevronDown,
  Loader2,
  RefreshCw,
  UserCheck
} from "lucide-react";

const Members = ({ addButton, groupMembers, owner, deleteButton }) => {
  const membersred = useSelector((state) => state.member.filter(member => member.profileLevel !== 0));
  const [cookie, setCookie] = useCookies('token');
  const [displayedMembers, setDisplayedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const activePageRef = useRef(1);
  const LIMIT = 700;
  const [memberRole, setMemberRole] = useState('');
  const [graduatingYear, setGraduatingYear] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const profile = useSelector((state) => state.profile);
  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }

  const totalMembers = membersred.length;

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = ['Graduated'];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const generateBatches = () => {
    const currentYear = new Date().getFullYear();
    const batches = [];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      batches.push(`${i - 1}-${i}`);
    }
    return batches;
  };

  const getRoleBadge = (level) => {
    let label = "";
    let colorClass = "";
    let icon = null;
    
    switch (level) {
      case 1:
        label = "ADMIN";
        colorClass = "bg-orange-100 text-orange-800";
        icon = <UserCheck size={12} className="text-orange-600" />;
        break;
      case 2:
        label = "ALUMNI";
        colorClass = "bg-blue-100 text-blue-800";
        icon = <Users size={12} className="text-blue-600" />;
        break;
      case 3:
        label = "STUDENT";
        colorClass = "bg-green-100 text-green-800";
        icon = <Users size={12} className="text-green-600" />;
        break;
      default:
        label = "SUPER ADMIN";
        colorClass = "bg-red-100 text-red-800";
        icon = <UserCheck size={12} className="text-red-600" />;
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {icon}
        {label}
      </span>
    );
  };

  const ListViewItem = ({ member }) => {
    return (
      <Link
        to={`/home/members/${member._id}`}
        className="block hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src={member.profilePicture || profileImage} 
                alt={`${member.firstName} ${member.lastName}`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(member.profileLevel)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 sm:text-right">
                  {member.graduatingYear && (
                    <p>Class of {member.graduatingYear}</p>
                  )}
                  {member.department && (
                    <p className="truncate sm:max-w-24">{member.department}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const handleDelete = async (memberId) => {
    try {
      const token = cookie.token;
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/alumni/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success(response.data);
        window.location.reload();
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMemberRole('');
    setGraduatingYear('');
    setDepartment('');
    setBatch('');
  };

  const activeFiltersCount = [memberRole, graduatingYear, department, batch].filter(Boolean).length;

  useEffect(() => {
    initialMembers();
  }, []);

  useEffect(() => {
    let filteredMembers = membersred;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredMembers = filteredMembers.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query) ||
          member.lastName.toLowerCase().includes(query)
      );
    }

    if (memberRole) {
      const roleMapping = {
        "1": 1,
        "2": 2,
        "3": 3
      };
      filteredMembers = filteredMembers.filter(
        (member) => member.profileLevel === roleMapping[memberRole]
      );
    }

    if (graduatingYear) {
      filteredMembers = filteredMembers.filter(
        (member) => member.graduatingYear === parseInt(graduatingYear)
      );
    }

    if (department) {
      filteredMembers = filteredMembers.filter(
        (member) => member.department === department
      );
    }

    if (batch) {
      filteredMembers = filteredMembers.filter(
        (member) => member.batch === batch
      );
    }

    setNoUsersFound(filteredMembers.length === 0);
    setDisplayedMembers(filteredMembers.slice(0, LIMIT));
  }, [searchQuery, memberRole, graduatingYear, department, batch]);

  const loadMoreMembers = () => {
    setLoading(true);
    const startIndex = activePageRef.current * LIMIT;
    const endIndex = startIndex + LIMIT;
    const nextBatch = membersred.slice(startIndex, endIndex);
    setDisplayedMembers((prevMembers) => [...prevMembers, ...nextBatch]);
    activePageRef.current++;
    setLoading(false);
  };

  const initialMembers = () => {
    setLoading(true);
    const startIndex = activePageRef.current * LIMIT;
    const endIndex = startIndex + LIMIT;
    const nextBatch = membersred.slice(startIndex, endIndex);
    setDisplayedMembers((prevMembers) => [...prevMembers, ...nextBatch]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              <Users size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Members</h1>
              <p className="text-xs sm:text-sm text-gray-600">{totalMembers} members total</p>
            </div>
          </div>
          
          {/* Create Member Button */}
          {admin && (
            <Link 
              to="/home/members/create"
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium shadow-sm w-full sm:w-auto"
            >
              <UserPlus size={16} />
              <span>Create Member</span>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search members by name..."
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
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-xs"
                  >
                    <option value="">All Roles</option>
                    <option value="1">Admin</option>
                    <option value="2">Alumni</option>
                    <option value="3">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-xs"
                  >
                    <option value="">All Departments</option>
                    <option value="Agricultural Engineering">Agricultural</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Human Languages">Human Languages</option>
                    <option value="Vocal Music">Vocal Music</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-xs"
                  >
                    <option value="">All Batches</option>
                    {generateBatches().map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={graduatingYear}
                    onChange={(e) => setGraduatingYear(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-xs"
                  >
                    <option value="">All Years</option>
                    {generateYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Members Display */}
        <Routes>
          <Route path="/" element={
            <div className="space-y-4">
              {/* No Results Message */}
              {noUsersFound && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 text-center">
                  <Users size={40} className="sm:size-48 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No members found</h3>
                  <p className="text-gray-600 text-sm">Try adjusting your search criteria or filters.</p>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && !noUsersFound && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {/* Member Cards */}
                  {displayedMembers.map((member) => (
                    <Profilecard
                      key={member._id}
                      member={member}
                      addButton={addButton}
                      groupMembers={groupMembers}
                      owner={owner}
                      deleteButton={deleteButton !== undefined ? deleteButton : true}
                      handleDelete={() => handleDelete(member._id)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && !noUsersFound && (
                <div className="space-y-2">
                  {displayedMembers.map((member) => (
                    <ListViewItem
                      key={member._id}
                      member={member}
                    />
                  ))}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-6">
                  <Loader2 size={20} className="animate-spin text-[#0A3A4C] mr-2" />
                  <span className="text-gray-600 text-sm">Loading members...</span>
                </div>
              )}

              {/* Load More Button */}
              {activePageRef.current * LIMIT < totalMembers && !noUsersFound && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMoreMembers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0A3A4C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    <span>Load More Members</span>
                  </button>
                </div>
              )}
            </div>
          } />
          {/* <Route path="/create" element={<DonSponRequest name='member' />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default Members;
