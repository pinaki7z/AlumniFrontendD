
// ShowImages.jsx - Enhanced Image Gallery Component
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Trash2, 
  ChevronRight, 
  Home,
  Calendar,
  Building,
  Loader2,
  AlertCircle,
  Download,
  Share2,
  ZoomIn,
  Eye,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react';

export default function ShowImages() {
  const { yearId, deptId } = useParams();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  
  const [year, setYear] = useState({});
  const [dept, setDept] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const isAdmin = profile.profileLevel === 0;

  useEffect(() => {
    fetchMeta();
    fetchPhotos();
  }, [yearId, deptId]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentImageIndex]);

  const fetchMeta = async () => {
    try {
      const [yearsRes, deptsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years`),
        axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years/${yearId}/departments`)
      ]);
      
      setYear(yearsRes.data.find(y => y._id === yearId) || {});
      setDept(deptsRes.data.find(d => d._id === deptId) || {});
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/photoGallary/images/get/year/${yearId}/dept/${deptId}`
      );
      setPhotos(res.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const form = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      form.append('images', files[i]);
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/photoGallary/images/multipleImages/year/${yearId}/dept/${deptId}`,
        form,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // You can show progress here
          }
        }
      );
      
      await fetchPhotos();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    if (!selectedImage) return;
    
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/photoGallary/images/${selectedImage._id}/deleteImage`
      );
      
      setSelectedImage(null);
      setShowDeleteConfirm(false);
      await fetchPhotos();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const openImage = (photo, index) => {
    setSelectedImage(photo);
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (!photos.length) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % photos.length;
    } else {
      newIndex = currentImageIndex === 0 ? photos.length - 1 : currentImageIndex - 1;
    }
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(photos[newIndex]);
  };

  const downloadImage = () => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = selectedImage.imageUrl;
    link.download = `photo-${selectedImage._id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="bg-gray-200 rounded-xl aspect-square animate-pulse"></div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Yet</h3>
      <p className="text-gray-600 mb-4">
        No photos have been uploaded for {dept.name} ({year.year}) yet.
      </p>
      {isAdmin && (
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 cursor-pointer">
          <Upload size={16} />
          Upload First Photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => uploadPhotos(e.target.files)}
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Home size={16} />
          <Link to="/home/photo-gallery" className="hover:text-[#0A3A4C] transition-colors duration-200">
            Gallery
          </Link>
          <ChevronRight size={16} />
          <button
            onClick={() => navigate('/home/photo-gallery')}
            className="hover:text-[#0A3A4C] transition-colors duration-200"
          >
            Years
          </button>
          <ChevronRight size={16} />
          <button
            onClick={() => navigate(`/home/photo-gallery/year/${yearId}`)}
            className="hover:text-[#0A3A4C] transition-colors duration-200"
          >
            {year.year}
          </button>
          <ChevronRight size={16} />
          <span className="text-[#0A3A4C] font-medium capitalize">{dept.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              <span className="capitalize">{dept.name}</span> Photos
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar size={16} />
              {year.year} • {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Upload Button */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Photos
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadPhotos(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* Photos Grid */}
        {loading ? (
          <LoadingGrid />
        ) : photos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo._id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100 hover:shadow-lg transition-all duration-200"
                onClick={() => openImage(photo, index)}
              >
                <img
                  src={photo.imageUrl}
                  alt="Gallery"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg">
                    <ZoomIn size={16} className="text-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
            >
              <X size={20} />
            </button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              <button
                onClick={downloadImage}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
                title="Download"
              >
                <Download size={16} />
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-500 transition-colors duration-200"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Image Counter */}
            {photos.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                {currentImageIndex + 1} of {photos.length}
              </div>
            )}

            {/* Main Image */}
            <img
              src={selectedImage.imageUrl}
              alt="Full View"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={24} className="text-red-600" />
                  <h3 className="text-lg font-semibold">Delete Photo</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this photo? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteImage}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}