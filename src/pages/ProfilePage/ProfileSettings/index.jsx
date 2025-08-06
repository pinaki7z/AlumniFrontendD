"use client"

import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../store/profileSlice"
import axios from "axios"
import { 
  User, 
  MapPin, 
  Building, 
  Link as LinkIcon, 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  FileText, 
  Globe, 
  Star,
  Award,
  Users,
  Info,
  Settings,
  Save,
  ArrowLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Eye
} from "lucide-react"

export const ProfileSettings = () => {
  const [cookie, setCookie] = useCookies(["access_token"])
  const profile = useSelector((state) => state.profile)
  const navigateTo = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isCurrentStudent, setIsCurrentStudent] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showDropDown, setShowDropDown] = useState(false)

  const token = cookie.token

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      aboutMe: profile.aboutMe || "",
      workingAt: profile.workingAt || "",
      companyWebsite: profile.companyWebsite || "",
      location: profile.location || "",
      city: profile.city || "",
      country: profile.country || "",
      profilePicture: profile.profilePicture || "",
      coverPicture: profile.coverPicture || "",
      ID: profile.ID || "",
      linkedIn: profile.linkedIn || "",
    }))
    setIsCurrentStudent(()=>{
      if(profile.profileLevel === 3){
        return true
      }
      return false
    })
  }, [profile._id])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    aboutMe: "",
    workingAt: "",
    companyWebsite: "",
    location: "",
    city: "",
    country: "",
    student: false,
    linkedIn: "",
    profilePicture: "",
    coverPicture: "",
    ID: "",
    idUpdated: false
  })

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setFormData({ ...formData, profilePicture: res.data?.imageUrl })
      toast.success('Profile picture uploaded successfully')
    })
    .catch((err) => {
      toast.error('Failed to upload profile picture')
    })
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setFormData({ ...formData, coverPicture: res.data?.imageUrl })
      toast.success('Cover picture uploaded successfully')
    })
    .catch((err) => {
      toast.error('Failed to upload cover picture')
    })
  }

  const handleUploadID = (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setFormData({ ...formData, ID: res.data?.imageUrl, idUpdated: true })
      toast.success('ID document uploaded successfully')
    })
    .catch((err) => {
      toast.error('Failed to upload ID document')
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCurrentStudentChange = () => {
    setIsCurrentStudent(!isCurrentStudent)
    if (!isCurrentStudent) {
      setFormData({ ...formData, workingAt: "", companyWebsite: "", student: true })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const userID = profile._id

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const responseData = await response.json()
        dispatch(updateProfile(responseData))
        toast.success("Profile updated successfully!")
        setLoading(false)
        navigateTo("/home/profile")
      } else {
        console.error("Failed to update user")
        toast.error("Failed to update profile")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred while updating profile")
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    setShowDropDown(true)
    const { value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      workingAt: value,
    }))

    if (value.length >= 3) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/search/search/company?q=${value}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.companies)
        } else {
          console.error("Failed to fetch search results")
        }
      } catch (error) {
        console.error("Error fetching search results:", error)
      }
    } else {
      setSearchResults([])
    }
  }

  const handleSelectCompany = (company) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      workingAt: company,
    }))
    setShowDropDown(false)
  }

  const getRoleBadge = (level) => {
    const badges = {
      0: { label: "SUPER ADMIN", color: "bg-red-600 text-white", icon: <Star size={14} /> },
      1: { label: "ADMIN", color: "bg-orange-600 text-white", icon: <Award size={14} /> },
      2: { label: "ALUMNI", color: "bg-[#0A3A4C] text-white", icon: <Users size={14} /> },
      3: { label: "STUDENT", color: "bg-[#71be95] text-white", icon: <Users size={14} /> }
    };
    
    const badge = badges[level] || badges[2];
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${badge.color} font-medium text-xs`}>
        {badge.icon}
        <span className="hidden sm:inline">{badge.label}</span>
        <span className="sm:hidden">{badge.label.split(' ')[0]}</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0A3A4C] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
                  <p className="text-gray-600 text-sm">Manage your profile information and preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getRoleBadge(profile.profileLevel)}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#0A3A4C] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <p className="text-blue-100 text-sm">Basic details about yourself</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-2">
                  About Me
                </label>
                <textarea
                  id="aboutMe"
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself, your interests, achievements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 resize-none text-gray-900"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrentStudent}
                    onChange={handleCurrentStudentChange}
                    className="w-4 h-4 text-[#71be95] border-gray-300 rounded focus:ring-[#71be95]"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">I am currently a student</span>
                  </div>
                </label>
                <p className="text-xs text-blue-600 mt-2 ml-7">Check this if you're currently enrolled as a student</p>
              </div>

              <div>
                <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="linkedIn"
                    name="linkedIn"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#0A3A4C] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Professional Information</h3>
                  <p className="text-blue-100 text-sm">Your work and career details</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="workingAt" className="block text-sm font-medium text-gray-700 mb-2">
                    Working At {!isCurrentStudent && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="workingAt"
                      name="workingAt"
                      placeholder="Search for your company"
                      value={formData.workingAt}
                      onChange={handleSearch}
                      required={!isCurrentStudent}
                      disabled={isCurrentStudent}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-gray-900"
                    />
                  </div>
                  {searchResults.length > 0 && showDropDown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((company) => (
                        <div
                          key={company._id}
                          onClick={() => handleSelectCompany(company.name)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors duration-200"
                        >
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.workingAt !== "" && showDropDown && searchResults.length === 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      <div
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                        onClick={() => handleSelectCompany(formData.workingAt)}
                      >
                        <Plus className="w-4 h-4 text-[#71be95]" />
                        <span className="text-gray-700">Add "{formData.workingAt}"</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="companyWebsite"
                      name="companyWebsite"
                      placeholder="https://company.com"
                      value={formData.companyWebsite}
                      disabled={isCurrentStudent}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#0A3A4C] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Location Information</h3>
                  <p className="text-blue-100 text-sm">Where are you located?</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      placeholder="Enter your country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#71be95] focus:border-[#71be95] transition-colors duration-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media & Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
            <div className="bg-[#0A3A4C] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Media & Documents</h3>
                  <p className="text-blue-100 text-sm">Upload your photos and verification documents</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 ">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div 
                  onClick={() => document.getElementById('profileImage').click()} 
                  className="border-2 border-dashed border-gray-300 cursor-pointer rounded-lg p-6 text-center hover:border-[#71be95] hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload profile picture</p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="sr-only"
                  />
                </div>
                {formData.profilePicture && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" 
                      src={formData.profilePicture} 
                      alt="Profile Preview" 
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, profilePicture: ""})} 
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cover Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cover Picture
                </label>
                <div 
                  onClick={() => document.getElementById('coverImage').click()} 
                  className="border-2 border-dashed border-gray-300 cursor-pointer rounded-lg p-6 text-center hover:border-[#71be95] hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload cover picture</p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className=""
                  />
                </div>
                {formData.coverPicture && (
                  <div className="mt-3 relative">
                    <img 
                      className="w-full h-24 rounded-lg object-cover border-2 border-gray-200" 
                      src={formData.coverPicture} 
                      alt="Cover Preview" 
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, coverPicture: ""})} 
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* ID Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Verification <span className="text-red-500">*</span>
                </label>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Verification Required</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Upload your College ID, Aadhaar Card, PAN Card, or Passport for account verification.
                      </p>
                    </div>
                  </div>
                </div>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#71be95] hover:bg-gray-50 transition-all duration-200 cursor-pointer" 
                  onClick={() => document.getElementById('idUpload').click()}
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload ID document</p>
                      <p className="text-xs text-gray-500">College ID, Aadhaar, PAN, Passport • JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                  <input 
                    id="idUpload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUploadID} 
                    className="sr-only" 
                  />
                </div>
                {formData.ID && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      className="w-32 h-24 rounded-lg object-cover border-2 border-gray-200" 
                      src={formData.ID} 
                      alt="ID Document Preview" 
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, ID: "" })} 
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo("/home/profile")}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#71be95] text-white rounded-md font-medium hover:bg-[#5fa080] focus:outline-none focus:ring-2 focus:ring-[#71be95] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings