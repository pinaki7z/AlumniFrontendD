import React, { useEffect, useState } from 'react';
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
  Globe
} from 'lucide-react';

export const CreateNews = () => {
  const profile = useSelector((state) => state.profile);
  const { id } = useParams();
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
  const [characterCount, setCharacterCount] = useState(0);

  const navigateTo = useNavigate();

  const categories = [
    { value: 'announcement', label: 'Announcement', icon: <Globe size={16} /> },
    { value: 'event', label: 'Event', icon: <Calendar size={16} /> },
    { value: 'achievement', label: 'Achievement', icon: <CheckCircle size={16} /> },
    { value: 'alumni-story', label: 'Alumni Story', icon: <User size={16} /> },
    { value: 'academic', label: 'Academic', icon: <FileText size={16} /> },
    { value: 'general', label: 'General', icon: <Newspaper size={16} /> },
  ];

  const handleEditorChange = (value) => {
    setNewsData((prev) => ({ ...prev, description: value }));
    setCharacterCount(value.replace(/<[^>]*>/g, '').length);
    setErrors((prev) => ({ ...prev, description: '' }));
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setNewsData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

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

  const validate = () => {
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
    } else if (newsData.description.replace(/<[^>]*>/g, '').length < 50) {
      errs.description = 'Description must be at least 50 characters.';
    }
    
    if (!newsData.category) {
      errs.category = 'Category is required.';
    }
    
    return errs;
  };

  const handleCreate = async () => {
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

      await axios.post(`${process.env.REACT_APP_API_URL}/news/create`, body);
      toast.success('News created successfully!');
      navigateTo('/home/news');
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error(error.response?.data?.message || 'Failed to create news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
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

      await axios.put(`${process.env.REACT_APP_API_URL}/news/${id}`, body);
      toast.success('News updated successfully!');
      navigateTo('/home/news');
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error(error.response?.data?.message || 'Failed to update news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (id) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const getNewsData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/news/news/${id}`);
      const data = response.data;
      setNewsData({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setCharacterCount(data.description ? data.description.replace(/<[^>]*>/g, '').length : 0);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news data.');
    }
  };

  useEffect(() => {
    if (id) {
      getNewsData();
    }
  }, [id]);

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.icon : <Tag size={16} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {id ? (
                    <Edit size={20} className="sm:size-6 text-[#0A3A4C]" />
                  ) : (
                    <Newspaper size={20} className="sm:size-6 text-[#0A3A4C]" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#136175]">
                    {id ? 'Edit News Article' : 'Create News Article'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#136175]/80">
                    {id ? 'Update your news article' : 'Share important news with the community'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm sm:text-base"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
                </button>
                <button
                  onClick={() => navigateTo('/home/news')}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm sm:text-base"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to News</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {getCategoryIcon(newsData.category)}
                  <span className="text-sm font-medium text-[#0A3A4C] capitalize">
                    {newsData.category.replace('-', ' ')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {newsData.title || 'News Title'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>By {newsData.author || 'Author Name'}</span>
                  <span>•</span>
                  <span>{new Date(newsData.publishDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              {newsData.picture && (
                <div className="mb-6">
                  <img 
                    src={newsData.picture} 
                    alt="News" 
                    className="w-full h-64 sm:h-80 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: newsData.description || 'Article content will appear here...' }}
              />
              
              {newsData.tags && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {newsData.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-[#0A3A4C]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Article Information</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title*
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newsData.title}
                          onChange={handleChange('title')}
                          placeholder="Enter a compelling title..."
                          className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                            errors.title ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          {newsData.title.length}/100
                        </div>
                      </div>
                      {errors.title && (
                        <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                          <AlertCircle size={14} />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={newsData.author}
                          onChange={handleChange('author')}
                          placeholder="Author name"
                          className={`w-full pl-10 pr-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                            errors.author ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.author && (
                        <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                          <AlertCircle size={14} />
                          {errors.author}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category*
                      </label>
                      <select
                        value={newsData.category}
                        onChange={handleChange('category')}
                        className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
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
                          <AlertCircle size={14} />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={newsData.tags}
                        onChange={handleChange('tags')}
                        placeholder="Enter tags separated by commas"
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate tags with commas (e.g., technology, innovation, education)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publish Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={newsData.publishDate}
                          onChange={handleChange('publishDate')}
                          className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                      <Image size={16} className="text-[#0A3A4C]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Featured Image</h3>
                  </div>

                  <div>
                    <div
                      onClick={() => document.getElementById('imageUpload').click()}
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
                    
                    {newsData.picture && (
                      <div className="mt-4 relative">
                        <img
                          src={newsData.picture}
                          alt="Featured"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setNewsData(prev => ({ ...prev, picture: '' }))}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                        <Edit size={16} className="text-[#0A3A4C]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Article Content</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{Math.ceil(characterCount / 200)} min read</span>
                      <span>•</span>
                      <span>{characterCount} characters</span>
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
                        <AlertCircle size={14} />
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
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigateTo('/home/news')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowLeft size={16} />
                    <span>Cancel</span>
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewsData(prev => ({ ...prev, status: 'draft' }))}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-[#0A3A4C] text-[#0A3A4C] rounded-lg hover:bg-[#0A3A4C]/5 transition-colors duration-200"
                    >
                      <FileText size={16} />
                      <span>Save as Draft</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{id ? 'Updating...' : 'Publishing...'}</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{id ? 'Update Article' : 'Publish Article'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
