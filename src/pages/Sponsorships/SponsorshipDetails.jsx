// components/SponsorshipDetails.js - Complete redesign based on BusinessDetails
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Award, DollarSign, Calendar, MapPin, Users, Eye, Share2,
  Download, Mail, Phone, Globe, Building, Star, CheckCircle, User,
  FileText, Target, Lightbulb, ExternalLink, CreditCard, Shield,
  Clock, ThumbsUp, MessageCircle, TrendingUp, Loader2, Edit, X,
  Plus, Minus, Heart
} from 'lucide-react';
import { toast } from 'react-toastify';
import { CommentThread } from '../BusinessConnect/CommentThread';

const SponsorshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const commentRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  
  // State variables
  const [sponsorship, setSponsorship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Admin funding edit states
  const [isEditingFunding, setIsEditingFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(0);
  const [savingFunding, setSavingFunding] = useState(false);

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;
  const RAZORPAY_KEY = "rzp_test_9biOcO86B9dZyQ";

  // Fetch sponsorship details
  const fetchSponsorshipDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}`);
      const result = await response.json();

      if (result.success) {
        setSponsorship(result.sponsorship);
        setLikesCount(result.sponsorship.likes || 0);
        setSharesCount(result.sponsorship.shares || 0);
      } else {
        toast.error(result.message || 'Failed to fetch sponsorship details');
        setSponsorship(null);
      }
    } catch (error) {
      console.error('Error fetching sponsorship details:', error);
      toast.error('Failed to fetch sponsorship details');
      setSponsorship(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch like status
  const fetchLikeStatus = async () => {
    if (!profile._id) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/like-status/${profile._id}`);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/comments`);
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
      ? `${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/comments/${parentId}/reply`
      : `${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/comments`;
    
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/like`, {
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
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/share`, {
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

  // Handle funding operations (Admin)
  const handleFundingOperation = async (operation) => {
    if (!fundingAmount || fundingAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSavingFunding(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/funding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, amount: fundingAmount }),
      });

      const result = await response.json();

      if (result.success) {
        setSponsorship(result.sponsorship);
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

  // Razorpay payment integration
  const handleDonation = async (amount) => {
    if (!sponsorship || amount <= 0) return;

    setIsProcessingPayment(true);

    try {
      if (!window.Razorpay) {
        console.error('Razorpay script not loaded');
        toast.error('Payment system not available. Please refresh the page.');
        setIsProcessingPayment(false);
        return;
      }

      // Create order
      const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: RAZORPAY_KEY,
        amount: amount * 100,
        currency: 'INR',
        name: sponsorship.title,
        description: `Donation for ${sponsorship.title}`,
        order_id: orderResult.orderId,
        image: sponsorship.sponsorLogo || '',
        handler: async function (response) {
          try {
            const paymentResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}/payment-success`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: amount,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const paymentResult = await paymentResponse.json();

            if (paymentResult.success) {
              setSponsorship(paymentResult.sponsorship);
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
        theme: {
          color: '#0A3A4C',
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsProcessingPayment(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.message || 'Failed to process donation');
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
      fetchSponsorshipDetails();
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
              <Loader2 size={32} className="animate-spin text-[#0A3A4C] mx-auto mb-4" />
              <p className="text-gray-600">Loading sponsorship details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sponsorship) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Award size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sponsorship Not Found</h2>
            <p className="text-gray-600 mb-4">The sponsorship you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/home/sponsorship-connect')}
              className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              <ArrowLeft size={16} />
              Back to Sponsorships
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = sponsorship.fundingGoal > 0 ? (sponsorship.fundingRaised / sponsorship.fundingGoal) * 100 : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 pb-3">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/home/sponsorship-connect')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Sponsorships
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="relative h-48 sm:h-64 lg:h-80">
            {sponsorship.images && sponsorship.images[0] ? (
              <img
                src={sponsorship.images[0]}
                alt={sponsorship.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full dynamic-site-bg flex items-center justify-center">
                <Award size={64} className="text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Action Buttons */}
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

            {/* Sponsorship Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-2 shadow-lg">
                  {sponsorship.sponsorLogo ? (
                    <img
                      src={sponsorship.sponsorLogo}
                      alt={`${sponsorship.sponsorName} logo`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <Award size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-white">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                    {sponsorship.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Award size={14} />
                      {sponsorship.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building size={14} />
                      {sponsorship.sponsorshipType}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      sponsorship.verificationStatus === 'verified' ? 'text-green-400' : 
                      sponsorship.verificationStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      <CheckCircle size={14} />
                      {sponsorship.verificationStatus === 'verified' ? 'Verified' : 
                       sponsorship.verificationStatus === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Donation Quick Action */}
        <div className="block lg:hidden mb-6">
          <div className="dynamic-site-bg rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Support This Sponsorship</p>
                <p className="text-xs opacity-80">Help reach the funding goal</p>
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
              onClick={() => handleDonation(donationAmount)}
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
                  Donate ₹{donationAmount.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              
              {/* Sponsor Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 dynamic-site-bg rounded-lg flex items-center justify-center">
                    <Building size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Sponsor</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Building size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sponsorship.sponsorName}</p>
                      <p className="text-sm text-gray-600">Sponsor</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {sponsorship.sponsorEmail && (
                      <a
                        href={`mailto:${sponsorship.sponsorEmail}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
                      >
                        <Mail size={14} />
                        {sponsorship.sponsorEmail}
                      </a>
                    )}
                    {sponsorship.sponsorPhone && (
                      <a
                        href={`tel:${sponsorship.sponsorPhone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
                      >
                        <Phone size={14} />
                        {sponsorship.sponsorPhone}
                      </a>
                    )}
                    {sponsorship.sponsorWebsite && (
                      <a
                        href={sponsorship.sponsorWebsite}
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

              {/* Funding Progress */}
              {sponsorship.fundingGoal > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
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
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Raised</span>
                        <span className="text-sm font-bold text-green-600">
                          {formatINR(sponsorship.fundingRaised)}
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
                          Goal: {formatINR(sponsorship.fundingGoal)}
                        </span>
                      </div>
                    </div>

                    {/* Admin Controls */}
                    {isEditingFunding && isAdmin && (
                      <div className="space-y-3 pt-4 border-t border-gray-200">
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
                            Add
                          </button>
                          
                          <button
                            onClick={() => handleFundingOperation('remove')}
                            disabled={savingFunding || !fundingAmount}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                          >
                            {savingFunding ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />}
                            Remove
                          </button>
                          
                          <button
                            onClick={() => {
                              setIsEditingFunding(false);
                              setFundingAmount(0);
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs font-medium"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-6">
            {/* Key Details Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-xl font-bold text-gray-900">₹{sponsorship?.amount?.toLocaleString() || "N/A"}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                </div>
              </div>


                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Audience</p>
                      <p className="text-xl font-bold text-gray-900">{sponsorship?.expectedAudience?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Views</p>
                      <p className="text-xl font-bold text-gray-900">{sponsorship?.views || "N/A"}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-purple-600" />
                    </div>
                  </div>
                </div>
            </div>

            {/* Social Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-900">{likesCount}</span>
                    <span className="text-sm text-gray-600">Likes</span>
                  </div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-2 rounded-lg" 
                    onClick={() => {
                      const element = document.getElementById('commentSection');
                      if (element) element.scrollIntoView({behavior: 'smooth'});
                    }}
                  >
                    <MessageCircle size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                      {comments.length}
                    </span>
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

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About This Sponsorship</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">{sponsorship.description}</p>
                {sponsorship.detailedDescription && (
                  <p className="text-gray-700 leading-relaxed">{sponsorship.detailedDescription}</p>
                )}
              </div>
            </div>

            {/* Event Information */}
            {(sponsorship.eventName || sponsorship.eventDate || sponsorship.eventLocation) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 dynamic-site-bg rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Event Information</h3>
                </div>
                <div className="space-y-3">
                  {sponsorship.eventName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Event Name</label>
                      <p className="text-gray-900">{sponsorship.eventName}</p>
                    </div>
                  )}
                  {sponsorship.eventDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Event Date</label>
                      <p className="text-gray-900">{new Date(sponsorship.eventDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {sponsorship.eventLocation && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{sponsorship.eventLocation}</p>
                    </div>
                  )}
                  {sponsorship.targetDemographic && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Target Demographic</label>
                      <p className="text-gray-900">{sponsorship.targetDemographic}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {sponsorship.benefits && sponsorship.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Star size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Sponsor Benefits</h3>
                </div>
                <ul className="space-y-2">
                  {sponsorship.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deliverables */}
            {sponsorship.deliverables && sponsorship.deliverables.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Target size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Deliverables</h3>
                </div>
                <ul className="space-y-2">
                  {sponsorship.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Marketing Reach */}
            {sponsorship.marketingReach && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Marketing Reach</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{sponsorship.marketingReach}</p>
              </div>
            )}

            {/* Additional Images */}
            {sponsorship.images && sponsorship.images.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 dynamic-site-bg rounded-lg flex items-center justify-center">
                    <Eye size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Gallery</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {sponsorship.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div id='commentSection' ref={commentRef}>
              <CommentThread
                ownerEmail={sponsorship.ownerEmail}
                comments={comments}
                onAdd={addComment}
              />
            </div>
          </div>

          {/* Right Sidebar - Donation Box */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Donation Box */}
              <div className="bg-gradient-to-br from-[#0A3A4C] to-[#174873] rounded-lg shadow-lg text-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold">Support This Sponsorship</h3>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Help {sponsorship.title} reach their funding goal and make this sponsorship opportunity successful.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Donation Amount (₹)
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
                        Donate ₹{donationAmount.toLocaleString()}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
                    <Shield size={14} />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {sponsorship.tags && sponsorship.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {sponsorship.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#0A3A4C]/10 text-[#0A3A4C] rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(sponsorship.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {sponsorship.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expires</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(sponsorship.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorship.sponsorshipType}</span>
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

export default SponsorshipDetails;
