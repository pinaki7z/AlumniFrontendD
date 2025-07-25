// CreateNewsPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  ArrowLeft, Save, X, Plus, Tag, 
  Image as ImageIcon, AlertCircle, Zap, CheckCircle,
  Link as LinkIcon, FileText, Upload, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const CreateNewsPage = () => {
  const navigate = useNavigate();
  const profile = useSelector(state => state.profile);
  const fileInputRef = useRef(null);
  const additionalImagesRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '',
    content: '',
    metaDescription: '',
    featuredImage: '',
    additionalImages: [],
    tags: [],
    priority: 'medium',
    status: 'draft',
    externalLinks: [{ title: '', url: '' }],
    authorNote: '',
    readTime: '',
    targetAudience: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Categories for news
  const categories = [
    { value: 'achievements', label: 'Achievements' },
    { value: 'careers', label: 'Career News' },
    { value: 'academics', label: 'Academic Updates' },
    { value: 'alumni-spotlight', label: 'Alumni Spotlight' },
    { value: 'research', label: 'Research & Innovation' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'community', label: 'Community' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  };

  const formats = [
    'font', 'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video', 'blockquote', 'code-block'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Upload featured image
  const handleFeaturedImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('featuredImage', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/upload-featured-image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, featuredImage: result.imageUrl }));
        toast.success('Featured image uploaded successfully');
      } else {
        toast.error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload additional images
  const handleAdditionalImagesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const formDataObj = new FormData();
    files.forEach(file => {
      formDataObj.append('additionalImages', file);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/upload-additional-images`, {
        method: 'POST',
        body: formDataObj
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, ...result.imageUrls]
        }));
        toast.success(`${result.imageUrls.length} images uploaded successfully`);
      } else {
        toast.error(result.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeAdditionalImage = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addExternalLink = () => {
    setFormData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { title: '', url: '' }]
    }));
  };

  const updateExternalLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeExternalLink = (index) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Strip HTML tags to get plain text for validation
    const plainTextContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!plainTextContent) newErrors.content = 'Content is required';
    if (plainTextContent.length < 100) newErrors.content = 'Content must be at least 100 characters';
    
    if (!formData.metaDescription.trim()) newErrors.metaDescription = 'Meta description is required';
    if (formData.metaDescription.length > 160) newErrors.metaDescription = 'Meta description must be less than 160 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status) => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const newsData = {
        ...formData,
        status,
        authorId: profile._id,
        authorName: `${profile.firstName} ${profile.lastName}`,
        authorEmail: profile.email
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        navigate('/home/news');
      } else {
        toast.error(result.message || 'Failed to create news article');
      }
      
    } catch (error) {
      console.error('Error submitting news:', error);
      toast.error('Failed to create news article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentCharCount = () => {
    return formData.content.replace(/<[^>]*>/g, '').length;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/home/news')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0A3A4C] transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to News</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create News Article</h1>
          </div>
          
          {/* Action Buttons - Right aligned */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              <Save size={16} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Publish Now
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              
              {/* Basic Information */}
              <div className="space-y-6">
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling title for your news article"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle / Summary
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Brief summary that will appear below the title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0A3A4C] transition-colors duration-200">
                    {formData.featuredImage ? (
                      <div className="relative">
                        <img
                          src={formData.featuredImage}
                          alt="Featured"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Upload a featured image for your article</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={16} />
                              Choose Image
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Rich Text Editor for Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content *
                  </label>
                  <div className={`border rounded-lg ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
                    <ReactQuill
                      value={formData.content}
                      onChange={(content) => handleInputChange('content', content)}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your article content here. Use the toolbar to format your text..."
                      theme="snow"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {errors.content && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.content}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {getContentCharCount()} characters
                    </p>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description * (SEO)
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="Brief description for search engines (max 160 characters)"
                    rows="3"
                    maxLength="160"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 ${
                      errors.metaDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.metaDescription && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.metaDescription}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A3A4C] text-white rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags (press Enter to add)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Tag size={16} />
                    </button>
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Gallery)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {formData.additionalImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => additionalImagesRef.current?.click()}
                    disabled={uploadingImages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Images
                      </>
                    )}
                  </button>
                  <input
                    ref={additionalImagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-6">
              
              {/* Publishing Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[#0A3A4C]" />
                  Publishing Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Read Time (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => handleInputChange('readTime', e.target.value)}
                      placeholder="e.g., 5 min read"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                    >
                      <option value="">All Alumni</option>
                      <option value="recent-graduates">Recent Graduates</option>
                      <option value="experienced-professionals">Experienced Professionals</option>
                      <option value="entrepreneurs">Entrepreneurs</option>
                      <option value="students">Current Students</option>
                      <option value="faculty">Faculty & Staff</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* External Links */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LinkIcon size={18} className="text-[#0A3A4C]" />
                  External Links
                </h3>
                
                <div className="space-y-3">
                  {formData.externalLinks.map((link, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateExternalLink(index, 'title', e.target.value)}
                          placeholder="Link title"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateExternalLink(index, 'url', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                        />
                      </div>
                      {formData.externalLinks.length > 1 && (
                        <button
                          onClick={() => removeExternalLink(index)}
                          className="mt-2 text-red-600 text-sm hover:text-red-800 transition-colors duration-200"
                        >
                          Remove Link
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={addExternalLink}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Plus size={16} />
                    Add Link
                  </button>
                </div>
              </div>

              {/* Author Note */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[#0A3A4C]" />
                  Author Note
                </h3>
                
                <textarea
                  value={formData.authorNote}
                  onChange={(e) => handleInputChange('authorNote', e.target.value)}
                  placeholder="Add a personal note or call-to-action for readers"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
              </div>

              {/* Status Indicator */}
              <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg shadow-sm p-4 sm:p-6 text-white">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Article Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Title:</span>
                    <span className={formData.title ? 'text-green-300' : 'text-yellow-300'}>
                      {formData.title ? '✓ Complete' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className={formData.category ? 'text-green-300' : 'text-yellow-300'}>
                      {formData.category ? '✓ Complete' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content:</span>
                    <span className={getContentCharCount() >= 100 ? 'text-green-300' : 'text-yellow-300'}>
                      {getContentCharCount() >= 100 ? '✓ Complete' : `⚠ ${100 - getContentCharCount()} chars needed`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meta Description:</span>
                    <span className={formData.metaDescription ? 'text-green-300' : 'text-yellow-300'}>
                      {formData.metaDescription ? '✓ Complete' : '⚠ Required'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsPage;
