// components/SponsorshipDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Award,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Eye,
  Share2,
  Download,
  Mail,
  Phone,
  Globe,
  Building,
  Star,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

const SponsorshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [sponsorship, setSponsorship] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch sponsorship details
  const fetchSponsorshipDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}`);
      const result = await response.json();

      if (result.success) {
        setSponsorship(result.sponsorship);
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

  // Handle share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Handle contact sponsor
  const handleContact = () => {
    if (sponsorship.sponsorEmail) {
      window.location.href = `mailto:${sponsorship.sponsorEmail}?subject=Interest in ${sponsorship.title}`;
    }
  };

  useEffect(() => {
    if (id) {
      fetchSponsorshipDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading sponsorship details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sponsorship) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Award size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sponsorship Not Found</h2>
            <p className="text-gray-600 mb-4">The sponsorship you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/home/sponsorship-connect')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              <ArrowLeft size={16} />
              Back to Sponsorships
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
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
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="relative h-48 sm:h-64 lg:h-80">
            {sponsorship.images && sponsorship.images[0] ? (
              <img
                src={sponsorship.images[0]}
                alt={sponsorship.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <Award size={64} className="text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-colors duration-200"
              >
                <Share2 size={18} />
              </button>
            </div>

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
                      <Building size={24} className="text-gray-400" />
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
                      sponsorship.status === 'active' ? 'text-green-400' : 
                      sponsorship.status === 'pending' ? 'text-yellow-400' :
                      sponsorship.status === 'completed' ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      <CheckCircle size={14} />
                      {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Sponsor Info */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
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
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                        >
                          <Mail size={14} />
                          {sponsorship.sponsorEmail}
                        </a>
                      )}
                      {sponsorship.sponsorPhone && (
                        <a
                          href={`tel:${sponsorship.sponsorPhone}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
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
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
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

              {/* Sponsorship Stats */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Statistics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorship.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inquiries</span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorship.inquiries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Applications</span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorship.applications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <span className={`text-sm font-semibold ${
                      sponsorship.priority === 'high' ? 'text-red-600' :
                      sponsorship.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {sponsorship.priority.charAt(0).toUpperCase() + sponsorship.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-6">
            {/* Key Details Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">₹{sponsorship.amount.toLocaleString()}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={16} className="text-green-600" />
                  </div>
                </div>
              </div>

              {sponsorship.duration && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{sponsorship.duration}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              )}

              {sponsorship.expectedAudience && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Audience</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{sponsorship.expectedAudience.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users size={16} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
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
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
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
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
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
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
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
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
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
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
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
          </div>

          {/* Right Sidebar - Contact & Action */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Contact Sponsor */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg text-white p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Mail size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold">Interested?</h3>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Contact {sponsorship.sponsorName} to learn more about this sponsorship opportunity.
                </p>

                <button
                  onClick={handleContact}
                  className="w-full bg-white text-purple-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Contact Sponsor
                </button>

                {sponsorship.proposalDocument && (
                  <a
                    href={sponsorship.proposalDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 bg-white/10 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/20 transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={14} />
                    Download Proposal
                  </a>
                )}
              </div>

              {/* Tags */}
              {sponsorship.tags && sponsorship.tags.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {sponsorship.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
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
