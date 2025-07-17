import pic from "../../../images/profilepic.jpg";
import { Avatar, IconButton, Modal, Box } from '@mui/material';
import postDelete from "../../../images/post-delete.svg";
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { lineSpinner } from 'ldrs';
import format from "date-fns/format";
import baseUrl from "../../../config";
import * as XLSX from 'xlsx';  // Import the XLSX library
import { Link } from "react-router-dom";
import { Calendar, Check, Clock, Loader2, Mail, MapPin, Phone, User, Users } from "lucide-react";

lineSpinner.register();

const EventDisplay = ({ event, userId, userData }) => {
    const profile = useSelector((state) => state.profile);
    const [newEvent, setNewEvent] = useState(event);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [attendees, setAttendees] = useState();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);



    useEffect(() => {
        checkAttendanceStatus();
    }, []);

    const checkAttendanceStatus = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/events/attendees/${event._id}`,
            );
            if (response.status === 200) {
                setAttendees(response.data);
                determineAttendanceStatus(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error :', error);
            toast.error(error.response?.data?.message || 'An error occurred.');
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
        setLoading(true);
        try {
            let body = {
                userId: profile._id,
                userName: `${profile.firstName} ${profile.lastName}`,
                profilePicture: profile.profilePicture,
                attendance,
                groupName: event.title,
                department: profile.department,
                graduatingYear: profile.graduatingYear,
                classNo: profile.class
            };

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/events/attendEvent/${eventId}`,
                body
            );

            if (response.status === 200) {
                toast.dismiss();
                toast.success('Vote submitted successfully.');
                setNewEvent(response.data.event);
                checkAttendanceStatus();
            } else {
                console.error('Unexpected response status:', response.status, response.message);
                alert('An unexpected error occurred. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error(error.response?.data?.message || 'An error occurred.');
            setLoading(false);
        }
    };

    const formatCreatedAt = (timestamp) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
        const dateString = new Date(timestamp).toLocaleDateString();
        return `${dateString} ${timeString}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleOpen = () => {
        checkAttendanceStatus();
        setOpen(true)
    };
    const handleClose = () => setOpen(false);

    const handleDeleteEvent = async () => {
        try {
            const url = `${process.env.REACT_APP_API_URL}/events/${event._id}`;
            const requestBody = {
                groupName: event.title
            };
            const response = await axios.delete(url, { data: requestBody });

            if (response.status === 200) {
                toast.success("Event deleted successfully");
                window.location.reload();
            } else {
                console.error("Failed to delete event");
                toast.error("Failed to delete event");
            }
        } catch (error) {
            console.error("Error occurred while deleting event:", error);
        }
    };

    // Function to export attendees as Excel file
    const exportAttendeesToExcel = () => {
        if (!attendees) {
            return;
        }

        // Helper function to map user data
        const mapAttendees = (attendeesList) => {
            return attendeesList.map(attendee => ({
                'Name': attendee.userName,
                'Graduating Year': attendee.graduatingYear || 'N/A',  // Default to 'N/A' if not available
                'Class': attendee.class || 'N/A',  // Default to 'N/A' if not available
                'Department': attendee.department || 'N/A'  // Default to 'N/A' if not available
            }));
        };

        // Extract attendee details with the new columns
        const willAttendNames = mapAttendees(attendees.willAttend);
        const mightAttendNames = mapAttendees(attendees.mightAttend);
        const willNotAttendNames = mapAttendees(attendees.willNotAttend);

        // Create worksheets for each attendance choice
        const willAttendSheet = XLSX.utils.json_to_sheet(willAttendNames, { header: ['Name', 'Graduating Year', 'Class', 'Department'] });
        const mightAttendSheet = XLSX.utils.json_to_sheet(mightAttendNames, { header: ['Name', 'Graduating Year', 'Class', 'Department'] });
        const willNotAttendSheet = XLSX.utils.json_to_sheet(willNotAttendNames, { header: ['Name', 'Graduating Year', 'Class', 'Department'] });

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Append sheets to the workbook
        XLSX.utils.book_append_sheet(workbook, willAttendSheet, "Will Attend");
        XLSX.utils.book_append_sheet(workbook, mightAttendSheet, "Might Attend");
        XLSX.utils.book_append_sheet(workbook, willNotAttendSheet, "Will Not Attend");

        // Write the workbook to a file
        XLSX.writeFile(workbook, `${event.title}_Attendees.xlsx`);
    };

    const handleDownloadCSV = () => {
        // Flatten all attendees into one array with a status field
        const allAttendees = [
            ...attendees.willAttend.map(u => ({ status: 'Will Attend', ...u })),
            ...attendees.mightAttend.map(u => ({ status: 'Might Attend', ...u })),
            ...attendees.willNotAttend.map(u => ({ status: 'Will Not Attend', ...u })),
        ]

        // Build CSV rows: header + data rows
        const header = ['User ID', 'User Name', 'Profile Picture', 'Status']
        const rows = allAttendees.map(u => [
            u.userId,
            u.userName,
            u.profilePicture,
            u.status
        ])

        // Join into a single CSV string
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [header, ...rows]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n')

        // Create a temporary link to trigger download
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', 'event_attendees.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }



    return (
        <>
            <div className='top'>
                <Link
                    to={`/home/members/${userId}`}
                    className="flex items-center gap-4 no-underline text-black"
                >
                    {userData.profilePicture ? (
                        <img src={userData.profilePicture} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <Avatar src={pic} style={{ width: '50px', height: '50px' }} />
                    )}
                    <div className=''>
                        <h4 className="font-semibold">{(userData.firstName + ' ' + userData.lastName) || 'N/A'}</h4>
                        <span className="text-sm text-gray-600">{formatCreatedAt(event.createdAt)}</span>
                    </div>
                </Link>
                {userId === profile._id && <IconButton className='delete-button' style={{ marginRight: '10px', marginLeft: 'auto' }}>
                    <img src={postDelete} onClick={handleDeleteEvent} />
                </IconButton>}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Event Details Section */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex gap-2">
                            <span className="text-sm font-medium text-gray-700">Title:</span>
                            <span className="text-sm text-gray-900 font-semibold">{event.title}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Start Date:</span>
                                <p className="text-sm text-gray-900">{formatDate(event.start)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">End Date:</span>
                                <p className="text-sm text-gray-900">{formatDate(event.end)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Start Time:</span>
                                <p className="text-sm text-gray-900">{event.startTime} hrs</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">End Time:</span>
                                <p className="text-sm text-gray-900">{event.endTime} hrs</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 grid grid-cols-2 pt-2 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Coordinator Name:</span>
                                <p className="text-sm text-gray-900">{event.cName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Coordinator Number:</span>
                                <p className="text-sm text-gray-900">{event.cNumber}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Coordinator Email:</span>
                                <p className="text-sm text-gray-900 break-all">{event.cEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Location:</span>
                                <p className="text-sm text-gray-900">{event.location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Options Section */}
                <div className="border-t border-gray-200 pt-1 space-y-2">
                    {userId === profile._id && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleOpen}
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors duration-200"
                            >
                                <Users className="w-4 h-4" />
                                See event attendees
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Your Attendance</h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {/* I will attend */}
                            <label className="flex items-center gap-3 p-1 border text-[10px] border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={attendanceStatus === 0}
                                        onChange={() => {
                                            if (event.priceType === "free") {
                                                handleAttendance(0, event._id)
                                            } else if (event.priceType === "paid") {
                                                window.open("https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt", "_blank")
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${attendanceStatus === 0
                                                ? "bg-green-500 border-green-500"
                                                : "border-gray-300 group-hover:border-green-400"
                                            }`}
                                    >
                                        {attendanceStatus === 0 && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] md:text-sm font-medium transition-colors duration-200 ${attendanceStatus === 0 ? "text-green-700" : "text-gray-700 group-hover:text-green-600"
                                        }`}
                                >
                                    I will attend
                                </span>
                            </label>

                            {/* I might attend */}
                            <label className="flex items-center gap-3 p-1 border text-[10px] border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={attendanceStatus === 1}
                                        onChange={() => handleAttendance(1, event._id)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${attendanceStatus === 1
                                                ? "bg-yellow-500 border-yellow-500"
                                                : "border-gray-300 group-hover:border-yellow-400"
                                            }`}
                                    >
                                        {attendanceStatus === 1 && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] md:text-sm font-medium transition-colors duration-200 ${attendanceStatus === 1 ? "text-yellow-700" : "text-gray-700 group-hover:text-yellow-600"
                                        }`}
                                >
                                    I might attend
                                </span>
                            </label>

                            {/* I will not attend */}
                            <label className="flex items-center gap-3 p-1 border text-[10px] border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={attendanceStatus === 2}
                                        onChange={() => handleAttendance(2, event._id)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${attendanceStatus === 2 ? "bg-red-500 border-red-500" : "border-gray-300 group-hover:border-red-400"
                                            }`}
                                    >
                                        {attendanceStatus === 2 && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] md:text-sm font-medium transition-colors duration-200 ${attendanceStatus === 2 ? "text-red-700" : "text-gray-700 group-hover:text-red-600"
                                        }`}
                                >
                                    I will not attend
                                </span>
                            </label>
                        </div>

                        {loading && (
                            <div className="flex justify-center pt-4">
                                <div className="flex items-center gap-2 text-[10px] md:text-sm text-gray-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Updating attendance...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                className="flex items-center justify-center"
            >
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>

                    <h2 id="modal-title" className="text-2xl font-semibold mb-4">
                        Event Attendees
                    </h2>
                    {(profile.profileLevel === 0 || profile._id === event.userId) &&
                        <button
                            onClick={handleDownloadCSV}
                            className="mb-6 inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition"
                        >
                            Export as Excel
                        </button>}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Will Attend', list: attendees?.willAttend },
                            { label: 'Might Attend', list: attendees?.mightAttend },
                            { label: 'Will Not Attend', list: attendees?.willNotAttend },
                        ].map(({ label, list }) => (
                            <div
                                key={label}
                                className="bg-gray-50 rounded-lg p-4 shadow-inner flex flex-col"
                            >
                                <h3 className="text-lg font-semibold mb-1">{label}</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Total: {list?.length ?? 0}
                                </p>
                                <div className="space-y-3 overflow-y-auto max-h-60">


                                    {!list || list.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">
                                            No responses yet.
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default EventDisplay;
