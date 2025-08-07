// components/SponsorshipConnect.js - Redesigned to match BusinessConnect
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Award, Plus, Search, Filter, DollarSign, Calendar, MapPin, Users, Eye,
  Building, Zap, Target, Loader2, Edit, Trash2, MoreVertical, CheckCircle,
  Clock, XCircle, AlertCircle, ArrowRight, TrendingUp, User, X
} from 'lucide-react';
import { toast } from 'react-toastify';

const SponsorshipConnect = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('verified');
  const [stats, setStats] = useState({
    total: 0, active: 0, pending: 0, verified: 0, rejected: 0, 
    mySponsorships: 0, totalAmount: 0
  });

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  const tabs = isAdmin ? [
    { id: 'verified', label: 'All Verified', icon: <CheckCircle size={16} /> },
    { id: 'my-sponsorships', label: 'My Sponsorships', icon: <Award size={16} /> },
    { id: 'pending', label: 'Pending Approval', icon: <Clock size={16} /> },
    { id: 'rejected', label: 'Rejected', icon: <XCircle size={16} /> },
    { id: 'all', label: 'All Sponsorships', icon: <Building size={16} /> }
  ] : [
    { id: 'verified', label: 'All Verified', icon: <CheckCircle size={16} /> },
    { id: 'my-sponsorships', label: 'My Sponsorships', icon: <Award size={16} /> }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Event', label: 'Event Sponsorship' },
    { value: 'Product', label: 'Product Sponsorship' },
    { value: 'Service', label: 'Service Sponsorship' },
    { value: 'Content', label: 'Content Sponsorship' },
    { value: 'Community', label: 'Community Sponsorship' }
  ];

  // Fetch sponsorships
  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/sponsorship/all`;
      let params = new URLSearchParams();
      
      params.append('tab', activeTab);
      params.append('userEmail', profile.email);
      params.append('isAdmin', isAdmin.toString());
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      params.append('limit', '12');

      const response = await fetch(`${url}?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setSponsorships(result.sponsorships);
      } else {
        toast.error(result.message || 'Failed to fetch sponsorships');
        setSponsorships([]);
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
      toast.error('Failed to fetch sponsorships');
      setSponsorships([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sponsorship/stats/overview?isAdmin=${isAdmin}&userEmail=${profile.email}`
      );
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Delete sponsorship
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sponsorship?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Sponsorship deleted successfully');
        fetchSponsorships();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to delete sponsorship');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete sponsorship');
    }
  };

  // Admin verify sponsorship
  const handleVerify = async (id, action, rejectionReason = '') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason,
          verifiedBy: `${profile.firstName} ${profile.lastName}`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        fetchSponsorships();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to verify sponsorship');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Failed to verify sponsorship');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSponsorships();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSponsorships();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, activeTab]);

  // Format currency compactly (matching BusinessCard style)
  const formatCurrency = (amount) => {
    if (amount >= 1e7) return `₹${(amount/1e7).toFixed(1)}Cr`;
    if (amount >= 1e5) return `₹${(amount/1e5).toFixed(1)}L`;
    if (amount >= 1e3) return `₹${(amount/1e3).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  const SponsorshipCard = ({ sponsorship }) => {
    const canEdit = isAdmin || sponsorship.ownerEmail === profile.email;

    return (
      <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden hover:-translate-y-1">
        {/* Compact Image Header */}
        <div className="relative h-28 sm:h-32 overflow-hidden">
          {sponsorship.images && sponsorship.images[0] ? (
            <img
              src={sponsorship.images[0]}
              alt={sponsorship.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = '/api/placeholder/800/400';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A3A4C] via-[#174873] to-[#2A5F7A] flex items-center justify-center relative overflow-hidden">
              <Award size={28} className="text-white/90 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Compact Status & Category */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className="px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-800 rounded-md text-xs font-medium border border-white/50">
              {sponsorship.category}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm ${
              sponsorship.verificationStatus === 'verified' 
                ? 'bg-green-500/90 text-white' 
                : sponsorship.verificationStatus === 'pending'
                ? 'bg-yellow-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}>
              {sponsorship.verificationStatus === 'verified' ? '✓' : sponsorship.verificationStatus === 'pending' ? '⏱' : '✗'}
            </span>
          </div>

          {/* Floating Action Menu */}
          <div className="absolute bottom-2 right-2 opacity- group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex gap-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/home/sponsorship-connect/${sponsorship._id}`);
                }}
                className="p-1.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-lg transition-colors duration-200 shadow-lg"
                title="View Details"
              >
                <Eye size={14} className="text-gray-700" />
              </button>
              {canEdit && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/home/sponsorship-connect/edit/${sponsorship._id}`);
                    }}
                    className="p-1.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-lg transition-colors duration-200 shadow-lg"
                    title="Edit"
                  >
                    <Edit size={14} className="text-gray-700" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sponsorship._id);
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
              {sponsorship.title}
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
              {sponsorship.description}
            </p>
          </div>

          {/* Compact Financial Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <DollarSign size={10} className="text-white" />
              </div>
              <p className="text-xs font-bold text-blue-900">{formatCurrency(sponsorship.amount)}</p>
              <p className="text-xs text-blue-700">Amount</p>
            </div>
            
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <TrendingUp size={10} className="text-white" />
              </div>
              <p className="text-xs font-bold text-green-900">{formatCurrency(sponsorship.fundingRaised || 0)}</p>
              <p className="text-xs text-green-700">Raised</p>
            </div>
            
            <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <Target size={10} className="text-white" />
              </div>
              <p className="text-xs font-bold text-purple-900">{formatCurrency(sponsorship.fundingGoal || sponsorship.amount)}</p>
              <p className="text-xs text-purple-700">Goal</p>
            </div>
          </div>

      
          {/* Compact Admin Actions */}
          {isAdmin && sponsorship.verificationStatus === 'pending' && (
            <div className="flex gap-2 mb-3 p-2 bg-amber-50 rounded-lg border-l-4 border-amber-400">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerify(sponsorship._id, 'approve');
                }}
                className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium flex items-center justify-center gap-1"
              >
                <CheckCircle size={12} />
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const reason = prompt('Rejection reason (optional):');
                  handleVerify(sponsorship._id, 'reject', reason || '');
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
                <p className="text-xs font-medium text-gray-900 line-clamp-1">{sponsorship.sponsorName}</p>
                <p className="text-xs text-gray-500">Sponsor</p>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/home/sponsorship-connect/${sponsorship._id}`);
              }}
              className="flex items-center gap-1 px-3 py-1.5 dynamic-site-bg text-white rounded-lg hover:opacity-90 hover:shadow-lg transition-all duration-200 text-xs font-medium group/btn"
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
        {/* Header - Updated with Admin Verify button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
              <Award size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Sponsorship Connect
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Discover and create sponsorship opportunities
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Admin Verify Button - Only visible to admins */}
            {isAdmin && (
              <Link
                to="/home/sponsorship-connect/admin/verify"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
              >
                <CheckCircle size={16} />
                <span className="hidden sm:inline">Admin Verify</span>
                <span className="sm:hidden">Verify</span>
                {stats.pending > 0 && (
                  <span className="ml-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                    {stats.pending}
                  </span>
                )}
              </Link>
            )}
            
            {/* Existing Create Sponsorship Button */}
            <Link
              to="/home/sponsorship-connect/create"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Create Sponsorship</span>
            </Link>
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
                placeholder="Search sponsorships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              />
            </div>
            
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Award size={16} className="text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Mine</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.mySponsorships}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle size={16} className="text-red-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'dynamic-site-bg text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.id === 'verified' ? stats.verified :
                   tab.id === 'my-sponsorships' ? stats.mySponsorships :
                   tab.id === 'pending' ? stats.pending :
                   tab.id === 'rejected' ? stats.rejected : stats.total}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#0A3A4C]" />
          </div>
        )}

        {/* Sponsorships Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sponsorships.map((sponsorship) => (
              <SponsorshipCard key={sponsorship._id} sponsorship={sponsorship} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sponsorships.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sponsorships found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No sponsorships match your search criteria.' : `No ${activeTab.replace('-', ' ')} sponsorships available.`}
            </p>
            {activeTab !== 'my-sponsorships' && (
              <Link
                to="/home/sponsorship-connect/create"
                className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Create First Sponsorship
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorshipConnect;
