import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Save,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  User,
  Eye,
  Settings,
  Globe,
  Home,
  Hybrid,
  Camera,
  Paperclip,
  Plus,
  Trash2
} from 'lucide-react';

export const CreateJob = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  
  const [formData, setFormData] = useState({
    title: '',
    userId: profile._id,
    location: '',
    companyType: 'myCompany',
    company: profile.workingAt || '',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    duration: 'per month',
    isJob: false,
    isInternship: true,
    employmentType: '',
    applyBy: '',
    isPaid: false,
    isUnpaid: false,
    category: 'Other',
    locationType: { onSite: true, remote: false, hybrid: false },
    question: '',
    description: '',
    coverImage: null,
    attachments: [],
    qualification: '',
    responsibility: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  // Steps for mobile navigation
  const steps = [
    { id: 1, name: 'Basic Info', description: 'Job details and company' },
    { id: 2, name: 'Requirements', description: 'Qualifications and responsibilities' },
    { id: 3, name: 'Media', description: 'Images and attachments' },
    { id: 4, name: 'Publish', description: 'Review and publish' }
  ];

  // Progress calculation
  const progress = useMemo(() => {
    const fields = [
      formData.title.trim(),
      formData.location.trim(),
      formData.company.trim(),
      formData.responsibility.trim(),
      formData.qualification.trim(),
      formData.description.trim(),
      formData.applyBy,
      formData.coverImage,
      formData.attachments.length > 0
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleRadioChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'companyType') {
      if (value === 'myCompany') {
        setFormData((prev) => ({ ...prev, company: profile.workingAt || '' }));
      } else {
        setFormData((prev) => ({ ...prev, company: '' }));
      }
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, [profile.workingAt]);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    if (name === 'isJob' || name === 'isInternship') {
      const other = name === 'isJob' ? 'isInternship' : 'isJob';
      setFormData((prev) => ({ ...prev, [name]: checked, [other]: !checked }));
    } else if (name === 'isPaid' || name === 'isUnpaid') {
      const other = name === 'isPaid' ? 'isUnpaid' : 'isPaid';
      setFormData((prev) => ({ ...prev, [name]: checked, [other]: false }));
      if (name === 'isUnpaid' && checked) {
        setFormData((prev) => ({ ...prev, salaryMin: '', salaryMax: '' }));
      }
    } else if (['onSite', 'remote', 'hybrid'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        locationType: {
          onSite: false,
          remote: false,
          hybrid: false,
          [name]: checked
        }
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const { name, files } = e.target;
    if (name === 'coverImage') {
      const file = files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setUploadingCover(true);
      try {
        const formDataImg = new FormData();
        formDataImg.append('image', file);
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
          formDataImg,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        setFormData((prev) => ({ ...prev, coverImage: response.data?.imageUrl }));
        setErrors((prev) => ({ ...prev, coverImage: '' }));
        toast.success('Cover image uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload cover image');
      } finally {
        setUploadingCover(false);
      }
    } else if (name === 'attachments') {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setUploadingAttachments(true);
      try {
        const formDataAttach = new FormData();
        fileArray.forEach((file) => formDataAttach.append('images', file));
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/uploadImage/image`,
          formDataAttach,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        setFormData((prev) => ({ ...prev, attachments: response.data }));
        setErrors((prev) => ({ ...prev, attachments: '' }));
        toast.success('Attachments uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload attachments');
      } finally {
        setUploadingAttachments(false);
      }
    }
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.responsibility.trim()) errs.responsibility = 'Responsibilities are required';
    if (!formData.qualification.trim()) errs.qualification = 'Qualifications are required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.applyBy) errs.applyBy = 'Apply-by date is required';
    if (!formData.company.trim()) errs.company = 'Company name is required';
    if (formData.isJob && !formData.employmentType) errs.employmentType = 'Employment type is required';
    if (formData.isPaid && (!formData.salaryMin || !formData.salaryMax)) {
      errs.salaryRange = 'Salary range is required for paid roles';
    }
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.coverImage) errs.coverImage = 'Cover image is required';
    if (formData.attachments.length === 0) errs.attachments = 'At least one attachment is required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix all errors before publishing');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        userId: profile._id,
        location: formData.location,
        company: formData.company,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        currency: formData.currency,
        duration: formData.duration,
        type: formData.isJob ? 'Job' : 'Internship',
        employmentType: formData.employmentType,
        applyBy: formData.applyBy,
        paid: formData.isPaid,
        unpaid: formData.isUnpaid,
        category: formData.category,
        locationType: formData.locationType,
        question: formData.question,
        description: formData.description,
        coverImage: formData.coverImage,
        attachments: formData.attachments,
        qualification: formData.qualification,
        responsibility: formData.responsibility
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/jobs/create`,
        payload
      );
      
      if (response.status === 200 || response.status === 201) {
        toast.success(`${payload.type} post is being validated`);
        navigate('/home/jobs');
      }
    } catch (error) {
      console.error('Publish failed:', error);
      toast.error(error.response?.data?.message || 'Failed to publish job');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6 lg:hidden">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step.id ? 'dynamic-site-bg text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step.id}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-6 h-0.5 mx-1 ${currentStep > step.id ? 'dynamic-site-bg' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="dynamic-site-bg h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  const getLocationTypeIcon = (type) => {
    switch (type) {
      case 'onSite': return <Building size={16} />;
      case 'remote': return <Home size={16} />;
      case 'hybrid': return <Globe size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  if (previewMode) {
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
          {/* Preview Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
                <Eye size={16} className="sm:size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Preview Job Posting
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Review your job before publishing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(false)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <ArrowLeft size={16} />
                <span>Continue Editing</span>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      <Briefcase size={14} />
                      {formData.isJob ? 'Job' : 'Internship'}
                    </span>
                    {formData.isPaid && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <DollarSign size={14} />
                        Paid
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    {formData.title || 'Job Title'}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Building size={14} />
                      <span>{formData.company || 'Company Name'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{formData.location || 'Location'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Apply by {formData.applyBy ? new Date(formData.applyBy).toLocaleDateString() : 'Date'}</span>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <h3>Job Description</h3>
                    <p>{formData.description || 'Job description will appear here...'}</p>
                    
                    <h3>Responsibilities</h3>
                    <pre className="whitespace-pre-wrap">{formData.responsibility || 'Responsibilities will appear here...'}</pre>
                    
                    <h3>Qualifications</h3>
                    <pre className="whitespace-pre-wrap">{formData.qualification || 'Qualifications will appear here...'}</pre>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-80">
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Job cover"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Job Details</h3>
                    <div className="space-y-2 text-sm">
                      {formData.salaryMin && formData.salaryMax && (
                        <div>
                          <span className="text-gray-600">Salary:</span>
                          <span className="ml-2">{formData.salaryMin} - {formData.salaryMax} {formData.currency} {formData.duration}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2">{Object.keys(formData.locationType).find(key => formData.locationType[key])}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Create Job Posting
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Post a new job or internship opportunity</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={() => navigate('/home/jobs')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        {/* Progress & Steps */}
        <div className="mb-6">
          <StepIndicator />
          <ProgressBar />
        </div>

        {/* Main Form */}
        <form onSubmit={handlePublish} className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 dynamic-site-bg bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Briefcase size={14} className="sm:size-4 text-[#0A3A4C]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title*
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Software Engineer"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
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

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. New York, NY"
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                          errors.location ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.location && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* Apply By */}
                  <div>
                    <label htmlFor="applyBy" className="block text-sm font-medium text-gray-700 mb-2">
                      Apply By*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="applyBy"
                        name="applyBy"
                        type="date"
                        value={formData.applyBy}
                        onChange={handleInputChange}
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                          errors.applyBy ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.applyBy && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.applyBy}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company Type */}
                <div>
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700 mb-3">I am hiring for*</legend>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      {[
                        { value: 'myCompany', label: 'My company', icon: <Building size={16} /> },
                        { value: 'otherCompany', label: 'Other company', icon: <Globe size={16} /> }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                          <input
                            type="radio"
                            name="companyType"
                            value={option.value}
                            checked={formData.companyType === option.value}
                            onChange={handleRadioChange}
                            className="w-4 h-4 text-[#0A3A4C] border-gray-300 focus:ring-[#0A3A4C]"
                          />
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span className="text-sm font-medium">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Building size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={formData.companyType === 'myCompany'}
                      placeholder="Company name"
                      className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                        errors.company ? 'border-red-300' : 'border-gray-300'
                      } ${formData.companyType === 'myCompany' && 'bg-gray-100'}`}
                    />
                  </div>
                  {errors.company && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={12} />
                      {errors.company}
                    </p>
                  )}
                </div>

                {/* Job Type */}
                <div>
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700 mb-3">Position Type*</legend>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      {[
                        { name: 'isJob', label: 'Job', checked: formData.isJob },
                        { name: 'isInternship', label: 'Internship', checked: formData.isInternship }
                      ].map((option) => (
                        <label key={option.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                          <input
                            type="checkbox"
                            name={option.name}
                            checked={option.checked}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-[#0A3A4C] border-gray-300 rounded focus:ring-[#0A3A4C]"
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Employment Type (for Jobs) */}
                {formData.isJob && (
                  <div>
                    <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type*
                    </label>
                    <select
                      id="employmentType"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                        errors.employmentType ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select employment type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                    {errors.employmentType && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.employmentType}
                      </p>
                    )}
                  </div>
                )}

                {/* Paid/Unpaid (for Internships) */}
                {(formData.isInternship || formData.employmentType === 'Volunteer') && (
                  <div>
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700 mb-3">Compensation</legend>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        {[
                          { name: 'isPaid', label: 'Paid', checked: formData.isPaid },
                          { name: 'isUnpaid', label: 'Unpaid', checked: formData.isUnpaid }
                        ].map((option) => (
                          <label key={option.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                            <input
                              type="checkbox"
                              name={option.name}
                              checked={option.checked}
                              onChange={handleCheckboxChange}
                              className="w-4 h-4 text-[#0A3A4C] border-gray-300 rounded focus:ring-[#0A3A4C]"
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* Salary Range */}
                {!formData.isUnpaid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range {formData.isPaid ? '*' : '(Optional)'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <input
                          name="salaryMin"
                          type="number"
                          placeholder="Minimum"
                          value={formData.salaryMin}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                            errors.salaryRange ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <input
                          name="salaryMax"
                          type="number"
                          placeholder="Maximum"
                          value={formData.salaryMax}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                            errors.salaryRange ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                      >
                        <option value="per hour">per hour</option>
                        <option value="per week">per week</option>
                        <option value="per month">per month</option>
                        <option value="per year">per year</option>
                      </select>
                    </div>
                    {errors.salaryRange && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.salaryRange}
                      </p>
                    )}
                  </div>
                )}

                {/* Location Type */}
                <div>
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700 mb-3">Work Location</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'onSite', label: 'On-site', icon: <Building size={16} />, checked: formData.locationType.onSite },
                        { name: 'remote', label: 'Remote', icon: <Home size={16} />, checked: formData.locationType.remote },
                        { name: 'hybrid', label: 'Hybrid', icon: <Globe size={16} />, checked: formData.locationType.hybrid }
                      ].map((option) => (
                        <label key={option.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                          <input
                            type="checkbox"
                            name={option.name}
                            checked={option.checked}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-[#0A3A4C] border-gray-300 rounded focus:ring-[#0A3A4C]"
                          />
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span className="text-sm font-medium">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>

              {/* Requirements Section */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 dynamic-site-bg bg-opacity-10 rounded-lg flex items-center justify-center">
                    <FileText size={14} className="sm:size-4 text-[#0A3A4C]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Job Requirements</h3>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a brief overview of the position..."
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base resize-vertical ${
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

                {/* Responsibilities */}
                <div>
                  <label htmlFor="responsibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities*
                  </label>
                  <textarea
                    id="responsibility"
                    name="responsibility"
                    rows="6"
                    value={formData.responsibility}
                    onChange={handleInputChange}
                    placeholder="List the key responsibilities and duties..."
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base resize-vertical ${
                      errors.responsibility ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsibility && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={12} />
                      {errors.responsibility}
                    </p>
                  )}
                </div>

                {/* Qualifications */}
                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications*
                  </label>
                  <textarea
                    id="qualification"
                    name="qualification"
                    rows="6"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="List required qualifications and skills..."
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base resize-vertical ${
                      errors.qualification ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.qualification && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={12} />
                      {errors.qualification}
                    </p>
                  )}
                </div>

                {/* Additional Question */}
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Question (Optional)
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    rows="3"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Ask candidates a specific question about this role..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base resize-vertical"
                  />
                </div>
              </section>

              {/* Media Section */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 dynamic-site-bg bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Camera size={14} className="sm:size-4 text-[#0A3A4C]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Media & Attachments</h3>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image*
                  </label>
                  
                  {!formData.coverImage ? (
                    <div
                      onClick={() => document.getElementById('coverImageInput').click()}
                      className="group border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                      {uploadingCover ? (
                        <div className="flex items-center justify-center">
                          <Loader2 size={20} className="sm:size-6 animate-spin text-[#0A3A4C] mr-2" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 dynamic-site-bg bg-opacity-10 rounded-full flex items-center justify-center mx-auto group-hover:bg-opacity-20 transition-colors duration-200">
                            <Camera size={20} className="sm:size-6 text-[#0A3A4C]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload cover image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="coverImageInput"
                        name="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-32 sm:h-48 lg:h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full transition-colors duration-200"
                      >
                        <X size={14} className="sm:size-4" />
                      </button>
                    </div>
                  )}
                  
                  {errors.coverImage && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={12} />
                      {errors.coverImage}
                    </p>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Attachments*
                  </label>
                  
                  {formData.attachments.length === 0 ? (
                    <div
                      onClick={() => document.getElementById('attachmentsInput').click()}
                      className="group border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                      {uploadingAttachments ? (
                        <div className="flex items-center justify-center">
                          <Loader2 size={20} className="sm:size-6 animate-spin text-[#0A3A4C] mr-2" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 dynamic-site-bg bg-opacity-10 rounded-full flex items-center justify-center mx-auto group-hover:bg-opacity-20 transition-colors duration-200">
                            <Paperclip size={20} className="sm:size-6 text-[#0A3A4C]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload attachments</p>
                            <p className="text-xs text-gray-500">PDF, DOC, Images - Multiple files allowed</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="attachmentsInput"
                        name="attachments"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{formData.attachments.length} file(s) uploaded</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, attachments: [] }))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove all
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Paperclip size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-700 truncate">Attachment {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.attachments && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={12} />
                      {errors.attachments}
                    </p>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/home/jobs')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  <ArrowLeft size={16} />
                  <span>Cancel</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading || uploadingCover || uploadingAttachments}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Publish Job</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
