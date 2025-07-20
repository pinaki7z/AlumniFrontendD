import pic from "../../../images/profilepic.jpg";
import { Modal } from '@mui/material';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { lineSpinner } from 'ldrs';
import * as XLSX from 'xlsx';
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Check, 
  Clock, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  Users, 
  Trash2,
  Download,
  X
} from "lucide-react";

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
      setLoading(false);
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
        toast.success('Attendance updated successfully!');
        setNewEvent(response.data.event);
        checkAttendanceStatus();
      } else {
        toast.error('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error(error.response?.data?.message || 'An error occurred.');
      setLoading(false);
    }
  };

  const formatCreatedAt = (timestamp) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - eventTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleOpen = () => {
    checkAttendanceStatus();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const url = `${process.env.REACT_APP_API_URL}/events/${event._id}`;
        const requestBody = { groupName: event.title };
        const response = await axios.delete(url, { data: requestBody });

        if (response.status === 200) {
          toast.success("Event deleted successfully");
          window.location.reload();
        } else {
          toast.error("Failed to delete event");
        }
      } catch (error) {
        console.error("Error occurred while deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  const exportAttendeesToExcel = () => {
    if (!attendees) return;

    const mapAttendees = (attendeesList) => {
      return attendeesList.map(attendee => ({
        'Name': attendee.userName,
        'Graduating Year': attendee.graduatingYear || 'N/A',
        'Class': attendee.class || 'N/A',
        'Department': attendee.department || 'N/A'
      }));
    };

    const willAttendNames = mapAttendees(attendees.willAttend);
    const mightAttendNames = mapAttendees(attendees.mightAttend);
    const willNotAttendNames = mapAttendees(attendees.willNotAttend);

    const willAttendSheet = XLSX.utils.json_to_sheet(willAttendNames);
    const mightAttendSheet = XLSX.utils.json_to_sheet(mightAttendNames);
    const willNotAttendSheet = XLSX.utils.json_to_sheet(willNotAttendNames);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, willAttendSheet, "Will Attend");
    XLSX.utils.book_append_sheet(workbook, mightAttendSheet, "Might Attend");
    XLSX.utils.book_append_sheet(workbook, willNotAttendSheet, "Will Not Attend");

    XLSX.writeFile(workbook, `${event.title}_Attendees.xlsx`);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/home/members/${userId}`}
          className="flex items-center gap-2 sm:gap-3 no-underline text-gray-800 hover:text-[#71be95] transition-colors min-w-0 flex-1"
        >
          <div className="relative flex-shrink-0">
            <img 
              src={userData?.profilePicture || pic} 
              alt="profile" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'N/A'}
            </h4>
            <span className="text-xs text-gray-500">{formatCreatedAt(event.createdAt)}</span>
          </div>
        </Link>
        
        {userId === profile._id && (
          <button
            onClick={handleDeleteEvent}
            className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Event Content */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
        {/* Event Title */}
        <div className="flex items-start gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight">{event.title}</h3>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Date & Time */}
          <div className="bg-white/60 rounded-lg p-2 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-green-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-600">Start:</span>
                <p className="text-xs font-medium text-gray-900">{formatDate(event.start)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-600">Time:</span>
                <p className="text-xs font-medium text-gray-900">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-white/60 rounded-lg p-2 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-orange-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-600">Location:</span>
                <p className="text-xs font-medium text-gray-900 truncate">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-purple-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-600">Contact:</span>
                <p className="text-xs font-medium text-gray-900 truncate">{event.cName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="space-y-3">
          {userId === profile._id && (
            <div className="flex justify-end">
              <button
                onClick={handleOpen}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Users className="w-3 h-3" />
                View Attendees
              </button>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Your Response</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Will Attend */}
              <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-white/80 transition-all group">
                <div className="relative">
                  <input
                    type="radio"
                    name="attendance"
                    checked={attendanceStatus === 0}
                    onChange={() => {
                      if (event.priceType === "free") {
                        handleAttendance(0, event._id);
                      } else {
                        window.open("https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt", "_blank");
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    attendanceStatus === 0 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-300 group-hover:border-green-400"
                  }`}>
                    {attendanceStatus === 0 && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  attendanceStatus === 0 ? "text-green-700" : "text-gray-700 group-hover:text-green-600"
                }`}>
                  Will Attend
                </span>
              </label>

              {/* Might Attend */}
              <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-white/80 transition-all group">
                <div className="relative">
                  <input
                    type="radio"
                    name="attendance"
                    checked={attendanceStatus === 1}
                    onChange={() => handleAttendance(1, event._id)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    attendanceStatus === 1 
                      ? "bg-yellow-500 border-yellow-500" 
                      : "border-gray-300 group-hover:border-yellow-400"
                  }`}>
                    {attendanceStatus === 1 && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  attendanceStatus === 1 ? "text-yellow-700" : "text-gray-700 group-hover:text-yellow-600"
                }`}>
                  Maybe
                </span>
              </label>

              {/* Won't Attend */}
              <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-white/80 transition-all group">
                <div className="relative">
                  <input
                    type="radio"
                    name="attendance"
                    checked={attendanceStatus === 2}
                    onChange={() => handleAttendance(2, event._id)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    attendanceStatus === 2 
                      ? "bg-red-500 border-red-500" 
                      : "border-gray-300 group-hover:border-red-400"
                  }`}>
                    {attendanceStatus === 2 && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  attendanceStatus === 2 ? "text-red-700" : "text-gray-700 group-hover:text-red-600"
                }`}>
                  Can't Attend
                </span>
              </label>
            </div>

            {loading && (
              <div className="flex justify-center pt-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Updating...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendees Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        className="flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Event Attendees</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Export Button */}
          {(profile.profileLevel === 0 || profile._id === event.userId) && (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={exportAttendeesToExcel}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          )}

          {/* Attendees Grid */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Will Attend', list: attendees?.willAttend, color: 'green' },
                { label: 'Might Attend', list: attendees?.mightAttend, color: 'yellow' },
                { label: 'Won\'t Attend', list: attendees?.willNotAttend, color: 'red' },
              ].map(({ label, list, color }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <span className="text-sm text-gray-500">({list?.length || 0})</span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {!list || list.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No responses yet</p>
                    ) : (
                      list.map((attendee, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <img
                            src={attendee.profilePicture || pic}
                            alt={attendee.userName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 truncate flex-1">{attendee.userName}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDisplay;
