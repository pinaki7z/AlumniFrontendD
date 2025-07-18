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
import { ImageIcon, BarChart3, Youtube, Calendar, X, Loader2, Plus } from "lucide-react"





// src/components/CreatePost1.jsx

export default function CreatePost1({
  name,
  onNewPost,
  entityType,
  getPosts,
  loadingPost,
  setLoadingPost,
}) {
  const { _id: groupId } = useParams();
  const profile = useSelector((state) => state.profile);
  const [isExpanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [picturePath, setPicturePath] = useState([]);
  const [author, setAuthor] = useState('');
  const [videoPath, setVideoPath] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [imgUrl, setImgUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cookie, setCookie] = useCookies(['access_token']);
  const [showPollModal, setShowPollModal] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [showMobilePostModal, setShowMobilePostModal] = useState(false);

  // extractYoutubeVideoId (unchanged)
  const extractYoutubeVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/i
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  };

  // IMAGE UPLOAD
  const handleImageChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let f of files) formData.append('images', f);
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setPicturePath(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // VIDEO UPLOAD
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('video', file);
    axios
      .post(`${process.env.REACT_APP_API_URL}/uploadImage/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => setVideoPath(res.data))
      .catch(console.error);
  };

  // SIMULATE PROGRESS
  const simulateUpload = () => {
    let prog = 0;
    const iv = setInterval(() => {
      prog += 10;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(iv);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 500);
  };

  // REMOVE MEDIA
  const removeMedia = (i) => {
    const arr = [...picturePath];
    arr.splice(i, 1);
    setPicturePath(arr);
    if (selectedFile && i === 0) setSelectedFile(null);
    else {
      const sf = [...selectedFiles];
      sf.splice(i, 1);
      setSelectedFiles(sf);
    }
  };

  // YOUTUBE HANDLERS
  const handleAddYoutubeVideo = () => {
    const url = prompt('Enter YouTube video URL:');
    if (!url) return;
    const id = extractYoutubeVideoId(url);
    if (id) setYoutubeVideoId(id);
    else alert('Invalid YouTube URL.');
  };
  const removeYoutubeVideo = () => setYoutubeVideoId(null);

  // POLL CREATION
  const handleCreatePoll = async (question, options) => {
    const pollData = {
      userId: profile._id,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
      question,
      options
    };
    if (groupId) pollData.groupID = groupId;
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/poll/createPoll`,
        pollData
      );
      onNewPost(data);
      setInput('');
      setShowPollModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // NEW POST SUBMIT
  const newHandleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      alert('Post cannot be blank.');
      setLoadingPost(false);
      return;
    }
    setLoadingPost(true);
    const payload = {
      userId: profile._id,
      description: input,
      department: profile.department,
      profilePicture: profile.profilePicture,
      author
    };
    if (groupId) payload.groupID = groupId;
    if (picturePath.length) payload.picturePath = picturePath;
    if (videoPath) payload.videoPath = videoPath;
    if (youtubeVideoId) payload.youtubeVideoId = youtubeVideoId;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/${entityType}/create`, payload);
      setImgUrl('');
      setSelectedFile(null);
      setShowMobilePostModal(false);
      setPicturePath([]);
      setVideoPath({});
      setInput('');
      setAuthor('');
      setYoutubeVideoId(null);
      onNewPost();
    } catch (err) {
      console.error(err);
      setLoadingPost(false);
    }
  };

  const closeMobilePostModal = () => {
    setShowMobilePostModal(false);
    setPicturePath([]);
    setVideoPath({});
    setInput('');
    setAuthor('');
    setYoutubeVideoId(null);
  };

  return (
    <div
      className={`mb-3 rounded-xl w-full xl:w-[650px] bg-white shadow-sm transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-green-300' : ''
      }`}
    >
      <div className="hidden md:block">
        <PostCreatorContent
          isMobile={false}
          profile={profile}
          picturePlaceholder={picture}
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onFocus={() => setExpanded(true)}
          isExpanded={isExpanded}
          loading={loading}
          picturePath={picturePath}
          closeMobilePostModal={closeMobilePostModal}
          onImageChange={handleImageChange}
          removeMedia={removeMedia}
          youtubeVideoId={youtubeVideoId}
          onAddYoutubeVideo={handleAddYoutubeVideo}
          removeYoutubeVideo={removeYoutubeVideo}
          videoPath={videoPath}
          removeVideo={() => setVideoPath({})}
          uploadProgress={uploadProgress}
          entityType={entityType}
          author={author}
          setAuthor={setAuthor}
          onOpenPoll={() => setShowPollModal(true)}
          onOpenEvent={() => setModalShow(true)}
          groupId={groupId}
          onSubmit={newHandleSubmit}
          loadingPost={loadingPost}
        />
      </div>

      <button
        onClick={() => setShowMobilePostModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#0A3A4C] hover:bg-teal-900 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showMobilePostModal && (
        <MobilePostModal
          isMobile={true}
          profile={profile}
          picturePlaceholder={picture}
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onFocus={() => setExpanded(true)}
          isExpanded={true}
          loading={loading}
          picturePath={picturePath}
          onImageChange={handleImageChange}
          removeMedia={removeMedia}
          youtubeVideoId={youtubeVideoId}
          onAddYoutubeVideo={handleAddYoutubeVideo}
          removeYoutubeVideo={removeYoutubeVideo}
          videoPath={videoPath}
          removeVideo={() => setVideoPath({})}
          uploadProgress={uploadProgress}
          entityType={entityType}
          author={author}
          closeMobilePostModal={closeMobilePostModal}
          setAuthor={setAuthor}
          onOpenPoll={() => setShowPollModal(true)}
          onOpenEvent={() => setModalShow(true)}
          groupId={groupId}
          onSubmit={newHandleSubmit}
          loadingPost={loadingPost}
        />
      )}

      <PollModal
        show={showPollModal}
        onHide={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        isEditing={isEditing}
        selectedEvent={selectedEvent}
        groupId={groupId}
      />
    </div>
  );
}




// saddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd



export function YouTubeEmbed({ videoId }) {
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
      />
    </div>
  );
}





export function MyVerticallyCenteredModal({
  show,
  onHide,
  isEditing,
  selectedEvent,
  groupId,
}) {
  const profile = useSelector((s) => s.profile);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    startTime: '00:00',
    endTime: '00:00',
    picture: '',
    cName: '',
    cNumber: '',
    cEmail: '',
    location: '',
    groupId,
  });
  const [priceType, setPriceType] = useState('free');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && selectedEvent) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/events/${selectedEvent._id}`)
        .then((res) => {
          const e = res.data;
          setNewEvent({
            title: e.title,
            start: new Date(e.start),
            end: new Date(e.end),
            startTime: e.startTime,
            endTime: e.endTime,
            picture: e.picture,
            cName: e.cName,
            cNumber: e.cNumber,
            cEmail: e.cEmail,
            location: e.location,
            groupId,
          });
          setPriceType(e.priceType || 'free');
          setAmount(e.amount || '');
          setCurrency(e.currency || 'INR');
        })
        .catch(console.error);
    }
  }, [isEditing, selectedEvent, groupId]);

  const validate = () => {
    const errs = {};
    if (!newEvent.title.trim()) errs.title = 'Event title is required';
    if (!newEvent.cName.trim()) errs.cName = 'Coordinator name is required';
    if (!newEvent.location.trim()) errs.location = 'Location is required';
    if (priceType === 'paid' && (!amount || amount <= 0))
      errs.amount = 'Valid amount is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`;
    const formData = new FormData();
    formData.append('image', file);
    axios
      .post(api, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) =>
        setNewEvent((p) => ({ ...p, picture: res.data.imageUrl }))
      )
      .catch(console.error);
  };

  const submit = () => {
    if (!validate()) return;
    const payload = {
      ...newEvent,
      start: format(newEvent.start, 'yyyy-MM-dd'),
      end: format(newEvent.end, 'yyyy-MM-dd'),
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      priceType,
      amount: priceType === 'paid' ? amount : undefined,
      currency: priceType === 'paid' ? currency : undefined,
      userId: profile._id,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
    };
    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/events/${selectedEvent._id}`
      : `${process.env.REACT_APP_API_URL}/events/createEvent`;
    const method = isEditing ? 'put' : 'post';

    axios[method](url, payload)
      .then(() => {
        toast.success(isEditing ? 'Event updated!' : 'Event created!');
        window.location.reload();
      })
      .catch(() => toast.error('Error saving event'));
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Event' : 'Add Event'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* replicate your form inputs here exactly as before,
            referencing newEvent, setNewEvent, priceType, setPriceType, amount, setAmount, currency, setCurrency, errors,
            and using handleImageChange and DatePicker */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          {isEditing ? 'Save Changes' : 'Create Event'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}



export function PostCreatorContent({
  isMobile,
  profile,
  picturePlaceholder,
  input,
  onInputChange,
  onFocus,
  isExpanded,
  loading,
  picturePath,
  onImageChange,
  removeMedia,
  youtubeVideoId,
  onAddYoutubeVideo,
  removeYoutubeVideo,
  videoPath,
  removeVideo,
  uploadProgress,
  entityType,
  author,
  setAuthor,
  onOpenPoll,
  onOpenEvent,
  closeMobilePostModal,
  groupId,
  onSubmit,
  loadingPost,
}) {
  const rows = isMobile ? 4 : isExpanded ? 1 : 1;
  const minH = isMobile ? '100px' : isExpanded ? '72px' : '24px';
  
  return (
    <div
      className={`bg-white ${
        isMobile ? 'rounded-t-2xl' : 'rounded-lg border border-gray-200 shadow-sm'
      }`}
    >
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Create a post</h2>
          <button onClick={closeMobilePostModal} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" /> 
          </button>
        </div>
      )}

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <img
            src={profile.profilePicture || picturePlaceholder}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={input}
              onChange={onInputChange}
              onFocus={onFocus}
              placeholder="Start a post, try writing with AI..."
              className="w-full text-gray-700 placeholder-gray-500 border-none outline-none resize-none text-base leading-relaxed"
              rows={rows}
              style={{ minHeight: minH, maxHeight: '200px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {picturePath.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {picturePath.map((path, i) => (
              <div key={i} className="relative group">
                <img src={path} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {youtubeVideoId && (
        <div className="px-4 pb-4 relative">
          <YouTubeEmbed videoId={youtubeVideoId} />
          <button
            onClick={removeYoutubeVideo}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      )}

      {videoPath.videoPath && (
        <div className="px-4 pb-4 relative">
          <video src={videoPath.videoPath} className="w-full h-64 object-cover rounded-lg" controls />
          <button
            onClick={removeVideo}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      )}

      {uploadProgress > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {entityType === 'news' && (isExpanded || isMobile) && (
        <div className="px-4 pb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Author:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {(isExpanded || isMobile) ? (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <span className="hidden sm:block text-sm font-medium">Media</span>
              <input type="file" accept="image/*" hidden onChange={onImageChange} multiple />
            </label>

            <button
              onClick={onOpenPoll}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span className="hidden sm:block text-sm font-medium">Poll</span>
            </button>

            <button
              onClick={onAddYoutubeVideo}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Youtube className="w-5 h-5 text-red-600" />
              <span className="hidden sm:block text-sm font-medium">Video</span>
            </button>

            {groupId && (
              <button
                onClick={onOpenEvent}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="hidden sm:block text-sm font-medium">Event</span>
              </button>
            )}
          </div>

          <button
            onClick={onSubmit}
            disabled={loadingPost || !input.trim()}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              loadingPost || !input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#0A3A4C] text-white hover:bg-teal-900 shadow-sm'
            }`}
          >
            {loadingPost ? <Loader2 className="w-4 h-4 animate-spin inline-block" /> : 'Post'}
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 hidden sm:flex items-center justify-around text-gray-500">
          <label className="cursor-pointer hover:text-green-600">
            <ImageIcon className="w-5 h-5" />
            <input type="file" accept="image/*" hidden onChange={onImageChange} multiple />
          </label>
          <button onClick={onOpenPoll} className="hover:text-amber-600">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={onAddYoutubeVideo} className="hover:text-red-600">
            <Youtube className="w-5 h-5" />
          </button>
          {groupId && (
            <button onClick={onOpenEvent} className="hover:text-purple-600">
              <Calendar className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}


export function MobilePostModal(props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden">
      <div className="w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <PostCreatorContent {...props}  isMobile={true} />
      </div>
    </div>
  );
}