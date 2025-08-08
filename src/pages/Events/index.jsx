import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enIN from 'date-fns/locale/en-US';
import './Events.css';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { lineSpinner } from 'ldrs';
import EventDisplay from "../../components/Feeed/EventDisplay";
import baseUrl from "../../config";
import picture from "../../images/d-group.jpg";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  X, 
  Edit, 
  Trash2, 
  Users, 
  Download, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Image,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

lineSpinner.register();

// Enhanced Modal Component with Mobile Optimization
function EventModal(props) {
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [priceType, setPriceType] = useState("free");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [createGroup, setCreateGroup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    startTime: "00:00",
    endTime: "00:00",
    picture: "",
    cName: "",
    cNumber: "",
    cEmail: "",
    location: "",
  });

  const steps = [
    { id: 1, title: 'Details', icon: <CalendarIcon size={16} />, description: 'Basic event information' },
    { id: 2, title: 'Schedule', icon: <Clock size={16} />, description: 'Date and time settings' },
    { id: 3, title: 'Contact', icon: <User size={16} />, description: 'Coordinator details and image' }
  ];

  useEffect(() => {
    if (props.isEditing && props.selectedEvent) {
      fetchEvent();
    }
  }, [props.isEditing, props.selectedEvent]);

  const fetchEvent = async () => {
    if (!props.selectedEvent?._id) return;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/events/${props.selectedEvent._id}`);
      const data = response.data;
      
      setFormData({
        title: data.title || "",
        start: data.start ? new Date(data.start) : new Date(),
        end: data.end ? new Date(data.end) : new Date(),
        startTime: data.startTime || "00:00",
        endTime: data.endTime || "00:00",
        picture: data.picture || "",
        cName: data.cName || "",
        cNumber: data.cNumber || "",
        cEmail: data.cEmail || "",
        location: data.location || "",
      });
      
      setPriceType(data.priceType || "free");
      setAmount(data.amount || "");
      setCurrency(data.currency || "INR");
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event data');
    }
  };

  const validate = () => {
    const errs = {};
    
    if (!formData.title?.trim()) errs.title = 'Event title is required';
    if (!formData.location?.trim()) errs.location = 'Location is required';
    if (priceType === 'paid' && (!amount || amount <= 0)) errs.amount = 'Valid amount is required';
    
    if (!formData.start) errs.start = 'Start date is required';
    if (!formData.end) errs.end = 'End date is required';
    if (formData.start && formData.end && formData.end < formData.start) {
      errs.end = 'End date cannot be before start date';
    }
    
    if (!formData.cName?.trim()) errs.cName = 'Coordinator name is required';
    const cNum = formData.cNumber ? String(formData.cNumber) : '';
    if (!cNum.trim()) errs.cNumber = 'Coordinator number is required';
    else if (!/^\d{10}$/.test(cNum)) errs.cNumber = 'Enter a valid 10-digit number';
    if (!formData.cEmail?.trim()) errs.cEmail = 'Coordinator email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.cEmail)) {
      errs.cEmail = 'Enter a valid email';
    }
    if (!formData.picture?.trim()) errs.picture = 'Event image is required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formDataImage = new FormData();
      formDataImage.append('image', file);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`,
        formDataImage,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      handleInputChange('picture', response.data?.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const eventData = {
        userId: profile._id,
        title: formData.title,
        start: format(formData.start, "yyyy-MM-dd"),
        end: format(formData.end, "yyyy-MM-dd"),
        startTime: formData.startTime,
        endTime: formData.endTime,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
        picture: formData.picture,
        cName: formData.cName,
        cNumber: formData.cNumber,
        cEmail: formData.cEmail,
        location: formData.location,
        department: profile.department,
        createGroup,
        priceType,
        amount: priceType === "paid" ? amount : null,
        currency: priceType === "paid" ? currency : "",
      };

      if (props.isEditing && props.selectedEvent?._id) {
        await axios.put(`${process.env.REACT_APP_API_URL}/events/${props.selectedEvent._id}`, eventData);
        toast.success('Event updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/events/createEvent`, eventData);
        toast.success('Event created successfully!');
      }

      props.onHide();
      window.location.reload();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title*
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={14} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Event location"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                />
              </div>
              {errors.location && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle size={12} />
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type*
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {['free', 'paid'].map((type) => (
                  <label key={type} className="cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      value={type}
                      checked={priceType === type}
                      onChange={(e) => setPriceType(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center gap-2 p-2 sm:p-3 border-2 rounded-lg transition-all duration-200 ${
                      priceType === type
                        ? 'border-[#0A3A4C] bg-[#0A3A4C]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {type === 'free' ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <DollarSign size={14} className="text-blue-600" />
                      )}
                      <span className="font-medium capitalize text-sm">{type}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {priceType === 'paid' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount*
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                  />
                  {errors.amount && (
                    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <AlertCircle size={12} />
                      {errors.amount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date*
                </label>
                <DatePicker
                  selected={formData.start}
                  onChange={(date) => handleInputChange('start', date)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                  placeholderText="Select start date"
                  dateFormat="dd/MM/yyyy"
                />
                {errors.start && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle size={12} />
                    {errors.start}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date*
                </label>
                <DatePicker
                  selected={formData.end}
                  onChange={(date) => handleInputChange('end', date)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                  placeholderText="Select end date"
                  dateFormat="dd/MM/yyyy"
                  minDate={formData.start}
                />
                {errors.end && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle size={12} />
                    {errors.end}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordinator Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.cName}
                    onChange={(e) => handleInputChange('cName', e.target.value)}
                    placeholder="Coordinator name"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                  />
                </div>
                {errors.cName && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle size={12} />
                    {errors.cName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.cNumber}
                    onChange={(e) => handleInputChange('cNumber', e.target.value)}
                    placeholder="10-digit phone number"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                  />
                </div>
                {errors.cNumber && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle size={12} />
                    {errors.cNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={14} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.cEmail}
                  onChange={(e) => handleInputChange('cEmail', e.target.value)}
                  placeholder="coordinator@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                />
              </div>
              {errors.cEmail && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle size={12} />
                  {errors.cEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image*
              </label>
              <div
                onClick={() => document.getElementById('eventImage').click()}
                className="group border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center hover:border-[#0A3A4C] hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                {uploadingImage ? (
                  <div className="flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-[#0A3A4C] mr-2" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0A3A4C]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#0A3A4C]/20 transition-colors duration-200">
                      <Upload size={18} className="sm:size-6 text-[#0A3A4C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Upload event image</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="eventImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </div>
              {errors.picture && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle size={12} />
                  {errors.picture}
                </p>
              )}
              {formData.picture && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={formData.picture}
                    alt="Event"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('picture', '')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {!props.isEditing && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="createGroup"
                  checked={createGroup}
                  onChange={(e) => setCreateGroup(e.target.checked)}
                  className="w-4 h-4 text-[#0A3A4C] border-gray-300 rounded focus:ring-[#0A3A4C]"
                />
                <label htmlFor="createGroup" className="text-sm text-gray-700">
                  Create a group with the same event title
                </label>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!props.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/50" onClick={props.onHide} />
      
      <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
        {/* Header - Mobile optimized */}
        <div className="dynamic-site-bg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {props.isEditing ? <Edit size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {props.isEditing ? 'Edit Event' : 'Create Event'}
                </h2>
                <p className="text-white/80 text-xs sm:text-sm">
                  {props.isEditing ? 'Update event details' : 'Add a new event'}
                </p>
              </div>
            </div>
            <button
              onClick={props.onHide}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Step Progress - Mobile optimized */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-colors duration-200 ${
                  currentStep >= step.id ? 'bg-white text-[#0A3A4C]' : 'bg-white/20 text-white'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={12} className="sm:size-4" /> : step.id}
                </div>
                <div className="ml-1 sm:ml-2 hidden sm:block">
                  <p className={`text-xs font-medium ${currentStep >= step.id ? 'text-white' : 'text-white/60'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 h-px mx-1 sm:mx-2 ${
                    currentStep > step.id ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body - Mobile optimized scrolling */}
        <div className="p-3 sm:p-4 max-h-[50vh] overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {steps[currentStep - 1]?.description}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Footer - Mobile stacked layout */}
        <div className="bg-gray-50 p-3 sm:p-4 flex flex-col sm:flex-row justify-between gap-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ArrowLeft size={14} />
            <span>Previous</span>
          </button>

          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
              >
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{props.isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>{props.isEditing ? 'Update Event' : 'Create Event'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Event Details Modal - Mobile optimized
function EventDetailsModal({ event, onClose, onEdit, onDelete, profile, attendees, attendanceStatus, onAttendanceChange, attendanceLoading }) {
  const [showAttendees, setShowAttendees] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDownloadCSV = () => {
    if (!attendees) return;

    const allAttendees = [
      ...attendees.willAttend.map(u => ({ status: 'Will Attend', ...u })),
      ...attendees.mightAttend.map(u => ({ status: 'Might Attend', ...u })),
      ...attendees.willNotAttend.map(u => ({ status: 'Will Not Attend', ...u })),
    ];

    const header = ['User ID', 'User Name', 'Status'];
    const rows = allAttendees.map(u => [u.userId, u.userName, u.status]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [header, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="dynamic-site-bg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CalendarIcon size={16} className="sm:size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Event Details</h2>
                <p className="text-white/80 text-xs sm:text-sm line-clamp-1">{event.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Body - Mobile optimized */}
        <div className="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Event Info */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Event Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="font-medium text-sm">{formatDate(event.start)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="font-medium text-sm">{formatDate(event.end)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium text-sm">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-sm">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Coordinator Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-sm">{event.cName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-sm">{event.cNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Mail size={14} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm break-all">{event.cEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Options - Mobile optimized */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Attendance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: 0, label: 'Will Attend', color: 'green' },
                    { value: 1, label: 'Might Attend', color: 'yellow' },
                    { value: 2, label: 'Will Not Attend', color: 'red' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (event.priceType === "paid" && option.value === 0) {
                          window.open("https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt", "_blank");
                        } else {
                          onAttendanceChange(option.value, event._id);
                        }
                      }}
                      disabled={attendanceLoading}
                      className={`flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                        attendanceStatus === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                          : 'border-gray-300 hover:border-gray-400'
                      } ${attendanceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {attendanceLoading && attendanceStatus === option.value ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
                
                {event.priceType === "paid" ? (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-blue-600 flex-shrink-0" />
                      <p className="text-blue-800 font-medium text-sm">
                        Paid Event - {event.amount} {event.currency}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                      <p className="text-green-800 font-medium text-sm">Free Event</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Image and Actions */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <img
                  src={event.picture || picture}
                  alt="Event"
                  className="w-full h-32 sm:h-48 lg:h-64 object-cover rounded-lg shadow-md"
                />
              </div>

              {/* Actions */}
              {(event.userId === profile._id || profile.profileLevel === 0) && (
                <div className="space-y-2">
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit Event</span>
                  </button>
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete Event</span>
                  </button>
                </div>
              )}

              {/* Attendee Summary */}
              {event.userId === profile._id && attendees && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 text-sm">Attendance Summary</h4>
                    <button
                      onClick={() => setShowAttendees(!showAttendees)}
                      className="text-[#0A3A4C] hover:text-[#0A3A4C]/80 text-xs"
                    >
                      {showAttendees ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Will Attend:</span>
                      <span className="font-medium">{attendees.willAttend?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Might Attend:</span>
                      <span className="font-medium">{attendees.mightAttend?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Will Not Attend:</span>
                      <span className="font-medium">{attendees.willNotAttend?.length || 0}</span>
                    </div>
                  </div>

                  {showAttendees && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleDownloadCSV}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                      >
                        <Download size={14} />
                        <span>Download CSV</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Calendar Toolbar - Mobile optimized
const CustomToolbar = ({ date, onNavigate, onView, view }) => {
  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToCurrent = () => onNavigate('TODAY');

  const label = () => {
    const month = format(date, 'MMMM yyyy');
    return month;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={goToBack}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 min-w-0">{label()}</h2>
        <button
          onClick={goToNext}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={goToCurrent}
          className="px-3 py-1.5 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium"
        >
          Today
        </button>
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border">
          {['month', 'week', 'day'].map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                view === v
                  ? 'dynamic-site-bg text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom Event Component
const EventComponent = ({ event }) => {
  const isPaid = event.priceType === 'paid';
  const isPast = new Date(event.end) < new Date();
  
  return (
    <div className="flex items-center gap-1 text-xs">
      {isPaid && <DollarSign size={10} />}
      <span className={`truncate ${isPast ? 'opacity-70' : ''}`}>
        {event.title}
      </span>
    </div>
  );
};

// Main Events Component with improved design
const locales = { "en-IN": enIN };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function Events() {
  const profile = useSelector((state) => state.profile);
  const { _id } = useParams();
  const calendarRef = useRef(null);
  
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(Views.MONTH);
  const [eventId, setEventId] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  useEffect(() => {
    fetchEvents();
    if (_id) {
      fetchEventDetails(_id);
    }
  }, [_id]);

  useEffect(() => {
    if (selectedEvent) {
      setEventId(selectedEvent._id);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (eventId) {
      checkAttendanceStatus(eventId);
    }
  }, [eventId]);

  // Filter events
  useEffect(() => {
    let filtered = allEvents;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(event => {
        if (filterType === 'upcoming') {
          return new Date(event.start) >= new Date();
        } else if (filterType === 'past') {
          return new Date(event.end) < new Date();
        } else if (filterType === 'free') {
          return event.priceType === 'free';
        } else if (filterType === 'paid') {
          return event.priceType === 'paid';
        }
        return true;
      });
    }

    if (filterDate) {
      const selectedDate = new Date(filterDate);
      filtered = filtered.filter(event => {
        const eventStart = new Date(event.start);
        return eventStart.toDateString() === selectedDate.toDateString();
      });
    }

    setFilteredEvents(filtered);
  }, [allEvents, searchQuery, filterType, filterDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`);
      const data = await response.json();
      
      const filteredEvents = data.filter((event) => {
        if (!event.groupId) return true;
        return profile.groupNames.includes(event.groupId);
      });

      const eventsWithDates = filteredEvents.map((event, index) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        id: index + 1,
      }));

      setAllEvents(eventsWithDates);
      setFilteredEvents(eventsWithDates);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}`);
      const data = await response.json();
      setSelectedEvent(data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAttendanceStatus = async (eventId) => {
    if (!eventId) return;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/events/attendees/${eventId}`);
      if (response.status === 200) {
        setAttendees(response.data);
        determineAttendanceStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  const determineAttendanceStatus = (attendees) => {
    if (attendees.willAttend.some(user => user.userId === profile._id)) {
      setAttendanceStatus(0);
    } else if (attendees.mightAttend.some(user => user.userId === profile._id)) {
      setAttendanceStatus(1);
    } else if (attendees.willNotAttend.some(user => user.userId === profile._id)) {
      setAttendanceStatus(2);
    } else {
      setAttendanceStatus(null);
    }
  };

  const handleAttendance = async (attendance, eventId) => {
    setAttendanceLoading(true);
    try {
      const body = {
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
        attendance,
        groupName: selectedEvent.title
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/events/attendEvent/${eventId}`,
        body
      );

      if (response.status === 200) {
        toast.success('Attendance updated successfully!');
        checkAttendanceStatus(eventId);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to update attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventId(event._id);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?._id) return;
    
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/events/${selectedEvent._id}`, {
        method: 'DELETE',
      });

      const updatedEvents = allEvents.filter(event => event._id !== selectedEvent._id);
      setAllEvents(updatedEvents);
      setSelectedEvent(null);
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterDate('');
  };

  const activeFiltersCount = [searchQuery, filterType !== 'all', filterDate].filter(Boolean).length;

  const eventStyleGetter = (event) => {
    const isPast = new Date(event.end) < new Date();
    const backgroundColor = isPast ? '#9CA3AF' : '#0A3A4C';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const formats = {
    timeGutterFormat: (date, culture, localizer) =>
      view === Views.WEEK ? format(date, "HH:mm") : format(date, "hh:mm a"),
  };

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 dynamic-site-bg rounded-lg flex items-center justify-center">
              <CalendarIcon size={16} className="sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Events Calendar
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {filteredEvents.length} events • {viewMode === 'calendar' ? 'Calendar View' : 'List View'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
        

            {/* Create Event Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  setModalShow(true);
                  setIsEditing(false);
                  setSelectedEvent(null);
                }}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm font-medium shadow-sm w-full sm:w-auto"
              >
                <Plus size={16} />
                <span>Create Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-4">
          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
              >
                <Filter size={14} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'upcoming', 'free', 'paid'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    filterType === type
                      ? 'dynamic-site-bg text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Filter by Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#0A3A4C]" />
              <p className="text-sm text-gray-600">Loading events...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
            {viewMode === 'calendar' ? (
              <div className="p-3 sm:p-4" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleEventClick}
                  selectable={isAdmin}
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  popup
                  showMultiDayTimes
                  view={view}
                  onView={handleViewChange}
                  formats={formats}
                  components={{
                    toolbar: CustomToolbar,
                    event: EventComponent,
                  }}
                />
              </div>
            ) : (
              <div className="p-3 sm:p-4">
                <EventDisplay 
                  events={filteredEvents}
                  onEditEvent={isAdmin ? handleEventClick : null}
                  onDeleteEvent={isAdmin ? handleDeleteEvent : null}
                />
              </div>
            )}
          </div>
        )}

        {/* Event Modal */}
        <EventModal
          show={modalShow}
          onHide={() => {
            setModalShow(false);
            setSelectedEvent(null);
            setIsEditing(false);
          }}
          isEditing={isEditing}
          selectedEvent={selectedEvent}
        />

        {/* Event Details Modal */}
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={() => {
              setIsEditing(true);
              setModalShow(true);
            }}
            onDelete={handleDeleteEvent}
            profile={profile}
            attendees={attendees}
            attendanceStatus={attendanceStatus}
            onAttendanceChange={handleAttendance}
            attendanceLoading={attendanceLoading}
          />
        )}

     
      </div>
    </div>
  );
}

export default Events;
