import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { 
  User, 
  Mail, 
  Lock, 
  Users, 
  GraduationCap, 
  Calendar,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Shield,
  FileText,
  X,
  Star
} from 'lucide-react';

const RegisterPage = () => {
  const navigateTo = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    gender: '', startingYear: '', graduatingYear: '', accept: false, captchaToken: null, userType: 'alumni'
  });

  const handleReCaptcha = (token) => setFormData({ ...formData, captchaToken: token });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.captchaToken) {
      toast.error("Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }
    
    if (!formData.accept) {
      toast.error("You must accept the terms and conditions to register.");
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validate years
    if (formData.startingYear && formData.graduatingYear) {
      if (parseInt(formData.startingYear) >= parseInt(formData.graduatingYear)) {
        toast.error("Starting year must be before graduating year.");
        setLoading(false);
        return;
      }
    }
    
    try {
      // Combine starting and graduating year to create batch
      const batch = `${formData.startingYear}-${formData.graduatingYear}`;
      
      const submitData = {
        ...formData,
        batch: batch
      };
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/alumni/register`, submitData);
      toast.success("Registration successful! Please login to continue.");
      navigateTo('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => currentYear - i);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/v2/loginBg.webp"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3A4C]/90 via-[#174873]/80 to-[#71be95]/70"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden relative min-h-screen flex flex-col py-4 px-2">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <button 
            onClick={() => navigateTo('/login')}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img 
            src="/v2/logo2.png" 
            alt="Logo" 
            className="w-[200px] h-auto drop-shadow-2xl" 
          />
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Mobile Form */}
        <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold dynamic-site-bg bg-clip-text text-transparent">
              Join Alumnify
            </h1>
            <p className="text-gray-600 text-sm mt-1">Create your alumni account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile form fields with compact design */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                <input
                  name="firstName"
                  onChange={handleChange}
                  required
                  placeholder="First Name"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                <input
                  name="lastName"
                  onChange={handleChange}
                  required
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={passwordVisible ? 'text' : 'password'}
                    onChange={handleChange}
                    required
                    placeholder="Password"
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {passwordVisible ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    onChange={handleChange}
                    required
                    placeholder="Confirm"
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {confirmPasswordVisible ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] bg-white text-sm"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Starting Year</label>
                <select
                  name="startingYear"
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] bg-white text-sm"
                >
                  <option value="">Select</option>
                  {generateYears().map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Graduating Year</label>
                <select
                  name="graduatingYear"
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#71be95] bg-white text-sm"
                >
                  <option value="">Select</option>
                  {generateYears().map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Show batch preview if both years are selected */}
            {formData.startingYear && formData.graduatingYear && (
              <div className="p-3 bg-[#71be95]/10 rounded-lg border border-[#71be95]/20">
                <div className="text-sm font-medium text-[#0A3A4C]">
                  Batch: {formData.startingYear}-{formData.graduatingYear}
                </div>
              </div>
            )}

            {/* Mobile reCAPTCHA */}
            <div className="flex justify-center py-2">
              <ReCAPTCHA 
                sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM" 
                onChange={handleReCaptcha}
                size="compact"
              />
            </div>

            {/* Mobile Terms */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="accept"
                checked={formData.accept}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-[#71be95] border-gray-300 rounded"
                required
              />
              <label className="text-xs text-gray-700">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="text-[#71be95] hover:underline font-medium"
                >
                  Terms & Privacy Policy
                </button>
              </label>
            </div>

            {/* Mobile Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="text-[#71be95] font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 min-h-[700px]">
          <div className="flex h-full">
            {/* Left Panel - Features with Logo */}
            <div className="w-2/5 bg-gradient-to-br from-[#0A3A4C] to-[#174873] text-white relative overflow-hidden flex flex-col">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#71be95] rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 right-20 w-16 h-16 bg-white rounded-full blur-xl"></div>
              </div>
              
              {/* Logo */}
              <div className="relative z-10 p-4 text-center">
                <img 
                  src="/v2/logo2.png" 
                  alt="Logo" 
                  className="w-[250px] mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300" 
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col justify-center px-10 space-y-8">
                <div className="text-start space-y-4">
                  <h2 className="text-2xl  font-medium">Welcome to</h2>
                  <h1 className="text-5xl font-bold">ALUMNIFY</h1>
                  <p className="text-white/90 text-lg">Join thousands of successful alumni</p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    { icon: Users, text: "Connect with fellow alumni" },
                    { icon: Star, text: "Build your professional network" },
                    { icon: GraduationCap, text: "Share your success story" },
                    { icon: Shield, text: "Secure and verified platform" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/90">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="w-3/5 p-8 overflow-y-auto max-h-[700px] custom-scrollbar">
              <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
                  <p className="text-gray-600">Join the alumni community today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="firstName"
                          onChange={handleChange}
                          required
                          placeholder="Enter First Name"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="lastName"
                          onChange={handleChange}
                          required
                          placeholder="Enter Last Name"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="password"
                          type={passwordVisible ? 'text' : 'password'}
                          onChange={handleChange}
                          required
                          placeholder="Create password"
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#71be95]"
                        >
                          {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="confirmPassword"
                          type={confirmPasswordVisible ? 'text' : 'password'}
                          onChange={handleChange}
                          required
                          placeholder="Confirm password"
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#71be95]"
                        >
                          {confirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 bg-white transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Year Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Year</label>
                      <select
                        name="startingYear"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 bg-white transition-all duration-200"
                      >
                        <option value="">Select Starting Year</option>
                        {generateYears().map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Graduating Year</label>
                      <select
                        name="graduatingYear"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#71be95] focus:ring-2 focus:ring-[#71be95]/20 bg-white transition-all duration-200"
                      >
                        <option value="">Select Graduating Year</option>
                          {generateYears().map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Show batch preview if both years are selected */}
                  {formData.startingYear && formData.graduatingYear && (
                    <div className="p-4 bg-[#71be95]/10 rounded-xl border border-[#71be95]/20">
                      <div className="text-sm font-medium text-[#0A3A4C] flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Batch: {formData.startingYear}-{formData.graduatingYear}
                      </div>
                    </div>
                  )}

                  {/* reCAPTCHA */}
                  <div className="flex justify-center py-4">
                    <ReCAPTCHA 
                      sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM" 
                      onChange={handleReCaptcha}
                    />
                  </div>

                  {/* Terms & Privacy */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="accept"
                      checked={formData.accept}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-[#71be95] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#71be95]/20"
                      required
                    />
                    <label className="text-sm text-gray-700">
                      By creating your account, you agree to our{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyPolicy(true)}
                        className="text-[#71be95] hover:text-[#5fa080] font-semibold hover:underline transition-colors"
                      >
                        Terms & Privacy Policy
                      </button>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#71be95] to-[#5fa080] hover:from-[#5fa080] hover:to-[#71be95] text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>

                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigateTo('/login')}
                        className="text-[#71be95] hover:text-[#5fa080] font-semibold hover:underline transition-colors"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="dynamic-site-bg text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Privacy Policy</h2>
                </div>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 text-sm overflow-y-auto max-h-[60vh] custom-scrollbar">
              <p>
                At <strong>Alumnify</strong>, we collect personal information such as your name, email address, gender, graduation details, and batch information to create your alumni profile and provide personalized services. This data helps us connect you with fellow alumni, notify you about events, and enhance networking opportunities. We do not sell or share your personal data with third parties for marketing purposes. All data is securely stored, and we take strong measures to prevent unauthorized access.
              </p>
              <p>
                If you are a resident of the <strong>European Economic Area (EEA)</strong>, your data is protected under the <strong>General Data Protection Regulation (GDPR)</strong>. You have the right to access, modify, or delete your personal data at any time. Additionally, you can request a copy of your stored data or withdraw consent for data processing by contacting us. We ensure that your data is processed lawfully, transparently, and for legitimate purposes.
              </p>
              <p>
                To improve user experience, <strong>Alumnify</strong> may use third-party services for authentication, analytics, and security. These services comply with strict data protection policies and do not misuse your personal information. However, we encourage you to review their privacy policies when interacting with external services through our platform. Any third-party integration will be disclosed, and users will have the option to opt-out if desired.
              </p>
              <p>
                We may update this <strong>Privacy Policy</strong> periodically to reflect changes in our services or legal requirements. Users will be notified of any significant modifications. Your continued use of <strong>Alumnify</strong> after these updates implies acceptance of the revised policy.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="px-6 py-2 bg-gradient-to-r from-[#71be95] to-[#5fa080] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #71be95 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #71be95, #5fa080);
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #5fa080, #4d8a66);
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
