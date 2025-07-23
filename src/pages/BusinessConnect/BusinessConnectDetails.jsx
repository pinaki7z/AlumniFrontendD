import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Phone,
  Mail,
  Globe,
  Download,
  Share2,
  Heart,
  Star,
  CheckCircle,
  User,
  FileText,
  Target,
  Lightbulb,
  Award,
  ExternalLink,
  CreditCard,
  Shield,
  Clock,
  ThumbsUp,
  MessageCircle,
  BookOpen,
  Briefcase,
  PieChart,
  TrendingDown,
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'react-toastify';

const BusinessConnectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  
  // Admin funding edit states
  const [isEditingFunding, setIsEditingFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(0);
  const [savingFunding, setSavingFunding] = useState(false);

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // Fetch business details
  const fetchBusinessDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}`);
      const result = await response.json();

      if (result.success) {
        setBusiness(result.business);
        setLikesCount(result.business.likes || 0);
        setSharesCount(result.business.shares || 0);
      } else {
        toast.error(result.message || 'Failed to fetch business details');
        setBusiness(null);
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      toast.error('Failed to fetch business details');
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle funding update with add/remove operations (Admin only)
  const handleFundingOperation = async (operation) => {
    if (!fundingAmount || fundingAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSavingFunding(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/funding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          operation: operation, 
          amount: fundingAmount 
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBusiness(result.business);
        setFundingAmount(0); // Reset the input
        toast.success(result.message);
        
        // Show operation details
        if (result.operationDetails) {
          const { previousAmount, newAmount, amount } = result.operationDetails;
          console.log(`Funding ${operation}: ₹${amount.toLocaleString()} | Previous: ₹${previousAmount.toLocaleString()} | New: ₹${newAmount.toLocaleString()}`);
        }
      } else {
        toast.error(result.message || 'Failed to update funding progress');
      }
    } catch (error) {
      console.error('Error updating funding:', error);
      toast.error('Failed to update funding progress');
    } finally {
      setSavingFunding(false);
    }
  };

  // Cancel funding edit
  const handleCancelFundingEdit = () => {
    setFundingAmount(0);
    setIsEditingFunding(false);
  };

  // Handle like/unlike
  const handleLike = async () => {
    try {
      const action = isLiked ? 'unlike' : 'like';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/like`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (result.success) {
        setIsLiked(!isLiked);
        setLikesCount(result.likes);
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSharesCount(result.shares);
        toast.success('Link copied to clipboard!');
      } else {
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle business plan download
  const handleDownloadBusinessPlan = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/download-business-plan`);
      const result = await response.json();

      if (result.success) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Business plan download started');
      } else {
        toast.error(result.message || 'Business plan not available');
      }
    } catch (error) {
      console.error('Error downloading business plan:', error);
      toast.error('Failed to download business plan');
    }
  };

  // Handle investment/donation
  const handleDonation = (amount) => {
    if (!business) return;
    
    const razorpayUrl = `https://rzp.io/l/dummy-payment?amount=${amount}&business=${encodeURIComponent(business.businessName)}&email=${encodeURIComponent(business.ownerEmail)}`;
    window.open(razorpayUrl, '_blank');
    toast.success(`Redirecting to payment for ₹${amount.toLocaleString()}`);
  };

  // Fetch business details on component mount
  useEffect(() => {
    if (id) {
      fetchBusinessDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-[#0A3A4C] mx-auto mb-4" />
              <p className="text-gray-600">Loading business details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Building size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
            <p className="text-gray-600 mb-4">The business you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/home/business-connect')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              <ArrowLeft size={16} />
              Back to Business Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = business.fundingGoal > 0 ? (business.fundingRaised / business.fundingGoal) * 100 : 0;

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/home/business-connect')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Business Connect
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="relative h-48 sm:h-64 lg:h-80">
            {business.backgroundImage ? (
              <img
                src={business.backgroundImage}
                alt={business.businessName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#0A3A4C] to-[#174873] flex items-center justify-center">
                <Building size={64} className="text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg backdrop-blur-sm transition-colors duration-200 ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-colors duration-200"
              >
                <Share2 size={18} />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-2 shadow-lg">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={`${business.businessName} logo`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-white">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                  {business.businessName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Building size={14} />
                    {business.industry}
                  </span>
                  {business.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {business.location}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 ${
                    business.status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    <CheckCircle size={14} />
                    {business.status === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Business Analytics & Related Content - Sticky */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Business Owner Info */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Business Owner</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{business.ownerName}</p>
                        <p className="text-sm text-gray-600">Founder & CEO</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {business.ownerEmail && (
                        <a
                          href={`mailto:${business.ownerEmail}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
                        >
                          <Mail size={14} />
                          {business.ownerEmail}
                        </a>
                      )}
                      {business.ownerPhone && (
                        <a
                          href={`tel:${business.ownerPhone}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
                        >
                          <Phone size={14} />
                          {business.ownerPhone}
                        </a>
                      )}
                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
                        >
                          <Globe size={14} />
                          Website
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Funding Progress with Add/Remove Controls */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Funding Progress</h3>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingFunding(!isEditingFunding)}
                      className="p-1.5 text-gray-500 hover:text-[#0A3A4C] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Manage funding"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Current Funding Display */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Raised</span>
                      <span className="text-sm font-bold text-green-600">
                        ₹{(business.fundingRaised / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">
                        {progressPercentage.toFixed(1)}% of goal
                      </span>
                      <span className="text-xs text-gray-600">
                        Goal: ₹{(business.fundingGoal / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>

                  {/* Admin Add/Remove Controls */}
                  {isEditingFunding && isAdmin && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount to Add/Remove (₹)
                        </label>
                        <input
                          type="number"
                          value={fundingAmount}
                          onChange={(e) => setFundingAmount(Number(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                          placeholder="Enter amount (e.g., 12000)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Current: ₹{business.fundingRaised.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleFundingOperation('add')}
                          disabled={savingFunding || !fundingAmount}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium disabled:opacity-50"
                        >
                          {savingFunding ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Plus size={14} />
                              Add
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleFundingOperation('remove')}
                          disabled={savingFunding || !fundingAmount}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium disabled:opacity-50"
                        >
                          {savingFunding ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Minus size={14} />
                              Remove
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleCancelFundingEdit}
                          disabled={savingFunding}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• <strong>Add:</strong> Increases funding by entered amount</p>
                        <p>• <strong>Remove:</strong> Decreases funding by entered amount (min: ₹0)</p>
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && !isEditingFunding && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield size={12} />
                      <span>Admin: Click edit to add/remove funding amounts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              {business.keyMetrics && Object.keys(business.keyMetrics).some(key => business.keyMetrics[key]) && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <PieChart size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Key Metrics</h3>
                  </div>
                  <div className="space-y-3">
                    {business.keyMetrics.monthlyGrowth && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Growth</span>
                        <span className="text-sm font-semibold text-gray-900">{business.keyMetrics.monthlyGrowth}%</span>
                      </div>
                    )}
                    {business.keyMetrics.customerRetention && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Retention Rate</span>
                        <span className="text-sm font-semibold text-gray-900">{business.keyMetrics.customerRetention}%</span>
                      </div>
                    )}
                    {business.keyMetrics.averageRevenuePerUser && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ARPU</span>
                        <span className="text-sm font-semibold text-gray-900">₹{business.keyMetrics.averageRevenuePerUser}</span>
                      </div>
                    )}
                    {business.keyMetrics.timeToBreakeven && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Break-even</span>
                        <span className="text-sm font-semibold text-gray-900">{business.keyMetrics.timeToBreakeven} months</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-6">
            {/* Business Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Investment</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">₹{(business.investmentAmount / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={16} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">₹{(business.currentRevenue / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Funding Goal</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">₹{(business.fundingGoal / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-teal-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-900">{likesCount}</span>
                    <span className="text-sm text-gray-600">Likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">{business.comments || 0}</span>
                    <span className="text-sm text-gray-600">Comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-900">{sharesCount}</span>
                    <span className="text-sm text-gray-600">Shares</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm ${
                      isLiked 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Business</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">{business.description}</p>
                {business.detailedDescription && (
                  <p className="text-gray-700 leading-relaxed">{business.detailedDescription}</p>
                )}
              </div>
            </div>

            {/* Business Model & Strategy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {business.targetMarket && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                      <Target size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Target Market</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.targetMarket}</p>
                </div>
              )}

              {business.competitiveAdvantage && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                      <Lightbulb size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Competitive Advantage</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.competitiveAdvantage}</p>
                </div>
              )}
            </div>

            {/* Additional Business Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {business.teamExperience && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Users size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Team Experience</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.teamExperience}</p>
                </div>
              )}

              {business.marketingStrategy && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Marketing Strategy</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.marketingStrategy}</p>
                </div>
              )}
            </div>

            {/* Business Model & Revenue Streams */}
            {(business.businessModel || (business.revenueStreams && business.revenueStreams.length > 0)) && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                    <Briefcase size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Business Model</h3>
                </div>
                {business.businessModel && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{business.businessModel}</p>
                )}
                {business.revenueStreams && business.revenueStreams.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Revenue Streams:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {business.revenueStreams.map((stream, index) => (
                        <li key={index} className="text-sm text-gray-700">{stream}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Achievements */}
            {business.achievements && business.achievements.length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Award size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Achievements</h3>
                </div>
                <ul className="space-y-2">
                  {business.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upcoming Milestones */}
            {business.upcomingMilestones && business.upcomingMilestones.length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Upcoming Milestones</h3>
                </div>
                <ul className="space-y-2">
                  {business.upcomingMilestones.map((milestone, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documents */}
            {business.businessPlan && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Business Documents</h3>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Business Plan</p>
                      <p className="text-sm text-gray-600">PDF Document</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownloadBusinessPlan}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Investment Box & Support - Sticky */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Investment/Donation Box */}
              <div className="bg-gradient-to-br from-[#0A3A4C] to-[#174873] rounded-lg sm:rounded-xl shadow-lg text-white p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold">Support This Business</h3>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Help {business.businessName} reach their funding goal and make a positive impact in the {business.industry} industry.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Investment Amount (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        min="100"
                        step="100"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 5000, 10000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          donationAmount === amount
                            ? 'bg-white text-[#0A3A4C]'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        ₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDonation(donationAmount)}
                    className="w-full bg-white text-[#0A3A4C] py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    Invest ₹{donationAmount.toLocaleString()}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
                    <Shield size={14} />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </div>
              </div>

              {/* Additional Business Information */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                    <Building size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Company Info</h3>
                </div>
                <div className="space-y-3">
                  {business.employeeCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Employees</span>
                      <span className="text-sm font-semibold text-gray-900">{business.employeeCount}</span>
                    </div>
                  )}
                  {business.marketSize && (
                    <div>
                      <span className="text-sm text-gray-600">Market Size</span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{business.marketSize}</p>
                    </div>
                  )}
                  {business.customerBase && (
                    <div>
                      <span className="text-sm text-gray-600">Customer Base</span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{business.customerBase}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Listed on {new Date(business.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessConnectDetails;
