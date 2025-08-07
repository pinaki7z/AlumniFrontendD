import React, { useState, useEffect } from 'react';
import { RiBriefcase4Line } from "react-icons/ri";
import { useCookies } from 'react-cookie';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
  Plus, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Building2, 
  User, 
  X, 
  Edit2, 
  Trash2,
  Loader2,
  Clock,
  Globe
} from 'lucide-react';

export const WorkExperience = () => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [cookie] = useCookies(['token']);
  const profile = useSelector((state) => state.profile);
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/workExperience/${profile._id}`, {
        headers: {
          'Authorization': `Bearer ${cookie.token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch work experiences');
      }
      const data = await response.json();
      setWorkExperiences(data);
    } catch (error) {
      console.error('Error fetching work experiences:', error);
      toast.error('Failed to load work experiences');
    } finally {
      setLoading(false);
    }
  };

  const WorkExperienceModal = ({ show, onHide, editData = null }) => {
    const [forms, setForms] = useState(editData ? [editData] : [{}]);
    const [submitting, setSubmitting] = useState(false);

    const generateYears = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear; i >= currentYear - 50; i--) {
        years.push(i);
      }
      return years;
    };

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleAddExperience = () => {
      setForms([...forms, {}]);
    };

    const handleRemoveExperience = (index) => {
      if (forms.length > 1) {
        setForms(forms.filter((_, i) => i !== index));
      }
    };

    const handleInputChange = (index, field, value) => {
      const newForms = [...forms];
      newForms[index][field] = value;
      
      // If current work is checked, clear end date
      if (field === 'currentWork' && value) {
        newForms[index].endMonth = '';
        newForms[index].endYear = '';
      }
      
      setForms(newForms);
    };

    const validateForm = (form) => {
      const required = ['title', 'companyName', 'startMonth', 'startYear'];
      return required.every(field => form[field] && form[field].trim());
    };

    const handleSave = async () => {
      // Validate all forms
      const invalidForms = forms.filter(form => !validateForm(form));
      if (invalidForms.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      setSubmitting(true);
      try {
        const updatedForms = forms.map(form => ({
          ...form,
          endMonth: form.currentWork ? 'current' : form.endMonth,
          endYear: form.currentWork ? '' : form.endYear
        }));

        const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/workExperience/${profile._id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedForms),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookie.token}`
          }
        });

        if (response.ok) {
          toast.success(editData ? 'Experience updated successfully!' : 'Experience added successfully!');
          fetchWorkExperiences();
          onHide();
        } else {
          throw new Error('Failed to save experience');
        }
      } catch (error) {
        console.error('Error saving experience:', error);
        toast.error('Failed to save experience');
      } finally {
        setSubmitting(false);
      }
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 dynamic-site-bg text-white">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6" />
              <h2 className="text-xl font-semibold">
                {editData ? 'Edit Experience' : 'Add Work Experience'}
              </h2>
            </div>
            <button 
              onClick={onHide}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            {forms.map((form, index) => (
              <div key={index} className="mb-8">
                {index > 0 && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Experience #{index + 1}</span>
                    <button
                      onClick={() => handleRemoveExperience(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={form.title || ''}
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={form.companyName || ''}
                      onChange={(e) => handleInputChange(index, 'companyName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New York, NY"
                      value={form.location || ''}
                      onChange={(e) => handleInputChange(index, 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type
                    </label>
                    <select
                      value={form.locationType || ''}
                      onChange={(e) => handleInputChange(index, 'locationType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                    >
                      <option value="">Select type</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Technology"
                      value={form.industry || ''}
                      onChange={(e) => handleInputChange(index, 'industry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Current Work Checkbox */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.currentWork || false}
                        onChange={(e) => handleInputChange(index, 'currentWork', e.target.checked)}
                        className="w-5 h-5 text-[#71be95] border-gray-300 rounded focus:ring-[#71be95]"
                      />
                      <span className="text-sm font-medium text-gray-700">I currently work here</span>
                    </label>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={form.startMonth || ''}
                        onChange={(e) => handleInputChange(index, 'startMonth', e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                      >
                        <option value="">Month</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={form.startYear || ''}
                        onChange={(e) => handleInputChange(index, 'startYear', e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all"
                      >
                        <option value="">Year</option>
                        {generateYears().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date {form.currentWork && <span className="text-sm text-gray-500">(Current)</span>}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={form.endMonth || ''}
                        onChange={(e) => handleInputChange(index, 'endMonth', e.target.value)}
                        disabled={form.currentWork}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Month</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={form.endYear || ''}
                        onChange={(e) => handleInputChange(index, 'endYear', e.target.value)}
                        disabled={form.currentWork}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Year</option>
                        {generateYears().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your role and achievements..."
                      value={form.description || ''}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Button */}
            <button
              onClick={handleAddExperience}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#71be95] hover:text-[#71be95] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Experience
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onHide}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-6 py-2 dynamic-site-bg text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (startMonth, startYear, endMonth, endYear) => {
    const start = `${startMonth} ${startYear}`;
    const end = endMonth === 'current' ? 'Present' : `${endMonth} ${endYear || ''}`.trim();
    return `${start} - ${end}`;
  };

  const calculateDuration = (startMonth, startYear, endMonth, endYear) => {
    const startDate = new Date(`${startMonth} 1, ${startYear}`);
    const endDate = endMonth === 'current' ? new Date() : new Date(`${endMonth} 1, ${endYear}`);
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      let duration = `${years} year${years !== 1 ? 's' : ''}`;
      if (remainingMonths > 0) {
        duration += ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
      return duration;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-2xl p-6 sm:p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Work Experience</h1>
              <p className="text-white/90 mt-1">Showcase your professional journey and career milestones</p>
            </div>
          </div>
          
          <button
            onClick={() => setModalShow(true)}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Work Experience
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#71be95] mx-auto mb-4" />
                <p className="text-gray-600">Loading work experiences...</p>
              </div>
            </div>
          ) : workExperiences.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No work experience yet</h3>
              <p className="text-gray-600 mb-6">Add your professional experience to showcase your career journey</p>
              <button
                onClick={() => setModalShow(true)}
                className="dynamic-site-bg text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Experience
              </button>
            </div>
          ) : (
            workExperiences.map((experience, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-lg flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {experience.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">{experience.companyName}</span>
                        </div>
                        {experience.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{experience.location}</span>
                            </div>
                          </>
                        )}
                        {experience.locationType && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              <span>{experience.locationType}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(experience.startMonth, experience.startYear, experience.endMonth, experience.endYear)}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{calculateDuration(experience.startMonth, experience.startYear, experience.endMonth, experience.endYear)}</span>
                        </div>
                        {experience.endMonth === 'current' && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Current
                            </span>
                          </>
                        )}
                      </div>

                      {experience.industry && (
                        <div className="mb-3">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {experience.industry}
                          </span>
                        </div>
                      )}

                      {experience.description && (
                        <p className="text-gray-700 leading-relaxed">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingIndex(index);
                        setModalShow(true);
                      }}
                      className="p-2 text-gray-400 hover:text-[#71be95] hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit experience"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        <WorkExperienceModal
          show={modalShow}
          onHide={() => {
            setModalShow(false);
            setEditingIndex(-1);
          }}
          editData={editingIndex >= 0 ? workExperiences[editingIndex] : null}
        />

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #71be95 transparent;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 1px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #71be95, #5fa080);
            border-radius: 1px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #5fa080, #4d8a66);
          }
        `}</style>
      </div>
    </div>
  );
};
