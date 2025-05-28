import React, { useState } from 'react';
import FrameComponent1 from "../../components/FrameComponent/FrameComponent1.jsx";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import baseUrl from "../../config.js";
import ReCAPTCHA from "react-google-recaptcha";
import io from "../../images/logo-io.png";


const RegisterPage = () => {
  const navigateTo = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    gender: '', department: '', graduatingYear: '', batch: '', accept: false, captchaToken: null, userType: 'alumni'
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
    try {
      const response = await axios.post(`http://localhost:5000/alumni/register`, formData);
      // const response = await axios.post(`${process.env.REACT_APP_API_URL}/alumni/register`, formData);
      toast.success("User Registered successfully!");
      navigateTo('/login');
    } catch (error) {
      toast.error(error.response?.data || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => `${currentYear - 1 - i}-${currentYear - i}`);
  };
  const generateGraduatingYears = () => {
    const currentYear = new Date().getFullYear();
    return ['Graduated', ...Array.from({ length: 101 }, (_, i) => currentYear - i)];
  };

  return (
    <>

      <div className="relative min-h-screen">
        <img
          src="/v2/loginBg.webp"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover brightness-[1.5] filter opacity-50 blur-xl"
        />

        <div className="min-h-screen relative flex flex-col items-center justify-center  p-4 ">
                      <img src={io} alt="InsideOut Logo" className="w-[200px] mb-8 " />

          {/* Panels Container */}
          <div className="relative flex w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden">
            
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-[#0a3a4c] text-white flex-col justify-center items-center p-8 space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold">Welcome to</h2>
              <h2 className="text-5xl md:text-6xl font-bold uppercase">Alumnify</h2>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 bg-gray-50 px-4 py-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">Create an account</h1>
                  <p className="text-sm text-gray-500">(All fields are mandatory)</p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      name="firstName"
                      onChange={handleChange}
                      required
                      placeholder="Enter First Name"
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      name="lastName"
                      onChange={handleChange}
                      required
                      placeholder="Enter Last Name"
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    required
                    placeholder="Enter Email Address"
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      name="password"
                      type="password"
                      onChange={handleChange}
                      required
                      placeholder="Enter Password"
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      onChange={handleChange}
                      required
                      placeholder="Confirm Password"
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Select Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      onChange={handleChange}
                      required
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none"
                    >
                      <option value="" disabled selected>Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department"
                      onChange={handleChange}
                      required
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none"
                    >
                      <option value="" disabled selected>Select Department</option>
                      <option>Agricultural Engineering</option>
                      <option>Gastroenterology</option>
                      <option>Indian languages</option>
                      <option>Neurosurgery</option>
                      <option>Vocal Music</option>
                    </select>
                  </div>
                </div>

                {/* Year & Batch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Graduating Year</label>
                    <select
                      name="graduatingYear"
                      onChange={handleChange}
                      required
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none"
                    >
                      <option value="" disabled selected>Select Graduating Year</option>
                      {generateGraduatingYears().map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Batch</label>
                    <select
                      name="batch"
                      onChange={handleChange}
                      required
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none"
                    >
                      <option value="" disabled selected>Select Batch</option>
                      {generateYears().map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* reCAPTCHA */}
                <ReCAPTCHA sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM" onChange={handleReCaptcha} />

                {/* Terms & Privacy */}
                <div className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="accept"
                    checked={formData.accept}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="accept" className="text-gray-700">By creating your account, you agree to our</label>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg text-lg font-medium"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>

                <div className="text-center text-sm mt-2">
                  <span className="text-gray-600">Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('/login')}
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    Login
                  </button>
                </div>
              </form>

              {/* Privacy Policy Modal */}
              {showPrivacyPolicy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
                    <div className="space-y-4 text-sm">
                      <p>
                        At <strong>Alumnify</strong>, we collect personal information such as your name, email address, gender, graduation details, and department to create your alumni profile and provide personalized services. This data helps us connect you with fellow alumni, notify you about events, and enhance networking opportunities. We do not sell or share your personal data with third parties for marketing purposes. All data is securely stored, and we take strong measures to prevent unauthorized access.
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
                    <div className="mt-6 text-right">
                      <button
                        onClick={() => setShowPrivacyPolicy(false)}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
