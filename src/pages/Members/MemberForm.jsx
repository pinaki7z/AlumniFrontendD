import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import baseUrl from '../../config';
import { 
  UserPlus, 
  Upload, 
  X, 
  Download, 
  Eye, 
  EyeOff,
  User,
  Mail,
  Lock,
  Building,
  Calendar,
  FileText,
  Shield,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Users,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const MemberForm = ({ edit }) => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    userType: '',
    batch: null,
    department: null,
    class: '',
    captchaToken: null,
  });
  const [errors, setErrors] = useState({});

  const handleReCaptcha = (token) => {
    setFormData((prev) => ({ ...prev, captchaToken: token }));
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: '' }));
    }
  };

  const handleCSVupload = async () => {
    const fileInput = document.getElementById('csv');
    if (!fileInput.files[0]) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploadingCSV(true);
    try {
      const data = new FormData();
      data.append('csv', fileInput.files[0]);

      await axios.post(`${process.env.REACT_APP_API_URL}/alumni/alumni/bulkRegister`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Users registered successfully!');
      setModalOpen(false);
      navigate('/home/members');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bulk upload failed');
    } finally {
      setUploadingCSV(false);
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i >= currentYear - 100; i--) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };

  const validate = () => {
    const errs = {};
    
    // Required field validation
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    
    // Email validation
    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email';
    }
    
    // Password validation
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.gender) errs.gender = 'Gender is required';
    if (!formData.userType) errs.userType = 'User type is required';

    // Conditional validation
    if (formData.userType && formData.userType !== 'Student') {
      if (!formData.department) errs.department = 'Department is required';
      if (formData.userType === 'Alumni' && !formData.batch) errs.batch = 'Batch is required';
    }
    
    if (formData.userType === 'Student' && !formData.class) {
      errs.class = 'Academic status is required';
    }
    
    if (!formData.captchaToken) errs.captcha = 'Please complete the CAPTCHA';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/alumni/register`, { ...formData });
      toast.success('Member registered successfully!');
      navigate('/home/members');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'Admin':
        return <Shield size={16} className="text-purple-600" />;
      case 'Student':
        return <GraduationCap size={16} className="text-green-600" />;
      case 'Alumni':
        return <Briefcase size={16} className="text-blue-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserPlus size={20} className="sm:size-6 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#136175]">
                    {edit ? 'Edit Member' : 'Create New Member'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#136175]/80">
                    {edit ? 'Update member information' : 'Add a new member to your community'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/home/members')}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm sm:text-base"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 text-sm sm:text-base"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Bulk Upload</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                      <Upload size={20} className="text-[#0A3A4C]" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Bulk Upload
                      </h2>
                      <p className="text-sm text-gray-600">For students</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">
                          CSV Format Required
                        </p>
                        <p className="text-sm text-blue-700">
                          Please upload a CSV file with columns: firstName, lastName, email, gender, userType, department, batch, class.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="csv"
                        id="csv"
                        accept=".csv"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <a
                      href="https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1746171609977-Book-_1_.csv"
                      download="sample_members.csv"
                      className="flex items-center gap-2 text-sm text-[#0A3A4C] hover:text-[#0A3A4C]/80 transition-colors duration-200"
                    >
                      <Download size={16} />
                      Download sample CSV file
                    </a>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCSVupload}
                      disabled={uploadingCSV}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingCSV ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Upload CSV</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                  <User size={16} className="text-[#0A3A4C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender*
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                  <Lock size={16} className="text-[#0A3A4C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff size={16} className="text-gray-400" />
                      ) : (
                        <Eye size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} className="text-gray-400" />
                      ) : (
                        <Eye size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-[#0A3A4C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Role</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select User Type*
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0].includes(profile.profileLevel) && (
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="Admin"
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all duration-200 ${
                        formData.userType === 'Admin'
                          ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        {getUserTypeIcon('Admin')}
                        <div>
                          <p className="font-medium text-gray-900">Admin</p>
                          <p className="text-sm text-gray-600">Full access rights</p>
                        </div>
                      </div>
                    </label>
                  )}
                  
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="Student"
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all duration-200 ${
                      formData.userType === 'Student'
                        ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {getUserTypeIcon('Student')}
                      <div>
                        <p className="font-medium text-gray-900">Student</p>
                        <p className="text-sm text-gray-600">Current student</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="Alumni"
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all duration-200 ${
                      formData.userType === 'Alumni'
                        ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {getUserTypeIcon('Alumni')}
                      <div>
                        <p className="font-medium text-gray-900">Alumni</p>
                        <p className="text-sm text-gray-600">Graduate member</p>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.userType && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-2">
                    <AlertCircle size={14} />
                    {errors.userType}
                  </p>
                )}
              </div>
            </div>

            {/* Academic Information */}
            {formData.userType && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                    <Building size={16} className="text-[#0A3A4C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                </div>

                {formData.userType !== 'Student' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department*
                      </label>
                      <select
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                          errors.department ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select department</option>
                        <option value="Agricultural Engineering">Agricultural Engineering</option>
                        <option value="Gastroenterology">Gastroenterology</option>
                        <option value="Indian languages">Indian Languages</option>
                        <option value="Neurosurgery">Neurosurgery</option>
                        <option value="Vocal Music">Vocal Music</option>
                      </select>
                      {errors.department && (
                        <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                          <AlertCircle size={14} />
                          {errors.department}
                        </p>
                      )}
                    </div>

                    {formData.userType === 'Alumni' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Batch*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={16} className="text-gray-400" />
                          </div>
                          <select
                            name="batch"
                            value={formData.batch || ''}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                              errors.batch ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select batch</option>
                            {generateYears().map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        {errors.batch && (
                          <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                            <AlertCircle size={14} />
                            {errors.batch}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Status*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="class"
                          value={formData.class || ''}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                            errors.class ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 1st Year, 2nd Year"
                        />
                      </div>
                      {errors.class && (
                        <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                          <AlertCircle size={14} />
                          {errors.class}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CAPTCHA */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-[#0A3A4C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Verification</h3>
              </div>

              <div className="flex justify-center">
                <div className="inline-block">
                  <ReCAPTCHA
                    sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM"
                    onChange={handleReCaptcha}
                  />
                  {errors.captcha && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-2">
                      <AlertCircle size={14} />
                      {errors.captcha}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/home/members')}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{edit ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{edit ? 'Update Member' : 'Create Member'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberForm;
