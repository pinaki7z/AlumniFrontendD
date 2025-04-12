import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, dateFnsLocalizer, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';
// import "react-big-calendar/lib/css/react-big-calendar.css";

// 2. With these imports for FullCalendar:
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enIN from 'date-fns/locale/en-US';
import './Events.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TimePicker from 'react-time-picker';
import { Col, Row } from 'react-bootstrap';
import { FaCalendarPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import axios from 'axios';
import pic from "../../images/profilepic.jpg";
import { Avatar, IconButton, Modal as MModal, Box, Modal as MMModal, Container } from '@mui/material';
import { useParams } from "react-router-dom";
import { lineSpinner } from 'ldrs';
import EventDisplay from "../../components/Feeed/EventDisplay";
import baseUrl from "../../config";
import { borderTop } from "@mui/system";
import picture from "../../images/d-group.jpg"

lineSpinner.register()






function MyVerticallyCenteredModal(props) {
  const [isEditing, setIsEditing] = useState(false);
  const profile = useSelector((state) => state.profile);
  const [createGroup, setCreateGroup] = useState(false);
  const [loading, setLoading] = useState(false);

  // New states for price type, amount, and currency
  const [priceType, setPriceType] = useState("free");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [newEvent, setNewEvent] = useState({
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

  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState([props.selectedEvent]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  // Handle date changes (DatePicker)
  const handleDateChange = (date, field) => {
    setNewEvent({ ...newEvent, [field]: date });
  };

  // Add new event
  const handleAddEvent = async () => {
    const { title, start, end, startTime, endTime, picture, cName, cNumber, cEmail, location } =
      newEvent;

    // if (!title || !start || !end || !picture) {
    //   alert("Please provide title, start date, end date and image");
    //   return;
    // }

    const formattedStart = format(new Date(start), "yyyy-MM-dd");
    const formattedEnd = format(new Date(end), "yyyy-MM-dd");
    setLoading(true);

    const eventData = {
      userId: profile._id,
      title,
      start: formattedStart,
      end: formattedEnd,
      startTime,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
      endTime,
      picture,
      cName,
      cNumber,
      cEmail,
      location,
      department: profile.department,
      createGroup,
      // Include price type and amount based on selection
      priceType,
      amount: priceType === "paid" ? amount : null, // Only include amount if it's paid
      currency: priceType === "paid" ? currency : "",
    };
    console.log("eventData", eventData);

    try {
      const response = await axios.post(`${baseUrl}/events/createEvent`, eventData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setAllEvents([...allEvents, response.data]);
      setLoading(false);
      window.location.reload();

      setNewEvent({
        title: "",
        start: "",
        end: "",
        startTime: "",
        endTime: "",
        picture: null,
        cEmail: "",
        cName: "",
        cNumber: "",
        location: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Edit event
  const handleEditEvent = async () => {
    const { title, start, end, startTime, endTime, picture, cName, cNumber, cEmail, location } =
      newEvent;
    const eventId = props.selectedEvent._id;

    if (!title || !start || !end) {
      alert("Please provide title, start date, and end date.");
      return;
    }

    try {
      const formattedStart = format(new Date(start), "yyyy-MM-dd");
      const formattedEnd = format(new Date(end), "yyyy-MM-dd");

      const updatedEvent = {
        title,
        start: formattedStart,
        end: formattedEnd,
        startTime,
        endTime,
        picture,
        cName,
        cNumber,
        cEmail,
        location,
        priceType,
        amount: priceType === "paid" ? amount : "0",
        currency: priceType === "paid" ? currency : "",
      };

      await axios.put(`${baseUrl}/events/${eventId}`, updatedEvent, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedEvents = allEvents.map((event) =>
        event._id === eventId ? updatedEvent : event
      );

      setAllEvents(updatedEvents);
      setSelectedEvent(null);
      props.onHide();
      toast.success("Event updated successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
    }
  };

  // If the modal is not visible, don't render anything
  if (!props.show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={props.onHide}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-md shadow-2xl rounded-t-xl max-w-xl w-full mx-4">
        {/* Header */}
        <div className="bg-[#02172B] px-5 py-3 flex justify-between items-center rounded-t-xl ">
          <h2 className="text-white text-lg font-semibold">
            {props.isEditing ? "Edit Event" : "Add Event"}
          </h2>
          <button
            onClick={props.onHide}
            className="text-white text-2xl leading-none hover:text-gray-300"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-[#f8fafc] max-h-[60vh] thin-scroller overflow-y-auto rounded-b-xl">
          <form className="space-y-4">
            {/* Event Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Event Title
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
            </div>

            {/* Start and End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Start Date
                </label>
                <DatePicker
                  className="w-full border border-gray-300 rounded p-2"
                  selected={newEvent.start || new Date()}
                  onChange={(date) => handleDateChange(date, "start")}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  End Date
                </label>
                <DatePicker
                  className="w-full border border-gray-300 rounded p-2"
                  selected={newEvent.end || new Date()}
                  onChange={(date) => handleDateChange(date, "end")}
                  required
                />
              </div>
            </div>

            {/* Start and End Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded p-2"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded p-2"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Event Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                required
              />
            </div>

            {/* Free / Paid Radio Buttons */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Event Type
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="free"
                    checked={priceType === "free"}
                    onChange={(e) => setPriceType(e.target.value)}
                  />
                  <span>Free</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="paid"
                    checked={priceType === "paid"}
                    onChange={(e) => setPriceType(e.target.value)}
                  />
                  <span>Paid</span>
                </label>
              </div>
            </div>

            {/* Conditionally render the price and currency input */}
            {priceType === "paid" && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-24 border border-gray-300 rounded p-2"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border border-gray-300 rounded p-2"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="JYN">JYN</option>
                </select>
              </div>
            )}

            {/* Coordinator Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Coordinator Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Coordinator Name"
                value={newEvent.cName}
                onChange={(e) => setNewEvent({ ...newEvent, cName: e.target.value })}
              />
            </div>

            {/* Coordinator Number */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Coordinator Number
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Coordinator Number"
                value={newEvent.cNumber}
                onChange={(e) => setNewEvent({ ...newEvent, cNumber: e.target.value })}
                required
              />
            </div>

            {/* Coordinator Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Coordinator Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Coordinator Email"
                value={newEvent.cEmail}
                onChange={(e) => setNewEvent({ ...newEvent, cEmail: e.target.value })}
                required
              />
            </div>

            {/* File Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Event Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-200 file:text-gray-700
                  hover:file:bg-gray-300"
              />
            </div>

            {/* Create Group Checkbox (only if not editing) */}
            {!props.isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="create-group"
                  checked={createGroup}
                  onChange={(e) => setCreateGroup(e.target.checked)}
                  className="h-4 w-4 text-indigo-600"
                />
                <label htmlFor="create-group" className="text-gray-700">
                  Create a group with the same event title
                </label>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-4 py-3 flex justify-end items-center space-x-2 rounded-b-xl">
          {/* Cancel Button */}
          <button
            onClick={props.onHide}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md "
          >
            Cancel
          </button>

          {/* Submit Button */}
          <button
            onClick={props.isEditing ? handleEditEvent : handleAddEvent}
            className="bg-[#172d41] hover:bg-[rgb(36,67,95)] text-white px-4 py-2 rounded-md"
          >
            {props.isEditing ? "Edit Event" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}



const locales = {
  "en-IN": enIN,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Events() {
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "", startTime: "", endTime: "", type: "" });
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [selectedEventDetailsPopup, setSelectedEventDetailsPopup] = useState(null);
  const calendarRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const { _id } = useParams();
  const [loading, setLoading] = useState(false);
  const [detailsModalShow, setDetailsModalShow] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);



  useEffect(() => {
    if (selectedEventDetails) {
      setEventId(selectedEventDetails._id); // Set eventId
    }
  }, [selectedEventDetails]);

  useEffect(() => {
    if (eventId) {
      checkAttendanceStatus(eventId); // Call checkAttendanceStatus only after eventId is set
    }
  }, [eventId]);

  const [view, setView] = useState(Views.MONTH); // Default view

  // Define dynamic formats based on the selected view
  const formats = {
    timeGutterFormat: (date, culture, localizer) =>
      view === Views.WEEK ? format(date, "HH:mm") : format(date, "hh:mm a"),
  };

  // Handle view change
  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);






  const handleAttendance = async (attendance, eventId) => {
    console.log('handling attendance')
    setAttendanceLoading(true);
    console.log('event titlee', selectedEvent.title, attendance, eventId)
    try {
      let body = {
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
        attendance,
        groupName: selectedEvent.title
      };

      const response = await axios.put(
        `${baseUrl}/events/attendEvent/${eventId}`,
        body
      );

      if (response.status === 200) {
        toast.success('Vote submitted successfully.');
        setNewEvent(response.data.event);
        checkAttendanceStatus();
        setAttendanceLoading(false);
      } else {
        console.error('Unexpected response status:', response.status, response.message);
        alert('An unexpected error occurred. Please try again.');
        setAttendanceLoading(false);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error(error.response?.data?.message || 'An error occurred.');
      setAttendanceLoading(false);
    }
  };

  // const gapi = window.gapi;
  // const google = window.google;

  // const CLIENT_ID = '221910855256-3ra04lqbdb4elusir5clvsail6ldum53.apps.googleusercontent.com';
  // const API_KEY = 'AIzaSyCduY-X8qZOq43I8zwsHlf2WWZ1ewDjpdc';
  // const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  // const SCOPES = "https://www.googleapis.com/auth/calendar";
  // const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';



  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }

  const handleClickOutsideCalendar = (event) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      !event.target.closest(".modal-open")
    ) {
      return;
      //setIsEditing(false);
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside the calendar
    window.addEventListener("click", handleClickOutsideCalendar);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("click", handleClickOutsideCalendar);
    };
  }, []);


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') {
        // Check if an event is selected
        if (selectedEvent) {
          handleDeleteEvent();
        }
      }
    };

    // Add event listener for the delete key
    document.addEventListener('keydown', handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEvent]);




  useEffect(() => {
    fetchEvents();
    if (_id) {
      fetchEventDetails(_id);
    }
  }, [_id]);

  const fetchEventDetails = (eventId) => {
    setLoading(true);
    fetch(`${baseUrl}/events/${eventId}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedEventDetailsPopup(data);
        // setModalShow(true);
        setDetailsModalShow(true)
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching event details:", error)
        setLoading(false);
      });

  };

  const fetchEvents = () => {
    fetch(`${baseUrl}/events`)
      .then((response) => response.json())
      .then((data) => {
        // Filter events based on groupId or no groupId
        const filteredEvents = data.filter((event) => {
          // If groupId is not present, include the event
          if (!event.groupId) {
            return true;
          }
          // If groupId is present, check if it's in profile.groupNames
          return profile.groupNames.includes(event.groupId);
        });

        // Convert start and end dates to JavaScript Date objects
        const eventsWithDates = filteredEvents.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));

        // Add an id to each event
        const eventsWithIds = eventsWithDates.map((event, index) => ({
          ...event,
          id: index + 1,
        }));

        // Set the filtered and processed events
        setAllEvents(eventsWithIds);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  };



  const checkAttendanceStatus = async () => {
    if (!eventId) {
      console.log('No eventId provided, skipping API call.');
      return; // Exit early if eventId is null or undefined
    }

    console.log('eventId check', eventId);
    try {
      const response = await axios.get(`${baseUrl}/events/attendees/${eventId}`);
      if (response.status === 200) {
        setAttendees(response.data);
        determineAttendanceStatus(response.data);
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





  function handleEventClick(event) {

    setSelectedEvent(event);
    checkAttendanceStatus(event._id)
    console.log("selected event", selectedEvent)
    setIsEditing(true);
    console.log("edit", isEditing)
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      startTime: event.startTime,
      endTime: event.endTime,
      picture: event.picture,
      cName: event.cName,
      cNumber: event.cNumber,
      cEmail: event.cEmail
    });
    setSelectedEventDetails(event);
  }



  const handleDeleteEvent = (e) => {
    const eventId = selectedEvent._id;
    console.log("id", eventId);
    fetch(`${baseUrl}/events/${eventId}`, {
      method: 'DELETE',
    })
      .then(() => {
        // Remove the event from the events array
        const updatedEvents = allEvents.filter(
          (event) => event._id !== eventId
        );

        setAllEvents(updatedEvents);
        setSelectedEvent(null);
        setIsEditing(false);

        toast.success('Event deleted successfully.');
      })
      .catch((error) => console.error('Error deleting event:', error));

  };



  const [open, setOpen] = useState(false);
  const handleOpenModal = (eventId) => {
    console.log('eventid openmodal', eventId)
    checkAttendanceStatus(eventId);
    setOpen(true)
  };
  const handleCloseModal = () => setOpen(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
      <div className="Events mx-auto px-[5%] py-[38px] mt-3 ">
        {/* <div style={{ textAlign: 'left', padding: '20px', borderRadius: '10px', marginBottom: '10px', backgroundColor: '#71be95' }}>
        <h2 style={{ margin: '0', color: 'white' }}>Event Calendar</h2>
        <p style={{ marginTop: '10px', fontSize: '15px', color: 'black' }}>
          Stay updated on upcoming events and opportunities to connect.
        </p>
      </div> */}

        <div className='bg-[#cef3df] p-4 rounded-lg mb-3 text-start'>
          <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Event Calendar</h2>
          <p className='text-base md:text-lg text-[#136175]' >
            Stay updated on upcoming events and opportunities to connect.
          </p>
        </div>



        <div class="bg-white rounded-lg p-4 shadow-lg" ref={calendarRef}>
          <MyVerticallyCenteredModal
            show={modalShow}
            isEditing={isEditing}
            selectedEvent={selectedEvent}
            onHide={() => {
              setModalShow(false);
              setSelectedEventDetails(null);
            }}
          />
          <Calendar
            localizer={localizer}
            events={allEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '60vh', fontWeight: '600', backgroundColor: 'white' }}
            selectable
            onSelectEvent={handleEventClick}
            view={view}
            onView={handleViewChange}
            formats={formats}
          />

          {/* <FullCalendar
  plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
  initialView="dayGridMonth"
  headerToolbar={{
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  }}
  events={allEvents.map(event => ({
    title: event.title,
    start: event.start,
    end: event.end,
    extendedProps: { ...event }  // optional: pass extra props for your event
  }))}
  selectable={true}
  eventClick={(info) => handleEventClick(info.event.extendedProps)}
  // Add any additional FullCalendar configurations as needed
/> */}

          {(profile.profileLevel === 0 || profile.profileLevel === 1) && (
            <Button
              className="add-event-button"
              variant="primary"
              onClick={() => {
                setModalShow(true);
                setIsEditing(false);
              }}
              style={{
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                position: 'absolute',
                backgroundColor: '#301c5B'
              }}
            >
              <FaCalendarPlus />
            </Button>)}


          {selectedEventDetails && (
            // Outer modal wrapper (Center + Backdrop)
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSelectedEventDetails(null)}
              ></div>

              {/* Modal Container */}
              <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4">
                {/* Header */}
                <div className="bg-[#02172B] px-5 py-3 flex justify-between items-center rounded-t-xl">
                  <h2 className="text-white text-xl font-semibold">
                    Event Details
                  </h2>
                  <button
                    onClick={() => setSelectedEventDetails(null)}
                    className="text-white text-2xl leading-none hover:text-gray-300"
                  >
                    &times;
                  </button>
                </div>

                {/* Body */}
                <div className="p-6  rounded-b-xl">
                  {/* Top section: event info + image */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left side: event info */}
                    <div className="md:col-span-2">
                      <div className="bg-white rounded-md  p-4 space-y-2">
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">Title:</span>
                          <span className="text-gray-800">{selectedEventDetails.title}</span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">Start Date:</span>
                          <span className="text-gray-800">
                            {formatDate(selectedEventDetails.start)}
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">End Date:</span>
                          <span className="text-gray-800">
                            {formatDate(selectedEventDetails.end)}
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">Start Time:</span>
                          <span className="text-gray-800">
                            {selectedEventDetails.startTime} hrs
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">End Time:</span>
                          <span className="text-gray-800">
                            {selectedEventDetails.endTime} hrs
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">
                            Coordinator:
                          </span>
                          <span className="text-gray-800">
                            {selectedEventDetails.cName}
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">Phone:</span>
                          <span className="text-gray-800">
                            {selectedEventDetails.cNumber}
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">Email:</span>
                          <span className="text-gray-800">
                            {selectedEventDetails.cEmail}
                          </span>
                        </div>
                        <div className="flex items-center text-start font-semibold">
                          <span className="font-semibold w-28 text-gray-700">
                            Location:
                          </span>
                          <span className="text-gray-800">
                            {selectedEventDetails.location}
                          </span>
                        </div>
                        {/* Display whether event is paid/free */}
                        {selectedEventDetails.priceType === "paid" ? (
                          <p className="mt-4 text-red-500 font-semibold">
                            This is a paid event
                          </p>
                        ) : selectedEventDetails.priceType === "free" ? (
                          <p className="mt-4 text-green-600 font-semibold">
                            This is a free event
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Right side: event image */}
                    <div className="flex items-center justify-center">
                      <img
                        src={selectedEventDetails.picture ? selectedEventDetails.picture : picture}
                        alt="Event"
                        className="h-48 w-auto rounded-md shadow"
                      />
                    </div>
                  </div>

                  {/* Attendance Options */}
                  <div className="mt-8 bg-white rounded-md shadow p-4">
                    <p className="text-gray-700 text-xl font-medium mb-4">Your Attendance:</p>
                    <div className="flex flex-wrap items-center justify-around gap-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={attendanceStatus === 0}
                          onChange={() => {
                            if (selectedEventDetails.priceType === "free") {
                              handleAttendance(0, selectedEventDetails._id);
                            } else if (selectedEventDetails.priceType === "paid") {
                              window.open(
                                "https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt",
                                "_blank"
                              );
                            }
                          }}
                        />
                        <span>I will attend</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={attendanceStatus === 1}
                          onChange={() => handleAttendance(1, selectedEventDetails._id)}
                        />
                        <span>I might attend</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={attendanceStatus === 2}
                          onChange={() => handleAttendance(2, selectedEventDetails._id)}
                        />
                        <span>I will not attend</span>
                      </label>

                      {attendanceLoading && (
                        <l-line-spinner
                          size="20"
                          stroke="3"
                          speed="1"
                          color="black"
                        ></l-line-spinner>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* See Attendees (if user is event creator) */}
                    {selectedEventDetails.userId === profile._id && (
                      <div className="mt-4 text-right">
                        <button
                          onClick={() => handleOpenModal(selectedEventDetails._id)}
                          className="text-indigo-600 hover:underline"
                        >
                          See event attendees
                        </button>
                      </div>
                    )}
                    {/* Edit/Delete Buttons (if user is event creator or admin) */}
                    {(selectedEventDetails.userId === profile._id ||
                      profile.profileLevel === 0) && (
                        <div className="mt-6 flex justify-start space-x-4">
                          <button
                            onClick={() => setModalShow(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            Edit Event
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteEvent();
                              setSelectedEventDetails(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                          >
                            Delete Event
                          </button>
                        </div>
                      )}


                  </div>

                  {/* Attendees Modal */}
                  {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      {/* Backdrop */}
                      <div
                        className="absolute inset-0 bg-black/50"
                        onClick={handleCloseModal}
                      ></div>

                      {/* Attendees Modal Container */}
                      <div className="relative bg-white rounded-md shadow-2xl max-w-xl w-full mx-4">
                        {/* Header */}
                        <div className="bg-[#02172B] px-4 py-3 flex justify-between items-center">
                          <h2 className="text-white text-lg font-semibold">
                            Event Attendees
                          </h2>
                          <button
                            onClick={handleCloseModal}
                            className="text-white text-2xl leading-none hover:text-gray-300"
                          >
                            &times;
                          </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-[#f8fafc]">
                          <div className="grid grid-cols-1 gap-6">
                            {/* Will Attend */}
                            <div>
                              <h3 className="font-semibold text-gray-700">Will Attend</h3>
                              <p className="text-sm text-gray-600">
                                Total: {attendees?.willAttend.length}
                              </p>
                              {attendees?.willAttend.map((user) => (
                                <div
                                  key={user.userId}
                                  className="flex items-center space-x-2 mt-2"
                                >
                                  <Avatar
                                    src={user.profilePicture || pic}
                                    alt={user.userName}
                                    className="h-8 w-8 rounded-full"
                                  />
                                  <span>{user.userName}</span>
                                </div>
                              ))}
                            </div>

                            {/* Might Attend */}
                            <div>
                              <h3 className="font-semibold text-gray-700">Might Attend</h3>
                              <p className="text-sm text-gray-600">
                                Total: {attendees?.mightAttend.length}
                              </p>
                              {attendees?.mightAttend.map((user) => (
                                <div
                                  key={user.userId}
                                  className="flex items-center space-x-2 mt-2"
                                >
                                  <Avatar
                                    src={user.profilePicture || pic}
                                    alt={user.userName}
                                    className="h-8 w-8 rounded-full"
                                  />
                                  <span>{user.userName}</span>
                                </div>
                              ))}
                            </div>

                            {/* Will Not Attend */}
                            <div>
                              <h3 className="font-semibold text-gray-700">
                                Will Not Attend
                              </h3>
                              <p className="text-sm text-gray-600">
                                Total: {attendees?.willNotAttend.length}
                              </p>
                              {attendees?.willNotAttend.map((user) => (
                                <div
                                  key={user.userId}
                                  className="flex items-center space-x-2 mt-2"
                                >
                                  <Avatar
                                    src={user.profilePicture || pic}
                                    alt={user.userName}
                                    className="h-8 w-8 rounded-full"
                                  />
                                  <span>{user.userName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedEventDetailsPopup && (
            <div className="event-details-popup">
              <div className="event-details-popup-content" style={{ textAlign: 'left' }}>
                <span className="close-btn-event" onClick={() => setSelectedEventDetailsPopup(null)}>&times;</span>

                <h2 align='center'>Event Details</h2>

                <EventDisplay event={selectedEventDetailsPopup} />
                {/* {(selectedEventDetailsPopup.userId === profile._id || profile.profileLevel === 0) && (
                <div className="event-edit-delete">
                  <Button variant="primary" onClick={() => setModalShow(true)}>
                    Edit Event
                  </Button>
                  <Button variant="danger" onClick={() => {
                    handleDeleteEvent();
                    setSelectedEventDetails(null);
                  }}>
                    Delete Event
                  </Button>
                </div>
              )} */}
              </div>
            </div>
          )}
          {loading && <><l-line-spinner
            size="40"
            stroke="3"
            speed="1"
            color="black"
          ></l-line-spinner></>}
        </div>
      </div>
  );
}


export default Events;