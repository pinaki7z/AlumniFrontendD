// components/CreateSponsorship.js - Updated with Funding Goal
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, ArrowRight, CheckCircle, User, Award, DollarSign, FileText,
  Upload, X, Loader2, AlertCircle, Calendar, MapPin, Users, Target
} from 'lucide-react';
import { toast } from 'react-toastify';

const CreateSponsorship = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const profile = useSelector((state) => state.profile);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', detailedDescription: '', category: '', sponsorshipType: '',
    amount: '', duration: '', sponsorName: `${profile.firstName} ${profile.lastName}`,
    sponsorEmail: profile.email, sponsorPhone: '', sponsorWebsite: '', sponsorLogo: null,
    eventName: '', eventDate: '', eventLocation: '', expectedAudience: '', targetDemographic: '',
    benefits: [''], deliverables: [''], marketingReach: '', images: [], proposalDocument: null,
    priority: 'medium', tags: '', expiresAt: '', fundingGoal: '' // Added fundingGoal
  });

  // Load existing sponsorship data for edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadSponsorshipData();
    }
  }, [id]);

  const loadSponsorshipData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sponsorship/${id}?edit=true`);
      const result = await response.json();

      if (result.success) {
        const sponsorship = result.sponsorship;
        
        // Check if user can edit
        const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;
        if (!isAdmin && sponsorship.ownerEmail !== profile.email) {
          toast.error('You do not have permission to edit this sponsorship');
          navigate('/home/sponsorship-connect');
          return;
        }

        // Populate form with existing data
        setFormData({
          title: sponsorship.title || '',
          description: sponsorship.description || '',
          detailedDescription: sponsorship.detailedDescription || '',
          category: sponsorship.category || '',
          sponsorshipType: sponsorship.sponsorshipType || '',
          amount: sponsorship.amount?.toString() || '',
          duration: sponsorship.duration || '',
          sponsorName: sponsorship.sponsorName || '',
          sponsorEmail: sponsorship.sponsorEmail || '',
          sponsorPhone: sponsorship.sponsorPhone || '',
          sponsorWebsite: sponsorship.sponsorWebsite || '',
          sponsorLogo: sponsorship.sponsorLogo || null,
          eventName: sponsorship.eventName || '',
          eventDate: sponsorship.eventDate ? new Date(sponsorship.eventDate).toISOString().split('T')[0] : '',
          eventLocation: sponsorship.eventLocation || '',
          expectedAudience: sponsorship.expectedAudience?.toString() || '',
          targetDemographic: sponsorship.targetDemographic || '',
          benefits: sponsorship.benefits?.length > 0 ? sponsorship.benefits : [''],
          deliverables: sponsorship.deliverables?.length > 0 ? sponsorship.deliverables : [''],
          marketingReach: sponsorship.marketingReach || '',
          images: sponsorship.images || [],
          proposalDocument: sponsorship.proposalDocument || null,
          priority: sponsorship.priority || 'medium',
          tags: sponsorship.tags?.join(', ') || '',
          expiresAt: sponsorship.expiresAt ? new Date(sponsorship.expiresAt).toISOString().split('T')[0] : '',
          fundingGoal: sponsorship.fundingGoal?.toString() || '' // Added fundingGoal
        });
      } else {
        toast.error(result.message || 'Failed to load sponsorship data');
        navigate('/home/sponsorship-connect');
      }
    } catch (error) {
      console.error('Load sponsorship error:', error);
      toast.error('Failed to load sponsorship data');
      navigate('/home/sponsorship-connect');
    } finally {
      setLoadingData(false);
    }
  };

  // Update the submit handler
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const sponsorshipData = {
        ...formData,
        benefits: formData.benefits.filter(b => b.trim()),
        deliverables: formData.deliverables.filter(d => d.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        expectedAudience: formData.expectedAudience ? Number(formData.expectedAudience) : null,
        amount: Number(formData.amount),
        fundingGoal: formData.fundingGoal ? Number(formData.fundingGoal) : Number(formData.amount), // Added fundingGoal handling
        ownerEmail: profile.email,
        createdBy: `${profile.firstName} ${profile.lastName}`
      };

      const url = isEditMode 
        ? `${process.env.REACT_APP_API_URL}/api/sponsorship/${id}`
        : `${process.env.REACT_APP_API_URL}/api/sponsorship/create`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsorshipData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || `Sponsorship ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/home/sponsorship-connect');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} sponsorship. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Information', subtitle: 'Sponsorship details', icon: <Award size={16} /> },
    { id: 2, title: 'Sponsor Details', subtitle: 'Your information', icon: <User size={16} /> },
    { id: 3, title: 'Event Information', subtitle: 'Event or project details', icon: <Calendar size={16} /> },
    { id: 4, title: 'Benefits & Media', subtitle: 'What sponsors get', icon: <FileText size={16} /> }
  ];

  const categories = ['Event', 'Product', 'Service', 'Content', 'Community'];
  const sponsorshipTypes = ['Title', 'Presenting', 'Supporting', 'Media', 'Venue'];
  const durations = ['1 month', '3 months', '6 months', '1 year', 'Custom'];

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.sponsorshipType) newErrors.sponsorshipType = 'Sponsorship type is required';
        if (!formData.amount) newErrors.amount = 'Amount is required';
        // Validate funding goal if provided
        if (formData.fundingGoal && Number(formData.fundingGoal) < Number(formData.amount)) {
          newErrors.fundingGoal = 'Funding goal should be greater than or equal to sponsorship amount';
        }
        break;
      case 2:
        if (!formData.sponsorName.trim()) newErrors.sponsorName = 'Sponsor name is required';
        if (!formData.sponsorEmail.trim()) newErrors.sponsorEmail = 'Email is required';
        break;
      case 3:
        break;
      case 4:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const isImage = type === 'image';
    const setUploading = isImage ? setUploadingImage : setUploadingDoc;
    
    if (isImage && !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (!isImage && file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append(isImage ? 'image' : 'document', file);

      const endpoint = isImage 
        ? `${process.env.REACT_APP_API_URL}/api/sponsorship/upload-image`
        : `${process.env.REACT_APP_API_URL}/api/sponsorship/upload-document`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        const fileUrl = isImage ? result.imageUrl : result.documentUrl;
        
        if (isImage) {
          setFormData(prev => ({ ...prev, images: [...prev.images, fileUrl] }));
        } else {
          setFormData(prev => ({ ...prev, proposalDocument: fileUrl }));
        }
        
        toast.success(`${isImage ? 'Image' : 'Document'} uploaded successfully!`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / 4) * 100;

  // Show loading spinner while loading data
  if (loadingData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#0A3A4C] mx-auto mb-4" />
          <p className="text-gray-600">Loading sponsorship data...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Title*
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter sponsorship title"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description*
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the sponsorship opportunity"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category*
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={12} />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsorship Type*
                </label>
                <select
                  value={formData.sponsorshipType}
                  onChange={(e) => handleInputChange('sponsorshipType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.sponsorshipType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  {sponsorshipTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.sponsorshipType && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={12} />
                    {errors.sponsorshipType}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsorship Amount (₹)*
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter sponsorship amount"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={12} />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal (₹)
                  <span className="text-xs text-gray-500 ml-1">(Optional - defaults to sponsorship amount)</span>
                </label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                  placeholder="Enter funding goal"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.fundingGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fundingGoal && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={12} />
                    {errors.fundingGoal}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Set a funding goal if you want to raise more than the sponsorship amount through donations
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              >
                <option value="">Select Duration</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                placeholder="Detailed description of the sponsorship opportunity, terms, and conditions"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsor Name*
              </label>
              <input
                type="text"
                value={formData.sponsorName}
                onChange={(e) => handleInputChange('sponsorName', e.target.value)}
                placeholder="Enter sponsor name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.sponsorName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.sponsorName && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.sponsorName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address*
              </label>
              <input
                type="email"
                value={formData.sponsorEmail}
                onChange={(e) => handleInputChange('sponsorEmail', e.target.value)}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.sponsorEmail ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.sponsorEmail && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.sponsorEmail}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.sponsorPhone}
                  onChange={(e) => handleInputChange('sponsorPhone', e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.sponsorWebsite}
                  onChange={(e) => handleInputChange('sponsorWebsite', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsor Logo
              </label>
              {formData.sponsorLogo ? (
                <div className="relative">
                  <img
                    src={formData.sponsorLogo}
                    alt="Logo"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sponsorLogo: null }))}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('logoUpload').click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer text-center"
                >
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#0A3A4C]" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto">
                        <Upload size={24} className="text-[#0A3A4C]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Upload Logo</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="sr-only"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event/Project Name
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                placeholder="Enter event or project name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Audience
                </label>
                <input
                  type="number"
                  value={formData.expectedAudience}
                  onChange={(e) => handleInputChange('expectedAudience', e.target.value)}
                  placeholder="Number of expected attendees"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Location
              </label>
              <input
                type="text"
                value={formData.eventLocation}
                onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                placeholder="Enter event location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Demographic
              </label>
              <textarea
                value={formData.targetDemographic}
                onChange={(e) => handleInputChange('targetDemographic', e.target.value)}
                placeholder="Describe the target audience demographics"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marketing Reach
              </label>
              <textarea
                value={formData.marketingReach}
                onChange={(e) => handleInputChange('marketingReach', e.target.value)}
                placeholder="Describe the marketing reach and exposure opportunities"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsor Benefits
              </label>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                      placeholder="Enter sponsor benefit"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('benefits', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('benefits')}
                  className="text-sm text-[#0A3A4C] hover:text-[#174873] font-medium"
                >
                  + Add Benefit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deliverables
              </label>
              <div className="space-y-2">
                {formData.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => handleArrayChange('deliverables', index, e.target.value)}
                      placeholder="Enter deliverable"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                    />
                    {formData.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('deliverables', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('deliverables')}
                  className="text-sm text-[#0A3A4C] hover:text-[#174873] font-medium"
                >
                  + Add Deliverable
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas (e.g., technology, startup, innovation)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Images
              </label>
              <div className="space-y-4">
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div
                  onClick={() => document.getElementById('imageUpload').click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer text-center"
                >
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#0A3A4C]" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto">
                        <Upload size={24} className="text-[#0A3A4C]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Upload Images</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposal Document (PDF)
              </label>
              {formData.proposalDocument ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-700">Proposal document uploaded</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, proposalDocument: null }))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('docUpload').click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer text-center"
                >
                  {uploadingDoc ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#0A3A4C]" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto">
                        <Upload size={24} className="text-[#0A3A4C]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Upload Proposal</p>
                        <p className="text-xs text-gray-500">PDF, up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="docUpload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'document')}
                    className="sr-only"
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/home/sponsorship-connect')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Sponsorship' : 'Create Sponsorship'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Update your sponsorship opportunity' : 'Create a new sponsorship opportunity'}
            </p>
          </div>
        </div>

        {isEditMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> After editing, your sponsorship will be sent for admin re-verification.
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors duration-200 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.subtitle}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-px mx-2 sm:mx-4 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1]?.subtitle}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{isEditMode ? 'Update Sponsorship' : 'Create Sponsorship'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSponsorship;
