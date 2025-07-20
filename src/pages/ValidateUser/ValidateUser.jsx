import React, { useEffect, useState } from 'react';
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
  Loader2
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
  const [viewMode, setViewMode] = useState('table');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    notValidated: 0,
    deleted: 0,
    expired: 0
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/validate/user`);
      setUsers(response.data.records);
      setCount(response.data.count);
      
      // Calculate stats
      const records = response.data.records;
      setStats({
        total: records.length,
        validated: records.filter(u => u.status === 'validated').length,
        notValidated: records.filter(u => u.status === 'not-validated').length,
        deleted: records.filter(u => u.status === 'account-deleted').length,
        expired: records.filter(u => u.status === 'expired').length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on selections
  const filteredUsers = users.filter(user => {
    const matchesType = userTypeFilter === 'all' || user.type === userTypeFilter;
    const matchesValidation = validationFilter === 'all' || user.status === validationFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      user.firstName.toLowerCase().includes(q) ||
      user.lastName.toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q);

    return matchesType && matchesValidation && matchesSearch;
  });

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
        `${user.firstName} ${user.lastName}`,
        user.email || '',
        user.type,
        user.status,
        new Date(user.createdAt).toLocaleDateString()
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

  // Status configuration
  const statusConfig = {
    'validated': { 
      icon: <Check size={16} />, 
      color: 'text-green-600 bg-green-100', 
      label: 'Validated' 
    },
    'not-validated': { 
      icon: <X size={16} />, 
      color: 'text-orange-600 bg-orange-100', 
      label: 'Not Validated' 
    },
    'expired': { 
      icon: <Clock size={16} />, 
      color: 'text-yellow-600 bg-yellow-100', 
      label: 'Expired' 
    },
    'account-deleted': { 
      icon: <UserX size={16} />, 
      color: 'text-red-600 bg-red-100', 
      label: 'Deleted' 
    }
  };

  const getStatsCard = (title, value, icon, color, description) => (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const UserCard = ({ user, index }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Avatar
            src={user.profilePicture || ''}
            alt={`${user.firstName} profile`}
            sx={{ width: 48, height: 48 }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
              onClick={() => navigate(`/home/members/${user._id}`)}
            >
              {user.firstName} {user.lastName}
            </h3>
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[user.status]?.color}`}>
              {statusConfig[user.status]?.icon}
              {statusConfig[user.status]?.label}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
              {user.type}
            </span>
          </div>
          
          {user.email && (
            <p className="text-sm text-gray-600 mb-3">{user.email}</p>
          )}
          
          {user.ID && (
            <a 
              href={user.ID} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-3"
            >
              <Eye size={14} />
              View ID Proof
            </a>
          )}
          
          <div className="flex flex-wrap gap-2">
            {(user.status === 'expired' || user.status === 'not-validated') && (
              <button
                onClick={() => validateUser(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'validating' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Validate
              </button>
            )}

            {user.status === 'validated' && (
              <button
                onClick={() => validateUser(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'validating' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
                Invalidate
              </button>
            )}

            {(user.status === 'validated' || user.status === 'expired' || user.status === 'not-validated') && (
              <button
                onClick={() => toggleDelete(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'deleting' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            )}

            {user.status === 'account-deleted' && (
              <button
                onClick={() => toggleDelete(user._id)}
                disabled={processing[user._id]}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                {processing[user._id] === 'deleting' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RotateCcw size={14} />
                )}
                Recover
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
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

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-[#CEF3DF] p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-96"></div>
              </div>
            </div>
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="sm:size-6 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175]">
                    Member Control Panel
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80">
                    Manage your members and their access to the Alumni Portal.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {getStatsCard("Total Users", stats.total, <Users size={20} className="text-blue-600" />, "bg-blue-100", "All registered users")}
          {getStatsCard("Validated", stats.validated, <UserCheck size={20} className="text-green-600" />, "bg-green-100", "Active members")}
          {getStatsCard("Pending", stats.notValidated, <Clock size={20} className="text-orange-600" />, "bg-orange-100", "Awaiting validation")}
          {getStatsCard("Expired", stats.expired, <AlertCircle size={20} className="text-yellow-600" />, "bg-yellow-100", "Expired accounts")}
          {getStatsCard("Deleted", stats.deleted, <UserX size={20} className="text-red-600" />, "bg-red-100", "Removed accounts")}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
                
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  >
                    <option value="all">All Types</option>
                    <option value="student">Students</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validation Status</label>
                  <select
                    value={validationFilter}
                    onChange={(e) => setValidationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
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
                    onClick={() => {
                      setUserTypeFilter('all');
                      setValidationFilter('all');
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-blue-700">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex gap-2">
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
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
            {(searchQuery || userTypeFilter !== 'all' || validationFilter !== 'all') && (
              <span className="ml-1">(filtered)</span>
            )}
          </p>
        </div>

        {/* Content */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => (
              <UserCard key={user._id} user={user} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u._id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Proof</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                          onClick={() => navigate(`/home/members/${user._id}`)}
                        >
                          <Avatar
                            src={user.profilePicture || ''}
                            alt={`${user.firstName} profile`}
                            sx={{ width: 40, height: 40 }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.email && (
                              <div className="text-sm text-gray-500">{user.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
                          {user.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[user.status]?.color}`}>
                          {statusConfig[user.status]?.icon}
                          {statusConfig[user.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(user.status === 'expired' || user.status === 'not-validated') && (
                            <button
                              onClick={() => validateUser(user._id)}
                              disabled={processing[user._id]}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            >
                              {processing[user._id] === 'validating' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Validate
                            </button>
                          )}

                          {user.status === 'validated' && (
                            <button
                              onClick={() => validateUser(user._id)}
                              disabled={processing[user._id]}
                              className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            >
                              {processing[user._id] === 'validating' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <X size={14} />
                              )}
                              Invalidate
                            </button>
                          )}

                          {(user.status === 'validated' || user.status === 'expired' || user.status === 'not-validated') && (
                            <button
                              onClick={() => toggleDelete(user._id)}
                              disabled={processing[user._id]}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            >
                              {processing[user._id] === 'deleting' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>
                          )}

                          {user.status === 'account-deleted' && (
                            <button
                              onClick={() => toggleDelete(user._id)}
                              disabled={processing[user._id]}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            >
                              {processing[user._id] === 'deleting' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <RotateCcw size={14} />
                              )}
                              Recover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchQuery || userTypeFilter !== 'all' || validationFilter !== 'all'
                    ? "Try adjusting your search criteria or filters."
                    : "No users have been registered yet."
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidateUser;
