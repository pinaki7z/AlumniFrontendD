import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { lineSpinner } from 'ldrs';
import './individualJobPost.css';
import coverImage from '../../images/cultural-1.jpg'
import { Link } from 'react-router-dom';
import baseUrl from "../../config";
import moment from 'moment'
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Building,
  Eye,
  Star,
  Bookmark,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Briefcase,
  Check,
  AlertCircle,
  ExternalLink,
  Home,
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  User,
  Shield,
  Verified,
  CheckCircle,
  Loader2,
  Edit
} from 'lucide-react';

lineSpinner.register()

const IndividualJobPost = () => {
  const { _id, title } = useParams();
  const [cookie] = useCookies(['access_token']);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starLoading, setStarLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [candidateModalShow, setCandidateModalShow] = useState(false);
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loader, setLoader] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const fetchDonationPost = async () => {
    setLoader(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/${title}/${_id}`)
      const data = response.data;
      setJobs(data);
      setLoading(false)
      setLoader(false)
    } catch (error) {
      console.error(error);
    }
  }

  const checkIfApplied = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/jobApplication/user/${profile._id}/job/${_id}`)
      .then(response => {
        setIsApplied(response.data.result);
      })
      .catch(error => {
        console.error(error);
      });
  }

  useEffect(() => {
    checkIfApplied();
  }, [profile._id, _id]);

  let admin = profile.profileLevel === 0;

  const fetchAppliedUserIds = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/${title}/appliedCandidates/${_id}`)
    const data = response.data;
    setAppliedCandidates(data.userIds);
    setAppliedCandidatesDetails(data.appliedCandidates);
  }

  useEffect(() => {
    fetchDonationPost();
    fetchAppliedUserIds();
  }, [_id])

  // Enhanced Apply Modal Component
  function ApplyModal({ profile, job, show, onClose, onSubmit }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      userId: profile._id,
      jobId: job._id,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      location: '',
      resumeLink: '',
      totalWorkExperience: '',
    });
    const [experiences, setExperiences] = useState([]);
    const [uploadingResume, setUploadingResume] = useState(false);

    const handleChange = e => {
      const { name, value } = e.target;
      setFormData(fd => ({ ...fd, [name]: value }));
    };

    const handleExpChange = (idx, field, value) => {
      setExperiences(exps => {
        const newExps = [...exps];
        newExps[idx] = { ...newExps[idx], [field]: value };
        return newExps;
      });
    };

    const handleResumeChange = e => {
      const file = e.target.files[0];
      if (!file) return;

      setUploadingResume(true);
      const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`;
      const formDataFile = new FormData();
      formDataFile.append('image', file);

      axios.post(api, formDataFile, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          setFormData(fd => ({ ...fd, resumeLink: res.data?.imageUrl }));
          toast.success('Resume uploaded successfully!');
        })
        .catch(err => {
          console.error('Resume upload failed', err);
          toast.error('Resume upload failed');
        })
        .finally(() => {
          setUploadingResume(false);
        });
    };

    const addExperience = () => {
      setExperiences(exps => [
        ...exps,
        { designation: '', company: '', startDate: '', endDate: '', current: false }
      ]);
    };

    const removeExperience = idx => {
      setExperiences(exps => exps.filter((_, i) => i !== idx));
    };

    const handleSubmit = e => {
      e.preventDefault();
      setApplyLoading(true);

      axios.post(`${process.env.REACT_APP_API_URL}/jobApplication/`, { ...formData, experiences })
        .then(response => {
          toast.success('Application submitted successfully!');
          navigate('/home/jobs');
        })
        .catch(error => {
          toast.error('Application submission failed');
          console.error(error);
        })
        .finally(() => {
          setApplyLoading(false);
        });
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dynamic-site-bg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Apply for Position</h2>
                <p className="text-white/80 text-sm">{job.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Body (scrollable) */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Personal Info */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={16} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                    <input
                      type="text" 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                    <input
                      type="text" 
                      name="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location*</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" 
                      name="location" 
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Work Experience (Years)*</label>
                  <input
                    type="number"
                    name="totalWorkExperience"
                    value={formData.totalWorkExperience}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Resume Upload
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0A3A4C] transition-colors duration-200">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="sr-only"
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload size={32} className="mx-auto text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {uploadingResume ? 'Uploading...' : 'Click to upload resume'}
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                      </div>
                    </div>
                  </label>
                  {formData.resumeLink && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-sm">Resume uploaded successfully</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase size={16} />
                    Work Experience
                  </h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="text-[#0A3A4C] hover:text-[#0A3A4C]/80 text-sm font-medium"
                  >
                    + Add Experience
                  </button>
                </div>
                
                {experiences.map((exp, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Experience {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation*</label>
                        <input
                          type="text" 
                          value={exp.designation}
                          onChange={e => handleExpChange(idx, 'designation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company*</label>
                        <input
                          type="text" 
                          value={exp.company}
                          onChange={e => handleExpChange(idx, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                        <input
                          type="date" 
                          value={exp.startDate}
                          onChange={e => handleExpChange(idx, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date" 
                          value={exp.endDate}
                          onChange={e => handleExpChange(idx, 'endDate', e.target.value)}
                          disabled={exp.current}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 transition-colors duration-200 text-sm ${
                            exp.current ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-[#0A3A4C] focus:border-[#0A3A4C]'
                          }`}
                          required={!exp.current}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox" 
                          id={`current-${idx}`}
                          checked={exp.current}
                          onChange={e => handleExpChange(idx, 'current', e.target.checked)}
                          className="w-4 h-4 text-[#0A3A4C] border-gray-300 rounded focus:ring-[#0A3A4C]"
                        />
                        <label htmlFor={`current-${idx}`} className="ml-2 text-sm text-gray-700">Currently Working</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applyLoading || uploadingResume}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {applyLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Enhanced Candidate Details Component
  function RenderCandidateDetails({ applicants }) {
    const [openExpIds, setOpenExpIds] = useState({});
    const [loading, setLoading] = useState(false);
    
    const toggleExperience = (id) =>
      setOpenExpIds(prev => ({ ...prev, [id]: !prev[id] }));

    const handleSelectApplicant = (applicant) => {
      setLoading(true)
      axios.put(`${process.env.REACT_APP_API_URL}/jobApplication/toggleSelectCandidate/job/${_id}/user/${applicant.userId._id}`)
        .then(response => {
          fetchApplicants()
          fetchSelectedApplicants()
          setLoading(false);
        }).catch(error => {
          console.error('Error selecting candidate:', error);
          setLoading(false);
        })
    }

    return (
      <div className="p-4 sm:p-6 max-h-[500px] overflow-y-auto">
        {applicants.length === 0 && (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No candidates found</p>
          </div>
        )}

        <div className="space-y-4">
          {applicants.map((applicant, idx) => (
            <div key={applicant._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 dynamic-site-bg rounded-full flex items-center justify-center text-white font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{applicant.firstName?.trim()} {applicant.lastName?.trim()}</h3>
                    <p className="text-sm text-gray-600">{applicant.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectApplicant(applicant)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    applicant.isSelected 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : applicant.isSelected ? 'Remove' : 'Select'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{applicant.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{applicant.location || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} />
                  <span>{applicant.totalWorkExperience} years experience</span>
                </div>
                {applicant.resumeLink && (
                  <div className="flex items-center gap-2">
                    <a
                      href={applicant.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink size={14} />
                      View Resume
                    </a>
                  </div>
                )}
              </div>

              {/* Work Experience Section */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleExperience(applicant._id)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-gray-700">Work Experience</span>
                  {openExpIds[applicant._id] ? (
                    <ChevronUp size={16} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-600" />
                  )}
                </button>

                {openExpIds[applicant._id] && (
                  <div className="mt-3 space-y-3">
                    {applicant.experiences && applicant.experiences.length > 0 ? (
                      applicant.experiences.map((exp, i) => (
                        <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="font-medium text-gray-900 capitalize">{exp.designation}</div>
                          <div className="text-sm text-gray-600 capitalize">{exp.company}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-gray-500 italic">No work experience provided</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Similar improvements for other functions...
  const fetchApplicants = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/jobApplication/job/${_id}`);
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  const fetchSelectedApplicants = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobApplication/selectedApplicants/job/${_id}`);
      setSelectedApplicants(response.data);
    } catch (error) {
      console.error('Error fetching selected applicants:', error);
    }
  }

  useEffect(() => {
    fetchApplicants();
    fetchSelectedApplicants();
  }, [_id]);

  const handleStarred = (jobId) => {
    setStarLoading(true);
    axios.put(`${process.env.REACT_APP_API_URL}/${title}/${jobId}`, {
      starred: true,
      userId: profile._id
    })
      .then(response => {
        fetchDonationPost();
        setStarLoading(false);
        toast.success('Job starred successfully!');
      })
      .catch(error => {
        console.error('Error starring job:', error);
        setStarLoading(false);
        toast.error('Failed to star job');
      });
  };

  const handleVerifyJob = async (jobId) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/jobs/make/job/${jobId}/verifyToggle`);
      toast.success(response.data.message);
      fetchDonationPost();
    } catch (error) {
      console.error('Error verifying job:', error);
      toast.error('Failed to update job verification');
    }
  }

  const dummyContent = {
    responsibility: `Collaborate with cross-functional teams to achieve organizational goals.
Ensure timely completion of assigned tasks and deliverables.
Maintain clear and effective communication with internal and external stakeholders.
Contribute to process improvement initiatives and recommend best practices.
Maintain accurate records and documentation as required.
Support team operations through administrative or technical assistance.
Adhere to company policies, procedures, and standards.
Assist in problem-solving and offer creative solutions to challenges.
Participate in meetings, training sessions, and workshops.
Manage workload efficiently in a fast-paced environment.`,
    qualification: `Bachelor's degree in Computer Science or related field.
Proficiency in programming languages such as Java, Python, or C++.
Experience with data structures and algorithms.
Strong problem-solving and analytical skills.
Good communication and interpersonal skills.
Ability to work independently and as part of a team.
Experience with version control systems such as Git.`
  }

  let starButtonText = jobs.starred?.includes(profile._id) ? 'Starred' : 'Star';

  if (loader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-[#0A3A4C] mb-4" />
        <p className="text-gray-600">Loading job details...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 pb-3">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Jobs
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative mb-6 rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
          <img
            src={jobs.coverImage || coverImage}
            alt="Job Cover"
            className="w-full h-48 sm:h-64 lg:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Overlay Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              {jobs.approved && (
                <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <Verified size={12} />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {jobs.title || "Job Title"}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 font-medium">
              {jobs.company || "Company Name"}
            </p>
          </div>
        </div>

        {/* Admin Verification Button */}
        {[0, 1].includes(profile.profileLevel) && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => handleVerifyJob(jobs._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                jobs.approved 
                  ? "bg-red-100 text-red-700 hover:bg-red-200" 
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              <Shield size={16} />
              {jobs.approved ? "Remove Verification" : "Verify Job"}
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Job Description
              </h2>
              <p className="text-gray-700 leading-relaxed">{jobs.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Responsibilities
              </h2>
              <div className="text-gray-700 leading-relaxed">
                {(jobs.responsibility || dummyContent.responsibility).split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} />
                Qualifications
              </h2>
              <div className="text-gray-700 leading-relaxed">
                {(jobs.qualification || dummyContent.qualification).split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {jobs.attachments && jobs.attachments.length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Attachments
                </h2>
                <div className="space-y-2">
                  {jobs.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink size={14} />
                      {attachment.split('/').pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Job Overview & Actions */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Overview</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date Posted</p>
                    <p className="text-gray-900">{moment(jobs.createdAt).format('Do MMMM YYYY')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Apply By</p>
                    <p className="text-gray-900">{moment(jobs.applyBy).format('Do MMMM YYYY') || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900">{jobs.location || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Salary</p>
                    <p className="text-gray-900">
                      {jobs.salaryMin && jobs.salaryMax 
                        ? `${jobs.salaryMin} - ${jobs.salaryMax}` 
                        : "Not disclosed"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <div className="space-y-3">
                {/* Admin/Owner Actions */}
                {(jobs.userId === profile._id || profile.profileLevel === 0) && (
                  <>
                    <button
                      onClick={() => setCandidateModalShow(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                    >
                      <Users size={16} />
                      View Candidates ({applicants?.length})
                    </button>
                    
                    <button
                      onClick={() => setSelectedCandidateModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
                    >
                      <CheckCircle size={16} />
                      Selected Candidates ({selectedApplicants?.length})
                    </button>
                  </>
                )}

                {/* Applicant Actions */}
                {!(jobs.userId === profile._id || [0, 1].includes(profile.profileLevel)) && (
                  <>
                    {isApplied ? (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg font-medium">
                        <CheckCircle size={16} />
                        Application Submitted
                      </div>
                    ) : (
                      <button
                        onClick={() => setModalShow(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                      >
                        <Briefcase size={16} />
                        Apply Now
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleStarred(jobs._id)}
                      disabled={starLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                      {starLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Star size={16} className={jobs.starred?.includes(profile._id) ? 'fill-current text-yellow-500' : ''} />
                      )}
                      {starLoading ? 'Loading...' : starButtonText}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ApplyModal
          profile={profile}
          job={jobs}
          show={modalShow}
          onClose={() => setModalShow(false)}
        />

        {/* Candidates Modal */}
        {candidateModalShow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Interested Candidates ({applicants?.length})
                </h2>
                <button
                  onClick={() => setCandidateModalShow(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <RenderCandidateDetails applicants={applicants} />
            </div>
          </div>
        )}

        {/* Selected Candidates Modal */}
        {selectedCandidateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Selected Candidates ({selectedApplicants?.length})
                </h2>
                <button
                  onClick={() => setSelectedCandidateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <RenderCandidateDetails applicants={selectedApplicants} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualJobPost;
