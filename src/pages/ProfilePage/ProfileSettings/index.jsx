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
  Mail, 
  Star,
  Award,
  Users,
  Info,
  Settings,
  Save,
  ArrowLeft,
  Plus,
  Search,
  Loader2
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

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setFormData({ ...formData, profilePicture: res.data?.imageUrl })
    })
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setFormData({ ...formData, coverPicture: res.data?.imageUrl })
    })
  }

  const handleUploadID = (e) => {
    const file = e.target.files[0]

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res)=>{
      setFormData({ ...formData, ID: res.data?.imageUrl, idUpdated: true  })
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
      setFormData({ ...formData, workingAt: "",companyWebsite: "", student: true })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    console.log("formData", formData)
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
        console.log("response data edit", responseData)
        dispatch(updateProfile(responseData))
        toast.success("User Updated Successfully")
        setLoading(false)
        navigateTo("/home/profile")
      } else {
        console.error("Failed to update user")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error:", error)
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    setShowDropDown(true)
    const { value } = e.target
    console.log("value", value)
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
    let label = ""
    let colorClass = ""
    let icon = null
    switch (level) {
      case 0:
        label = "SUPER ADMIN"
        colorClass = "bg-[#0A3A4C] text-white shadow-lg"
        icon = <Star size={12} className="text-white" />
        break
      case 1:
        label = "ADMIN"
        colorClass = "bg-[#0A3A4C] text-white shadow-lg"
        icon = <Award size={12} className="text-white" />
        break
      case 2:
        label = "ALUMNI"
        colorClass = "bg-[#0A3A4C] text-white shadow-lg"
        icon = <Users size={12} className="text-white" />
        break
      case 3:
        label = "STUDENT"
        colorClass = "bg-[#0A3A4C] text-white shadow-lg"
        icon = <Users size={12} className="text-white" />
        break
      default:
        label = "UNKNOWN"
        colorClass = "bg-gray-500 text-white shadow-lg"
        icon = <Info size={12} className="text-white" />
    }
    return (
      <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full ${colorClass}`}>
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.split(' ')[0]}</span>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Settings size={16} className="sm:size-6 text-[#0A3A4C]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-[#136175]">Profile Settings</h1>
                  <p className="text-[#136175]/80 text-xs sm:text-sm">Manage your profile information and preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center">
                {getRoleBadge(profile.profileLevel)}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="bg-[#0A3A4C] p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center">
                  <User size={12} className="sm:size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Personal Information</h3>
                  <p className="text-white/80 text-xs sm:text-sm">Basic details about yourself</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    First Name*
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="aboutMe" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  About Me
                </label>
                <textarea
                  id="aboutMe"
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 resize-none text-sm sm:text-base"
                />
              </div>

              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrentStudent}
                    onChange={handleCurrentStudentChange}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A3A4C] border-gray-300 rounded focus:ring-[#0A3A4C]"
                  />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users size={14} className="sm:size-4 text-[#0A3A4C]" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">I am currently a student</span>
                  </div>
                </label>
              </div>

              <div>
                <label htmlFor="linkedIn" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={14} className="sm:size-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="linkedIn"
                    name="linkedIn"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="bg-[#0A3A4C] p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center">
                  <Building size={12} className="sm:size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Professional Information</h3>
                  <p className="text-white/80 text-xs sm:text-sm">Your work and career details</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="relative">
                  <label htmlFor="workingAt" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Working At*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <Building size={14} className="sm:size-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="workingAt"
                      name="workingAt"
                      placeholder="Search for your company"
                      value={formData.workingAt}
                      onChange={handleSearch}
                      required
                      disabled={isCurrentStudent}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-sm sm:text-base"
                    />
                  </div>
                  {searchResults.length > 0 && showDropDown ? (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-xl max-h-60 overflow-auto">
                      {searchResults.map((company) => (
                        <div
                          key={company._id}
                          onClick={() => handleSelectCompany(company.name)}
                          className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-2 sm:gap-3"
                        >
                          <Building size={14} className="sm:size-4 text-gray-400" />
                          <span className="text-gray-700 text-sm sm:text-base">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : formData.workingAt !== "" && showDropDown ? (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-xl">
                      <div
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 sm:gap-3"
                        onClick={() => handleSelectCompany(formData.workingAt)}
                      >
                        <Plus size={14} className="sm:size-4 text-[#0A3A4C]" />
                        <span className="text-gray-700 text-sm sm:text-base">Add "{formData.workingAt}"</span>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="companyWebsite" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Company Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <Globe size={14} className="sm:size-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="companyWebsite"
                      name="companyWebsite"
                      placeholder="https://company.com"
                      value={formData.companyWebsite}
                      disabled={isCurrentStudent}
                      onChange={handleInputChange}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="bg-[#0A3A4C] p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center">
                  <MapPin size={12} className="sm:size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Location Information</h3>
                  <p className="text-white/80 text-xs sm:text-sm">Where are you located?</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="city" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    City*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <MapPin size={14} className="sm:size-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="country" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Country*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <Globe size={14} className="sm:size-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      placeholder="Enter your country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media & Documents */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="bg-[#0A3A4C] p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center">
                  <Camera size={12} className="sm:size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Media & Documents</h3>
                  <p className="text-white/80 text-xs sm:text-sm">Upload your photos and verification documents</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Profile Picture (1:1 Ratio)
                  </label>
                  <div 
                    onClick={() => document.getElementById('profileImage').click()} 
                    className="group border-2 border-dashed border-gray-300 cursor-pointer rounded-lg sm:rounded-xl p-4 sm:p-8 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                        <Camera size={16} className="sm:size-5 text-[#0A3A4C]" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Drop your profile picture here</p>
                        <p className="text-xs text-gray-500 mt-1">or click to browse</p>
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
                    <div className="mt-3 sm:mt-4 relative inline-block">
                      <img 
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl object-cover border-2 border-gray-200" 
                        src={formData.profilePicture} 
                        alt="Profile" 
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, profilePicture: null})} 
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                      >
                        <X size={12} className="sm:size-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cover Picture */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Cover Picture
                  </label>
                  <div 
                    onClick={() => document.getElementById('coverImage').click()} 
                    className="group border-2 border-dashed border-gray-300 cursor-pointer rounded-lg sm:rounded-xl p-4 sm:p-8 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                        <Upload size={16} className="sm:size-5 text-[#0A3A4C]" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Drop your cover image here</p>
                        <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                      </div>
                    </div>
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                  </div>
                  {formData.coverPicture && (
                    <div className="mt-3 sm:mt-4 relative">
                      <img 
                        className="w-full h-20 sm:h-24 rounded-lg sm:rounded-xl object-cover border-2 border-gray-200" 
                        src={formData.coverPicture} 
                        alt="Cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, coverPicture: null})} 
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                      >
                        <X size={12} className="sm:size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Identity Verification
                </label>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Upload your College ID, Aadhaar Card, PAN Card, or Passport for verification
                </p>
                <div 
                  className="group border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-8 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer" 
                  onClick={() => document.getElementById('idUpload').click()}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                      <FileText size={16} className="sm:size-5 text-[#0A3A4C]" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Upload your ID document</p>
                      <p className="text-xs text-gray-500 mt-1">Accepted: College ID, Aadhaar, PAN, Passport</p>
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
                  <div className="mt-3 sm:mt-4 relative inline-block">
                    <img 
                      className="w-40 h-28 sm:w-48 sm:h-32 rounded-lg sm:rounded-xl object-cover border-2 border-gray-200" 
                      src={formData.ID} 
                      alt="ID Document" 
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, ID: null })} 
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                    >
                      <X size={12} className="sm:size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigateTo("/home/profile")}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  <ArrowLeft size={16} className="sm:size-5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0A3A4C] text-white rounded-lg sm:rounded-xl font-semibold hover:bg-[#0A3A4C]/90 focus:outline-none focus:ring-2 focus:ring-[#0A3A4C] focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="sm:size-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="sm:size-5" />
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
