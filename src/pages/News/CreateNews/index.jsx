import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CKeditor from '../../../components/CKeditor/CKeditor.jsx';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Newspaper, 
  ArrowLeft, 
  Save, 
  Edit, 
  User, 
  FileText, 
  Image, 
  AlertCircle, 
  Upload, 
  X, 
  Eye, 
  Calendar, 
  Tag,
  Loader2,
  CheckCircle,
  Camera,
  Clock,
  Globe,
  Settings,
  Book,
  Trophy,
  Users,
  Bell
} from 'lucide-react';

export const CreateNews = () => {
  const profile = useSelector((state) => state.profile);
  const { id } = useParams();
  const navigateTo = useNavigate();
  
  const [newsData, setNewsData] = useState({
    userId: profile._id,
    title: '',
    description: '',
    author: '',
    picture: '',
    category: '',
    tags: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Categories configuration with responsive icons
  const categories = useMemo(() => [
    { value: 'announcement', label: 'Announcement', icon: <Bell size={16} />, color: 'bg-blue-100 text-blue-700' },
    { value: 'event', label: 'Event', icon: <Calendar size={16} />, color: 'bg-purple-100 text-purple-700' },
    { value: 'achievement', label: 'Achievement', icon: <Trophy size={16} />, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'alumni-story', label: 'Alumni Story', icon: <Users size={16} />, color: 'bg-green-100 text-green-700' },
    { value: 'academic', label: 'Academic', icon: <Book size={16} />, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'general', label: 'General', icon: <Newspaper size={16} />, color: 'bg-gray-100 text-gray-700' },
  ], []);

  // Character count with memo
  const characterCount = useMemo(() => {
    return newsData.description.replace(/<[^>]*>/g, '').length;
  }, [newsData.description]);

  // Reading time calculation
  const readingTime = useMemo(() => {
    return Math.ceil(characterCount / 200);
  }, [characterCount]);

  // Progress calculation
  const progress = useMemo(() => {
    const fields = [
      newsData.title.trim(),
      newsData.author.trim(),
      newsData.category,
      newsData.description.trim(),
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [newsData]);

  // Page title based on mode
  const pageTitle = useMemo(() => {
    if (previewMode) return 'Preview Article';
    return id ? 'Edit News Article' : 'Create News Article';
  }, [id, previewMode]);

  const handleEditorChange = useCallback((value) => {
    setNewsData((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: '' }));
  }, []);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setNewsData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      setNewsData((prev) => ({ ...prev, picture: response.data?.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = useCallback(() => {
    const errs = {};
    
    if (!newsData.title.trim()) {
      errs.title = 'Title is required.';
    } else if (newsData.title.length < 10) {
      errs.title = 'Title must be at least 10 characters.';
    } else if (newsData.title.length > 100) {
      errs.title = 'Title must be less than 100 characters.';
    }
    
    if (!newsData.author.trim()) {
      errs.author = 'Author is required.';
    } else if (newsData.author.length < 2) {
      errs.author = 'Author name must be at least 2 characters.';
    }
    
    if (!newsData.description.trim()) {
      errs.description = 'Description is required.';
    } else if (characterCount < 50) {
      errs.description = 'Description must be at least 50 characters.';
    }
    
    if (!newsData.category) {
      errs.category = 'Category is required.';
    }
    
    return errs;
  }, [newsData, characterCount]);

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        userId: profile._id,
        title: newsData.title.trim(),
        author: newsData.author.trim(),
        picture: newsData.picture,
        description: newsData.description,
        category: newsData.category,
        tags: newsData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        publishDate: newsData.publishDate,
        status: newsData.status,
        department: profile.department,
      };

      const url = id 
        ? `${process.env.REACT_APP_API_URL}/news/${id}`
        : `${process.env.REACT_APP_API_URL}/news/create`;
      
      const method = id ? 'put' : 'post';
      
      await axios[method](url, body);
      toast.success(`News ${id ? 'updated' : 'created'} successfully!`);
      navigateTo('/home/news');
    } catch (error) {
      console.error(`Error ${id ? 'updating' : 'creating'} news:`, error);
      toast.error(error.response?.data?.message || `Failed to ${id ? 'update' : 'create'} news. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getNewsData = async () => {
    if (!id) return;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/news/news/${id}`);
      const data = response.data;
      setNewsData({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news data.');
    }
  };

  useEffect(() => {
    getNewsData();
  }, [id]);

  const getCategoryData = useCallback((categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || { icon: <Tag size={16} />, label: 'General', color: 'bg-gray-100 text-gray-700' };
  }, [categories]);

  // Step indicator for mobile
  const steps = [
    { id: 1, name: 'Basic Info', description: 'Title, author, category' },
    { id: 2, name: 'Content', description: 'Article body and image' },
    { id: 3, name: 'Publish', description: 'Review and publish' }
  ];

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6 lg:hidden">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step.id ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step.id}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-gradient-to-r from-[#0A3A4C] to-[#174873]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const ProgressBar = () => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  if (previewMode) {
    const categoryData = getCategoryData(newsData.category);
    
    return (
      <div className="bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
          {/* Simple Header for Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
                <Eye size={16} className="sm:size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Preview Article
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Review your article before publishing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(false)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <Edit size={16} />
                <span>Continue Editing</span>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-3">
            <article className="max-w-4xl mx-auto">
              <header className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${categoryData.color}`}>
                    {categoryData.icon}
                    <span>{categoryData.label}</span>
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {newsData.title || 'Article Title Will Appear Here'}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>By {newsData.author || 'Author Name'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(newsData.publishDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </header>
              
              {newsData.picture && (
                <div className="mb-6 sm:mb-8">
                  <img 
                    src={newsData.picture} 
                    alt="Article featured image" 
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}
              
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                {newsData.description ? (
                  <div dangerouslySetInnerHTML={{ __html: newsData.description }} />
                ) : (
                  <p className="text-gray-500 italic">Article content will appear here once you start writing...</p>
                )}
              </div>
              
              {newsData.tags && (
                <footer className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {newsData.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Tag size={12} />
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
            </article>
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#0A3A4C] to-[#174873] rounded-lg flex items-center justify-center">
              {id ? <Edit size={16} className="sm:size-5 text-white" /> : <Newspaper size={16} className="sm:size-5 text-white" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {id ? 'Update your news article' : 'Share important news with the community'}
              </p>
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
              onClick={() => navigateTo('/home/news')}
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
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <FileText size={14} className="sm:size-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Article Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newsData.title}
                        onChange={handleChange('title')}
                        placeholder="Enter a compelling title..."
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {newsData.title.length}/100
                      </div>
                    </div>
                    {errors.title && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={newsData.author}
                        onChange={handleChange('author')}
                        placeholder="Author name"
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                          errors.author ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.author && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.author}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category*
                    </label>
                    <select
                      value={newsData.category}
                      onChange={handleChange('category')}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle size={12} />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={newsData.publishDate}
                        onChange={handleChange('publishDate')}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={newsData.tags}
                      onChange={handleChange('tags')}
                      placeholder="technology, news, update"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>
                </div>
              </section>

              {/* Featured Image */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Image size={14} className="sm:size-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Featured Image</h3>
                </div>

                <div>
                  {!newsData.picture ? (
                    <div
                      onClick={() => document.getElementById('imageUpload').click()}
                      className="group border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                      {uploadingImage ? (
                        <div className="flex items-center justify-center">
                          <Loader2 size={20} className="sm:size-6 animate-spin text-[#0A3A4C] mr-2" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#0A3A4C] to-[#174873] bg-opacity-10 rounded-full flex items-center justify-center mx-auto group-hover:bg-opacity-20 transition-colors duration-200">
                            <Camera size={20} className="sm:size-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload featured image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={newsData.picture}
                        alt="Featured"
                        className="w-full h-32 sm:h-48 lg:h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setNewsData(prev => ({ ...prev, picture: '' }))}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full transition-colors duration-200"
                      >
                        <X size={14} className="sm:size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Content Editor */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#0A3A4C] to-[#174873] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <Edit size={14} className="sm:size-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Article Content</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Clock size={12} className="sm:size-4" />
                    <span>{readingTime} min read</span>
                    <span>•</span>
                    <span>{characterCount} chars</span>
                  </div>
                </div>

                <div>
                  <div className={`border rounded-lg focus-within:ring-2 focus-within:ring-[#0A3A4C] focus-within:border-[#0A3A4C] transition-colors duration-200 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}>
                    <CKeditor
                      key={newsData.description}
                      value={newsData.description}
                      onChange={handleEditorChange}
                      setNewForum={setNewsData}
                      placeholder="Write your article content here..."
                    />
                  </div>
                  {errors.description && (
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={12} />
                      {errors.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Minimum 50 characters required
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        characterCount >= 50 ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-500">
                        {characterCount >= 50 ? 'Ready to publish' : 'Needs more content'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigateTo('/home/news')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  <ArrowLeft size={16} />
                  <span>Cancel</span>
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewsData(prev => ({ ...prev, status: 'draft' }));
                      handleSubmit();
                    }}
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-[#0A3A4C] text-[#0A3A4C] rounded-lg hover:bg-[#0A3A4C]/5 transition-colors duration-200 text-sm disabled:opacity-50"
                  >
                    <FileText size={16} />
                    <span>Save Draft</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setNewsData(prev => ({ ...prev, status: 'published' }));
                      handleSubmit();
                    }}
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#0A3A4C] to-[#174873] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{id ? 'Updating...' : 'Publishing...'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{id ? 'Update' : 'Publish'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
