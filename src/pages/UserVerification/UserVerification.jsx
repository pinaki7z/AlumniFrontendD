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
  ArrowLeft,
  Calendar,
  Activity,
  Database,
  TrendingUp,
  History,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Upload
} from 'lucide-react';
import axios from 'axios';
import { Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserVerification = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  
  // Check if user is admin
  const isAdmin = profile?.profileLevel === 0 || profile?.profileLevel === 1;
  
  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/home');
      return;
    }
  }, [isAdmin, navigate]);

  // State management
  const [activeTab, setActiveTab] = useState('pending-ids');
  const [validationFilter, setValidationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifications, setVerifications] = useState([]);
  const [pendingIds, setPendingIds] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    accountDeleted: 0,
    expired: 0
  });
  const [idStats, setIdStats] = useState({
    totalWithIds: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    notUploaded: 0
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [viewMode, setViewMode] = useState('cards');
  const [selectedVerifications, setSelectedVerifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch pending ID approvals
  const fetchPendingIds = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingResponse, idStatsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/user-verification/pending-ids`, {
          params: {
            page: 1,
            size: 1000
          }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/user-verification/id-stats`)
      ]);
      
      setPendingIds(pendingResponse.data.records || []);
      setIdStats(idStatsResponse.data || {
        totalWithIds: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        notUploaded: 0
      });
    } catch (error) {
      console.error('Error fetching pending IDs:', error);
      setPendingIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user verifications from API
  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const [verificationsResponse, statsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/user-verification`, {
          params: {
            page: 1,
            size: 1000
          }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/user-verification/stats`)
      ]);
      
      setVerifications(verificationsResponse.data.records || []);
      setStats(statsResponse.data || {
        total: 0,
        validated: 0,
        accountDeleted: 0,
        expired: 0
      });
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'pending-ids') {
        fetchPendingIds();
      } else {
        fetchVerifications();
      }
    }
  }, [activeTab, fetchPendingIds, fetchVerifications, isAdmin]);

  // Toggle validation status
  const toggleValidation = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: 'validating' }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/user-verification/${id}/toggle-validation`);
      await fetchVerifications();
    } catch (error) {
      console.error('Error toggling validation:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  // Toggle account deletion
  const toggleDeletion = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: 'deleting' }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/user-verification/${id}/toggle-deletion`);
      await fetchVerifications();
    } catch (error) {
      console.error('Error toggling deletion:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  // Delete verification record
  const deleteVerification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this verification record?')) {
      return;
    }
    
    setProcessing(prev => ({ ...prev, [id]: 'removing' }));
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/user-verification/${id}`);
      await fetchVerifications();
    } catch (error) {
      console.error('Error deleting verification:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  // Approve ID
  const approveId = async (id) => {
    setProcessing(prev => ({ ...prev, [id]: 'approving' }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/user-verification/${id}/approve-id`, {
        adminId: profile._id
      });
      await fetchPendingIds();
    } catch (error) {
      console.error('Error approving ID:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  // Reject ID
  const rejectId = async (id, reason = '') => {
    setProcessing(prev => ({ ...prev, [id]: 'rejecting' }));
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/user-verification/${id}/reject-id`, {
        reason, 
        adminId: profile._id
      });
      await fetchPendingIds();
    } catch (error) {
      console.error('Error rejecting ID:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: null }));
    }
  };

  // Bulk actions
  const bulkAction = async (action) => {
    if (selectedVerifications.length === 0) return;
    
    setLoading(true);
    try {
      const promises = selectedVerifications.map(verificationId => {
        if (action === 'validate') {
          return axios.put(`${process.env.REACT_APP_API_URL}/api/user-verification/${verificationId}/toggle-validation`);
        } else if (action === 'delete') {
          return axios.put(`${process.env.REACT_APP_API_URL}/api/user-verification/${verificationId}/toggle-deletion`);
        } else if (action === 'remove') {
          return axios.delete(`${process.env.REACT_APP_API_URL}/api/user-verification/${verificationId}`);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      setSelectedVerifications([]);
      await fetchVerifications();
    } catch (error) {
      console.error('Error in bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const exportData = () => {
    const dataToExport = activeTab === 'pending-ids' ? filteredPendingIds : filteredVerifications;
    
    const csvContent = [
      ['User Name', 'Email', 'Status', 'Created Date', 'Expiration Date', 'Last Updated', 'ID Status'],
      ...dataToExport.map(verification => {
        const user = verification.userId;
        const currentDate = new Date();
        let status = 'not-validated';
        if (verification.accountDeleted) {
          status = 'account-deleted';
        } else if (verification.validated) {
          status = 'validated';
        } else if (verification.expirationDate && new Date(verification.expirationDate) < currentDate) {
          status = 'expired';
        }

        return [
          `${user?.firstName || ''} ${user?.lastName || ''}`,
          user?.email || '',
          status,
          verification.createdAt ? new Date(verification.createdAt).toLocaleDateString() : '',
          verification.expirationDate ? new Date(verification.expirationDate).toLocaleDateString() : 'Never',
          verification.updatedAt ? new Date(verification.updatedAt).toLocaleDateString() : '',
          verification.idApprovalStatus || 'not-uploaded'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-verifications-${activeTab}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear filters
  const clearFilters = () => {
    setValidationFilter('all');
    setSearchQuery('');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    validationFilter !== 'all',
    searchQuery.trim(),
    dateFilter !== 'all'
  ].filter(Boolean).length;

  // Get verification status
  const getVerificationStatus = (verification) => {
    const currentDate = new Date();
    if (verification.accountDeleted) {
      return 'account-deleted';
    } else if (verification.validated) {
      return 'validated';
    } else if (verification.expirationDate && new Date(verification.expirationDate) < currentDate) {
      return 'expired';
    }
    return 'not-validated';
  };

  // Filter pending IDs based on search
  const filteredPendingIds = useMemo(() => {
    return pendingIds.filter(verification => {
      const user = verification.userId;
      const q = searchQuery.trim().toLowerCase();
      return !q ||
        user?.firstName?.toLowerCase().includes(q) ||
        user?.lastName?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q);
    });
  }, [pendingIds, searchQuery]);

  // Filter verifications based on selections - memoized
  const filteredVerifications = useMemo(() => {
    return verifications.filter(verification => {
      const currentDate = new Date();
      
      let status = 'not-validated';
      if (verification.accountDeleted) {
        status = 'account-deleted';
      } else if (verification.validated) {
        status = 'validated';
      } else if (verification.expirationDate && new Date(verification.expirationDate) < currentDate) {
        status = 'expired';
      }

      const matchesValidation = validationFilter === 'all' || status === validationFilter;
      
      const q = searchQuery.trim().toLowerCase();
      const user = verification.userId;
      const matchesSearch = !q ||
        user?.firstName?.toLowerCase().includes(q) ||
        user?.lastName?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q);

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const createdAt = new Date(verification.createdAt);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = createdAt.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = createdAt >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = createdAt >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesValidation && matchesSearch && matchesDate;
    });
  }, [verifications, validationFilter, searchQuery, dateFilter]);

  // Pagination - memoized
  const paginatedPendingIds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPendingIds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPendingIds, currentPage, itemsPerPage]);

  const paginatedVerifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVerifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVerifications, currentPage, itemsPerPage]);

  const totalPagesIds = Math.ceil(filteredPendingIds.length / itemsPerPage);
  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);

  // Status configuration
  const statusConfig = {
    'validated': { 
      icon: <Check size={14} />, 
      color: 'text-green-600 bg-green-100', 
      label: 'Validated' 
    },
    'not-validated': { 
      icon: <Clock size={14} />, 
      color: 'text-orange-600 bg-orange-100', 
      label: 'Pending' 
    },
    'expired': { 
      icon: <AlertCircle size={14} />, 
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

  // ID Pending Card Component
  const PendingIdCard = ({ verification }) => {
    const user = verification.userId;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Avatar
              src={user?.profilePicture || ''}
              alt={`${user?.firstName || ''} profile`}
              sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 
                className="text-sm sm:text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                onClick={() => navigate(`/home/members/${user?._id}`)}
              >
                {user?.firstName || ''} {user?.lastName || ''}
              </h3>
              <div className="relative flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-100">
                  <Upload size={12} />
                  <span className="hidden sm:inline">ID Pending</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                Level {user?.profileLevel || 'N/A'}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {user?.department || 'No Dept'}
              </span>
            </div>
            
            {user?.email && (
              <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{user.email}</p>
            )}
            
            <div className="text-xs text-gray-500 mb-3">
              <p>Uploaded: {new Date(verification.idUploadedAt).toLocaleDateString()}</p>
            </div>

            {verification.ID && (
              <div className="mb-3">
                <a 
                  href={verification.ID} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md"
                >
                  <Eye size={12} />
                  <span>View ID Document</span>
                </a>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                onClick={() => approveId(verification._id)}
                disabled={processing[verification._id]}
                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
              >
                {processing[verification._id] === 'approving' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ThumbsUp size={12} />
                )}
                <span className="hidden sm:inline">Approve</span>
              </button>

              <button
                onClick={() => {
                  const reason = window.prompt('Reason for rejection (optional):');
                  if (reason !== null) { // User didn't cancel
                    rejectId(verification._id, reason);
                  }
                }}
                disabled={processing[verification._id]}
                className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
              >
                {processing[verification._id] === 'rejecting' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ThumbsDown size={12} />
                )}
                <span className="hidden sm:inline">Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VerificationCard = ({ verification }) => {
    const user = verification.userId;
    const status = getVerificationStatus(verification);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Avatar
              src={user?.profilePicture || ''}
              alt={`${user?.firstName || ''} profile`}
              sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 
                className="text-sm sm:text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                onClick={() => navigate(`/home/members/${user?._id}`)}
              >
                {user?.firstName || ''} {user?.lastName || ''}
              </h3>
              <div className="relative flex-shrink-0">
                <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]?.color || 'text-gray-600 bg-gray-100'}`}>
                {statusConfig[status]?.icon || <AlertCircle size={12} />}
                <span className="hidden sm:inline">{statusConfig[status]?.label || 'Unknown'}</span>
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                Level {user?.profileLevel || 'N/A'}
              </span>
              {verification.idApprovalStatus && verification.idApprovalStatus !== 'not-uploaded' && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  verification.idApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  verification.idApprovalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  ID {verification.idApprovalStatus}
                </span>
              )}
            </div>
            
            {user?.email && (
              <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{user.email}</p>
            )}
            
            <div className="text-xs text-gray-500 mb-3 space-y-1">
              <p>Created: {new Date(verification.createdAt).toLocaleDateString()}</p>
              {verification.expirationDate && (
                <p>Expires: {new Date(verification.expirationDate).toLocaleDateString()}</p>
              )}
              <p>Updated: {new Date(verification.updatedAt).toLocaleDateString()}</p>
            </div>

            {verification.ID && (
              <div className="mb-3">
                <a 
                  href={verification.ID} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md"
                >
                  <Eye size={12} />
                  <span>View ID Document</span>
                </a>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {status === 'not-validated' && (
                <button
                  onClick={() => toggleValidation(verification._id)}
                  disabled={processing[verification._id]}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                >
                  {processing[verification._id] === 'validating' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  <span className="hidden sm:inline">Validate</span>
                </button>
              )}

              {status === 'validated' && (
                <button
                  onClick={() => toggleValidation(verification._id)}
                  disabled={processing[verification._id]}
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                >
                  {processing[verification._id] === 'validating' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  <span className="hidden sm:inline">Invalidate</span>
                </button>
              )}

              {status !== 'account-deleted' && (
                <button
                  onClick={() => toggleDeletion(verification._id)}
                  disabled={processing[verification._id]}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                >
                  {processing[verification._id] === 'deleting' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              {status === 'account-deleted' && (
                <button
                  onClick={() => toggleDeletion(verification._id)}
                  disabled={processing[verification._id]}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                >
                  {processing[verification._id] === 'deleting' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  <span className="hidden sm:inline">Restore</span>
                </button>
              )}

              <button
                onClick={() => deleteVerification(verification._id)}
                disabled={processing[verification._id]}
                className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                title="Remove verification record"
              >
                {processing[verification._id] === 'removing' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <X size={12} />
                )}
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const EmptyState = ({ type = 'verifications' }) => (
    <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        type === 'pending-ids' ? 'bg-orange-100' : 'bg-gray-100'
      }`}>
        {type === 'pending-ids' ? (
          <FileText size={24} className="sm:size-8 text-orange-400" />
        ) : (
          <Database size={24} className="sm:size-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        {type === 'pending-ids' ? 'No pending ID approvals' : 'No verification records found'}
      </h3>
      <p className="text-gray-600 text-sm sm:text-base mb-4">
        {type === 'pending-ids' 
          ? searchQuery 
            ? "No pending ID approvals match your search criteria."
            : "All ID submissions have been processed or there are no submissions yet."
          : searchQuery || activeFiltersCount > 0
            ? "Try adjusting your search criteria or filters."
            : "No user verification records have been created yet."
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

  const Pagination = ({ currentData, totalData, totalPagesCount }) => {
    if (totalPagesCount <= 1) return null;

    const currentTotalPages = activeTab === 'pending-ids' ? totalPagesIds : totalPages;

    return (
      <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalData)} of {totalData} results
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
            {Array.from({ length: Math.min(5, currentTotalPages) }, (_, i) => {
              let pageNum;
              if (currentTotalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= currentTotalPages - 2) {
                pageNum = currentTotalPages - 4 + i;
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, currentTotalPages))}
            disabled={currentPage === currentTotalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  if (loading && (activeTab === 'pending-ids' ? pendingIds.length === 0 : verifications.length === 0)) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft size={16} className="sm:size-5" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              <Database size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                User Verification System
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage user verification records and ID approvals</p>
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
              onClick={() => {
                if (activeTab === 'pending-ids') {
                  fetchPendingIds();
                } else {
                  fetchVerifications();
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveTab('pending-ids');
                  setCurrentPage(1);
                  setSearchQuery('');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pending-ids'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>ID Approvals</span>
                  {idStats.pending > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      {idStats.pending}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('verifications');
                  setCurrentPage(1);
                  setSearchQuery('');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'verifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>All Verifications</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'pending-ids' ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
            {getStatsCard("Total with IDs", idStats.totalWithIds, <FileText size={16} className="text-blue-600" />, "bg-blue-100", "All users with ID docs")}
            {getStatsCard("Pending", idStats.pending, <Clock size={16} className="text-orange-600" />, "bg-orange-100", "Awaiting approval")}
            {getStatsCard("Approved", idStats.approved, <ThumbsUp size={16} className="text-green-600" />, "bg-green-100", "ID approved")}
            {getStatsCard("Rejected", idStats.rejected, <ThumbsDown size={16} className="text-red-600" />, "bg-red-100", "ID rejected")}
            {getStatsCard("No ID", idStats.notUploaded, <X size={16} className="text-gray-600" />, "bg-gray-100", "No ID uploaded")}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {getStatsCard("Total Records", stats.total, <Database size={16} className="text-blue-600" />, "bg-blue-100", "All verification records")}
            {getStatsCard("Validated", stats.validated, <UserCheck size={16} className="text-green-600" />, "bg-green-100", "Verified users")}
            {getStatsCard("Expired", stats.expired, <AlertCircle size={16} className="text-yellow-600" />, "bg-yellow-100", "Expired verifications")}
            {getStatsCard("Deleted", stats.accountDeleted, <UserX size={16} className="text-red-600" />, "bg-red-100", "Deleted accounts")}
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
              placeholder={activeTab === 'pending-ids' ? "Search pending ID approvals..." : "Search by user name or email..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
            />
          </div>

          {/* Filter Controls - Only show for verifications tab */}
          {activeTab === 'verifications' && (
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
          )}

          {/* Extended Filters */}
          {showFilters && activeTab === 'verifications' && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Validation Status</label>
                  <select
                    value={validationFilter}
                    onChange={(e) => setValidationFilter(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-xs"
                  >
                    <option value="all">All Status</option>
                    <option value="validated">Validated</option>
                    <option value="not-validated">Pending</option>
                    <option value="account-deleted">Account Deleted</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-xs"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
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

        {/* Bulk Actions - Only for verifications tab */}
        {selectedVerifications.length > 0 && activeTab === 'verifications' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-blue-700">
                {selectedVerifications.length} record{selectedVerifications.length !== 1 ? 's' : ''} selected
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
                  onClick={() => bulkAction('remove')}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Bulk Remove
                </button>
                <button
                  onClick={() => setSelectedVerifications([])}
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
            {activeTab === 'pending-ids' ? (
              <>Showing {paginatedPendingIds.length} of {filteredPendingIds.length} pending ID approvals</>
            ) : (
              <>Showing {paginatedVerifications.length} of {filteredVerifications.length} verification records</>
            )}
            {searchQuery && <span className="ml-1">(filtered)</span>}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : activeTab === 'pending-ids' ? (
          filteredPendingIds.length === 0 ? (
            <EmptyState type="pending-ids" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {paginatedPendingIds.map((verification) => (
                  <PendingIdCard key={verification._id} verification={verification} />
                ))}
              </div>
              <Pagination 
                currentData={paginatedPendingIds.length}
                totalData={filteredPendingIds.length}
                totalPagesCount={totalPagesIds}
              />
            </>
          )
        ) : (
          filteredVerifications.length === 0 ? (
            <EmptyState type="verifications" />
          ) : viewMode === 'cards' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {paginatedVerifications.map((verification) => (
                  <VerificationCard key={verification._id} verification={verification} />
                ))}
              </div>
              <Pagination 
                currentData={paginatedVerifications.length}
                totalData={filteredVerifications.length}
                totalPagesCount={totalPages}
              />
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
                            checked={selectedVerifications.length === paginatedVerifications.length && paginatedVerifications.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVerifications(paginatedVerifications.map(v => v._id));
                              } else {
                                setSelectedVerifications([]);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Status</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedVerifications.map((verification) => {
                        const user = verification.userId;
                        const status = getVerificationStatus(verification);
                        
                        return (
                          <tr key={verification._id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedVerifications.includes(verification._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVerifications([...selectedVerifications, verification._id]);
                                  } else {
                                    setSelectedVerifications(selectedVerifications.filter(id => id !== verification._id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div 
                                className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                                onClick={() => navigate(`/home/members/${user?._id}`)}
                              >
                                <Avatar
                                  src={user?.profilePicture || ''}
                                  alt={`${user?.firstName || ''} profile`}
                                  sx={{ width: 32, height: 32 }}
                                />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {user?.firstName || ''} {user?.lastName || ''}
                                  </div>
                                  {user?.email && (
                                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]?.color || 'text-gray-600 bg-gray-100'}`}>
                                {statusConfig[status]?.icon || <AlertCircle size={12} />}
                                {statusConfig[status]?.label || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              {verification.idApprovalStatus && verification.idApprovalStatus !== 'not-uploaded' ? (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  verification.idApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  verification.idApprovalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {verification.idApprovalStatus}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">No ID</span>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(verification.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {verification.expirationDate 
                                ? new Date(verification.expirationDate).toLocaleDateString()
                                : 'Never'
                              }
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                {verification.ID && (
                                  <a 
                                    href={verification.ID} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                                  >
                                    <Eye size={12} />
                                    <span className="hidden sm:inline">View ID</span>
                                  </a>
                                )}

                                {status === 'not-validated' && (
                                  <button
                                    onClick={() => toggleValidation(verification._id)}
                                    disabled={processing[verification._id]}
                                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                                  >
                                    {processing[verification._id] === 'validating' ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                    <span className="hidden sm:inline">Validate</span>
                                  </button>
                                )}

                                {status === 'validated' && (
                                  <button
                                    onClick={() => toggleValidation(verification._id)}
                                    disabled={processing[verification._id]}
                                    className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                                  >
                                    {processing[verification._id] === 'validating' ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <X size={12} />
                                    )}
                                    <span className="hidden sm:inline">Invalidate</span>
                                  </button>
                                )}

                                {status !== 'account-deleted' && (
                                  <button
                                    onClick={() => toggleDeletion(verification._id)}
                                    disabled={processing[verification._id]}
                                    className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                                  >
                                    {processing[verification._id] === 'deleting' ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={12} />
                                    )}
                                    <span className="hidden sm:inline">Delete</span>
                                  </button>
                                )}

                                {status === 'account-deleted' && (
                                  <button
                                    onClick={() => toggleDeletion(verification._id)}
                                    disabled={processing[verification._id]}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                                  >
                                    {processing[verification._id] === 'deleting' ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <RotateCcw size={12} />
                                    )}
                                    <span className="hidden sm:inline">Restore</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteVerification(verification._id)}
                                  disabled={processing[verification._id]}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                                  title="Remove verification record"
                                >
                                  {processing[verification._id] === 'removing' ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <X size={12} />
                                  )}
                                  <span className="hidden sm:inline">Remove</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination 
                currentData={paginatedVerifications.length}
                totalData={filteredVerifications.length}
                totalPagesCount={totalPages}
              />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default UserVerification;
