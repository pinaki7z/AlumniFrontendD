import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Heart, 
  ArrowLeft, 
  Save, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Building, 
  FileText, 
  Upload, 
  X, 
  Eye, 
  Download,
  AlertCircle, 
  CheckCircle, 
  Camera, 
  Target,
  TrendingUp,
  Users,
  Briefcase,
  Image,
  Loader2,
  Info,
  Globe,
  PieChart,
  Lightbulb,
  Zap
} from 'lucide-react';

// Industry images
import Technology from '../../images/pexels-pixabay-356056.jpg';
import Retail from '../../images/pexels-pixabay-264636.jpg';
import Manufacturing from '../../images/pexels-pixabay-257700.jpg';
import Healthcare from '../../images/pexels-chokniti-khongchum-2280568.jpg';

const CreateDonation = ({ edit }) => {
  const { _id } = useParams();
  const profile = useSelector(state => state.profile);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: `${profile.firstName} ${profile.lastName}`,
    email: '',
    phone: '',
    amount: '',
    businessName: '',
    industry: '',
    businessDescription: '',
    targetMarket: '',
    competitiveAdvantage: '',
    currentRevenue: '',
    fundingGoal: '',
    teamExperience: '',
    marketingStrategy: '',
    businessPlan: null,
    backgroundImage: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingPlan, setUploadingPlan] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const totalSteps = 4;

  const industries = [
    { value: 'Technology', label: 'Technology & Software', icon: <Zap size={16} />, image: Technology },
    { value: 'Healthcare', label: 'Healthcare & Medical', icon: <Heart size={16} />, image: Healthcare },
    { value: 'Manufacturing', label: 'Manufacturing & Industrial', icon: <Building size={16} />, image: Manufacturing },
    { value: 'Retail', label: 'Retail & E-commerce', icon: <Globe size={16} />, image: Retail },
    { value: 'Finance', label: 'Finance & Banking', icon: <DollarSign size={16} />, image: null },
    { value: 'Education', label: 'Education & Training', icon: <FileText size={16} />, image: null },
    { value: 'Food', label: 'Food & Beverage', icon: <Users size={16} />, image: null },
    { value: 'Other', label: 'Other', icon: <Briefcase size={16} />, image: null }
  ];

  const steps = [
    { id: 1, title: 'Personal Info', icon: <User size={20} />, description: 'Basic contact information' },
    { id: 2, title: 'Business Details', icon: <Building size={20} />, description: 'Company information' },
    { id: 3, title: 'Financial Info', icon: <DollarSign size={20} />, description: 'Investment & revenue details' },
    { id: 4, title: 'Strategy & Docs', icon: <FileText size={20} />, description: 'Plans and documents' }
  ];

  useEffect(() => {
    if (edit && _id) {
      fetchDonation();
    }
  }, [edit, _id]);

  const fetchDonation = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donations/${_id}`);
      const data = response.data;
      setFormData({
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        amount: data.amount,
        businessName: data.businessName,
        industry: data.industry,
        businessDescription: data.businessDescription,
        targetMarket: data.targetMarket,
        competitiveAdvantage: data.competitiveAdvantage,
        currentRevenue: data.currentRevenue,
        fundingGoal: data.fundingGoal,
        teamExperience: data.teamExperience,
        marketingStrategy: data.marketingStrategy,
        businessPlan: data.businessPlan,
        backgroundImage: data.backgroundImage
      });
    } catch (error) {
      console.error('Error fetching donation:', error);
      toast.error('Failed to load donation data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIndustryChange = (industry) => {
    const selectedIndustry = industries.find(ind => ind.value === industry);
    handleInputChange('industry', industry);
    
    if (selectedIndustry?.image) {
      fetch(selectedIndustry.image)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            handleInputChange('backgroundImage', reader.result);
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error loading image:', error));
    }
  };

  const handleBusinessPlanChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size should be less than 10MB');
      return;
    }

    setUploadingPlan(true);
    try {
      const formDataImage = new FormData();
      formDataImage.append('image', file);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
        formDataImage,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      handleInputChange('businessPlan', response.data?.imageUrl);
      toast.success('Business plan uploaded successfully!');
    } catch (error) {
      console.error('Error uploading business plan:', error);
      toast.error('Failed to upload business plan');
    } finally {
      setUploadingPlan(false);
    }
  };

  const handleBackgroundImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formDataImage = new FormData();
      formDataImage.append('image', file);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
        formDataImage,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      handleInputChange('backgroundImage', response.data?.imageUrl);
      toast.success('Background image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast.error('Failed to upload background image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
        break;
      case 2:
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.businessDescription.trim()) newErrors.businessDescription = 'Business description is required';
        if (!formData.targetMarket.trim()) newErrors.targetMarket = 'Target market is required';
        break;
      case 3:
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Investment amount must be greater than 0';
        if (!formData.currentRevenue || formData.currentRevenue < 0) newErrors.currentRevenue = 'Current revenue must be 0 or greater';
        if (!formData.fundingGoal || formData.fundingGoal <= 0) newErrors.fundingGoal = 'Funding goal must be greater than 0';
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

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const body = {
        userId: profile._id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        amount: formData.amount,
        businessName: formData.businessName,
        industry: formData.industry,
        businessDescription: formData.businessDescription,
        businessPlan: formData.businessPlan,
        targetMarket: formData.targetMarket,
        competitiveAdvantage: formData.competitiveAdvantage,
        currentRevenue: formData.currentRevenue,
        fundingGoal: formData.fundingGoal,
        teamExperience: formData.teamExperience,
        marketingStrategy: formData.marketingStrategy,
        backgroundImage: formData.backgroundImage
      };

      let response;
      if (edit && _id) {
        response = await axios.put(`${process.env.REACT_APP_API_URL}/donations/${_id}`, body);
      } else {
        response = await axios.post(`${process.env.REACT_APP_API_URL}/donations/create`, body);
      }

      if (response.status === 201 || response.status === 200) {
        toast.success(`Donation request ${edit ? 'updated' : 'created'} successfully`);
        navigate('/home/donations');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    disabled
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                  />
                </div>
                {errors.fullName && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
                {errors.phone && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
                {errors.businessName && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
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
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.industry}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description*
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business, its mission, and what makes it unique..."
                rows="4"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-none"
              />
              {errors.businessDescription && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={14} />
                  {errors.businessDescription}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Market*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  placeholder="Describe your target market"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>
              {errors.targetMarket && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={14} />
                  {errors.targetMarket}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
                {errors.amount && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Revenue (₹)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingUp size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.currentRevenue}
                    onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
                {errors.currentRevenue && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.currentRevenue}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal (₹)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PieChart size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.fundingGoal}
                    onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>
                {errors.fundingGoal && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.fundingGoal}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            {(formData.amount || formData.currentRevenue || formData.fundingGoal) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Investment Amount:</span>
                    <p className="font-semibold">₹{formData.amount ? Number(formData.amount).toLocaleString('en-IN') : '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Revenue:</span>
                    <p className="font-semibold">₹{formData.currentRevenue ? Number(formData.currentRevenue).toLocaleString('en-IN') : '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Funding Goal:</span>
                    <p className="font-semibold">₹{formData.fundingGoal ? Number(formData.fundingGoal).toLocaleString('en-IN') : '0'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitive Advantage*
              </label>
              <textarea
                value={formData.competitiveAdvantage}
                onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                placeholder="What sets your business apart from competitors?"
                rows="4"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-none"
              />
              {errors.competitiveAdvantage && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={14} />
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
                rows="4"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-none"
              />
              {errors.teamExperience && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={14} />
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
                rows="4"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 resize-none"
              />
              {errors.marketingStrategy && (
                <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle size={14} />
                  {errors.marketingStrategy}
                </p>
              )}
            </div>

            {/* Business Plan Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Plan (PDF)
              </label>
              <div
                onClick={() => document.getElementById('businessPlan').click()}
                className="group border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                {uploadingPlan ? (
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-[#0A3A4C] mr-2" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                      <Upload size={24} className="text-[#0A3A4C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Upload Business Plan</p>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="businessPlan"
                  type="file"
                  accept=".pdf"
                  onChange={handleBusinessPlanChange}
                  className="sr-only"
                />
              </div>
              {formData.businessPlan && (
                <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">Business Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={formData.businessPlan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-[#0A3A4C] hover:text-[#0A3A4C]/80"
                    >
                      <Eye size={14} />
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleInputChange('businessPlan', null)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image
              </label>
              <div
                onClick={() => document.getElementById('backgroundImage').click()}
                className="group border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                {uploadingImage ? (
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-[#0A3A4C] mr-2" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                      <Camera size={24} className="text-[#0A3A4C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Upload Background Image</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="backgroundImage"
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageChange}
                  className="sr-only"
                />
              </div>
              {formData.backgroundImage && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={formData.backgroundImage}
                    alt="Background"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('backgroundImage', '')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                  >
                    <X size={12} />
                  </button>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 ">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart size={20} className="sm:size-6 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#136175]">
                    {edit ? 'Edit Donation Request' : 'Create Donation Request'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#136175]/80">
                    {edit ? 'Update your donation request' : 'Share your business idea and seek investment'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/home/donations')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm sm:text-base"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back to Donations</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Step {currentStep} of {totalSteps}</h2>
              <div className="text-sm text-gray-600">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-[#0A3A4C] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                    currentStep === step.id
                      ? 'bg-[#0A3A4C] text-white'
                      : completedSteps.includes(step.id)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div className="mb-1 sm:mb-2">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle size={20} />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium">{step.title}</p>
                    <p className="text-xs hidden sm:block opacity-75">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {steps[currentStep - 1]?.title}
              </h3>
              <p className="text-sm text-gray-600">
                {steps[currentStep - 1]?.description}
              </p>
            </div>

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
                  >
                    <span>Next</span>
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{edit ? 'Updating...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{edit ? 'Update Request' : 'Submit Request'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDonation;
