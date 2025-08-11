import React, { useEffect, useState } from 'react';
import '../CreatePost/socialWall.css';
import picture from '../../images/profilepic.png'
import axios from 'axios';
import JobsInt from '../JobsInt';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import PollModal from './PollModal';
import baseUrl from '../../config';
import { toast } from "react-toastify";
import format from "date-fns/format";
import { Col, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DatePicker from "react-datepicker";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import {
  ImageIcon,
  BarChart3,
  Youtube,
  Calendar,
  X,
  Loader2,
  Plus,
  Smile,
  AtSign,
  MapPin,
  Clock,
  Users
} from "lucide-react"
import AIRefactorButton from '../../utils/AIRefactorButton';
import AISuggestion from '../../utils/AISuggestion';
import { auto } from '@popperjs/core';


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

    // Check file size on mobile (max 5MB per file)
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
    }

    const formData = new FormData();
    for (let f of files) formData.append('images', f);

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadImage/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setPicturePath(prev => [...prev, ...data]);
      simulateUpload();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  // VIDEO UPLOAD
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size should be less than 50MB');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    setLoading(true);

    axios
      .post(`${process.env.REACT_APP_API_URL}/uploadImage/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => {
        setVideoPath(res.data);
        simulateUpload();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to upload video');
      })
      .finally(() => setLoading(false));
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
    }, 200);
  };

  // REMOVE MEDIA
  const removeMedia = (i) => {
    const arr = [...picturePath];
    arr.splice(i, 1);
    setPicturePath(arr);
  };

  // YOUTUBE HANDLERS
  const handleAddYoutubeVideo = () => {
    const url = prompt('Enter YouTube video URL:');
    if (!url) return;
    const id = extractYoutubeVideoId(url);
    if (id) {
      setYoutubeVideoId(id);
      toast.success('YouTube video added!');
    } else {
      toast.error('Invalid YouTube URL');
    }
  };

  const removeYoutubeVideo = () => {
    setYoutubeVideoId(null);
    toast.info('YouTube video removed');
  };

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
      toast.success('Poll created successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create poll');
    }
  };

  // NEW POST SUBMIT
  const newHandleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !picturePath.length && !youtubeVideoId && !videoPath.videoPath) {
      toast.error('Please add some content to your post');
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
    if (videoPath.videoPath) payload.videoPath = videoPath;
    if (youtubeVideoId) payload.youtubeVideoId = youtubeVideoId;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/${entityType}/create`, payload);
      resetForm();
      onNewPost();
      toast.success('Post created successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
      setLoadingPost(false);
    }
  };

  const resetForm = () => {
    setImgUrl('');
    setSelectedFile(null);
    setShowMobilePostModal(false);
    setPicturePath([]);
    setVideoPath({});
    setInput('');
    setAuthor('');
    setYoutubeVideoId(null);
    setExpanded(false);
    setLoadingPost(false);
  };

  const closeMobilePostModal = () => {
    resetForm();
  };

  return (
    <>
      {/* Desktop Version - LinkedIn-like width */}
      <div className="hidden sm:block w-full  mx-auto">
        <PostCreatorContent
          isMobile={false}
          setInput={setInput}
          profile={profile}
          picturePlaceholder={picture}
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onFocus={() => setExpanded(true)}
          onBlur={() => !input.trim() && !picturePath.length && !youtubeVideoId && !videoPath.videoPath && setExpanded(false)}
          isExpanded={isExpanded}
          loading={loading}
          picturePath={picturePath}
          closeMobilePostModal={closeMobilePostModal}
          onImageChange={handleImageChange}
          onVideoChange={handleVideoChange}
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
          resetForm={resetForm}
        />
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowMobilePostModal(true)}
        className="sm:hidden fixed bottom-[90px] right-4 w-14 h-14 dynamic-site-bg hover:shadow-lg text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-200 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Post Modal */}
      {showMobilePostModal && (
        <MobilePostModal
          setInput={setInput}
          profile={profile}
          picturePlaceholder={picture}
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          loading={loading}
          picturePath={picturePath}
          onImageChange={handleImageChange}
          onVideoChange={handleVideoChange}
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
          onOpenPoll={() => {
            setShowMobilePostModal(false);
            setShowPollModal(true);
          }}
          onOpenEvent={() => {
            setShowMobilePostModal(false);
            setModalShow(true);
          }}
          groupId={groupId}
          onSubmit={newHandleSubmit}
          loadingPost={loadingPost}
        />
      )}

      <PollModal
        show={showPollModal}
        onHide={() => {
          setShowPollModal(false);
          if (window.innerWidth < 640) setShowMobilePostModal(true);
        }}
        onCreatePoll={handleCreatePoll}
      />

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          if (window.innerWidth < 640) setShowMobilePostModal(true);
        }}
        isEditing={isEditing}
        selectedEvent={selectedEvent}
        groupId={groupId}
      />
    </>
  );
}

// YouTube Component - Compact
export function YouTubeEmbed({ videoId, isMobile = false }) {
  if (!videoId) return null;

  return (
    <div className="youtube-embed-container mt-3">
      <div className="relative w-full rounded-lg overflow-hidden shadow-sm bg-gray-100" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// Event Modal - Mobile optimized
export function MyVerticallyCenteredModal({ show, onHide, isEditing, selectedEvent, groupId }) {
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
  const [loading, setLoading] = useState(false);

  const isMobile = window.innerWidth < 640;

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
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`;
    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    axios
      .post(api, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => setNewEvent((p) => ({ ...p, picture: res.data.imageUrl })))
      .catch(() => toast.error('Failed to upload image'))
      .finally(() => setLoading(false));
  };

  const submit = () => {
    if (!validate()) return;

    setLoading(true);
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
        onHide();
        window.location.reload();
      })
      .catch(() => toast.error('Error saving event'))
      .finally(() => setLoading(false));
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="event-modal">
      <Modal.Header closeButton className="border-0 pb-2">
        <Modal.Title className="text-lg font-semibold">
          {isEditing ? 'Edit Event' : 'Create Event'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Compact form fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Event location *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <input
              type="text"
              value={newEvent.cName}
              onChange={(e) => setNewEvent(prev => ({ ...prev, cName: e.target.value }))}
              placeholder="Coordinator name *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
            />
            {errors.cName && <p className="text-red-500 text-xs mt-1">{errors.cName}</p>}
          </div>

          <div className="flex gap-2">
            <DatePicker
              selected={newEvent.start}
              onChange={(date) => setNewEvent(prev => ({ ...prev, start: date }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
              placeholderText="Start date"
              dateFormat="yyyy-MM-dd"
            />
            <DatePicker
              selected={newEvent.end}
              onChange={(date) => setNewEvent(prev => ({ ...prev, end: date }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
              placeholderText="End date"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="free"
                checked={priceType === 'free'}
                onChange={(e) => setPriceType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Free</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="paid"
                checked={priceType === 'paid'}
                onChange={(e) => setPriceType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Paid</span>
            </label>
          </div>

          {priceType === 'paid' && (
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71be95] focus:border-transparent text-sm"
              />
            </div>
          )}

          <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Add Image</span>
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </label>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-2">
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          disabled={loading}
          className="dynamic-site-bg border-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save' : 'Create'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Desktop Post Creator - LinkedIn-like compact design
export function PostCreatorContent({
  isMobile,
  setInput,
  profile,
  picturePlaceholder,
  input,
  onInputChange,
  onFocus,
  onBlur,
  isExpanded,
  loading,
  picturePath,
  onImageChange,
  onVideoChange,
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
  groupId,
  onSubmit,
  loadingPost,
  resetForm,
}) {
  const textareaRef = React.useRef(null);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 100; // Reduced for LinkedIn-like experience

  const handleInputChange = (e) => {
    const value = e.target.value;
    onInputChange(e);
    setCharCount(value.length);
    autoResize()

  };


  useEffect(() => {
    autoResize()
  }, [input])

  const autoResize = () => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight)}px`;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 520)}px`;
    }
  }

  const hasContent = input.trim() || picturePath.length > 0 || youtubeVideoId || videoPath.videoPath;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
      {/* Compact Header */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <img
            src={profile.profilePicture || picturePlaceholder}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={`What's on your mind, ${profile.firstName}?`}
              className="w-full text-gray-700 placeholder-gray-500 border border-gray-200 outline-none resize-none text-sm leading-relaxed bg-gray-50 rounded-lg p-2 focus:bg-white focus:border-[#71be95] transition-all"

              style={{ minHeight: '36px', }}
            />
            

          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="flex items-center gap-2 text-[#71be95]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        </div>
      )}

      {/* Compact Media Preview */}
      {picturePath.length > 0 && (
        <div className="px-3 pb-3">
          <div className={`grid gap-2 ${picturePath.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {picturePath.slice(0, 4).map((path, i) => (
              <div key={i} className="relative group">
                <img
                  src={path}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-20 object-cover rounded border border-gray-200"
                />
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {picturePath.length > 4 && (
              <div className="flex items-center justify-center bg-gray-100 rounded border border-gray-200 h-20">
                <span className="text-sm text-gray-600">+{picturePath.length - 4} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* YouTube Preview */}
      {youtubeVideoId && (
        <div className="px-3 pb-3 relative">
          <YouTubeEmbed videoId={youtubeVideoId} />
          <button
            onClick={removeYoutubeVideo}
            className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Video Preview */}
      {videoPath.videoPath && (
        <div className="px-3 pb-3 relative">
          <video
            src={videoPath.videoPath}
            className="w-full max-h-40 object-cover rounded border border-gray-200"
            controls
          />
          <button
            onClick={removeVideo}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="px-3 pb-3">
          <div className="bg-gray-200 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#71be95] to-[#5fa080] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Author Field for News */}
      {entityType === 'news' && isExpanded && (
        <div className="px-3 pb-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#71be95] focus:border-transparent"
          />
        </div>
      )}

      {/* Compact Actions */}
      <div className="px-3 py-2 border-t border-gray-100">
        {true ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-50 rounded cursor-pointer transition-colors text-sm">
                <ImageIcon className="w-4 h-4 text-green-600" />
                <span className="hidden sm:inline">Photo</span>
                <input type="file" accept="image/*" hidden onChange={onImageChange} multiple />
              </label>

              {/* <label className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-50 rounded cursor-pointer transition-colors text-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
                <span className="hidden sm:inline">Video</span>
                <input type="file" accept="video/*" hidden onChange={onVideoChange} />
              </label> */}

              <button
                onClick={onOpenPoll}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-50 rounded transition-colors text-sm"
              >
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Poll</span>
              </button>

              <button
                onClick={onAddYoutubeVideo}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-50 rounded transition-colors text-sm"
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">YouTube</span>
              </button>

              {groupId && (
                <button
                  onClick={onOpenEvent}
                  className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-50 rounded transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">Event</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* <span className="text-xs text-gray-500">{charCount}/{maxChars}</span> */}
              
             <AIRefactorButton inputText={input} setInputText={setInput} />
              <AISuggestion inputText={input} setInputText={setInput} />
              <button
                onClick={onSubmit}
                disabled={loadingPost || !hasContent}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${loadingPost || !hasContent
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'dynamic-site-bg text-white hover:shadow-md'
                  }`}
              >
                {loadingPost ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Posting...</span>
                  </div>
                ) : (
                  'Post'
                )}
              </button>
              
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6 text-gray-500 py-1">
            <label className="cursor-pointer hover:text-green-600 transition-colors">
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" hidden onChange={onImageChange} multiple />
            </label>
            {/* <label className="cursor-pointer hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
              <input type="file" accept="video/*" hidden onChange={onVideoChange} />
            </label> */}
            <button onClick={onOpenPoll} className="hover:text-amber-600 transition-colors">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button onClick={onAddYoutubeVideo} className="hover:text-red-600 transition-colors">
              <Youtube className="w-5 h-5" />
            </button>
            {groupId && (
              <button onClick={onOpenEvent} className="hover:text-purple-600 transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile Post Modal - Compact
export function MobilePostModal({
  profile,
  setInput,
  picturePlaceholder,
  input,
  onInputChange,
  loading,
  picturePath,
  onImageChange,
  onVideoChange,
  removeMedia,
  youtubeVideoId,
  onAddYoutubeVideo,
  removeYoutubeVideo,
  videoPath,
  removeVideo,
  uploadProgress,
  entityType,
  author,
  closeMobilePostModal,
  setAuthor,
  onOpenPoll,
  onOpenEvent,
  groupId,
  onSubmit,
  loadingPost,
}) {
  const [charCount, setCharCount] = useState(input.length);
  const maxChars = 1000;

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      onInputChange(e);
      setCharCount(value.length);
    }
  };

  const hasContent = input.trim() || picturePath.length > 0 || youtubeVideoId || videoPath.videoPath;

  return (
    <div onClick={closeMobilePostModal} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div onClick={e => e.stopPropagation()} className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={closeMobilePostModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Create post</h2>
          </div>
          <button
            onClick={onSubmit}
            disabled={loadingPost || !hasContent}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${loadingPost || !hasContent
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'dynamic-site-bg text-white'
              }`}
          >
            {loadingPost ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <img
              src={profile.profilePicture || picturePlaceholder}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h3 className="font-medium text-gray-800 text-sm">
                {profile.firstName} {profile.lastName}
              </h3>
              <span className="text-xs text-gray-500">
                {profile.department || 'Member'}
              </span>
            </div>
          </div>

          {/* Text Input */}
          <div className="px-4 pb-4">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder={`What's on your mind, ${profile.firstName}?`}
              className="w-full text-gray-700 placeholder-gray-500 border-none outline-none resize-none text-base leading-relaxed min-h-[80px] max-h-[150px]"
              autoFocus
            />

            <div className="flex  sm:flex-row gap-6 mt-1">
              <AIRefactorButton inputText={input} setInputText={setInput} />
              <AISuggestion inputText={input} setInputText={setInput} />
              {/* ...other buttons like Submit */}
            </div>
            {/* <div className="flex items-center justify-end mt-2">
              <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount}/{maxChars}
              </span>
            </div> */}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="flex items-center gap-2 text-[#71be95]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}

          {/* Media Preview */}
          {picturePath.length > 0 && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {picturePath.slice(0, 4).map((path, i) => (
                  <div key={i} className="relative">
                    <img
                      src={path}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-200"
                    />
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Preview */}
          {youtubeVideoId && (
            <div className="px-4 pb-4 relative">
              <YouTubeEmbed videoId={youtubeVideoId} isMobile />
              <button
                onClick={removeYoutubeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Video Preview */}
          {videoPath.videoPath && (
            <div className="px-4 pb-4 relative">
              <video
                src={videoPath.videoPath}
                className="w-full max-h-48 object-cover rounded border border-gray-200"
                controls
              />
              <button
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="px-4 pb-4">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#71be95] to-[#5fa080] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Author Field for News */}
          {entityType === 'news' && (
            <div className="px-4 pb-4">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#71be95] focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-4 gap-2">
            <label className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600">Photos</span>
              <input type="file" accept="image/*" hidden onChange={onImageChange} multiple />
            </label>
            {/* 
            <label className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
              <span className="text-xs text-gray-600">Video</span>
              <input type="file" accept="video/*" hidden onChange={onVideoChange} />
            </label> */}

            <button
              onClick={onOpenPoll}
              className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-gray-600">Poll</span>
            </button>

            <button
              onClick={onAddYoutubeVideo}
              className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <Youtube className="w-5 h-5 text-red-600" />
              <span className="text-xs text-gray-600">YouTube</span>
            </button>
          </div>

          {groupId && (
            <button
              onClick={onOpenEvent}
              className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Create Event</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;
document.head.appendChild(style);
