import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function ShowImages() {
  const { yearId, deptId } = useParams();
  const navigate = useNavigate();
    const profile = useSelector((state) => state.profile);
  const [year, setYear] = useState({});
  const [dept, setDept] = useState({});
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchMeta();
    fetchPhotos();
  }, [yearId, deptId]);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    const objectUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const fetchMeta = async () => {
    try {
      const yrs = await axios.get(
        `${process.env.REACT_APP_API_URL}/photoGallary/years`
      );
      const selectedYear = yrs.data.find(y => y._id === yearId) || {};
      setYear(selectedYear);
      const deps = await axios.get(
        `${process.env.REACT_APP_API_URL}/photoGallary/years/${yearId}/departments`
      );
      const selectedDept = deps.data.find(d => d._id === deptId) || {};
      setDept(selectedDept);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/photoGallary/images/get/year/${yearId}/dept/${deptId}`
      );
      setPhotos(res.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const uploadPhoto = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const form = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      form.append('images', selectedFiles[i]);
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/photoGallary/images/multipleImages/year/${yearId}/dept/${deptId}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      fetchPhotos();
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
    }
  };

  const deleteImage = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/photoGallary/images/${selectedImage._id}/deleteImage`
      );
      setSelectedImage(null);
      fetchPhotos();
    } catch (error) {
      console.error('Delete failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <nav className="text-lg font-bold text-[#0A3A4C] mb-4">
          <Link to="/home/photo-gallery" className="hover:text-[#136175]">Home</Link>
          <span> / </span>
          <span
            onClick={() => navigate('/home/photo-gallery')}
            className="cursor-pointer hover:text-[#136175]"
          >
            Years
          </span>
          <span> / </span>
          <span
            onClick={() => navigate(`/home/photo-gallery/year/${yearId}`)}
            className="cursor-pointer hover:text-[#136175]"
          >
            {year.year || '20XX'}
          </span>
          <span> / </span>
          <span className="underline text-[#136175]">{dept.name || 'Loading...'}</span>
        </nav>

        <h1 className="text-xl md:text-3xl font-semibold text-center text-gray-800 mb-6">
          Photos of <span className='capitalize mx-2 font-bold text-teal-600'>{`"${dept.name}"`}</span>({year.year})
        </h1>

        {/* Upload & Preview */}
        <div className="mb-6">
       {profile.profileLevel === 0 &&   <div className="flex items-center space-x-2 justify-end">
            <label className="cursor-pointer bg-[#0A3A4C] text-white px-4 py-2 rounded-lg hover:bg-[#136175] transition">
              Select Photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => uploadPhoto(e)}
              />
            </label>
         
          </div>}

         
        </div>
        {/* Gallery */}
        {photos.length === 0 ? (
          <div className="text-center text-gray-500 mt-6">
            No photos uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photos.map(p => (
              <div
                key={p._id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(p)}
              >
                <img
                  src={p.imageUrl}
                  alt="Gallery"
                  className="w-full h-[200px] object-cover rounded-lg shadow-sm group-hover:opacity-75 transition"
                />
              </div>
            ))}
          </div>
        )}

        
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target.closest('.relative') === null) {
              setSelectedImage(null);
            }
          }}
        >
          <div className="relative max-w-3xl mx-4 bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-lg text-xl font-bold"
            >
              &times;
            </button>
         {profile.profileLevel === 0 &&   <button
              onClick={deleteImage}
              className="absolute top-2 right-12 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg font-medium"
            >
              Delete
            </button>}
            <img
              src={selectedImage.imageUrl}
              alt="Full View"
              className="max-h-screen w-auto mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
