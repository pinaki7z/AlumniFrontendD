// BusinessConnectDetails.js - Mobile-First Responsive Version
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
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
  Briefcase,
  PieChart,
  Loader2,
  Edit,
  X,
  Plus,
  Minus,
  Menu
} from 'lucide-react';
import { toast } from 'react-toastify';
import { CommentThread } from './CommentThread';

const BusinessConnectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const commentRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  
  // State variables
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Admin funding edit states
  const [isEditingFunding, setIsEditingFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(0);
  const [savingFunding, setSavingFunding] = useState(false);

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  // Razorpay configuration
  const RAZORPAY_KEY = "rzp_test_9biOcO86B9dZyQ";

  // All existing functions remain the same...
  // (fetchBusinessDetails, fetchLikeStatus, fetchComments, addComment, etc.)
  
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

  // Fetch like status
  const fetchLikeStatus = async () => {
    if (!profile._id) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/like-status/${profile._id}`);
      const result = await response.json();
      
      if (result.success) {
        setIsLiked(result.isLiked);
        setLikesCount(result.likes);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/comments`);
      const result = await response.json();
      if (result.success) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add comment or reply
  const addComment = async (text, parentId = null) => {
    if (!text.trim()) return;
    
    const body = {
      userId: profile._id,
      userName: `${profile.firstName} ${profile.lastName}`,
      userEmail: profile.email,
      text
    };
    
    const url = parentId
      ? `${process.env.REACT_APP_API_URL}/api/business/${id}/comments/${parentId}/reply`
      : `${process.env.REACT_APP_API_URL}/api/business/${id}/comments`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await fetchComments();
        toast.success(parentId ? 'Reply added successfully!' : 'Comment added successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id }),
      });

      const result = await response.json();

      if (result.success) {
        setIsLiked(result.isLiked);
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
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (result.success) {
        setSharesCount(result.shares);
      }
      
      toast.success('Link copied to clipboard!');
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

  // Handle funding operations (Admin)
  const handleFundingOperation = async (operation) => {
    if (!fundingAmount || fundingAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSavingFunding(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/funding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, amount: fundingAmount }),
      });

      const result = await response.json();

      if (result.success) {
        setBusiness(result.business);
        setFundingAmount(0);
        toast.success(result.message);
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

// Razorpay payment integration - Fixed version
const handleInvestment = async (amount) => {
  if (!business || amount <= 0) return;

  setIsProcessingPayment(true);

  try {
    // Step 1: Verify Razorpay script is loaded
    if (!window.Razorpay) {
      console.error('Razorpay script not loaded');
      toast.error('Payment system not available. Please refresh the page.');
      setIsProcessingPayment(false);
      return;
    }

    // Step 2: Create order
    const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!orderResponse.ok) {
      throw new Error(`HTTP error! status: ${orderResponse.status}`);
    }

    const orderResult = await orderResponse.json();
    console.log('Order creation response:', orderResult);

    if (!orderResult.success) {
      throw new Error(orderResult.message || 'Failed to create order');
    }

    // Step 3: Initialize Razorpay with proper error handling
    const options = {
      key: RAZORPAY_KEY,
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: business.businessName,
      description: `Investment in ${business.businessName}`,
      order_id: orderResult.orderId, // This must match the order ID from backend
      image: business.logo || '',
      handler: async function (response) {
        console.log('Payment successful response:', response);
        
        // Payment successful - verify on backend
        try {
          const paymentResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}/payment-success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amount,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (!paymentResponse.ok) {
            throw new Error(`Verification HTTP error! status: ${paymentResponse.status}`);
          }

          const paymentResult = await paymentResponse.json();
          console.log('Payment verification response:', paymentResult);

          if (paymentResult.success) {
            setBusiness(paymentResult.business);
            toast.success(paymentResult.message || 'Payment successful!');
          } else {
            toast.error(paymentResult.message || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed. Please contact support.');
        } finally {
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        contact: profile.phone || '',
      },
      notes: {
        business_id: id,
        investor_id: profile._id,
      },
      theme: {
        color: '#0A3A4C',
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          setIsProcessingPayment(false);
        }
      }
    };

    console.log('Razorpay options:', options);

    // Step 4: Create Razorpay instance
    const rzp = new window.Razorpay(options);
    
    // Step 5: Handle payment failure
    rzp.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
      setIsProcessingPayment(false);
    });

    // Step 6: Open payment modal
    rzp.open();

  } catch (error) {
    console.error('Investment error:', error);
    toast.error(error.message || 'Failed to process investment');
    setIsProcessingPayment(false);
  }
};


  // Format currency
  const formatINR = (num = 0) => {
    if (num >= 1e7) return `₹${(num/1e7).toFixed(1)} Cr`;
    if (num >= 1e5) return `₹${(num/1e5).toFixed(1)} L`;
    if (num >= 1e3) return `₹${(num/1e3).toFixed(1)} K`;
    return `₹${num.toLocaleString()}`;
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchBusinessDetails();
      fetchComments();
      fetchLikeStatus();
    }
  }, [id, profile._id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Loader2 size={28} className="animate-spin text-[#0A3A4C] mx-auto mb-4 sm:w-8 sm:h-8" />
              <p className="text-gray-600 text-sm sm:text-base">Loading business details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Building size={40} className="text-gray-400 mx-auto mb-4 sm:w-12 sm:h-12" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:text-xl">Business Not Found</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">The business you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/home/business-connect')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm sm:text-base"
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
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 pb-3">
        {/* Mobile Header with Back Button and Menu */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => navigate('/home/business-connect')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeft size={16} />
            <span className=" ">Back</span>
          </button>
          
         
        </div>

        {/* Desktop Back Button */}
        <div className="hidden lg:block mb-4">
          <button
            onClick={() => navigate('/home/business-connect')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Business Connect
          </button>
        </div>

        {/* Hero Section - Mobile First */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6 overflow-hidden">
          <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 xl:h-80">
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
                <Building size={48} className="text-white sm:w-16 sm:h-16" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Mobile Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg backdrop-blur-sm transition-colors duration-200 ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart size={16} className={`${isLiked ? 'fill-current' : ''} sm:w-5 sm:h-5`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-colors duration-200"
              >
                <Share2 size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Business Info Overlay - Mobile Optimized */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white rounded-xl p-1.5 sm:p-2 shadow-lg flex-shrink-0">
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
                    <Building size={16} className="text-gray-400 sm:w-6 sm:h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-white min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 truncate">
                  {business.businessName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 bg-black/20 rounded px-2 py-1">
                    <Building size={12} className="flex-shrink-0" />
                    <span className="truncate">{business.industry}</span>
                  </span>
                  {business.location && (
                    <span className="flex items-center gap-1 bg-black/20 rounded px-2 py-1">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span className="truncate">{business.location}</span>
                    </span>
                  )}
                  <span className={`flex items-center gap-1 rounded px-2 py-1 ${
                    business.status === 'verified' ? 'text-green-400 bg-green-400/20' : 'text-yellow-400 bg-yellow-400/20'
                  }`}>
                    <CheckCircle size={12} className="flex-shrink-0" />
                    <span>{business.status === 'verified' ? 'Verified' : 'Pending'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Investment Quick Action - Shows only on mobile */}
        <div className="block lg:hidden mb-4">
          <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Quick Investment</p>
                <p className="text-xs opacity-80">Support this business</p>
              </div>
              <CreditCard size={20} />
            </div>
            <div className="flex gap-2 mb-3">
              {[1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors duration-200 ${
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
              onClick={() => handleInvestment(donationAmount)}
              disabled={isProcessingPayment || donationAmount <= 0}
              className="w-full bg-white text-[#0A3A4C] py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Invest ₹{donationAmount.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Layout - Mobile First Responsive Grid */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          
          {/* Mobile: All content stacked vertically */}
          {/* Desktop: Left Sidebar (3 columns) */}
          <div className="space-y-4 lg:col-span-3 lg:space-y-6">
            

               {/* Business Owner Info - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Business Owner</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-500 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{business.ownerName}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Founder & CEO</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {business.ownerEmail && (
                    <a
                      href={`mailto:${business.ownerEmail}`}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200 break-all"
                    >
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{business.ownerEmail}</span>
                    </a>
                  )}
                  {business.ownerPhone && (
                    <a
                      href={`tel:${business.ownerPhone}`}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
                    >
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{business.ownerPhone}</span>
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200 break-all"
                    >
                      <Globe size={14} className="flex-shrink-0" />
                      <span className="truncate">Website</span>
                      <ExternalLink size={12} className="flex-shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Business Stats Cards - Mobile First */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Investment</p>
                    <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{formatINR(business.investmentAmount)}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign size={16} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Revenue</p>
                    <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{formatINR(business.currentRevenue)}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Goal</p>
                    <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{formatINR(business.fundingGoal)}</p>
                  </div>
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={16} className="text-teal-600" />
                  </div>
                </div>
              </div>
            </div>

           

            {/* Funding Progress - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Funding Progress</h3>
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
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Raised</span>
                    <span className="text-xs sm:text-sm font-bold text-green-600">
                      {formatINR(business.fundingRaised)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-600">
                      {progressPercentage.toFixed(1)}% of goal
                    </span>
                    <span className="text-xs text-gray-600">
                      Goal: {formatINR(business.fundingGoal)}
                    </span>
                  </div>
                </div>

                {/* Admin Controls - Mobile Responsive */}
                {isEditingFunding && isAdmin && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Amount to Add/Remove (₹)
                      </label>
                      <input
                        type="number"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                        placeholder="Enter amount"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleFundingOperation('add')}
                        disabled={savingFunding || !fundingAmount}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                      >
                        {savingFunding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        <span className="hidden sm:inline">Add</span>
                      </button>
                      
                      <button
                        onClick={() => handleFundingOperation('remove')}
                        disabled={savingFunding || !fundingAmount}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                      >
                        {savingFunding ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />}
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsEditingFunding(false);
                          setFundingAmount(0);
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs font-medium"
                      >
                        <X size={12} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics - Mobile Responsive */}
            {business.keyMetrics && Object.keys(business.keyMetrics).some(key => business.keyMetrics[key]) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PieChart size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Key Metrics</h3>
                </div>
                <div className="space-y-3">
                  {business.keyMetrics.monthlyGrowth && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Monthly Growth</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{business.keyMetrics.monthlyGrowth}%</span>
                    </div>
                  )}
                  {business.keyMetrics.customerRetention && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Retention Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{business.keyMetrics.customerRetention}%</span>
                    </div>
                  )}
                  {business.keyMetrics.averageRevenuePerUser && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">ARPU</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">₹{business.keyMetrics.averageRevenuePerUser}</span>
                    </div>
                  )}
                  {business.keyMetrics.timeToBreakeven && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Break-even</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{business.keyMetrics.timeToBreakeven} months</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center - Main Content (Mobile: full width, Desktop: 6 columns) */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-6">

            {/* Social Stats - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Heart size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-900">{likesCount}</span>
                    <span className="text-sm text-gray-600  ">Likes</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:bg-blue-50 p-2 rounded-xl " 
                     onClick={() => {
                        const element = document.getElementById('commentSection');
                        if (element) element.scrollIntoView({behavior: 'smooth'});
                      }}
                  >
                    <MessageCircle size={16} className="text-blue-500" />
                    <div 
                     
                      
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                    >
                      {comments.length}
                    </div>
                    <span className="text-sm text-gray-600 ">Comments</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Share2 size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-900">{sharesCount}</span>
                    <span className="text-sm text-gray-600 ">Shares</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm flex-shrink-0 ${
                      isLiked 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span className="hidden xs:inline">{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Business Description - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">About the Business</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">{business.description}</p>
                {business.detailedDescription && (
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{business.detailedDescription}</p>
                )}
              </div>
            </div>

            {/* Business Model & Strategy - Mobile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {business.targetMarket && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target size={16} className="text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Target Market</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.targetMarket}</p>
                </div>
              )}

              {business.competitiveAdvantage && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={16} className="text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Competitive Advantage</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.competitiveAdvantage}</p>
                </div>
              )}
            </div>

            {/* Additional Business Info - Mobile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {business.teamExperience && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Team Experience</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.teamExperience}</p>
                </div>
              )}

              {business.marketingStrategy && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Marketing Strategy</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{business.marketingStrategy}</p>
                </div>
              )}
            </div>

            {/* Business Model & Revenue Streams - Mobile Optimized */}
            {(business.businessModel || (business.revenueStreams && business.revenueStreams.length > 0)) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Business Model</h3>
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

            {/* Achievements - Mobile Optimized */}
            {business.achievements && business.achievements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Achievements</h3>
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

            {/* Upcoming Milestones - Mobile Optimized */}
            {business.upcomingMilestones && business.upcomingMilestones.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Upcoming Milestones</h3>
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

            {/* Documents - Mobile Optimized */}
            {business.businessPlan && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Business Documents</h3>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Business Plan</p>
                      <p className="text-xs sm:text-sm text-gray-600">PDF Document</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownloadBusinessPlan}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm flex-shrink-0"
                  >
                    <Download size={14} />
                    <span className="hidden xs:inline">Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* Comments Section - Mobile Optimized */}
            <div id='commentSection' ref={commentRef}>
              <CommentThread
                ownerEmail={business.ownerEmail}
                comments={comments}
                onAdd={addComment}
              />
            </div>
          </div>

          {/* Right Sidebar - Investment Box (Mobile: hidden, Desktop: 3 columns) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Investment/Donation Box */}
              <div className="bg-gradient-to-br from-[#0A3A4C] to-[#174873] rounded-lg shadow-lg text-white p-6">
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
                    onClick={() => handleInvestment(donationAmount)}
                    disabled={isProcessingPayment || donationAmount <= 0}
                    className="w-full bg-white text-[#0A3A4C] py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Invest ₹{donationAmount.toLocaleString()}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
                    <Shield size={14} />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </div>
              </div>

              {/* Additional Business Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
