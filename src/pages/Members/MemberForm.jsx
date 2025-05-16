import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import baseUrl from '../../config';

const MemberForm = ({ edit }) => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
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
  };

  const handleCSVupload = async () => {
    try {
      const fileInput = document.getElementById('csv');
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
    if (!formData.password) errs.password = 'Password is required';
    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.gender) errs.gender = 'Gender is required';
    if (!formData.userType) errs.userType = 'User type is required';

    if (formData.userType && formData.userType !== 'Student') {
      if (!formData.department) errs.department = 'Department is required';
      if (!formData.batch) errs.batch = 'Batch is required';
    }
    if (formData.userType === 'Student') {
      if (!formData.class) errs.class = 'Class is required';
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

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/alumni/register`, { ...formData });
      toast.success('Member registered successfully!');
      navigate('/home/members');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="my-8 mx-10 bg-white rounded-lg">
      
      <div className='flex justify-between items-center mb-4'>
      <h1 className='text-2xl md:text-3xl font-bold mb-4'>{edit ? 'Edit Member' : 'Create a New Member'}</h1>
      <div>
        <button onClick={() => setModalOpen(true)} className="bg-[#0A3A4C] text-white px-4 py-2 rounded hover:bg-[#0A3A4C]">
          Bulk Upload
        </button>
      </div>
      </div>
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg p-4 mx-auto  w-1/2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Bulk Upload</h2>
              <p className="mb-4">
                Please upload a CSV file with the following columns: firstName, lastName, email, gender, userType, department, batch, class.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium mb-2">Upload .csv file</label>
              <input type="file" name="csv" id="csv" className="block w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C]" />
            
              <a
                href={`https://generalbuckethai.s3.ap-south-1.amazonaws.com/2025/may/1746171609977-Book-_1_.csv`}
                download="Book-_1_.csv"
                className="block mt-2 text-lg text-gray-700 underline hover:text-gray-900"
              >
                Download sample .csv file
              </a>
            </div>
            <div className='flex justify-end'>
            <button
                onClick={handleCSVupload}
                className="bg-[#0A3A4C] text-white px-4 py-2 rounded hover:bg-[#0A3A4C]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">First Name*</label>
            <input
              name="firstName"
              onChange={handleChange}
              value={formData.firstName}
              className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name*</label>
            <input
              name="lastName"
              onChange={handleChange}
              value={formData.lastName}
              className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email & Gender */}
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className="block text-sm font-medium">Email*</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Gender*</label>
            <select
              name="gender"
              onChange={handleChange}
              value={formData.gender}
              className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Password*</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password*</label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* User Type */}
        <div>
          <p className="text-sm font-medium mb-3">User Type*</p>
          <div className="flex space-x-2">
            {[0].includes(profile.profileLevel) && (
              <label>
                <input
                  type="radio"
                  name="userType"
                  value="Admin"
                  className="hidden"
                  onChange={handleChange}
                />
                <span
                  className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border ${
                    formData.userType === 'Admin'
                      ? 'bg-[#0A3A4C] text-white'
                      : 'border-[#0A3A4C] bg-white text-[#0A3A4C] hover:bg-gray-100'
                  }`}
                >
                  Admin
                </span>
              </label>
            )}
            <label>
              <input
                type="radio"
                name="userType"
                value="Student"
                className="hidden"
                onChange={handleChange}
              />
              <span
                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border ${
                  formData.userType === 'Student'
                    ? 'bg-[#0A3A4C] text-white'
                    : 'border-[#0A3A4C] bg-white text-[#0A3A4C] hover:bg-gray-100'
                }`}
              >
                Student
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="Alumni"
                className="hidden"
                onChange={handleChange}
              />
              <span
                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border ${
                  formData.userType === 'Alumni'
                    ? 'bg-[#0A3A4C] text-white'
                    : 'border-[#0A3A4C] bg-white text-[#0A3A4C] hover:bg-gray-100'
                }`}
              >
                Alumni
              </span>
            </label>
          </div>
          {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType}</p>}
        </div>

        {/* Department & Batch or Class */}
        {formData.userType && formData.userType !== 'Student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Department*</label>
              <select
                name="department"
                onChange={handleChange}
                value={formData.department || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
              >
                <option value="">Select Department</option>
                <option>Agricultural Engineering</option>
                <option>Gastroenterology</option>
                <option>Indian languages</option>
                <option>Neurosurgery</option>
                <option>Vocal Music</option>
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Batch*</label>
              <select
                name="batch"
                onChange={handleChange}
                value={formData.batch || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
              >
                <option value="">Select Batch</option>
                {generateYears().map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
            </div>
          </div>
        )}
        {formData.userType === 'Student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Academic Status*</label>
              <input
                type="text"
                name="class"
                onChange={handleChange}
                value={formData.class || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-[#0A3A4C] focus:border-[#0A3A4C] p-2 text-sm"
                min={1}
                max={13}
              />
              {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
            </div>
          </div>
        )}

        {/* CAPTCHA */}
        <div className="pt-2">
          <ReCAPTCHA sitekey="6LdPzXgqAAAAACrakqqSjHvl4XIVyec6u1UimfSM" onChange={handleReCaptcha} />
          {errors.captcha && <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>}
        </div>

        {/* Submit Button */}
        <div className='flex justify-end pt-2'>
          <button
            type="submit"
            className="py-2 px-3 bg-[#0A3A4C] text-white font-medium rounded hover:bg-blue-900 active:bg-blue-950 text-base"
          >
            {edit ? 'Update Member' : 'Register Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
