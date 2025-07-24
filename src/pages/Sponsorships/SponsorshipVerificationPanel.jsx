// components/SponsorshipVerificationPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Search, Filter, CheckCircle, XCircle, Eye, Calendar,
  DollarSign, MapPin, Users, Award, Clock, Loader2, MoreVertical,
  FileText, Building, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const SponsorshipVerificationPanel = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSponsorships, setSelectedSponsorships] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0
  });

    const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;
  console.log("isAdmin", isAdmin)
  console.log("profile.level", profile.level)
//   // Redirect if not admin
//   useEffect(() => {
//     if (!isAdmin) {
//       toast.error('Access denied. Admin privileges required.');
//       navigate('/home/sponsorship-connect');
//     }
//   }, [isAdmin, navigate]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Event', label: 'Event Sponsorship' },
    { value: 'Product', label: 'Product Sponsorship' },
    { value: 'Service', label: 'Service Sponsorship' },
    { value: 'Content', label: 'Content Sponsorship' },
    { value: 'Community', label: 'Community Sponsorship' }
  ];

  // Fetch pending sponsorships
  const fetchPendingSponsorships = async () => {
    setLoading(true);
    try {
      let params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sponsorship/admin/pending?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setSponsorships(result.sponsorships);
        setTotalPages(result.pagination.total);
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

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sponsorship/stats/overview?isAdmin=true&userEmail=${profile.email}`
      );
      const result = await response.json();
      
      if (result.success) {
        setStats({
          pending: result.stats.pending,
          verified: result.stats.verified,
          rejected: result.stats.rejected
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Verify single sponsorship
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
        fetchPendingSponsorships();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to verify sponsorship');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Failed to verify sponsorship');
    }
  };

  // Bulk verify sponsorships
  const handleBulkVerify = async (action) => {
    if (selectedSponsorships.length === 0) {
      toast.error('Please select sponsorships to verify');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/bulk/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorshipIds: selectedSponsorships,
          action,
          verifiedBy: `${profile.firstName} ${profile.lastName}`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        setSelectedSponsorships([]);
        setShowBulkActions(false);
        fetchPendingSponsorships();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to verify sponsorships');
      }
    } catch (error) {
      console.error('Bulk verify error:', error);
      toast.error('Failed to verify sponsorships');
    }
  };

  // Handle checkbox selection
  const handleSelectSponsorship = (id) => {
    setSelectedSponsorships(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  // Select all sponsorships
  const handleSelectAll = () => {
    if (selectedSponsorships.length === sponsorships.length) {
      setSelectedSponsorships([]);
      setShowBulkActions(false);
    } else {
      const allIds = sponsorships.map(s => s._id);
      setSelectedSponsorships(allIds);
      setShowBulkActions(true);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchPendingSponsorships();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchPendingSponsorships();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingSponsorships();
    }
  }, [currentPage]);

  if (!isAdmin) {
    return null;
  }

  const SponsorshipCard = ({ sponsorship }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={selectedSponsorships.includes(sponsorship._id)}
              onChange={() => handleSelectSponsorship(sponsorship._id)}
              className="w-4 h-4 text-[#0A3A4C] bg-gray-100 border-gray-300 rounded focus:ring-[#0A3A4C] focus:ring-2"
            />
          </div>

          {/* Sponsorship Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            {sponsorship.images && sponsorship.images[0] ? (
              <img
                src={sponsorship.images[0]}
                alt={sponsorship.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0A3A4C] via-[#174873] to-[#2A5F7A] flex items-center justify-center">
                <Award size={16} className="text-white/90" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                  {sponsorship.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {sponsorship.description}
                </p>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <MoreVertical size={16} className="text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                    <button
                      onClick={() => navigate(`/home/sponsorship-connect/${sponsorship._id}`)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Eye size={12} className="text-gray-600" />
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <DollarSign size={12} />
                <span className="font-medium">₹{sponsorship.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Award size={12} />
                <span>{sponsorship.category}</span>
              </div>
              
              {sponsorship.eventDate && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={12} />
                  <span>{new Date(sponsorship.eventDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {sponsorship.expectedAudience && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users size={12} />
                  <span>{sponsorship.expectedAudience.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building size={12} />
                <span>{sponsorship.sponsorName}</span>
                <span>•</span>
                <Clock size={12} />
                <span>{new Date(sponsorship.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVerify(sponsorship._id, 'approve')}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200"
                >
                  <CheckCircle size={12} />
                  Approve
                </button>
                <button 
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    handleVerify(sponsorship._id, 'reject', reason || '');
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors duration-200"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home/sponsorship-connect')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sponsorship Verification Panel
            </h1>
            <p className="text-sm text-gray-600">
              Review and approve pending sponsorship submissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedSponsorships.length} sponsorship(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkVerify('approve')}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200"
                >
                  <CheckCircle size={12} />
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkVerify('reject')}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors duration-200"
                >
                  <XCircle size={12} />
                  Reject Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Select All Checkbox */}
        {sponsorships.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSponsorships.length === sponsorships.length && sponsorships.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#0A3A4C] bg-gray-100 border-gray-300 rounded focus:ring-[#0A3A4C] focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({sponsorships.length} items)
              </span>
            </label>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#0A3A4C]" />
          </div>
        )}

        {/* Sponsorships List */}
        {!loading && (
          <div className="space-y-4">
            {sponsorships.map((sponsorship) => (
              <SponsorshipCard key={sponsorship._id} sponsorship={sponsorship} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sponsorships.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending sponsorships</h3>
            <p className="text-gray-600">
              {searchQuery ? 'No sponsorships match your search criteria.' : 'All sponsorships have been reviewed.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorshipVerificationPanel;
