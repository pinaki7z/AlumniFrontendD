import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  Check, 
  X, 
  Clock, 
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  RotateCcw,
  Trash2,
  Eye,
  AlertCircle,
  Shield,
  Download,
  RefreshCw,
  Settings,
  Grid,
  List,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ValidateUser = () => {
  const navigate = useNavigate();
  
  // State management
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [viewMode, setViewMode] = useState('cards');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Statistics - memoized to prevent unnecessary recalculations
  const stats = useMemo(() => {
    return {
      total: users.length,
      validated: users.filter(u => u.status === 'validated').length,
      notValidated: users.filter(u => u.status === 'not-validated').length,
      deleted: users.filter(u => u.status === 'account-deleted').length,
      expired: users.filter(u => u.status === 'expired').length
    };
  }, [users]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/validate/user`);
      setUsers(response.data.records || []);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on selections - memoized
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesType = userTypeFilter === 'all' || user.type === userTypeFilter;
      const matchesValidation = validationFilter === 'all' || user.status === validationFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        user.firstName?.toLowerCase().includes(q) ||
        user.lastName?.toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q);

      return matchesType && matchesValidation && matchesSearch;
    });
  }, [users, userTypeFilter, validationFilter, searchQuery]);

  // Pagination - memoized
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const validateUser = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: 'validating' }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/alumni/alumni/${id}/validateAlumni`);
      await fetchUsers();
    } catch (error) {
      console.error('Error validating user:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  const toggleDelete = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: 'deleting' }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/alumni/alumni/${id}/deleteAccount`);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling delete:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  const bulkAction = async (action) => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      const promises = selectedUsers.map(userId => {
        if (action === 'validate') {
          return axios.put(`${process.env.REACT_APP_API_URL}/alumni/alumni/${userId}/validateAlumni`);
        } else if (action === 'delete') {
          return axios.put(`${process.env.REACT_APP_API_URL}/alumni/alumni/${userId}/deleteAccount`);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      console.error('Error in bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Type', 'Status', 'Created Date'],
      ...filteredUsers.map(user => [
        `${user.firstName || ''} ${user.lastName || ''}`,
        user.email || '',
        user.type || '',
        user.status || '',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setUserTypeFilter('all');
    setValidationFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    userTypeFilter !== 'all',
    validationFilter !== 'all',
    searchQuery.trim()
  ].filter(Boolean).length;

  // Status configuration
  const statusConfig = {
    'validated': { 
      icon: <Check size={14} />, 
      color: 'text-green-600 bg-green-100', 
      label: 'Validated' 
    },
    'not-validated': { 
      icon: <X size={14} />, 
      color: 'text-orange-600 bg-orange-100', 
      label: 'Not Validated' 
    },
    'expired': { 
      icon: <Clock size={14} />, 
      color: 'text-yellow-600 bg-yellow-100', 
      label: 'Expired' 
    },
    'account-deleted': { 
      icon: <UserX size={14} />, 
      color: 'text-red-600 bg-red-100', 
      label: 'Deleted' 
    }
  };

  const getStatsCard = (title, value, icon, color, description) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${color} flex-shrink-0`}>
          {React.cloneElement(icon, { size: 16 })}
        </div>
      </div>
    </div>
  );

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Avatar
            src={user.profilePicture || ''}
            alt={`${user.firstName || ''} profile`}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 
              className="text-sm sm:text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
              onClick={() => navigate(`/home/members/${user._id}`)}
            >
              {user.firstName || ''} {user.lastName || ''}
            </h3>
            <div className="relative flex-shrink-0">
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[user.status]?.color || 'text-gray-600 bg-gray-100'}`}>
              {statusConfig[user.status]?.icon || <AlertCircle size={12} />}
              <span className="hidden sm:inline">{statusConfig[user.status]?.label || 'Unknown'}</span>
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
              {user.type || 'N/A'}
            </span>
          </div>
          
          {user.email && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{user.email}</p>
          )}
          
          {user.ID && (
            <a 
              href={user.ID} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mb-3"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">View ID Proof</span>
              <span className="sm:hidden">ID</span>
            </a>
          )}
          
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {(user.status === 'expired' || user.status === 'not-validated') && (
              <button
                onClick={() => validateUser(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'validating' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                <span className="hidden sm:inline">Validate</span>
              </button>
            )}

            {user.status === 'validated' && (
              <button
                onClick={() => validateUser(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'validating' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <X size={12} />
                )}
                <span className="hidden sm:inline">Invalidate</span>
              </button>
            )}

            {(user.status === 'validated' || user.status === 'expired' || user.status === 'not-validated') && (
              <button
                onClick={() => toggleDelete(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'deleting' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {user.status === 'account-deleted' && (
              <button
                onClick={() => toggleDelete(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'deleting' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RotateCcw size={12} />
                )}
                <span className="hidden sm:inline">Recover</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users size={24} className="sm:size-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-600 text-sm sm:text-base mb-4">
        {searchQuery || activeFiltersCount > 0
          ? "Try adjusting your search criteria or filters."
          : "No users have been registered yet."
        }
      </p>
      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
        >
          <RefreshCw size={16} />
          Clear Filters
        </button>
      )}
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="animate-pulse mb-6">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96"></div>
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              <Shield size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Member Control Panel
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage member access and validation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
          {getStatsCard("Total Users", stats.total, <Users size={16} className="text-blue-600" />, "bg-blue-100", "All registered users")}
          {getStatsCard("Validated", stats.validated, <UserCheck size={16} className="text-green-600" />, "bg-green-100", "Active members")}
          {getStatsCard("Pending", stats.notValidated, <Clock size={16} className="text-orange-600" />, "bg-orange-100", "Awaiting validation")}
          {getStatsCard("Expired", stats.expired, <AlertCircle size={16} className="text-yellow-600" />, "bg-yellow-100", "Expired accounts")}
          {getStatsCard("Deleted", stats.deleted, <UserX size={16} className="text-red-600" />, "bg-red-100", "Removed accounts")}
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
              placeholder="Search by name or email..."
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
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={14} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-xs"
                  >
                    <option value="all">All Types</option>
                    <option value="student">Students</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Validation Status</label>
                  <select
                    value={validationFilter}
                    onChange={(e) => setValidationFilter(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-xs"
                  >
                    <option value="all">All Status</option>
                    <option value="validated">Validated</option>
                    <option value="not-validated">Not Validated</option>
                    <option value="account-deleted">Account Deleted</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-xs"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-blue-700">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => bulkAction('validate')}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                >
                  Bulk Validate
                </button>
                <button
                  onClick={() => bulkAction('delete')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Bulk Delete
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
            {activeFiltersCount > 0 && <span className="ml-1">(filtered)</span>}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'cards' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {paginatedUsers.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
            <Pagination />
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden mb-3">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(paginatedUsers.map(u => u._id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Proof</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                            onClick={() => navigate(`/home/members/${user._id}`)}
                          >
                            <Avatar
                              src={user.profilePicture || ''}
                              alt={`${user.firstName || ''} profile`}
                              sx={{ width: 32, height: 32 }}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {user.firstName || ''} {user.lastName || ''}
                              </div>
                              {user.email && (
                                <div className="text-sm text-gray-500 truncate">{user.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
                            {user.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[user.status]?.color || 'text-gray-600 bg-gray-100'}`}>
                            {statusConfig[user.status]?.icon || <AlertCircle size={12} />}
                            {statusConfig[user.status]?.label || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          {user.ID ? (
                            <a 
                              href={user.ID} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <Eye size={14} />
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">No ID</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            {(user.status === 'expired' || user.status === 'not-validated') && (
                              <button
                                onClick={() => validateUser(user._id)}
                                disabled={processing[user._id]}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                              >
                                {processing[user._id] === 'validating' ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                <span className="hidden sm:inline">Validate</span>
                              </button>
                            )}

                            {user.status === 'validated' && (
                              <button
                                onClick={() => validateUser(user._id)}
                                disabled={processing[user._id]}
                                className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                              >
                                {processing[user._id] === 'validating' ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <X size={12} />
                                )}
                                <span className="hidden sm:inline">Invalidate</span>
                              </button>
                            )}

                            {(user.status === 'validated' || user.status === 'expired' || user.status === 'not-validated') && (
                              <button
                                onClick={() => toggleDelete(user._id)}
                                disabled={processing[user._id]}
                                className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                              >
                                {processing[user._id] === 'deleting' ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            )}

                            {user.status === 'account-deleted' && (
                              <button
                                onClick={() => toggleDelete(user._id)}
                                disabled={processing[user._id]}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                              >
                                {processing[user._id] === 'deleting' ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={12} />
                                )}
                                <span className="hidden sm:inline">Recover</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};

export default ValidateUser;
