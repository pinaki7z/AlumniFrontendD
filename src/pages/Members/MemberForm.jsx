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

  // ... (all your existing functions remain the same)
  
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
    
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    
    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email';
    }
    
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
    <div className="bg-gray-50">
      {/* Removed min-h-screen and fixed container height */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
              <UserPlus size={16} className="sm:size-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {edit ? 'Edit Member' : 'Create Member'}
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/home/members')}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
            >
              <Upload size={14} />
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>

        {/* Modal remains the same */}
        {modalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
    <div className="bg-white rounded-xl w-full max-w-md">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 dynamic-site-bg rounded-lg flex items-center justify-center">
              <Upload size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bulk Upload</h2>
              <p className="text-sm text-gray-600">For students and alumni</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">CSV Format Required</p>
                <p className="text-xs text-blue-700">
                  Required columns: firstName*, lastName*, email*, type* (Student/Alumni), batch*
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select CSV File
            </label>
            <input
              type="file"
              name="csv"
              id="csv"
              accept=".csv"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] text-sm"
            />
          </div>

          <div className="text-center">
            <a
              href="/sample_bulk_upload.csv"
              download="sample_bulk_upload.csv"
              className="inline-flex items-center gap-1 text-sm text-[#0A3A4C] hover:text-[#0A3A4C]/80 transition-colors duration-200"
            >
              <Download size={14} />
              Download sample CSV
            </a>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCSVupload}
              disabled={uploadingCSV}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {uploadingCSV ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
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


        {/* Form Container - Removed excessive padding and height constraints */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
            {/* Personal Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Security Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={14} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
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
                        <EyeOff size={14} className="text-gray-400" />
                      ) : (
                        <Eye size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
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
                      <Lock size={14} className="text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
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
                        <EyeOff size={14} className="text-gray-400" />
                      ) : (
                        <Eye size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">User Role</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User Type*
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[0].includes(profile.profileLevel) && (
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="Admin"
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`flex items-center gap-2 p-2.5 border-2 rounded-lg transition-all duration-200 ${
                        formData.userType === 'Admin'
                          ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        {getUserTypeIcon('Admin')}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Admin</p>
                          <p className="text-xs text-gray-600">Full access</p>
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
                    <div className={`flex items-center gap-2 p-2.5 border-2 rounded-lg transition-all duration-200 ${
                      formData.userType === 'Student'
                        ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {getUserTypeIcon('Student')}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Student</p>
                        <p className="text-xs text-gray-600">Current student</p>
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
                    <div className={`flex items-center gap-2 p-2.5 border-2 rounded-lg transition-all duration-200 ${
                      formData.userType === 'Alumni'
                        ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {getUserTypeIcon('Alumni')}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Alumni</p>
                        <p className="text-xs text-gray-600">Graduate</p>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.userType && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="flex-shrink-0" />
                    {errors.userType}
                  </p>
                )}
              </div>
            </div>

            {/* Academic Information */}
            {formData.userType && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building size={12} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Academic Information</h3>
                </div>

                {formData.userType !== 'Student' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department*
                      </label>
                      <select
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
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
                        <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <AlertCircle size={12} className="flex-shrink-0" />
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
                            <Calendar size={14} className="text-gray-400" />
                          </div>
                          <select
                            name="batch"
                            value={formData.batch || ''}
                            onChange={handleChange}
                            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
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
                          <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertCircle size={12} className="flex-shrink-0" />
                            {errors.batch}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Status*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="class"
                          value={formData.class || ''}
                          onChange={handleChange}
                          className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                            errors.class ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 1st Year, 2nd Year"
                        />
                      </div>
                      {errors.class && (
                        <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <AlertCircle size={12} className="flex-shrink-0" />
                          {errors.class}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CAPTCHA - Reduced spacing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Security Verification</h3>
              </div>

              <div className="flex justify-center py-2">
                <div className="w-full max-w-sm mx-auto">
                  <div className="transform scale-90 origin-center">
                    <ReCAPTCHA
                      sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM"
                      onChange={handleReCaptcha}
                    />
                  </div>
                  {errors.captcha && (
                    <p className="flex items-center justify-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {errors.captcha}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button - Removed excessive spacing */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/home/members')}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{edit ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
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
