import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Building,
  Plus,
  Filter,
  Search,
  Users,
  User,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Star,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Shield, // Added new icon for admin verification
  X
} from 'lucide-react';

const BusinessConnect = () => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    rejected: 0,
    industries: 0
  });
  const [myBusinessesCount, setMyBusinessesCount] = useState(0);

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // ... All your existing functions remain unchanged ...
  const industries = [
    'Technology',
    'Healthcare', 
    'Finance',
    'Education',
    'Energy',
    'Food & Beverage',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Transportation',
    'Entertainment',
    'Agriculture'
  ];

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/stats/overview`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch my businesses count
  const fetchMyBusinessesCount = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/my/${encodeURIComponent(profile.email)}`);
      const result = await response.json();
      
      if (result.success) {
        setMyBusinessesCount(result.businesses.length);
      }
    } catch (error) {
      console.error('Error fetching my businesses count:', error);
    }
  };

  // Fetch businesses based on active tab and filters
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/business`;
      let params = new URLSearchParams();

      switch (activeTab) {
        case 'all':
          url += '/all';
          params.append('status', 'verified');
          break;
        case 'my':
          url += `/my/${encodeURIComponent(profile.email)}`;
          break;
        case 'pending':
          url += '/all';
          params.append('status', 'pending');
          break;
        default:
          url += '/all';
          params.append('status', 'verified');
      }

      // Add search and filter parameters
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (filterIndustry !== 'all') {
        params.append('industry', filterIndustry);
      }

      params.append('limit', '50');

      const response = await fetch(`${url}?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setBusinesses(result.businesses);
      } else {
        toast.error(result.message || 'Failed to fetch businesses');
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to fetch businesses');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle business status update (admin only)
  const handleStatusUpdate = async (businessId, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Business ${newStatus} successfully`);
        fetchBusinesses(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        toast.error(result.message || 'Failed to update business status');
      }
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    }
  };

  // Handle business deletion
  const handleDelete = async (businessId) => {
    if (!window.confirm('Are you sure you want to delete this business?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${businessId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Business deleted successfully');
        fetchBusinesses(); // Refresh the list
        fetchStats(); // Refresh stats
        fetchMyBusinessesCount(); // Refresh my businesses count
      } else {
        toast.error(result.message || 'Failed to delete business');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchMyBusinessesCount();
  }, []);

  // Fetch businesses when tab, search, or filter changes
  useEffect(() => {
    fetchBusinesses();
  }, [activeTab, searchQuery, filterIndustry]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

const BusinessCard = ({ business }) => {
  // Format currency compactly
  const formatCurrency = (amount) => {
    if (amount >= 1e7) return `₹${(amount/1e7).toFixed(1)}Cr`;
    if (amount >= 1e5) return `₹${(amount/1e5).toFixed(1)}L`;
    if (amount >= 1e3) return `₹${(amount/1e3).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Compact Image Header */}
      <div className="relative h-28 sm:h-32 overflow-hidden">
        {business.backgroundImage ? (
          <img
            src={business.backgroundImage}
            alt={business.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/api/placeholder/800/400';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A3A4C] via-[#174873] to-[#2A5F7A] flex items-center justify-center relative overflow-hidden">
            <Building size={28} className="text-white/90 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Compact Status & Industry */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <span className="px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-800 rounded-md text-xs font-medium border border-white/50">
            {business.industry}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm ${
            business.status === 'verified' 
              ? 'bg-green-500/90 text-white' 
              : business.status === 'pending'
              ? 'bg-yellow-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {business.status === 'verified' ? '✓' : business.status === 'pending' ? '⏱' : '✗'}
          </span>
        </div>

        {/* Floating Action Menu */}
        <div className="absolute bottom-2 right-2  group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/home/business-connect/${business._id}`);
              }}
              className="p-1.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-lg transition-colors duration-200 shadow-lg"
              title="View Details"
            >
              <Eye size={14} className="text-gray-700" />
            </button>
            {(isAdmin || business.ownerEmail === profile.email) && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/home/business-connect/edit/${business._id}`);
                  }}
                  className="p-1.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-lg transition-colors duration-200 shadow-lg"
                  title="Edit"
                >
                  <Edit size={14} className="text-gray-700" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(business._id);
                  }}
                  className="p-1.5 bg-red-500/95 backdrop-blur-sm hover:bg-red-600 rounded-lg transition-colors duration-200 shadow-lg"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compact Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-[#0A3A4C] transition-colors duration-200">
            {business.businessName}
          </h3>
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
            {business.description}
          </p>
        </div>

        {/* Compact Financial Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <DollarSign size={10} className="text-white" />
            </div>
            <p className="text-xs font-bold text-blue-900">{formatCurrency(business.investmentAmount)}</p>
            <p className="text-xs text-blue-700">Investment</p>
          </div>
          
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <TrendingUp size={10} className="text-white" />
            </div>
            <p className="text-xs font-bold text-green-900">{formatCurrency(business.currentRevenue)}</p>
            <p className="text-xs text-green-700">Revenue</p>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <Users size={10} className="text-white" />
            </div>
            <p className="text-xs font-bold text-purple-900">{formatCurrency(business.fundingGoal)}</p>
            <p className="text-xs text-purple-700">Goal</p>
          </div>
        </div>

        {/* Compact Admin Actions */}
        {isAdmin && business.status === 'pending' && (
          <div className="flex gap-2 mb-3 p-2 bg-amber-50 rounded-lg border-l-4 border-amber-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(business._id, 'verified');
              }}
              className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium flex items-center justify-center gap-1"
            >
              <CheckCircle size={12} />
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(business._id, 'rejected');
              }}
              className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-xs font-medium flex items-center justify-center gap-1"
            >
              <X size={12} />
              Reject
            </button>
          </div>
        )}

        {/* Compact Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center relative">
              <User size={10} className="text-gray-600" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 line-clamp-1">{business.ownerName}</p>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/home/business-connect/${business._id}`);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 hover:shadow-lg transition-all duration-200 text-xs font-medium group/btn"
          >
            <span>View</span>
            <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};


  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Header - UPDATED with Admin Verify button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              <Building size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Business Connect
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Connect with innovative businesses and entrepreneurs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* NEW: Admin Verify Button - Only visible to admins */}
            {isAdmin && (
              <Link
                to="/home/business-connect/admin/verify"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
              >
                <Shield size={16} />
                <span className="hidden sm:inline">Admin Verify</span>
                <span className="sm:hidden">Verify</span>
              </Link>
            )}
            
            {/* Existing Create Business Button */}
            <Link
              to="/home/business-connect/create"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Create Business</span>
            </Link>
          </div>
        </div>

        {/* All remaining JSX stays exactly the same */}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">My Businesses</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{myBusinessesCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-yellow-600" />
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Industries</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.industries}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star size={16} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building size={14} />
              <span>All Businesses</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('my')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm whitespace-nowrap ${
                activeTab === 'my'
                  ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={14} />
              <span>My Businesses</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'my' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {myBusinessesCount}
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock size={14} />
                <span>Pending Verification</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {stats.pending}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#0A3A4C]" />
          </div>
        )}

        {/* Business Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business._id} business={business} />
            ))}
          </div>
        )}

        {!loading && businesses.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'my' 
                ? "You haven't created any businesses yet." 
                : "No businesses match your current filters."
              }
            </p>
            {activeTab === 'my' && (
              <Link
                to="/home/business-connect/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Create Your First Business
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessConnect;
