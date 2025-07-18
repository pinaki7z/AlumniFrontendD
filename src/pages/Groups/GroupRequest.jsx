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
    { value: 'Education', label: 'Education', icon: <BookOpen size={16} className="text-blue-600" /> },
    { value: 'Business Connect', label: 'Business Connect', icon: <Building size={16} className="text-green-600" /> },
    { value: 'Entertainment', label: 'Entertainment', icon: <Gamepad2 size={16} className="text-purple-600" /> },
    { value: 'Sports', label: 'Sports', icon: <Trophy size={16} className="text-orange-600" /> },
    { value: 'Pets and Animals', label: 'Pets and Animals', icon: <Heart size={16} className="text-pink-600" /> },
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
        return <Globe size={16} className="text-green-600" />;
      case 'Private':
        return <Lock size={16} className="text-red-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const getCategoryIcon = (cat) => {
    const category = categories.find(c => c.value === cat);
    return category ? category.icon : <Tag size={16} className="text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {edit ? (
                    <Edit size={20} className="sm:size-6 text-[#0A3A4C]" />
                  ) : (
                    <Users size={20} className="sm:size-6 text-[#0A3A4C]" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#136175]">
                    {edit ? 'Edit Group' : 'Create New Group'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#136175]/80">
                    {edit ? 'Update your group information' : 'Create a community for like-minded people'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/home/groups"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-[#0A3A4C] rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm sm:text-base"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to Groups</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-[#0A3A4C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>

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
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
                      errors.groupName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {groupName.length}/50
                  </div>
                </div>
                {errors.groupName && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.groupName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Type*
                  </label>
                  <div className="space-y-2">
                    {['Public', 'Private'].map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="groupType"
                          value={type}
                          checked={groupType === type}
                          onChange={(e) => handleInputChange('groupType', e.target.value)}
                          className="w-4 h-4 text-[#0A3A4C] border-gray-300 focus:ring-[#0A3A4C]"
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
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.groupType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm sm:text-base ${
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
                    <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle size={14} />
                      {errors.category}
                    </p>
                  )}
                  {category && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-gray-50 rounded-lg w-fit">
                      {getCategoryIcon(category)}
                      <span className="text-sm text-gray-700">{category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#0A3A4C]/10 rounded-lg flex items-center justify-center">
                  <Image size={16} className="text-[#0A3A4C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Group Images</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Background Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Background*
                  </label>
                  <div className="space-y-3">
                    <div
                      onClick={() => document.getElementById('backgroundUpload').click()}
                      className="group border-2 border-dashed border-gray-300 rounded-lg   hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                      {uploadingBackground ? (
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
                            <p className="text-sm font-medium text-gray-700">Upload background image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="backgroundUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setBackground, setUploadingBackground)}
                        className="sr-only"
                      />
                    </div>
                    {errors.background && (
                      <p className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        {errors.background}
                      </p>
                    )}
                    {background && (
                      <div className="relative">
                        <img
                          src={background}
                          alt="Background"
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setBackground('')}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                        >
                          <X size={16} />
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
                      className="group border-2 border-dashed border-gray-300 rounded-lg   hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                      {uploadingLogo ? (
                        <div className="flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-[#0A3A4C] mr-2" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                            <Upload size={24} className="text-[#0A3A4C]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload group logo</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setGroupLogo, setUploadingLogo)}
                        className="sr-only"
                      />
                    </div>
                    {errors.groupLogo && (
                      <p className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        {errors.groupLogo}
                      </p>
                    )}
                    {groupLogo && (
                      <div className="relative">
                        <img
                          src={groupLogo}
                          alt="Logo"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setGroupLogo('')}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <Link
                to="/home/groups"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} />
                <span>Cancel</span>
              </Link>
              <button
                type="submit"
                disabled={loading || uploadingBackground || uploadingLogo}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{edit ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
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
