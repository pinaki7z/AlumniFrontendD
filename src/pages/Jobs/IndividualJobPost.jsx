import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { GiMoneyStack } from 'react-icons/gi';
import { FaCalendarAlt } from "react-icons/fa";
import { FcBriefcase } from "react-icons/fc";
import { FaMapMarkerAlt } from "react-icons/fa";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React from "react";
import Form from 'react-bootstrap/Form';
import { toast } from "react-toastify";
import { lineSpinner } from 'ldrs';
import './individualJobPost.css';
import coverImage from '../../images/cultural-1.jpg'
import { fontSize } from "@mui/system";
import { Link } from 'react-router-dom';
import { CiLocationArrow1 } from "react-icons/ci";
import { RiHomeSmileLine } from "react-icons/ri";
import baseUrl from "../../config";
import { Spinner } from "react-bootstrap";
import moment from 'moment'
import { useNavigate } from "react-router-dom";

lineSpinner.register()




const IndividualJobPost = () => {
    const { _id, title } = useParams();
    const [cookie] = useCookies(['access_token']);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [starLoading, setStarLoading] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(null);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [modalShow, setModalShow] = React.useState(false);
    const [candidateModalShow, setCandidateModalShow] = React.useState(false);
    const [appliedCandidates, setAppliedCandidates] = useState([]);
    const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loader, setLoader] = useState(true);
    const [isApplied, setIsApplied] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [selectedCandidateModal, setSelectedCandidateModal] = useState(false);
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const toggleShareOptions = () => {
        setShowShareOptions(!showShareOptions);
    };
    const profile = useSelector((state) => state.profile);

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

    let admin;
    if (profile.profileLevel === 0) {
        admin = true;
    }


    const fetchAppliedUserIds = async () => {
        console.log('id', _id)
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/${title}/appliedCandidates/${_id}`)
        const data = response.data;
        setAppliedCandidates(data.userIds);
        setAppliedCandidatesDetails(data.appliedCandidates);
    }




    useEffect(() => {
        fetchDonationPost();
        // if (title === 'Jobs') {
        fetchAppliedUserIds();
        // }
        // if (title === 'Internships') {
        //     fetchAppliedUserIds();
        // }
    }, [_id])



    // new apply form 
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
            const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`;
            const formDataFile = new FormData();
            formDataFile.append('image', file);

            axios.post(api, formDataFile, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(res => {
                    setFormData(fd => ({ ...fd, resumeLink: res.data?.imageUrl }));
                })
                .catch(err => console.error('Resume upload failed', err));
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

            axios.post(`${process.env.REACT_APP_API_URL}/jobApplication/`, { ...formData, experiences })
                .then(response => {
                    navigate('/home/jobs');
                })
            // console.log('Form data submitted:', { ...formData, experiences });
        };

        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 flex flex-col ">
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex-shrink-0">
                        <h2 className="text-xl font-semibold">Apply</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 ">
                        {/* Body (scrollable) */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[50vh] ">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text" name="firstName" value={formData.firstName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text" name="lastName" value={formData.lastName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel" name="phone" value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email" name="email" value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Location</label>
                                <input
                                    type="text" name="location" value={formData.location}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="totalWorkExperience" className="block text-sm font-medium text-gray-700">
                                    Total Work Experience (Years)
                                </label>
                                <input
                                    type="number"
                                    id="totalWorkExperience"
                                    name="totalWorkExperience"
                                    value={formData.totalWorkExperience}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.1"
                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">Upload Resume</label>
                                <input
                                    type="file"
                                    id="resume"
                                    accept=".pdf"
                                    onChange={handleResumeChange}
                                    className="mt-1 block w-full"
                                    required={!formData.resumeLink}
                                />
                            </div>

                            {/* Work Experience */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
                                {experiences.map((exp, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded p-4 mb-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Experience {idx + 1}</span>
                                            {experiences.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeExperience(idx)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm">Designation</label>
                                                <input
                                                    type="text" value={exp.designation}
                                                    onChange={e => handleExpChange(idx, 'designation', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm">Company</label>
                                                <input
                                                    type="text" value={exp.company}
                                                    onChange={e => handleExpChange(idx, 'company', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                            <div>
                                                <label className="block text-sm">Start Date</label>
                                                <input
                                                    type="date" value={exp.startDate}
                                                    onChange={e => handleExpChange(idx, 'startDate', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm">End Date</label>
                                                <input
                                                    type="date" value={exp.endDate}
                                                    onChange={e => handleExpChange(idx, 'endDate', e.target.value)}
                                                    disabled={exp.current}
                                                    className={`mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 ${exp.current ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-blue-500'
                                                        }`}
                                                    required={!exp.current}
                                                />
                                            </div>
                                            <div className="flex items-center mt-5">
                                                <input
                                                    type="checkbox" id={`current-${idx}`}
                                                    checked={exp.current}
                                                    onChange={e => handleExpChange(idx, 'current', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`current-${idx}`} className="ml-2 text-sm">Currently Working</label>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addExperience}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    + Add Experience
                                </button>
                            </div>
                        </div>

                        {/* Footer (fixed) */}
                        <div className="px-6 py-4 border-t flex-shrink-0 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }


    const formatCreatedAt = (createdAt) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(createdAt).toLocaleTimeString(undefined, options);
        const dateString = new Date(createdAt).toLocaleDateString();

        return `${dateString} ${timeString} `;
    };

    const handleStatusUpdate = (status, comment, userId) => {
        console.log('job id', status, comment, userId)
        setStatusLoading(status);

        axios.put(`${process.env.REACT_APP_API_URL}/jobs/${_id}/updateJobStatus`, { userId, status, comment })
            .then(response => {
                console.log("Job status updated successfully:", response.data.message);
                fetchAppliedUserIds();
                setStatusLoading(false);
            })
            .catch(error => {
                console.error("Error updating job status:", error.response.data.message);
            });
    };

    const fetchApplicants = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL}/jobApplication/job/${_id}`
            );
            setApplicants(data);
        } catch (error) {
            console.error('Error fetching applicants:', error);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [_id]);



    function RenderCandidateDetails({ applicants }) {
        const [openExpIds, setOpenExpIds] = useState({});
        const [loading, setLoading] = useState(false);
        const toggleExperience = (id) =>
            setOpenExpIds(prev => ({ ...prev, [id]: !prev[id] }));

        const handleSelectApplicant = (applicant) => {
            setLoading(true)
            axios.put(`${process.env.REACT_APP_API_URL}/jobApplication/toggleSelectCandidate/job/${_id}/user/${applicant.userId._id}`)
                .then(response => {
                    // console.log('Job starred successfully:', response.data);
                    // fetchAppliedUserIds();
                    // setStarLoading(false);
                    fetchApplicants()
                    fetchSelectedApplicants()
                    setLoading(false);
                }).catch(error => {
                    console.error('Error starring job:', error);
                    // Handle error if needed
                    setLoading(false);
                })
        }

        return (
            <div className="p-6 max-h-[500px] overflow-y-auto">

                {applicants.length === 0 && (
                    <p className="text-gray-500">No candidates found.</p>
                )}

                <div className="space-y-4">
                    {applicants.map((applicant, idx) => (
                        <div
                            key={applicant._id}
                            className="p-4 bg-white shadow rounded-lg border"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 font-bold text-lg">
                                    {idx + 1}.
                                </span>
                            </div>

                            <div className="grid grid-cols-2 ">
                                <div className="mb-3">
                                    <span className="block text-sm font-semibold text-gray-700">
                                        Name
                                    </span>
                                    <span className="block text-base text-gray-900">
                                        {applicant.firstName.trim()} {applicant.lastName.trim()}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="block text-sm font-semibold text-gray-700">
                                        Email
                                    </span>
                                    <span className="block text-base text-gray-900">
                                        {applicant.email}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => toggleExperience(applicant._id)}
                                    className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                >
                                    <span className="text-sm font-semibold text-gray-700">
                                        Work Experience
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-gray-600 transform transition-transform ${openExpIds[applicant._id] ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                <div
                                    className={`mt-2 space-y-2 overflow-hidden transition-all ${openExpIds[applicant._id] ? 'max-h-screen' : 'max-h-0'
                                        }`}
                                >
                                    {applicant.experiences && applicant.experiences.length > 0 ? (
                                        applicant.experiences.map((exp, i) => (
                                            <div
                                                key={i}
                                                className="p-3 bg-white border border-gray-200 rounded shadow-sm"
                                            >
                                                <p className="text-sm  text-gray-800">
                                                    <span className="font-bold text-base capitalize"> {exp.designation}</span>
                                                    <span className="  capitalize block">{exp.company}</span>
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {exp.startDate} –{' '}
                                                    {exp.current ? 'Present' : exp.endDate || 'N/A'}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-3 text-sm text-gray-500">No experience</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex ">

                                <p className="p-3 text-sm text-gray-600">
                                    Total Work Experience: {applicant.totalWorkExperience} years
                                </p>

                                {applicant.resumeLink && (
                                    <div className="p-3">
                                        <a
                                            href={applicant.resumeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline text-sm"
                                        >
                                            View Resume
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="text-sm flex justify-end">
                                <button onClick={() => handleSelectApplicant(applicant)}
                                    className={`px-4 py-2 rounded shadow-sm text-white font-semibold focus:outline-none ${applicant.isSelected ? 'bg-red-500 border-red-500' : 'bg-green-500 border-green-500'} ${loading ? 'opacity-50' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (applicant.isSelected ? 'Removing...' : 'Selecting...') : applicant.isSelected ? 'Remove' : 'Select'}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function RenderSelectedCandidateDetails({ applicants }) {
        const [openExpIds, setOpenExpIds] = useState({});
        const [loading, setLoading] = useState(false);
        const toggleExperience = (id) =>
            setOpenExpIds(prev => ({ ...prev, [id]: !prev[id] }));

        const handleSelectApplicant = (applicant) => {
            setLoading(true)
            axios.put(`${process.env.REACT_APP_API_URL}/jobApplication/toggleSelectCandidate/job/${_id}/user/${applicant.userId._id}`)
                .then(response => {
                    // console.log('Job starred successfully:', response.data);
                    // fetchAppliedUserIds();
                    // setStarLoading(false);
                    fetchSelectedApplicants()
                    setLoading(false);
                }).catch(error => {
                    console.error('Error starring job:', error);
                    // Handle error if needed
                    setLoading(false);
                })
        }

        const downloadCSV = () => {
            // 1. Define headers
            const headers = [
                'S. No',
                'Name',
                'Email',
                'Phone',
                'Resume Link',
                'Total Work Experience'
            ];

            // 2. Build rows
            const rows = applicants.map((app, idx) => [
                idx + 1,
                `${app.firstName.trim()} ${app.lastName.trim()}`,
                app.email || '',
                app.phone || '',
                app.resumeLink || '',
                app.totalWorkExperience || ''
            ]);

            // 3. Convert to CSV string
            let csvContent = headers.join(',') + '\n';
            rows.forEach(row => {
                // wrap each field in quotes to escape commas
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });

            // 4. Create blob and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'applicants.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="p-6 max-h-[500px] overflow-y-auto">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={downloadCSV}
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                    >
                        Download CSV
                    </button>
                </div>
                {applicants.length === 0 && (
                    <p className="text-gray-500">No candidates found.</p>
                )}

                <div className="space-y-4">
                    {applicants.map((applicant, idx) => (
                        <div
                            key={applicant._id}
                            className="p-4 bg-white shadow rounded-lg border"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 font-bold text-lg">
                                    {idx + 1}.
                                </span>
                            </div>

                            <div className="grid grid-cols-2 ">
                                <div className="mb-3">
                                    <span className="block text-sm font-semibold text-gray-700">
                                        Name
                                    </span>
                                    <span className="block text-base text-gray-900">
                                        {applicant.firstName.trim()} {applicant.lastName.trim()}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="block text-sm font-semibold text-gray-700">
                                        Email
                                    </span>
                                    <span className="block text-base text-gray-900">
                                        {applicant.email}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => toggleExperience(applicant._id)}
                                    className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                >
                                    <span className="text-sm font-semibold text-gray-700">
                                        Work Experience
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-gray-600 transform transition-transform ${openExpIds[applicant._id] ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                <div
                                    className={`mt-2 space-y-2 overflow-hidden transition-all ${openExpIds[applicant._id] ? 'max-h-screen' : 'max-h-0'
                                        }`}
                                >
                                    {applicant.experiences && applicant.experiences.length > 0 ? (
                                        applicant.experiences.map((exp, i) => (
                                            <div
                                                key={i}
                                                className="p-3 bg-white border border-gray-200 rounded shadow-sm"
                                            >
                                                <p className="text-sm  text-gray-800">
                                                    <span className="font-bold text-base capitalize"> {exp.designation}</span>
                                                    <span className="  capitalize block">{exp.company}</span>
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {exp.startDate} –{' '}
                                                    {exp.current ? 'Present' : exp.endDate || 'N/A'}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-3 text-sm text-gray-500">No experience</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex ">

                                <p className="p-3 text-sm text-gray-600">
                                    Total Work Experience: {applicant.totalWorkExperience} years
                                </p>

                                {applicant.resumeLink && (
                                    <div className="p-3">
                                        <a
                                            href={applicant.resumeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline text-sm"
                                        >
                                            View Resume
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="text-sm flex justify-end">
                                <button onClick={() => handleSelectApplicant(applicant)}
                                    className={`px-4 py-2 rounded shadow-sm text-white font-semibold focus:outline-none ${applicant.isSelected ? 'bg-red-500 border-red-500' : 'bg-green-500 border-green-500'} ${loading ? 'opacity-50' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (applicant.isSelected ? 'Removing...' : 'Selecting...') : applicant.isSelected ? 'Remove' : 'Select'}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        );
    }
    const CandidatesModal = () => (
        <Modal
            show={candidateModalShow}
            onHide={() => setCandidateModalShow(false)}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {` Interested Candidates (${applicants?.length})`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <RenderCandidateDetails applicants={applicants} />
            </Modal.Body>
        </Modal>
    );


    const ShowSelectedCandidate = () => (
        <Modal
            show={selectedCandidateModal}
            onHide={() => setSelectedCandidateModal(false)}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {` Interested Candidates (${selectedApplicants?.length})`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <RenderSelectedCandidateDetails applicants={selectedApplicants} />
            </Modal.Body>
        </Modal>
    );




    const viewCandidatesButton = (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setCandidateModalShow(true)}>Interested Candidates (<span>{applicants?.length}</span>)</button>
    );

    const renderImages = () => {
        return jobs.attachments.map((attachment, index) => {
            if (attachment.endsWith('.pdf')) {
                return null; // Skip rendering PDFs
            } else if (attachment.endsWith('.jpg') || attachment.endsWith('.jpeg') || attachment.endsWith('.png')) {
                return (
                    <div key={index} className="image-link">
                        <button style={{ border: 'none', borderBottom: 'solid 1px' }} onClick={() => handleImageClick(`${process.env.REACT_APP_API_URL}/uploads/${attachment}`)}>
                            {attachment}
                        </button>
                    </div>
                );
            } else {
                return null;
            }
        });
    };
    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowImagesModal(true);
    };

    const handleStarred = (jobId) => {
        setStarLoading(true);
        axios.put(`${process.env.REACT_APP_API_URL}/${title}/${jobId}`, {
            starred: true,
            userId: profile._id
        })
            .then(response => {
                console.log('Job starred successfully:', response.data);
                fetchDonationPost();
                setStarLoading(false);
            })
            .catch(error => {
                console.error('Error starring job:', error);
                // Handle error if needed
            });

    };

    const ImagesModal = () => (
        <Modal
            show={showImagesModal}
            onHide={() => setShowImagesModal(false)}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    View Image
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <img
                    src={selectedImage}
                    alt="Selected Image"
                    style={{ width: '100%', height: '100%' }}
                />
            </Modal.Body>
        </Modal>
    );
    let starButtonText
    if (jobs.starred) {
        starButtonText = jobs.starred.includes(profile._id) ? 'Starred' : 'Star';
    }
    else starButtonText = 'Star'

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
    const handleVerifyJob = async (jobId) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/jobs/make/job/${jobId}/verifyToggle`);
            // console.log('Job verified successfully:', response.data);
            toast.dismiss();

            toast.success(response.data.message);
            fetchDonationPost();
        } catch (error) {
            toast.disable()
            console.error('Error verifying job:', error);
            // Handle error if needed
        }
    }

    const fetchSelectedApplicants = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobApplication/selectedApplicants/job/${_id}`);
            // console.log('Selected Applicants:', response.data);
            setSelectedApplicants(response.data);
        } catch (error) {
            console.error('Error fetching selected applicants:', error);
            // Handle error if needed
        }
    }
    useEffect(() => {
        fetchSelectedApplicants();
    }, [_id]);

    if (loader) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-[90px] w-[90px] border-b-2 border-gray-900"></div>

            </div>
        )
    }

    return (
        <div className="mx-5 ">
            <div className="border border-gray-600 mt-4 shadow-md rounded-lg mb-5 ">
                <img
                    src={jobs.coverImage || coverImage}
                    alt="Job Cover"
                    className="w-full h-[350px] object-cover rounded-lg "
                />
            </div>
            {[0, 1].includes(profile.profileLevel) && <div className="flex justify-center ">
                <button
                    onClick={() => handleVerifyJob(jobs._id)}
                    className={`${jobs.approved ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} text-white font-bold py-2 px-4 rounded mt-4`}
                >
                    {jobs.approved ? "Make Job Unverified" : "Make Job Verified"}
                </button>
            </div>}

            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2">
                    <h1 className="job-title">{jobs.title || "Job Title"}</h1>
                    <p className="company-name">{jobs.company || "Company Name"}</p>
                    <div className="job-description">
                        <h2>Job Description</h2>
                        <p>{jobs.description}</p>
                    </div>
                    <div className="">
                        <h2 className="text-xl mb-1  font-bold ">Responsibilities</h2>
                        <p>
                            {(jobs.responsibility || dummyContent.responsibility).split('\n').map((line, index) => (
                                <span key={index}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>
                    <div className="mb-7">
                        <h2 className="text-xl mb-1  font-bold ">Qualifications</h2>
                        <p>
                            {(jobs.qualification || dummyContent.qualification).split('\n').map((line, index) => (
                                <span key={index}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>

                </div>
                <div className=" md:col-span-1 p-4">
                {(profile.profileLevel === 0 || jobs.userId === profile._id) &&    <div>
                        <button
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded mb-4"
                            onClick={() => setSelectedCandidateModal(true)}
                        >
                            Show Selected Candidates({selectedApplicants?.length})
                        </button>

                    </div>}
                    <div className="bg-gray-100 rounded-xl w-full shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Job Overview</h2>

                        <ul className="space-y-4">
                            <li className="flex items-start space-x-4">
                                <FaCalendarAlt className="text-blue-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Date Posted</span>
                                    <span className="text-gray-800">{moment(jobs.createdAt).format('Do MMMM YYYY') || "N/A"}</span>
                                </div>
                            </li>

                            <li className="flex items-start space-x-4">
                                <FaCalendarAlt className="text-green-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Apply By</span>
                                    <span className="text-gray-800">{moment(jobs.applyBy).format('Do MMMM YYYY') || "N/A"}</span>
                                </div>
                            </li>

                            <li className="flex items-start space-x-4">
                                <FaMapMarkerAlt className="text-red-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Location</span>
                                    <span className="text-gray-800">{jobs.location || "N/A"}</span>
                                </div>
                            </li>



                            <li className="flex items-start space-x-4">
                                <GiMoneyStack className="text-yellow-500 text-xl mt-1" />
                                <div>
                                    <span className="block text-gray-600 font-medium">Salary</span>
                                    <span className="text-gray-800">{jobs.salaryMin} - {jobs.salaryMax}</span>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 flex flex-wrap gap-4">
                            {(jobs.userId === profile._id || profile.profileLevel === 0) ? (
                                <>
                                    {viewCandidatesButton}
                                </>
                            ) : isApplied ? (
                                <>
                                    <button className="bg-blue-200 text-blue-800 px-5 py-2 rounded font-medium" disabled>
                                        Applied
                                    </button>
                                </>
                            ) : profile.profileLevel === 0 || profile.profileLevel === 1 ? (
                                <></>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setModalShow(true)}
                                        className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded transition duration-200"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => handleStarred(jobs._id)}
                                        className="bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded transition duration-200"
                                    >
                                        {starLoading ? 'Loading...' : starButtonText}
                                    </button>

                                    <ApplyModal
                                        profile={profile}
                                        job={jobs}
                                        show={modalShow}
                                        onClose={() => setModalShow(false)}

                                    />
                                </>
                            )}
                        </div>

                        <CandidatesModal />
                        <ShowSelectedCandidate />
                    </div>

                    <div className="mb-10 w-full">
                        <h2 className="text-xl mb-1  font-bold ">Attachments</h2>
                        {(jobs.attachments || []).map(attachment => (
                            <a key={attachment} href={attachment} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:text-blue-700 underline">
                                {attachment}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
            {/* <ApplyModal show={modalShow} onHide={() => setModalShow(false)} /> */}
        </div >
    )


}

export default IndividualJobPost;