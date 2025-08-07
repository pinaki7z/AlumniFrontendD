// components/ProhibitedKeywords/ProhibitedKeywords.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  AlertTriangle,
  Download,
  Upload,
  Loader2,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const ProhibitedKeywords = () => {
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [deletingKeyword, setDeletingKeyword] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  const [keywords, setKeywords] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null
  });
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: [],
    severities: []
  });
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    keyword: '',
    category: 'other',
    severity: 'medium',
    description: ''
  });
  const [bulkKeywords, setBulkKeywords] = useState('');

  const categories = [
    { value: 'profanity', label: 'Profanity', color: 'bg-red-100 text-red-800' },
    { value: 'hate_speech', label: 'Hate Speech', color: 'bg-red-100 text-red-800' },
    { value: 'spam', label: 'Spam', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'inappropriate', label: 'Inappropriate', color: 'bg-orange-100 text-orange-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const severities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  // Check if user is admin
  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // Fetch keywords
  const fetchKeywords = async (page = currentPage) => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/prohibited-keywords/all`;
      let params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      
      if (filterSeverity !== 'all') {
        params.append('severity', filterSeverity);
      }
      
      if (filterStatus !== 'all') {
        params.append('isActive', filterStatus === 'active');
      }

      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(`${url}?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setKeywords(result.keywords);
        setPagination(result.pagination);
        setCurrentPage(result.pagination.currentPage);
      } else {
        toast.error(result.message || 'Failed to fetch keywords');
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
      toast.error('Failed to fetch keywords');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/stats`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Add keyword
  const handleAddKeyword = async (e) => {
    e.preventDefault();
    
    if (!formData.keyword.trim()) {
      toast.error('Keyword is required');
      return;
    }

    setAddingKeyword(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          addedBy: profile.email
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Prohibited keyword added successfully!');
        setShowAddModal(false);
        setFormData({ keyword: '', category: 'other', severity: 'medium', description: '' });
        fetchKeywords(1); // Go to first page
        setCurrentPage(1);
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to add keyword');
      }
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast.error('Failed to add keyword');
    } finally {
      setAddingKeyword(false);
    }
  };

  // Edit keyword
  const handleEditKeyword = async (e) => {
    e.preventDefault();
    
    if (!formData.keyword.trim()) {
      toast.error('Keyword is required');
      return;
    }

    setEditingLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/${editingKeyword._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Keyword updated successfully!');
        setShowEditModal(false);
        setEditingKeyword(null);
        setFormData({ keyword: '', category: 'other', severity: 'medium', description: '' });
        fetchKeywords();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to update keyword');
      }
    } catch (error) {
      console.error('Error updating keyword:', error);
      toast.error('Failed to update keyword');
    } finally {
      setEditingLoading(false);
    }
  };

  // Delete keyword
  const handleDeleteKeyword = async (keywordId) => {
    if (!window.confirm('Are you sure you want to delete this keyword?')) {
      return;
    }

    setDeletingKeyword(keywordId);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/${keywordId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Keyword deleted successfully');
        fetchKeywords();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to delete keyword');
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast.error('Failed to delete keyword');
    } finally {
      setDeletingKeyword(null);
    }
  };

  // Toggle keyword status
  const handleToggleStatus = async (keywordId) => {
    setTogglingStatus(keywordId);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/${keywordId}/toggle-status`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchKeywords();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    } finally {
      setTogglingStatus(null);
    }
  };

  // Bulk import
  const handleBulkImport = async () => {
    if (!bulkKeywords.trim()) {
      toast.error('Please enter keywords to import');
      return;
    }

    const keywordList = bulkKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordList.length === 0) {
      toast.error('No valid keywords found');
      return;
    }

    setBulkImporting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywordList,
          addedBy: profile.email,
          category: formData.category,
          severity: formData.severity
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setShowBulkModal(false);
        setBulkKeywords('');
        setFormData({ keyword: '', category: 'other', severity: 'medium', description: '' });
        fetchKeywords(1); // Go to first page
        setCurrentPage(1);
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to import keywords');
      }
    } catch (error) {
      console.error('Error importing keywords:', error);
      toast.error('Failed to import keywords');
    } finally {
      setBulkImporting(false);
    }
  };

  // Export keywords
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/prohibited-keywords/export`);
      const result = await response.json();

      if (result.success) {
        const dataStr = JSON.stringify(result.keywords, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `prohibited_keywords_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Keywords exported successfully');
      } else {
        toast.error('Failed to export keywords');
      }
    } catch (error) {
      console.error('Error exporting keywords:', error);
      toast.error('Failed to export keywords');
    } finally {
      setExporting(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      fetchKeywords(page);
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchKeywords(1);
  };

  // Open edit modal
  const openEditModal = (keyword) => {
    setEditingKeyword(keyword);
    setFormData({
      keyword: keyword.keyword,
      category: keyword.category,
      severity: keyword.severity,
      description: keyword.description || ''
    });
    setShowEditModal(true);
  };

  // Get category label and color
  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1];
  };

  // Get severity label and color
  const getSeverityInfo = (severity) => {
    return severities.find(s => s.value === severity) || severities[0];
  };

  // Initial data fetch
  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  // Fetch keywords when filters change
  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        setCurrentPage(1); // Reset to first page when filters change
        fetchKeywords(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filterCategory, filterSeverity, filterStatus, itemsPerPage, isAdmin]);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Only administrators can manage prohibited keywords.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
              <Shield size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Prohibited Keywords
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Manage content filtering keywords and phrases
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={bulkImporting}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
            >
              {bulkImporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              <span className="hidden sm:inline">
                {bulkImporting ? 'Importing...' : 'Bulk Import'}
              </span>
              <span className="sm:hidden">
                {bulkImporting ? 'Importing' : 'Import'}
              </span>
            </button>
            
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
            >
              {exporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span className="hidden sm:inline">
                {exporting ? 'Exporting...' : 'Export'}
              </span>
              <span className="sm:hidden">
                {exporting ? 'Exporting' : 'Export'}
              </span>
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              disabled={addingKeyword}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 text-sm font-medium"
            >
              {addingKeyword ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              <span>Add Keyword</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Keywords</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Check size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X size={16} className="text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Categories</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.categories?.length || 0}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Items Per Page */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              <option value="all">All Severities</option>
              {severities.map(severity => (
                <option key={severity.value} value={severity.value}>
                  {severity.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-[#0A3A4C] mx-auto mb-4" />
              <p className="text-sm text-gray-600">Loading keywords...</p>
            </div>
          </div>
        )}

        {/* Keywords Table */}
        {!loading && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added By
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {keywords.map((keyword) => {
                    const categoryInfo = getCategoryInfo(keyword.category);
                    const severityInfo = getSeverityInfo(keyword.severity);
                    const isToggling = togglingStatus === keyword._id;
                    const isDeleting = deletingKeyword === keyword._id;
                    
                    return (
                      <tr key={keyword._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {keyword.keyword}
                            </div>
                            {keyword.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {keyword.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityInfo.color}`}>
                            {severityInfo.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            keyword.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {keyword.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {keyword.addedBy}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(keyword._id)}
                              disabled={isToggling || isDeleting}
                              className={`p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                keyword.isActive 
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title={keyword.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {isToggling ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : keyword.isActive ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                            
                            <button
                              onClick={() => openEditModal(keyword)}
                              disabled={isToggling || isDeleting}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteKeyword(keyword._id)}
                              disabled={isToggling || isDeleting}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              title="Delete"
                            >
                              {isDeleting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden mb-3">
                  <button
                    onClick={() => handlePageChange(pagination.prevPage)}
                    disabled={!pagination.hasPrev || loading}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.nextPage)}
                    disabled={!pagination.hasNext || loading}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {((pagination.currentPage - 1) * pagination.limit) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* First Page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1 || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="First page"
                      >
                        <ChevronsLeft size={16} />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(pagination.prevPage)}
                        disabled={!pagination.hasPrev || loading}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const totalPages = pagination.totalPages;
                        const currentPage = pagination.currentPage;
                        
                        let startPage = Math.max(1, currentPage - 2);
                        let endPage = Math.min(totalPages, currentPage + 2);
                        
                        if (currentPage <= 3) {
                          endPage = Math.min(5, totalPages);
                        }
                        if (currentPage > totalPages - 3) {
                          startPage = Math.max(totalPages - 4, 1);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              disabled={loading}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                i === currentPage
                                  ? 'z-10 dynamic-site-bg border-[#0A3A4C] text-white'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(pagination.nextPage)}
                        disabled={!pagination.hasNext || loading}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.currentPage === pagination.totalPages || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Last page"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {keywords.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No keywords found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterCategory !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all'
                    ? "No keywords match your current filters."
                    : "No prohibited keywords have been added yet."
                  }
                </p>
                {!searchQuery && filterCategory === 'all' && filterSeverity === 'all' && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add Your First Keyword
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Keyword Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="dynamic-site-bg px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add Prohibited Keyword</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={addingKeyword}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleAddKeyword} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keyword <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      disabled={addingKeyword}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      placeholder="Enter prohibited keyword"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      disabled={addingKeyword}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      disabled={addingKeyword}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {severities.map(severity => (
                        <option key={severity.value} value={severity.value}>
                          {severity.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={addingKeyword}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      placeholder="Optional description or context"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={addingKeyword}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingKeyword}
                    className="flex-1 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 flex items-center justify-center gap-2"
                  >
                    {addingKeyword ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Keyword'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Keyword Modal */}
        {showEditModal && editingKeyword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="dynamic-site-bg px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Edit Prohibited Keyword</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={editingLoading}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleEditKeyword} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keyword <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      disabled={editingLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      placeholder="Enter prohibited keyword"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      disabled={editingLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      disabled={editingLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {severities.map(severity => (
                        <option key={severity.value} value={severity.value}>
                          {severity.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={editingLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      placeholder="Optional description or context"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={editingLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingLoading}
                    className="flex-1 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 flex items-center justify-center gap-2"
                  >
                    {editingLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Keyword'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="dynamic-site-bg px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Bulk Import Keywords</h3>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    disabled={bulkImporting}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Import Instructions:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Enter one keyword per line</li>
                        <li>Duplicate keywords will be skipped</li>
                        <li>Empty lines will be ignored</li>
                        <li>All keywords will use the same category and severity</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        disabled={bulkImporting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        disabled={bulkImporting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {severities.map(severity => (
                          <option key={severity.value} value={severity.value}>
                            {severity.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={bulkKeywords}
                      onChange={(e) => setBulkKeywords(e.target.value)}
                      disabled={bulkImporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                      placeholder="Enter keywords (one per line)&#10;Example:&#10;badword1&#10;inappropriate2&#10;spam3"
                      rows={10}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkKeywords.split('\n').filter(k => k.trim()).length} keywords ready to import
                    </p>
                  </div>

                  {bulkImporting && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 size={20} className="animate-spin text-blue-600" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Importing keywords...</p>
                          <p className="text-xs">Please wait while we process your keywords.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    disabled={bulkImporting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={bulkImporting || !bulkKeywords.trim()}
                    className="flex-1 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 flex items-center justify-center gap-2"
                  >
                    {bulkImporting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import Keywords'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProhibitedKeywords;
