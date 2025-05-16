import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import baseUrl from '../../../config.js';
import { toast } from 'react-toastify';
import axios from 'axios';
import { lineSpinner } from 'ldrs';
import { useNavigate } from 'react-router-dom';

lineSpinner.register();

export const CreateJob = () => {
    const navigate = useNavigate()
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRadioChange = (e) => {
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
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'isJob' || name === 'isInternship') {
      // Ensure only one of job or internship
      const other = name === 'isJob' ? 'isInternship' : 'isJob';
      setFormData((prev) => ({ ...prev, [name]: checked, [other]: !checked }));
    } else if (name === 'isPaid' || name === 'isUnpaid') {
      const other = name === 'isPaid' ? 'isUnpaid' : 'isPaid';
      setFormData((prev) => ({ ...prev, [name]: checked, [other]: false }));
      if (name === 'isUnpaid' && checked) {
        setFormData((prev) => ({ ...prev, salaryMin: '', salaryMax: '' }));
      }
    } else if (['onSite', 'remote', 'hybrid'].includes(name)) {
      // Only one location type
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
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'coverImage') {
      setFormData((prev) => ({ ...prev, coverImage: files[0] }));
      setErrors((prev) => ({ ...prev, coverImage: '' }));
    } else if (name === 'attachments') {
      setFormData((prev) => ({ ...prev, attachments: Array.from(files) }));
      setErrors((prev) => ({ ...prev, attachments: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.responsibility.trim()) errs.responsibility = 'responsibility is required';
    if (!formData.qualification.trim()) errs.qualification = 'qualification is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.applyBy) errs.applyBy = 'Apply-by date is required';
    if (!formData.company.trim()) errs.company = 'Company name is required';
    if (formData.isJob && !formData.employmentType) errs.employmentType = 'Employment type is required';
    if ((formData.isInternship || formData.isPaid || formData.isUnpaid) && formData.isPaid && (!formData.salaryMin || !formData.salaryMax)) {
      errs.salaryRange = 'Salary range is required for paid roles';
    }
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.coverImage) errs.coverImage = 'Cover image is required';
    if (formData.attachments.length === 0) errs.attachments = 'At least one attachment is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Upload cover image
    const imgForm = new FormData();
    imgForm.append('image', formData.coverImage);
    try {
      const imgRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
        imgForm,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const coverUrl = imgRes.data.imageUrl;

      // Upload attachments
      const attachForm = new FormData();
      formData.attachments.forEach((file) => attachForm.append('images', file));
      const attachRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/image`,
        attachForm,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const attachmentUrls = attachRes.data;

      // Prepare payload
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
        coverImage: coverUrl,
        attachments: attachmentUrls,
        qualification: formData.qualification,
        responsibility: formData.responsibility
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (response.ok) {
        toast.success(`${payload.type} post is being validated`);
        navigate('/home/jobs')
      } else {
        const errorData = await response.json();
        console.error('Publish failed', errorData);
        toast.error('Failed to publish.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during upload.');
    }

    setLoading(false);
  };

  return (
    <div className="mx-3 p-6 bg-white rounded-lg ">
      <h2 className="text-2xl font-semibold mb-6">Create A Job</h2>
      <form onSubmit={handlePublish} noValidate>
        {/* Title & Location */}
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title*</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} p-2`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location*</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} p-2`}
            />
            {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* Company Type */}
        <fieldset className="mb-4">
          <legend className="text-sm font-medium text-gray-700">I am hiring for*</legend>
          <div className="flex space-x-6 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="companyType"
                value="myCompany"
                checked={formData.companyType === 'myCompany'}
                onChange={handleRadioChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">My company</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="companyType"
                value="otherCompany"
                checked={formData.companyType === 'otherCompany'}
                onChange={handleRadioChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">Other company</span>
            </label>
          </div>
        </fieldset>

        {/* Company Name */}
        <div className="mb-4">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company*</label>
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleInputChange}
            disabled={formData.companyType === 'myCompany'}
            className={`mt-1 block w-full rounded-md border ${errors.company ? 'border-red-500' : 'border-gray-300'} p-2 ${formData.companyType === 'myCompany' && 'bg-gray-100'}`}
          />
          {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company}</p>}
        </div>

         {/* Apply By */}
         <div className="mb-4">
          <label htmlFor="applyBy" className="block text-sm font-medium text-gray-700">Apply By*</label>
          <input
            id="applyBy"
            name="applyBy"
            type="date"
            value={formData.applyBy}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.applyBy ? 'border-red-500' : 'border-gray-300'} p-2`}
          />
          {errors.applyBy && <p className="text-red-600 text-sm mt-1">{errors.applyBy}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="responsibility" className="block text-sm font-medium text-gray-700">Responsibilities*</label>
          <textarea
            id="responsibility"
            name="responsibility"
            value={formData.responsibility}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.responsibility ? 'border-red-500' : 'border-gray-300'} p-2`}
            rows={10}
          />
          {errors.responsibility && <p className="text-red-600 text-sm mt-1">{errors.responsibility}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification *</label>
          <textarea
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.qualification ? 'border-red-500' : 'border-gray-300'} p-2`}
            rows={6}
          />
          {errors.qualification && <p className="text-red-600 text-sm mt-1">{errors.qualification}</p>}
        </div>

        {/* Salary & Currency & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Salary Range {formData.isUnpaid && '(Unpaid)'}</label>
            <div className="flex space-x-2 mt-1">
              <input
                name="salaryMin"
                type="number"
                placeholder="Min"
                value={formData.salaryMin}
                onChange={handleInputChange}
                disabled={formData.isUnpaid}
                className={`w-1/2 rounded-md border ${errors.salaryRange ? 'border-red-500' : 'border-gray-300'} p-2`}
              />
              <input
                name="salaryMax"
                type="number"
                placeholder="Max"
                value={formData.salaryMax}
                onChange={handleInputChange}
                disabled={formData.isUnpaid}
                className={`w-1/2 rounded-md border ${errors.salaryRange ? 'border-red-500' : 'border-gray-300'} p-2`}
              />
            </div>
            {errors.salaryRange && <p className="text-red-600 text-sm mt-1">{errors.salaryRange}</p>}
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleSelectChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            >
              <option>INR</option>
              <option>USD</option>
              <option>JPY</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleSelectChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            >
              <option>per hour</option>
              <option>per week</option>
              <option>per month</option>
              <option>per year</option>
            </select>
          </div>
        </div>

        {/* Job/Internship Checkboxes */}
        <div className="flex space-x-6 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isJob"
              checked={formData.isJob}
              onChange={handleCheckboxChange}
              className="form-checkbox text-blue-600"
            />
            <span className="ml-2">Job</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isInternship"
              checked={formData.isInternship}
              onChange={handleCheckboxChange}
              className="form-checkbox text-blue-600"
            />
            <span className="ml-2">Internship</span>
          </label>
        </div>

        {/* Employment Type */}
        {formData.isJob && (
          <div className="mb-4">
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">Employment Type*</label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleSelectChange}
              className={`mt-1 block w-full rounded-md border ${errors.employmentType ? 'border-red-500' : 'border-gray-300'} p-2`}
            >
              <option value="">Select type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Volunteer</option>
              <option>Contract</option>
            </select>
            {errors.employmentType && <p className="text-red-600 text-sm mt-1">{errors.employmentType}</p>}
          </div>
        )}

        {/* Paid/Unpaid */}
        {(formData.isInternship || formData.employmentType === 'Volunteer') && (
          <div className="flex space-x-6 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleCheckboxChange}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">Paid</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isUnpaid"
                checked={formData.isUnpaid}
                onChange={handleCheckboxChange}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">Unpaid</span>
            </label>
          </div>
        )}

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleSelectChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          >
            <option>Other</option>
            <option>Admin & Office</option>
            <option>Art & Design</option>
            <option>Business Operations</option>
            <option>Healthcare</option>
            <option>Management</option>
            <option>Retail & Sales</option>
          </select>
        </div>

        {/* Location Type */}
        <fieldset className="mb-4">
          <legend className="text-sm font-medium text-gray-700">Location Type</legend>
          <div className="flex space-x-6 mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="onSite"
                checked={formData.locationType.onSite}
                onChange={handleCheckboxChange}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">On-site</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remote"
                checked={formData.locationType.remote}
                onChange={handleCheckboxChange}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">Remote</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="hybrid"
                checked={formData.locationType.hybrid}
                onChange={handleCheckboxChange}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2">Hybrid</span>
            </label>
          </div>
        </fieldset>

        {/* Question Accordion */}
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">Add a question (optional)</label>
          <textarea
            id="question"
            name="question"
            rows="3"
            value={formData.question}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description*</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-2`}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Cover Image */}
        <div className="mb-4">
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Cover Image*</label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900"
          />
          {errors.coverImage && <p className="text-red-600 text-sm mt-1">{errors.coverImage}</p>}
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">Attachments*</label>
          <input
            id="attachments"
            name="attachments"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900"
          />
          {errors.attachments && <p className="text-red-600 text-sm mt-1">{errors.attachments}</p>}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};
