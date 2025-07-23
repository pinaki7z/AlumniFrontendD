import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // Added navigation imports
import {
  CheckCircle,
  X,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  DollarSign,
  MapPin,
  FileText,
  AlertCircle,
  Clock,
  Filter,
  Search,
  Loader2,
  RotateCcw,
  List,
  ArrowLeft, // Added back arrow icon
  Shield
} from 'lucide-react';
import { toast } from 'react-toastify';

const BusinessVerificationPanel = () => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate(); // Added navigation hook
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [activeStatTab, setActiveStatTab] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    totalReviewed: 0,
    totalRequests: 0
  });


    // Initial data fetch
  useEffect(() => {
    fetchAdminStats();
    fetchBusinessesByStatus();
  }, []);

  // Fetch businesses when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinessesByStatus(activeStatTab, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // All existing functions remain the same...
  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  if (!isAdmin) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this panel.</p>
            <Link
              to="/home/business-connect"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to Business Connect
            </Link>
          </div>
        </div>
      </div>
    );
  }



  // Fetch admin statistics
  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/stats/admin`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
        
        // Fetch total requests count
        const totalResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/business/all?limit=1`);
        const totalResult = await totalResponse.json();
        if (totalResult.success) {
          setStats(prev => ({ 
            ...prev, 
            totalRequests: totalResult.pagination?.totalRecords || 0 
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  // Fetch businesses based on active tab and search
  const fetchBusinessesByStatus = async (status = activeStatTab, search = searchQuery) => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/business/all`;
      let params = new URLSearchParams();
      params.append('limit', '50');

      // Set status based on active tab
      switch (status) {
        case 'all':
          // Don't append any status filter - show all businesses
          break;
        case 'pending':
          params.append('status', 'pending');
          break;
        case 'approved':
          params.append('status', 'verified');
          break;
        case 'reviewed':
          params.append('status', 'verified,rejected');
          break;
        default:
          // Default to all if unknown status
          break;
      }

      // Add search parameter if exists
      if (search.trim()) {
        params.append('search', search.trim());
      }

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

  // Handle stat tab click
  const handleStatTabClick = (tabType) => {
    setActiveStatTab(tabType);
    fetchBusinessesByStatus(tabType, searchQuery);
  };

  // Handle business approval
  const handleApprove = async (businessId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'verified' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Business approved successfully!');
        fetchBusinessesByStatus(); // Refresh the list
        fetchAdminStats(); // Refresh stats
        setShowModal(false); // Close modal if open
      } else {
        toast.error(result.message || 'Failed to approve business');
      }
    } catch (error) {
      console.error('Error approving business:', error);
      toast.error('Failed to approve business');
    }
  };

  // Handle business rejection
  const handleReject = async (businessId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Business rejected successfully!');
        fetchBusinessesByStatus(); // Refresh the list
        fetchAdminStats(); // Refresh stats
        setShowModal(false); // Close modal if open
      } else {
        toast.error(result.message || 'Failed to reject business');
      }
    } catch (error) {
      console.error('Error rejecting business:', error);
      toast.error('Failed to reject business');
    }
  };

  // Handle make pending (for approved businesses)
  const handleMakePending = async (businessId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'pending' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Business moved to pending status!');
        fetchBusinessesByStatus(); // Refresh the list
        fetchAdminStats(); // Refresh stats
        setShowModal(false); // Close modal if open
      } else {
        toast.error(result.message || 'Failed to update business status');
      }
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    }
  };

  // Handle business plan download
  const handleDownloadBusinessPlan = (businessPlanUrl, businessName) => {
    if (businessPlanUrl) {
      const link = document.createElement('a');
      link.href = businessPlanUrl;
      link.download = `${businessName}_business_plan.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Business plan not available');
    }
  };

  // Get the display title for current active tab
  const getActiveTabTitle = () => {
    switch (activeStatTab) {
      case 'all':
        return 'All Business Requests';
      case 'pending':
        return 'Businesses Pending Review';
      case 'approved':
        return 'Approved Businesses';
      case 'reviewed':
        return 'All Reviewed Businesses';
      default:
        return 'All Business Requests';
    }
  };

  const BusinessDetailModal = ({ business, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full my-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{business.businessName}</h2>
              <p className="text-gray-600 text-sm sm:text-base">{business.industry}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {business.backgroundImage && (
            <div className="mb-6">
              <img
                src={business.backgroundImage}
                alt="Business"
                className="w-full h-48 sm:h-56 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 text-sm sm:text-base mt-1">{business.description}</p>
                </div>
                {business.targetMarket && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Target Market</label>
                    <p className="text-gray-900 text-sm sm:text-base mt-1">{business.targetMarket}</p>
                  </div>
                )}
                {business.competitiveAdvantage && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Competitive Advantage</label>
                    <p className="text-gray-900 text-sm sm:text-base mt-1">{business.competitiveAdvantage}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Investment Amount</span>
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">₹{business.investmentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Current Revenue</span>
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">₹{business.currentRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Funding Goal</span>
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">₹{business.fundingGoal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategy & Experience</h3>
              <div className="space-y-3">
                {business.teamExperience && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Team Experience</label>
                    <p className="text-gray-900 text-sm sm:text-base mt-1">{business.teamExperience}</p>
                  </div>
                )}
                {business.marketingStrategy && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Marketing Strategy</label>
                    <p className="text-gray-900 text-sm sm:text-base mt-1">{business.marketingStrategy}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span className="text-gray-900 text-sm sm:text-base">{business.ownerName}</span>
                </div>
                {business.ownerEmail && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-sm sm:text-base break-all">{business.ownerEmail}</span>
                  </div>
                )}
                {business.ownerPhone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-sm sm:text-base">{business.ownerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {business.businessPlan && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText size={20} className="text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Business Plan</p>
                  <p className="text-sm text-gray-600">PDF Document</p>
                </div>
                <button 
                  onClick={() => handleDownloadBusinessPlan(business.businessPlan, business.businessName)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm flex-shrink-0"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            {business.status === 'verified' ? (
              // Actions for approved businesses
              <>
                <button
                  onClick={() => handleReject(business._id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleMakePending(business._id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors duration-200 font-medium"
                >
                  <RotateCcw size={16} />
                  <span>Make Pending</span>
                </button>
              </>
            ) : (
              // Actions for pending/rejected businesses
              <>
                <button
                  onClick={() => handleReject(business._id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleApprove(business._id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                >
                  <CheckCircle size={16} />
                  <span>Approve</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* UPDATED: Back Button - Mobile and Desktop */}
        <div className="mb-4">
          <Link
            to="/home/business-connect"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm w-fit"
          >
            <ArrowLeft size={16} />
            <span>Back to Business Connect</span>
          </Link>
        </div>

        {/* UPDATED: Header - Improved design consistency */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Shield size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Business Verification Panel
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Review and verify business applications
              </p>
            </div>
          </div>
        </div>

        {/* UPDATED: Clickable Stats - Enhanced design matching */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* All Requests Tab */}
          <div 
            onClick={() => handleStatTabClick('all')}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              activeStatTab === 'all' ? 'ring-2 ring-gray-500 border-gray-300' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">All Requests</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <List size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Pending Review Tab */}
          <div 
            onClick={() => handleStatTabClick('pending')}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              activeStatTab === 'pending' ? 'ring-2 ring-yellow-500 border-yellow-300' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-yellow-600 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          
          {/* Approved Today Tab */}
          <div 
            onClick={() => handleStatTabClick('approved')}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              activeStatTab === 'approved' ? 'ring-2 ring-green-500 border-green-300' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.approvedToday}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          
          {/* Total Reviewed Tab */}
          <div 
            onClick={() => handleStatTabClick('reviewed')}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              activeStatTab === 'reviewed' ? 'ring-2 ring-blue-500 border-blue-300' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Reviewed</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalReviewed}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building size={16} className="text-blue-600 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* UPDATED: Active Tab Indicator - Better responsive design */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">{getActiveTabTitle()}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeStatTab === 'all' ? 'bg-gray-100 text-gray-800' :
                activeStatTab === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                activeStatTab === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {businesses.length} businesses
              </span>
            </div>
          </div>
          
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
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-[#0A3A4C] sm:w-8 sm:h-8" />
          </div>
        )}

        {/* UPDATED: Businesses List - Enhanced mobile responsiveness */}
        {!loading && (
          <div className="space-y-4">
            {businesses.map((business) => (
              <div key={business._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-shrink-0">
                      {business.backgroundImage ? (
                        <img
                          src={business.backgroundImage}
                          alt={business.businessName}
                          className="w-full lg:w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/800/400';
                          }}
                        />
                      ) : (
                        <div className="w-full lg:w-32 h-32 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                          <Building size={24} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
                            {business.businessName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {business.industry}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              business.status === 'verified' ? 'bg-green-100 text-green-800' :
                              business.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {business.status === 'verified' ? 'Approved' :
                              business.status === 'rejected' ? 'Rejected' :
                              'Pending Review'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {business.description}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedBusiness(business);
                              setShowModal(true);
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                          >
                            <Eye size={16} />
                            <span>Review</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign size={14} className="flex-shrink-0" />
                          <span className="truncate">Investment: ₹{business.investmentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} className="flex-shrink-0" />
                          <span className="truncate">Owner: {business.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span className="truncate">Submitted: {new Date(business.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                        {business.status === 'verified' ? (
                          // Actions for approved businesses
                          <>
                            <button
                              onClick={() => handleReject(business._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                            >
                              <X size={16} />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleMakePending(business._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors duration-200 text-sm font-medium"
                            >
                              <RotateCcw size={16} />
                              <span>Make Pending</span>
                            </button>
                          </>
                        ) : (
                          // Actions for pending/rejected businesses
                          <>
                            <button
                              onClick={() => handleReject(business._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                            >
                              <X size={16} />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(business._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
                            >
                              <CheckCircle size={16} />
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UPDATED: Empty State - Better responsive design */}
        {!loading && businesses.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {searchQuery ? 'No businesses match your search criteria.' : `No ${activeStatTab} businesses found.`}
            </p>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedBusiness && (
          <BusinessDetailModal
            business={selectedBusiness}
            onClose={() => {
              setShowModal(false);
              setSelectedBusiness(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessVerificationPanel;
