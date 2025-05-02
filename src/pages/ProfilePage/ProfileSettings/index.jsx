"use client"

import { useState, useEffect } from "react"
import { CgProfile } from "react-icons/cg"
import { IoMdAdd } from "react-icons/io"
import { useCookies } from "react-cookie"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../store/profileSlice"
import axios from "axios"

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
    // setFormData({ ...formData, })

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

  const title = "Profile Settings"
  const icon = <CgProfile className="text-[#174873]" />

  return (
    <div className="w-full">
      {/* <PageTitle title={title} icon={icon} /> */}
      <div className=" m-5">
        <form className="py-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">
              About Me
            </label>
            <textarea
              id="aboutMe"
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
            ></textarea>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isCurrentStudent}
                onChange={handleCurrentStudentChange}
                className="h-4 w-4 text-[#174873] focus:ring-[#174873] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Current Student</span>
            </label>
          </div>

          <div className="mt-6">
            <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn profile link
            </label>
            <input
              type="text"
              id="linkedIn"
              name="linkedIn"
              placeholder="Enter LinkedIn profile link"
              value={formData.linkedIn}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="relative">
              <label htmlFor="workingAt" className="block text-sm font-medium text-gray-700 mb-1">
                Working At*
              </label>
              <input
                type="text"
                id="workingAt"
                name="workingAt"
                placeholder="Enter Working at"
                value={formData.workingAt}
                onChange={handleSearch}
                required
                disabled={isCurrentStudent}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
              {searchResults.length > 0 && showDropDown ? (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((company) => (
                    <div
                      key={company._id}
                      onClick={() => handleSelectCompany(company.name)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                    >
                      {company.name}
                    </div>
                  ))}
                </div>
              ) : formData.workingAt !== "" && showDropDown ? (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleSelectCompany(formData.workingAt)}
                  >
                    <IoMdAdd className="mr-2" />
                    <span>Add {formData.workingAt}</span>
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                Company Website
              </label>
              <input
                type="text"
                id="companyWebsite"
                name="companyWebsite"
                placeholder="Enter company website"
                value={formData.companyWebsite}
                disabled={isCurrentStudent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country*
              </label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Enter Country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#174873] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-3">
                Change Profile Picture (Ratio: 1:1)
              </label>
              <div onClick={() => document.getElementById('profileImage').click()} className="border-2 border-dashed border-gray-300 cursor-pointer rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#174873]">Drop files here</div>
                  <p className="text-xs text-gray-500">or</p>
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#174873] hover:text-[#2c6ca9] focus-within:outline-none">
                    <span className="text-sm">Browse files</span>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              {formData.profilePicture &&<>
                <img className="h-[150px] rounded-xl mt-6" src={formData.profilePicture} alt="Uploaded profilePicture" />
                <button onClick={()=> setFormData({...formData, profilePicture: null})} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-1">Remove</button>
              </>}
            </div>
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-3">
                Change Cover Picture
              </label>
              <div onClick={()=> document.getElementById('coverImage').click()} className="border-2 border-dashed cursor-pointer border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#174873]">Drop files here</div>
                  <p className="text-xs text-gray-500">or</p>
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#174873] hover:text-[#2c6ca9] focus-within:outline-none">
                    <span className="text-sm">Browse files</span>
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              <div>
              {formData.coverPicture &&<>
                <img className="h-[150px] rounded-xl mt-6" src={formData.coverPicture} alt="Uploaded coverPicture" />
                <button onClick={()=> setFormData({...formData, coverPicture: null})} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-1">Remove</button>
              </>}
            </div>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="idUpload" className="block text-sm font-medium text-gray-700 mb-3">
              Upload ID (College ID, Adhaar Card, PAN Card, Passport)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => document.getElementById('idUpload').click()}>
              <div className="space-y-1">
                <div className="text-sm font-medium text-[#174873]">Drop files here</div>
                <p className="text-xs text-gray-500">or</p>
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#174873] hover:text-[#2c6ca9] focus-within:outline-none">
                  <span className="text-sm">Browse files</span>
                  <input id="idUpload" type="file" accept="image/*" onChange={handleUploadID} className="sr-only" />
                </label>
              </div>
            </div>
            <div>
              {formData.ID && <>
                <img className="h-[250px] rounded-xl mt-6" src={formData.ID} alt="Uploaded ID" />
                <button onClick={() => setFormData({ ...formData, ID: null })} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-1">Remove</button>
              </>}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <button
              type="submit"
              className="px-6 py-2 bg-[#174873] text-white rounded-md shadow-sm hover:bg-[#0f3356] focus:outline-none focus:ring-2 focus:ring-[#174873] focus:ring-offset-2 transition-colors"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => navigateTo("/home/profile")}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
