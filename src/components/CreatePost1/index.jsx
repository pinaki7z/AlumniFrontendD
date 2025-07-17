import React, { useEffect, useState } from 'react';
import '../CreatePost/socialWall.css';
import picture from '../../images/profilepic.jpg'
import axios from 'axios';
import JobsInt from '../JobsInt';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import video from "../../images/videocam.svg";
import gallery from "../../images/gallery.svg";
import poll from "../../images/poll.svg";
import PollModal from './PollModal';
import baseUrl from '../../config';
import { toast } from "react-toastify";
import format from "date-fns/format";
import { Col, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DatePicker from "react-datepicker";
import youtube from "../../images/youtube.svg";
import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
import Box from '@mui/material/Box';





const CreatePost1 = ({
  name,
  onNewPost,
  entityType,
  getPosts,
  loadingPost,
  setLoadingPost,
}) => {
  const { _id } = useParams();
  const [isExpanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [picturePath, setPicturePath] = useState("");
  const [author, setAuthor] = useState("");
  const [videoPath, setVideoPath] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [imgUrl, setImgUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cookie, setCookie] = useCookies(["access_token"]);
  const profile = useSelector((state) => state.profile);
  const [showPollModal, setShowPollModal] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);

  const extractYoutubeVideoId = (url) => {
    if (!url) return null;

    // Regular expression patterns for different YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i, // Standard YouTube URL
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,    // Embed URL
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,             // Shortened URL
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,        // Old embed URL
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/i    // YouTube Shorts URL
    ];

    // Try each pattern until we find a match
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

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
      groupId: _id ? _id : "",
    });
    const [errors, setErrors] = useState({});


    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState([props.selectedEvent]);


    const validate = () => {
      const errs = {};
      if (!newEvent.title?.trim()) errs.title = 'Event title is required';
      if (!newEvent.cName?.trim()) errs.cName = 'Coordinator name is required';
      if (!newEvent.picture?.trim()) errs.picture = 'Event Image is required';
      if (!newEvent.start) errs.start = 'Start date is required';
      if (!newEvent.end) errs.end = 'End date is required';
      if (newEvent.start && newEvent.end && newEvent.end < newEvent.start) errs.end = 'End date cannot be before start date';
      if (priceType === 'paid') {
        if (!amount || amount <= 0) errs.amount = 'Valid amount is required';
      }
      if (!newEvent.location?.trim()) errs.location = 'Location is required';
      // if (!newEvent.cNumber?.trim()) errs.cNumber = 'Coordinator number is required';
      // Coordinator number (ensure string)
      const cNum = newEvent.cNumber != null ? String(newEvent.cNumber) : '';
      if (!cNum.trim()) errs.cNumber = 'Coordinator number is required';
      else if (!/^\d{10}$/.test(cNum)) errs.cNumber = 'Enter a valid 10-digit number';

      else if (!/^\d{10}$/.test(newEvent.cNumber)) errs.cNumber = 'Enter a valid 10-digit number';
      if (!newEvent.cEmail?.trim()) errs.cEmail = 'Coordinator email is required';
      else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newEvent.cEmail)) errs.cEmail = 'Enter a valid email';
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };
    const fetchEvent = async () => {
      if (props.isEditing === true) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/events/${props.selectedEvent._id}`);
          setNewEvent((prev) => {
            return {
              ...prev,
              title: res.data.title,
              start: new Date(res.data.start),
              end: new Date(res.data.end),
              startTime: res.data.startTime,
              endTime: res.data.endTime,
              picture: res.data.picture,
              cName: res.data.cName,
              cNumber: res.data.cNumber,
              cEmail: res.data.cEmail,
              location: res.data.location,
            }
          })
          console.log(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    }

    useEffect(() => {
      fetchEvent();
    }, [props.isEditing])
    // Handle image file selection
    const handleImageChange = (e) => {
      const file = e.target.files[0];

      const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
      const formDataImage = new FormData();
      formDataImage.append('image', file);

      axios.post(api, formDataImage, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          setNewEvent((prev) => {
            return {
              ...prev,
              picture: res.data?.imageUrl
            }
          })
        })
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

      if (validate()) {
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
          groupId: _id || "",
          // Include price type and amount based on selection
          priceType,
          amount: priceType === "paid" ? amount : null, // Only include amount if it's paid
          currency: priceType === "paid" ? currency : "",
        };
        console.log("eventData", eventData);

        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/events/createEvent`, eventData, {
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
      }

    };

    // Edit event
    const handleEditEvent = async () => {
      if (validate()) {
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

          await axios.put(`${process.env.REACT_APP_API_URL}/events/${eventId}`, updatedEvent, {
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
              <div>
                <label className="block text-gray-700 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Start and End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                  <DatePicker
                    className="w-full border border-gray-300 rounded p-2"
                    selected={newEvent.start}
                    onChange={(date) => handleDateChange(date, 'start')}
                    placeholderText="Select start date"
                    required
                  />
                  {errors.start && <p className="text-red-500 text-sm mt-1">{errors.start}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">End Date</label>
                  <DatePicker
                    className="w-full border border-gray-300 rounded p-2"
                    selected={newEvent.end}
                    onChange={(date) => handleDateChange(date, 'end')}
                    placeholderText="Select end date"
                    required
                  />
                  {errors.end && <p className="text-red-500 text-sm mt-1">{errors.end}</p>}
                </div>
              </div>

              {/* Start and End Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded p-2"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">End Time</label>
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
                <label className="block text-gray-700 font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Event Location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Free / Paid Radio Buttons */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Event Type</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="free"
                      checked={priceType === 'free'}
                      onChange={(e) => setPriceType(e.target.value)}
                    />
                    <span>Free</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="paid"
                      checked={priceType === 'paid'}
                      onChange={(e) => setPriceType(e.target.value)}
                    />
                    <span>Paid</span>
                  </label>
                </div>
              </div>

              {/* Conditionally render the price and currency input */}
              {priceType === 'paid' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-24 border border-gray-300 rounded p-2"
                    required
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
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>
              )}

              {/* Coordinator Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Coordinator Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Coordinator Name"
                  value={newEvent.cName}
                  onChange={(e) => setNewEvent({ ...newEvent, cName: e.target.value })}
                />
                {errors.cName && <p className="text-red-500 text-sm mt-1">{errors.cName}</p>}

              </div>

              {/* Coordinator Number */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Coordinator Number</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Coordinator Number"
                  value={newEvent.cNumber}
                  onChange={(e) => setNewEvent({ ...newEvent, cNumber: e.target.value })}
                  required
                />
                {errors.cNumber && <p className="text-red-500 text-sm mt-1">{errors.cNumber}</p>}
              </div>

              {/* Coordinator Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Coordinator Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Coordinator Email"
                  value={newEvent.cEmail}
                  onChange={(e) => setNewEvent({ ...newEvent, cEmail: e.target.value })}
                  required
                />
                {errors.cEmail && <p className="text-red-500 text-sm mt-1">{errors.cEmail}</p>}
              </div>

              {/* File Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Event Image</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                />
                {errors.picture && <p className="text-red-500 text-sm mt-1">{errors.picture}</p>}
                {newEvent.picture && (
                  <div className="mt-2">
                    <img src={newEvent.picture} alt="Event" className="max-w-full h-auto" />
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
                      onClick={() => setNewEvent({ ...newEvent, picture: null })}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Create Group Checkbox (only if not editing) */}
              {/* {(!props.isEditing )&& (
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
        )} */}
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

  // Component to render YouTube embed
  const YouTubeEmbed = ({ videoId }) => {
    if (!videoId) return null;

    return (
      <div className="youtube-embed-container mt-2 px-4">
        <iframe
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };


  const onHideModal = (modalVisibility) => {
    setShowModal(modalVisibility);
  };

  const handleInputClick = () => {
    // setExpanded(!isExpanded);
  };

  // Handle YouTube link detection in the input text
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);

    // Check for YouTube links in the input
    const words = text.split(/\s+/);
    // for (const word of words) {
    //   const videoId = extractYoutubeVideoId(word);
    //   if (videoId) {
    //     setYoutubeVideoId(videoId);
    //     return; // Stop after finding the first YouTube URL
    //   }
    // }

    // Clear YouTube video ID if no URL is found
    // setYoutubeVideoId(null);
  };

  // Function to clear YouTube video
  const removeYoutubeVideo = () => {
    setYoutubeVideoId(null);
  };

  const handleImageChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    try {
      // Post the images to the server
      setLoading(true);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/uploadImage/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setLoading(false);
      // Update gallery with uploaded image URLs
      setPicturePath(response.data);
    } catch (error) {
      setLoading(false);
      console.error("Error uploading files", error);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    console.log("file", file);

    // Create a FormData object
    const formData = new FormData();
    formData.append('video', file);

    // Send the FormData via Axios
    axios.post(`${process.env.REACT_APP_API_URL}/uploadImage/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        setVideoPath(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 500);
  };

  const removeMedia = (index) => {
    const newPicturePath = [...picturePath];
    newPicturePath.splice(index, 1);
    setPicturePath(newPicturePath);

    if (selectedFile && index === 0) {
      setSelectedFile(null);
    } else {
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles.splice(index, 1);
      setSelectedFiles(newSelectedFiles);
    }
  };

  const newHandleSubmit = async (event) => {
    event.preventDefault();

    // Prevent blank posts from being submitted
    if (input.trim() === '') {
      alert("Post cannot be blank.");
      setLoadingPost(false);
      return;
    }

    setLoadingPost(true);

    const payload = {
      userId: profile._id,
      description: input,
      department: profile.department,
      profilePicture: profile.profilePicture,
      author: author
    };

    if (_id) payload.groupID = _id;
    if (picturePath) payload.picturePath = picturePath;
    if (videoPath) payload.videoPath = videoPath;

    // Add YouTube video ID if one was detected
    if (youtubeVideoId) {
      payload.youtubeVideoId = youtubeVideoId;
    }

    console.log("payload", payload);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/${entityType}/create`, payload);
      setImgUrl("");
      setSelectedFile(null);
      setPicturePath([]);
      setVideoPath({});
      setInput("");
      setAuthor("");
      setYoutubeVideoId(null); // Clear YouTube video ID
      onNewPost()
    } catch (err) {
      console.log(err);
      setLoadingPost(false);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent blank posts from being submitted
    if (input.trim() === '') {
      alert("Post cannot be blank.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", profile._id);
    formData.append("description", input);
    formData.append("department", profile.department);
    if (_id) formData.append("groupID", _id);

    if (selectedFile) {
      console.log('selected file is present', selectedFile)
      if (selectedFile.type.startsWith("image/")) {
        console.log('picture', picturePath)
        const reader = new window.FileReader();
        reader.onload = function (event) {
          const dataURL = event.target.result;
          const formDataObject = {
            picturePath: picturePath
          };

          for (let pair of formData.entries()) {
            const key = pair[0];
            const value = pair[1];
            formDataObject[key] = value;
            console.log("FORMDATAOBJECT:", formDataObject)
          }
          uploadImage(formDataObject);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        console.log('videoPath is present');
        formData.append("videoPath", selectedFile);
        const formDataObject = {};

        for (let pair of formData.entries()) {
          const key = pair[0];
          const value = pair[1];
          formDataObject[key] = value;
        }

        const currentDate = new Date();
        const folderName = currentDate.toISOString().split("T")[0];
        console.log("folder name:", folderName)
        uploadData(formDataObject, folderName);
      }
    } else if (selectedFiles) {
      console.log('selected files are present', selectedFiles);
      const formDataObject = {
        picturePath: picturePath
      };

      for (let pair of formData.entries()) {
        const key = pair[0];
        const value = pair[1];
        formDataObject[key] = value;
      }
      console.log("FORMDATAOBJECT:", formDataObject);
      uploadImage(formDataObject);
    } else {
      console.log('elseee')
      const formDataObject = {};

      for (let pair of formData.entries()) {
        const key = pair[0];
        const value = pair[1];
        if (key === "picturePath" && Array.isArray(value)) {
          formDataObject[key] = value.join(",");
        } else {
          formDataObject[key] = value;
        }
        console.log("FORMDATAOBJECT:", formDataObject);
      }

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/${entityType}/create`,
          formDataObject,
        );
        const newPost = await response.data;
        onNewPost(newPost);
        setInput("");
        setImgUrl("");
      } catch (error) {
        console.error("Error posting:", error);
      }
    }
  };

  const uploadData = async (formDataObject, folderName) => {
    try {
      console.log("request body", formDataObject);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/${entityType}/create?folder=${folderName}`,
        formDataObject,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newPost = await response.data;
      console.log(newPost);
      onNewPost(newPost);
      setInput("");
      setImgUrl("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  const uploadImage = async (formDataObject) => {
    try {
      console.log("request body", formDataObject);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/${entityType}/create`,
        formDataObject,
      );
      const newPost = await response.data;
      onNewPost(newPost);
      setInput("");
      setImgUrl("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  const handleCreatePoll = async (question, options) => {
    console.log('question1', question, options);
    const pollData = {
      userId: profile._id,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
      question: question,
      options: options,
    };
    if (_id) pollData.groupID = _id;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/poll/createPoll`,
        pollData,
      );
      const newPoll = await response.data;
      onNewPost(newPoll);
      setInput("");
      setShowPollModal(false);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  // Function to manually add a YouTube video
  const handleAddYoutubeVideo = () => {
    const url = prompt("Enter YouTube video URL:");
    if (url) {
      const videoId = extractYoutubeVideoId(url);
      if (videoId) {
        setYoutubeVideoId(videoId);
      } else {
        alert("Invalid YouTube URL. Please enter a valid YouTube video link.");
      }
    }
  };

  return (
    <div className={` mb-3  rounded-xl border border-gray-300  w-full md:w-full xl:w-[650px] bg-white shadow-sm transition-all duration-300 ${isExpanded ? 'ring-2 ring-green-300' : ''}`}>
      <div className={`overlay  ${isExpanded ? 'opacity-75' : 'opacity-0'}`} onClick={handleInputClick}></div>
      <div className={` pt-1 ${isExpanded ? 'pb-4' : 'pb-2'}`}>
        <div className={`rounded-xl bg-white `}>
          <div className="flex items-center gap-4 px-4 py-1">
            <img
              src={profile.profilePicture || picture}
              alt="Profile"
              className=" w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
            />
            <div className="w-full">
              <textarea
                type="text"
                value={input}
                rows={2}
                onChange={handleInputChange}
                placeholder="What's going on??"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md outline-none resize-none"
                style={{ height: 'auto', maxHeight: '8em', overflow: 'hidden' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />
            </div>
          </div>
        </div>
        {
          loading && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )
        }
        {picturePath.length > 0 && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 px-4">
            {picturePath.map((path, index) => (
              <div key={index} className="relative">
                <img
                  src={path}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        {/* YouTube Video Preview */}
        {youtubeVideoId && (
          <div className="mt-2 px-4">
            <YouTubeEmbed videoId={youtubeVideoId} />
            <div className="flex justify-end mt-1">
              <button
                onClick={removeYoutubeVideo}
                className="bg-red-500 text-white text-sm px-3 py-1 rounded-full"
              >
                Remove YouTube Video
              </button>
            </div>
          </div>
        )}

        {videoPath?.videoPath && (
          <div className="w-full px-4 mt-2">
            <video
              src={videoPath?.videoPath}
              className="w-full h-40 object-cover rounded-md"
              controls
            />
            <div className="flex justify-end mt-1">
              <button
                onClick={() => setVideoPath({})}
                className="bg-red-500 text-white text-sm px-3 py-1 rounded-full"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="mt-2 w-full px-4">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}

        <div className="flex items-center justify-between  px-4">
          <div className="flex gap-3">
            <label className="flex gap-1 items-center font-semibold  px-2 py-1 rounded-full  cursor-pointer hover:bg-green-100 transition-colors">
              <img src={gallery} alt="Gallery" className="w-6 h-6 md:w-5 md:h-5" />
              <p className="hidden md:block">Image</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                multiple
              />
            </label>
            <label
              className="flex gap-2 items-center font-semibold  px-2 py-1 rounded-full cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => setShowPollModal(true)}
            >
              <img src={poll} alt="Poll" className="w-5 h-5" />
              <p className="hidden md:block">Poll</p>
            </label>

            {/* YouTube button */}
            <label
              className="flex gap-2 items-center font-semibold px-2 py-1 rounded-full  cursor-pointer hover:bg-green-100 transition-colors"
              onClick={handleAddYoutubeVideo}
            >
              {youtube ? (
                <img src={youtube} alt="YouTube" className="w-5 h-5" />
              ) : (
                <svg className="w-5 h-5" fill="red" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              )}
              <p className="hidden md:block">YouTube</p>
            </label>

            {entityType === 'news' && (
              <>
                <label className="font-semibold">Add an author</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-green-300"
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </>
            )}
            {_id && (
              <label
                onClick={() => setModalShow(true)}
                className="md:flex hidden  items-center gap-2 border border-green-400 text-black px-4 py-1 rounded-full cursor-pointer text-sm hover:bg-green-100 transition-colors"
              >
                <img src={video} alt="Event" className="w-5 h-5" />
                Event
              </label>
            )}
          </div>
          <div>
            <button
              onClick={newHandleSubmit}
              disabled={loadingPost}
              style={{
                backgroundColor: loadingPost ? "#ccc" : "#0A3A4C",
                cursor: loadingPost ? "not-allowed" : "pointer",
              }}
              className="px-6 py-2 text-white text-xs md:text-sm font-medium rounded shadow transition-colors"
            >
              {loadingPost ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
      <PollModal
        show={showPollModal}
        onHide={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />
      <MyVerticallyCenteredModal
        show={modalShow}
        isEditing={isEditing}
        selectedEvent={selectedEvent}
        onHide={() => {
          setModalShow(false);
          setSelectedEventDetails(null);
        }}
      />
    </div>
  );
};
export default CreatePost1;
