import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import baseUrl from '../../config';
import { 
  Users, 
  Upload, 
  X, 
  ArrowLeft, 
  Save, 
  Edit, 
  Image, 
  Globe, 
  Lock, 
  Tag, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Camera, 
  Loader2,
  Eye,
  Building,
  BookOpen,
  Gamepad2,
  Heart,
  Trophy
} from 'lucide-react';

// Helper to capitalize the first letter of a string
const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const GroupRequest = ({ edit }) => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const { _id } = useParams();
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('');
  const [category, setCategory] = useState('');
  const [background, setBackground] = useState('');
  const [groupLogo, setGroupLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errors, setErrors] = useState({});

  // Category options with icons
  const categories = [
    { value: 'Education', label: 'Education', icon: <BookOpen size={14} className="text-blue-600" /> },
    { value: 'Business Connect', label: 'Business Connect', icon: <Building size={14} className="text-green-600" /> },
    { value: 'Entertainment', label: 'Entertainment', icon: <Gamepad2 size={14} className="text-purple-600" /> },
    { value: 'Sports', label: 'Sports', icon: <Trophy size={14} className="text-orange-600" /> },
    { value: 'Pets and Animals', label: 'Pets and Animals', icon: <Heart size={14} className="text-pink-600" /> },
  ];

  // Handle image file input and convert to Data URL
  const handleImageChange = async (event, setter, setUploading) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`;
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(api, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      setter(response.data?.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${_id}`);
      const group = response.data;
      setGroupName(group.groupName || '');
      setGroupType(group.groupType || '');
      setCategory(group.category || '');
      setBackground(group.groupBackground || '');
      setGroupLogo(group.groupLogo || '');
    } catch (error) {
      console.error("Error fetching group:", error);
      toast.error('Failed to load group data');
    }
  };

  useEffect(() => {
    if (edit && _id) {
      fetchGroup();
    }
  }, [edit, _id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.trim().length < 3) {
      newErrors.groupName = 'Group name must be at least 3 characters';
    } else if (groupName.trim().length > 50) {
      newErrors.groupName = 'Group name must be less than 50 characters';
    }
    
    if (!groupType) newErrors.groupType = 'Group type is required';
    if (!category) newErrors.category = 'Category is required';
    if (!background) newErrors.background = 'Background image is required';
    if (!groupLogo) newErrors.groupLogo = 'Group logo is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'groupName':
        setGroupName(value);
        break;
      case 'groupType':
        setGroupType(value);
        break;
      case 'category':
        setCategory(value);
        break;
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const body = {
        userId: profile._id,
        groupName: groupName.trim(),
        groupType,
        category,
        groupBackground: background,
        groupLogo,
        member: {
          userId: profile._id,
          profilePicture: profile.profilePicture,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
      };

      if (edit) {
        await axios.put(`${process.env.REACT_APP_API_URL}/groups/${_id}`, body);
        toast.success('Group updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/groups/create`, body);
        toast.success('Group created successfully!');
      }
      
      navigate('/home/groups');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'An error occurred';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case 'Public':
        return <Globe size={14} className="text-green-600" />;
      case 'Private':
        return <Lock size={14} className="text-red-600" />;
      default:
        return <Users size={14} className="text-gray-600" />;
    }
  };

  const getCategoryIcon = (cat) => {
    const category = categories.find(c => c.value === cat);
    return category ? category.icon : <Tag size={14} className="text-gray-600" />;
  };

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
              {edit ? (
                <Edit size={16} className="sm:size-5 text-white" />
              ) : (
                <Users size={16} className="sm:size-5 text-white" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {edit ? 'Edit Group' : 'Create Group'}
            </h1>
          </div>
          
          <Link
            to="/home/groups"
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm w-full sm:w-auto"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => handleInputChange('groupName', e.target.value)}
                    placeholder="Enter group name"
                    maxLength="50"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                      errors.groupName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {groupName.length}/50
                  </div>
                </div>
                {errors.groupName && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="flex-shrink-0" />
                    {errors.groupName}
                  </p>
                )}
              </div>

              {/* Group Type and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Group Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Type*
                  </label>
                  <div className="space-y-2">
                    {['Public', 'Private'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="groupType"
                          value={type}
                          checked={groupType === type}
                          onChange={(e) => handleInputChange('groupType', e.target.value)}
                          className="w-3 h-3 text-[#0A3A4C] border-gray-300 focus:ring-[#0A3A4C]"
                        />
                        <div className="flex items-center gap-2">
                          {getGroupTypeIcon(type)}
                          <div>
                            <span className="text-sm font-medium text-gray-900">{type}</span>
                            <p className="text-xs text-gray-600">
                              {type === 'Public' ? 'Anyone can join' : 'Requires approval'}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.groupType && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {errors.groupType}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {errors.category}
                    </p>
                  )}
                  {category && (
                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-gray-50 rounded-lg w-fit">
                      {getCategoryIcon(category)}
                      <span className="text-xs text-gray-700">{category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-6 h-6 dynamic-site-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Group Images</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Background Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Background*
                  </label>
                  <div className="space-y-3">
                    <div
                      onClick={() => document.getElementById('backgroundUpload').click()}
                      className="group border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer text-center"
                    >
                      {uploadingBackground ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin text-[#0A3A4C]" />
                          <span className="text-xs text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                            <Camera size={18} className="sm:size-6 text-[#0A3A4C]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload background</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="backgroundUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setBackground, setUploadingBackground)}
                        className="hidden"
                      />
                    </div>
                    {errors.background && (
                      <p className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle size={12} className="flex-shrink-0" />
                        {errors.background}
                      </p>
                    )}
                    {background && (
                      <div className="relative">
                        <img
                          src={background}
                          alt="Background"
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setBackground('')}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Logo*
                  </label>
                  <div className="space-y-3">
                    <div
                      onClick={() => document.getElementById('logoUpload').click()}
                      className="group border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer text-center"
                    >
                      {uploadingLogo ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin text-[#0A3A4C]" />
                          <span className="text-xs text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                            <Upload size={18} className="sm:size-6 text-[#0A3A4C]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload logo</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setGroupLogo, setUploadingLogo)}
                        className="hidden"
                      />
                    </div>
                    {errors.groupLogo && (
                      <p className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle size={12} className="flex-shrink-0" />
                        {errors.groupLogo}
                      </p>
                    )}
                    {groupLogo && (
                      <div className="relative mx-auto w-fit">
                        <img
                          src={groupLogo}
                          alt="Logo"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setGroupLogo('')}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <Link
                to="/home/groups"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <ArrowLeft size={14} />
                <span>Cancel</span>
              </Link>
              <button
                type="submit"
                disabled={loading || uploadingBackground || uploadingLogo}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{edit ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{edit ? 'Update Group' : 'Create Group'}</span>
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

export default GroupRequest;
