import React, { useState } from 'react';
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


function MyVerticallyCenteredModal(props) {
  const [isEditing, setIsEditing] = useState(false);
  const profile = useSelector((state) => state.profile);
  const [createGroup, setCreateGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { _id } = useParams();

  // New states for price type, amount, and currency
  const [priceType, setPriceType] = useState("free");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [newEvent, setNewEvent] = useState({
    title: "", start: "", end: "", startTime: "00:00",
    endTime: "00:00", picture: "", cName: "",
    cNumber: "", cEmail: "", location: ""
  });
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState([props.selectedEvent]);

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

  const handleAddEvent = () => {
    const { title, start, end, startTime, endTime, picture, cName, cNumber, cEmail, location } = newEvent;

    if (!title || !start || !end || !picture) {
      alert("Please provide title, start date, end date and image");
      return;
    }

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
      groupEvent: _id ? true : false,
      groupId: _id ? _id : null,
      // Include price type and amount based on selection
      priceType,
      amount: priceType === "paid" ? amount : null, // Only include amount if it's paid
      currency: priceType === "paid" ? currency : ""
    };
    console.log('eventData', eventData);

    fetch(`${process.env.REACT_APP_API_URL}/events/createEvent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    })
      .then((response) => response.json())
      .then((createdEvent) => {
        //setAllEvents([...allEvents, createdEvent]);
        setLoading(false);
        //window.location.reload();

        setNewEvent({ title: "", start: "", end: "", startTime: "", endTime: "", picture: null, cEmail: "", cName: "", cNumber: "", location: "" });
      })
      .catch((error) => console.error("Error creating event:", error));
  };

  const handleEditEvent = () => {
    const { title, start, end, startTime, endTime, picture, cName, cNumber, cEmail, location } = newEvent;
    const eventId = props.selectedEvent._id;

    if (!title || !start || !end) {
      alert("Please provide title, start date, and end date.");
      return;
    }

    try {
      const formattedStart = format(new Date(start), "yyyy-MM-dd");
      const formattedEnd = format(new Date(end), "yyyy-MM-dd");

      const updatedEvent = {
        title: title,
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
        amount: priceType === "paid" ? amount : "0", // Only include amount if it's paid
        currency: priceType === "paid" ? currency : ""
      };

      const jsonEventData = JSON.stringify(updatedEvent);

      fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEventData,
      })
        .then(() => {
          const updatedEvents = allEvents.map((event) =>
            event._id === eventId ? updatedEvent : event
          );

          setAllEvents(updatedEvents);
          setSelectedEvent(null);
          props.onHide();
          toast.success("Event updated successfully.");
          //window.location.reload();
        })
        .catch((error) => console.error("Error updating event:", error));
    } catch (jsonError) {
      console.error("JSON serialization error:", jsonError);
      alert("Error updating event: JSON serialization error");
    }
  };

  const handleDateChange = (date, field) => {
    if (props.isEditing) {
      const updatedEvent = { ...newEvent };
      updatedEvent[field] = date;
      setNewEvent(updatedEvent);
      setIsEditing(true);
    } else {
      setNewEvent({ ...newEvent, [field]: date });
    }
  };

  const handleTimeChange = (time, field) => {
    const updatedEvent = { ...newEvent };
    updatedEvent[field] = time;
    setNewEvent(updatedEvent);
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header style={{ backgroundColor: '#f5dad2' }} closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.isEditing ? "Edit Event" : "Add Event"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ display: 'flex', gap: '2em', backgroundColor: '#eaf6ff' }}>
        <Col>
          <Row style={{ padding: '0px 5px' }}>
            <input
              type="text"
              placeholder="Add/Edit Title"
              style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
            <br />
            <br />
            <label htmlFor={newEvent.picture}>Insert a Picture:-</label>
            <br />
            <input type="file" name={newEvent.picture}
              style={{ width: '60%' }}
              onChange={handleImageChange} />

            <input
              type="text"
              placeholder="Enter Coordinator Name"
              style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
              value={newEvent.cName}
              onChange={(e) =>
                setNewEvent({ ...newEvent, cName: e.target.value })
              }
            />
          </Row>
        </Col>

        <Col>
          <DatePicker
            placeholderText="Start Date"
            style={{ marginRight: "10px", padding: "0.5em" }}
            selected={newEvent.start}
            onChange={(date) => handleDateChange(date, "start")}
          />
          <br /><br />
          <input type="time" id="appt" name="startTime" value={newEvent.startTime} onChange={(e) =>
            setNewEvent({ ...newEvent, startTime: e.target.value })
          } />
          <br /><br />
          <input
            type="number"
            placeholder="Enter Coordinator Contact Number"
            style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
            value={newEvent.cNumber}
            onChange={(e) =>
              setNewEvent({ ...newEvent, cNumber: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Enter event location"
            style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />
        </Col>

        <Col>
          <DatePicker
            placeholderText="End Date"
            style={{ padding: "0.5em" }}
            selected={newEvent.end}
            onChange={(date) => handleDateChange(date, "end")}
          />
          <br /><br />
          <input type="time" id="appt" name="endTime" value={newEvent.endTime} onChange={(e) =>
            setNewEvent({ ...newEvent, endTime: e.target.value })
          } />
          <input
            type="email"
            placeholder="Enter Coordinator Email"
            style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
            value={newEvent.cEmail}
            onChange={(e) =>
              setNewEvent({ ...newEvent, cEmail: e.target.value })
            }
          />
        </Col>
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: '#f5dad2' }}>
        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="create-group"
            checked={createGroup}
            onChange={(e) => setCreateGroup(e.target.checked)}
          />
          <label htmlFor="create-group" style={{ marginLeft: '0.5em' }}>Create a group with the same event title name</label>
        </div>

        {/* Free/Paid Radio Buttons */}
        <div>
          <label>
            <input
              type="radio"
              value="free"
              checked={priceType === "free"}
              onChange={(e) => setPriceType(e.target.value)}
            /> Free
          </label>
          <label style={{ marginLeft: '1em' }}>
            <input
              type="radio"
              value="paid"
              checked={priceType === "paid"}
              onChange={(e) => setPriceType(e.target.value)}
            /> Paid
          </label>
        </div>

        {/* Conditionally render the price and currency input */}
        {priceType === "paid" && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              style={{ width: '100px', padding: '0.5em', borderRadius: '5px' }}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ padding: '0.5em', borderRadius: '5px' }}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JYN">JYN</option>
            </select>
          </div>
        )}

        <Button onClick={props.isEditing ? handleEditEvent : handleAddEvent}>
          {loading
            ? 'Adding Event...'
            : props.isEditing
              ? 'Edit Event'
              : 'Add Event'}
        </Button>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}




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

  const onHideModal = (modalVisibility) => {
    setShowModal(modalVisibility);
  };

  const handleInputClick = () => {
    setExpanded(!isExpanded);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 1) {
      console.log("ONLY ONE IMAGE");
      const file = files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        setPicturePath(base64String);
      };
      reader.readAsDataURL(file);

      setSelectedFiles([]);
    } else if (files.length > 1) {
      if (files.length > 5) {
        alert('Maximum limit is 5 images');
        return;
      }
      setSelectedFile(null);
      setSelectedFiles(files);
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises)
        .then(base64Strings => {
          console.log('Base64 strings:', base64Strings);
          setSelectedFiles(base64Strings);
          setPicturePath(base64Strings);
        })
        .catch(error => console.error('Error converting files to base64:', error));
    }

    console.log(selectedFiles);
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/uploadImage/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update gallery with uploaded image URLs
      setPicturePath(response.data);
    } catch (error) {
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
    console.log('loading t/f', loading);

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

    console.log("payload", payload);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/${entityType}/create`, payload);
      setImgUrl("");
      setSelectedFile(null);
      setPicturePath([]);
      setVideoPath({});
      setInput("");
      setAuthor("");
      // getPosts();
      onNewPost()
      // window.location.reload();
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

  return (
    <div className={` mb-3 rounded-xl border border-gray-200  w-full md:w-3/4 xl:min-w-[650px] bg-white shadow-sm transition-all duration-300 ${isExpanded ? 'ring-2 ring-green-300' : ''}`}>
      <div className={`overlay ${isExpanded ? 'opacity-75' : 'opacity-0'}`} onClick={handleInputClick}></div>
      <div className={`card pt-1 ${isExpanded ? 'pb-4' : 'pb-2'}`}>
        <div className={`card-header bg-white border-b-0 p-0`}>
          <div className="flex items-center gap-4 px-4 py-2">
            <img
              src={profile.profilePicture || picture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="w-full border-b border-gray-300">
              <textarea
                value={input}
                onClick={handleInputClick}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What's going on??"
                className="w-full resize-none border-none outline-none placeholder-gray-500 text-lg p-2"
                rows={isExpanded ? 3 : 1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    newHandleSubmit(e);
                  }
                }}
              />
            </div>
          </div>
        </div>
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

        <div className="flex items-center justify-between mt-4 px-4">
          <div className="flex gap-3">
            <label className="flex gap-1 items-center font-semibold px-3 py-2 rounded-full border border-green-300 cursor-pointer hover:bg-green-100 transition-colors">
              <img src={gallery} alt="Gallery" className="w-5 h-5" />
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
              className="flex gap-2 items-center font-semibold px-3 py-2 rounded-full border border-green-300 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => setShowPollModal(true)}
            >
              <img src={poll} alt="Poll" className="w-5 h-5" />
              <p className="hidden md:block">Poll</p>
            </label>
            {/* <label className="flex gap-2 items-center font-semibold px-3 py-2 rounded-full border border-green-300 cursor-pointer hover:bg-green-100 transition-colors">
              <img src={video} alt="Video" className="w-5 h-5" />
              <p className="hidden lg:block">Video</p>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoChange}
              />
            </label> */}
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
                className="flex items-center gap-2 border border-green-400 text-black px-4 py-1 rounded-full cursor-pointer text-sm hover:bg-green-100 transition-colors"
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
              className="px-6 py-2 text-white text-lg font-medium rounded shadow transition-colors"
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
