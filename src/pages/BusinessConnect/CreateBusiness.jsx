import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Building,
  DollarSign,
  FileText,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Edit
} from 'lucide-react';
import { toast } from 'react-toastify';

const CreateBusiness = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get business ID from URL params for edit mode
  const profile = useSelector((state) => state.profile);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPlan, setUploadingPlan] = useState(false);
  const [errors, setErrors] = useState({});

  // Determine if we're in edit mode
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: `${profile.firstName} ${profile.lastName}`,
    email: profile.email,
    phone: '',
    
    // Business Details
    businessName: '',
    industry: '',
    businessDescription: '',
    targetMarket: '',
    
    // Financial Info
    investmentAmount: '',
    currentRevenue: '',
    fundingGoal: '',
    
    // Strategy & Docs
    competitiveAdvantage: '',
    teamExperience: '',
    marketingStrategy: '',
    businessPlan: null,
    backgroundImage: null
  });

  const steps = [
    {
      id: 1,
      title: 'Personal Info',
      subtitle: 'Basic contact information',
      icon: <User size={16} />,
      color: 'from-[#0A3A4C] to-[#174873]'
    },
    {
      id: 2,
      title: 'Business Details',
      subtitle: 'Company information',
      icon: <Building size={16} />,
      color: 'from-[#0A3A4C] to-[#174873]'
    },
    {
      id: 3,
      title: 'Financial Info',
      subtitle: 'Investment & revenue details',
      icon: <DollarSign size={16} />,
      color: 'from-[#0A3A4C] to-[#174873]'
    },
    {
      id: 4,
      title: 'Strategy & Docs',
      subtitle: 'Plans and documents',
      icon: <FileText size={16} />,
      color: 'from-[#0A3A4C] to-[#174873]'
    }
  ];

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

  // Fetch business data for edit mode
  const fetchBusinessData = async () => {
    if (!isEditMode) return;

    setInitialLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/business/${id}`);
      const result = await response.json();

      if (result.success) {
        const business = result.business;
        
        // Check if user is owner or admin
        const isOwner = business.ownerEmail === profile.email;
        const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;
        
        if (!isOwner && !isAdmin) {
          toast.error('You do not have permission to edit this business');
          navigate('/home/business-connect');
          return;
        }

        // Populate form with existing data
        setFormData({
          fullName: business.ownerName || `${profile.firstName} ${profile.lastName}`,
          email: business.ownerEmail || profile.email,
          phone: business.ownerPhone || '',
          businessName: business.businessName || '',
          industry: business.industry || '',
          businessDescription: business.description || '',
          targetMarket: business.targetMarket || '',
          investmentAmount: business.investmentAmount || '',
          currentRevenue: business.currentRevenue || '',
          fundingGoal: business.fundingGoal || '',
          competitiveAdvantage: business.competitiveAdvantage || '',
          teamExperience: business.teamExperience || '',
          marketingStrategy: business.marketingStrategy || '',
          businessPlan: business.businessPlan || null,
          backgroundImage: business.backgroundImage || null
        });
      } else {
        toast.error(result.message || 'Failed to fetch business data');
        navigate('/home/business-connect');
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
      navigate('/home/business-connect');
    } finally {
      setInitialLoading(false);
    }
  };

  // Load business data on component mount if in edit mode
  useEffect(() => {
    fetchBusinessData();
  }, [id, isEditMode]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 2:
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.businessDescription.trim()) newErrors.businessDescription = 'Business description is required';
        if (!formData.targetMarket.trim()) newErrors.targetMarket = 'Target market is required';
        break;
      case 3:
        if (!formData.investmentAmount) newErrors.investmentAmount = 'Investment amount is required';
        if (!formData.currentRevenue) newErrors.currentRevenue = 'Current revenue is required';
        if (!formData.fundingGoal) newErrors.fundingGoal = 'Funding goal is required';
        break;
      case 4:
        if (!formData.competitiveAdvantage.trim()) newErrors.competitiveAdvantage = 'Competitive advantage is required';
        if (!formData.teamExperience.trim()) newErrors.teamExperience = 'Team experience is required';
        if (!formData.marketingStrategy.trim()) newErrors.marketingStrategy = 'Marketing strategy is required';
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

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const isImage = type === 'backgroundImage';
    const isPDF = type === 'businessPlan';

    if (isImage && !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (isPDF && file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const setUploading = isImage ? setUploadingImage : setUploadingPlan;
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append(type, file);

      const endpoint = isImage 
        ? `${process.env.REACT_APP_API_URL}/api/business/upload-background-image`
        : `${process.env.REACT_APP_API_URL}/api/business/upload-business-plan`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        const fileUrl = isImage ? result.imageUrl : result.documentUrl;
        setFormData(prev => ({ ...prev, [type]: fileUrl }));
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const businessData = {
        ownerName: formData.fullName,
        ownerEmail: formData.email,
        ownerPhone: formData.phone,
        businessName: formData.businessName,
        industry: formData.industry,
        description: formData.businessDescription,
        targetMarket: formData.targetMarket,
        investmentAmount: formData.investmentAmount,
        currentRevenue: formData.currentRevenue,
        fundingGoal: formData.fundingGoal,
        competitiveAdvantage: formData.competitiveAdvantage,
        teamExperience: formData.teamExperience,
        marketingStrategy: formData.marketingStrategy,
        businessPlan: formData.businessPlan,
        backgroundImage: formData.backgroundImage
      };

      const url = isEditMode 
        ? `${process.env.REACT_APP_API_URL}/api/business/${id}`
        : `${process.env.REACT_APP_API_URL}/api/business/create`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEditMode ? 'Business updated successfully!' : 'Business submitted for verification!');
        navigate('/home/business-connect');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(isEditMode ? 'Failed to update business. Please try again.' : 'Failed to submit business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while fetching business data in edit mode
  if (initialLoading) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-[#0A3A4C] mx-auto mb-4" />
              <p className="text-gray-600">Loading business data...</p>
            </div>
          </div>
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
                Full Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address*
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number*
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter 10-digit phone number"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.businessName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.businessName && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.businessName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry*
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.industry ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.industry}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description*
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business, its mission, and what makes it unique..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical ${
                  errors.businessDescription ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.businessDescription && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.businessDescription}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Market*
              </label>
              <textarea
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                placeholder="Describe your target market"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical ${
                  errors.targetMarket ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.targetMarket && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.targetMarket}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (₹)*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.investmentAmount}
                  onChange={(e) => handleInputChange('investmentAmount', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.investmentAmount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.investmentAmount && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.investmentAmount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Revenue (₹)*
              </label>
              <input
                type="number"
                value={formData.currentRevenue}
                onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                  errors.currentRevenue ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.currentRevenue && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.currentRevenue}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Goal (₹)*
              </label>
              <input
                type="number"
                value={formData.fundingGoal}
                onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                placeholder="0"
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
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitive Advantage*
              </label>
              <textarea
                value={formData.competitiveAdvantage}
                onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                placeholder="What sets your business apart from competitors?"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical ${
                  errors.competitiveAdvantage ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.competitiveAdvantage && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.competitiveAdvantage}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Experience*
              </label>
              <textarea
                value={formData.teamExperience}
                onChange={(e) => handleInputChange('teamExperience', e.target.value)}
                placeholder="Describe your team's experience and expertise..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical ${
                  errors.teamExperience ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.teamExperience && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.teamExperience}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marketing Strategy*
              </label>
              <textarea
                value={formData.marketingStrategy}
                onChange={(e) => handleInputChange('marketingStrategy', e.target.value)}
                placeholder="Describe your marketing and customer acquisition strategy..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-vertical ${
                  errors.marketingStrategy ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.marketingStrategy && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={12} />
                  {errors.marketingStrategy}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Plan (PDF)
              </label>
              {formData.businessPlan ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-700">
                    {isEditMode ? 'Business plan uploaded' : 'Business plan uploaded'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, businessPlan: null }))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('businessPlanUpload').click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer text-center"
                >
                  {uploadingPlan ? (
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
                        <p className="text-sm font-medium text-gray-700">
                          {isEditMode ? 'Update Business Plan' : 'Upload Business Plan'}
                        </p>
                        <p className="text-xs text-gray-500">PDF, up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="businessPlanUpload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'businessPlan')}
                    className="sr-only"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image
              </label>
              {formData.backgroundImage ? (
                <div className="relative">
                  <img
                    src={formData.backgroundImage}
                    alt="Background"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundImage: null }))}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('backgroundImageUpload').click()}
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
                        <p className="text-sm font-medium text-gray-700">
                          {isEditMode ? 'Update Background Image' : 'Upload Background Image'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="backgroundImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'backgroundImage')}
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

  const progress = (currentStep / 4) * 100;

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/home/business-connect')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit size={20} />
                  Edit Business
                </>
              ) : (
                'Create Business'
              )}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Update your business information' : 'Submit your business for verification'}
            </p>
          </div>
        </div>

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
                  <span>{isEditMode ? 'Updating...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  {isEditMode ? <Edit size={16} /> : <CheckCircle size={16} />}
                  <span>{isEditMode ? 'Update Business' : 'Submit Request'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBusiness;
