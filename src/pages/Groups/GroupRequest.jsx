import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import upload from '../../images/upload.svg';
import baseUrl from '../../config';

// Helper to capitalize the first letter of a string
const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const GroupRequest = ({ edit }) => {
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const { _id } = useParams();
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('public');
  const [category, setCategory] = useState('');
  const [background, setBackground] = useState('');
  const [groupLogo, setGroupLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle image file input and convert to Data URL
  const handleImageChange = (event, setter) => {
    const file = event.target.files[0];

    const api = `${process.env.REACT_APP_API_URL}/uploadImage/singleImage`
        const formData = new FormData();
        formData.append('image', file);
        axios.post(api, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then((res) => {
            setter(res.data?.imageUrl)
          }).catch((err) => {
            setLoading(false);
            toast.dismiss()
            toast.error('Upload failed');
          })

  };

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${_id}`);
      setGroupName(response.data.groupName);
      setGroupType(response.data.groupType);
      setCategory(response.data.category);
      setBackground(response.data.groupBackground);
      setGroupLogo(response.data.groupLogo);
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  }
  // Construct payload
 
  useEffect(() => {
    if (edit) {
      fetchGroup();
    }
  }, [edit]);

  const validateForm = () => {
    const newErrors = {};
    if (!groupName.trim()) newErrors.groupName = 'Group Name is required';
    else if (groupName.trim().length < 3) newErrors.groupName = 'Group Name must be at least 3 characters';
    // if (!groupType) newErrors.groupType = 'Group Type is required';
    if (!category) newErrors.category = 'Category is required';
    if (!background) newErrors.background = 'Background image is required';
    if (!groupLogo) newErrors.groupLogo = 'Group Logo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler for create or edit flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
        userId: profile._id,
        groupName,
        groupType,
        category,
        groupBackground: background,
        groupLogo,
        member: {
          userId: profile._id,
          profilePicture: profile.profilePicture,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
      };
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (!edit) {
        await axios.post(`${process.env.REACT_APP_API_URL}/groups/create`, body);
        toast.success('Group created successfully!');
      } else {
        await axios.put(`${process.env.REACT_APP_API_URL}/groups/${_id}`, body);
        toast.success('Group updated successfully!');
      }
      navigate('/home/groups');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'An error occurred';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {edit ? `Edit ${capitalizeFirstLetter('group')}` : `Create A New ${capitalizeFirstLetter('group')}`}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Group Name*</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            // required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
           {errors.groupName && <p className="text-red-500 text-sm mt-1">{errors.groupName}</p>}
        </div>
        

        {/* <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Group Type*</label>
          <select
            value={groupType}
            onChange={(e) => setGroupType(e.target.value)}
            // required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          {errors.groupType && <p className="text-red-500 text-sm mt-1">{errors.groupType}</p>}
        </div> */}

        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Category*</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            // required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="Education">Education</option>
            <option value="Business Connect">Business Connect</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Sports">Sports</option>
            <option value="Pets and Animals">Pets and Animals</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Group Background*</label>
          <label className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer">
            <img src={upload} alt="upload icon" className="w-6 h-6 mr-2" />
            <span className="text-gray-500 mr-2">Drag & Drop or</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setBackground)}
            //   required
              className="hidden"
            />
          </label>
            {errors.background && <p className="text-red-500 text-sm mt-1">{errors.background}</p>}
          <div>
            {background ? (
              <div className="relative mt-2">
                <img src={background} alt="background" className="w-[80px] h-[80px]" />
                <button
                  onClick={() => setBackground(null)}
                  className=" bg-red-500 p-2 text-white rounded-lg font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Group Logo*</label>
          <label className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer">
            <img src={upload} alt="upload icon" className="w-6 h-6 mr-2" />
            <span className="text-gray-500 mr-2">Drag & Drop or</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setGroupLogo)}
            //   required
              className="hidden"
            />
          </label>
            {errors.groupLogo && <p className="text-red-500 text-sm mt-1">{errors.groupLogo}</p>}
          <div>
            {groupLogo ? (
              <div className="relative mt-2">
                <img src={groupLogo} alt="background" className="w-[80px] h-[80px]" />
                <button
                  onClick={() => setGroupLogo(null)}
                  className=" bg-red-500 p-2 text-white rounded-lg font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        </div>

      </div>

        <div className="flex justify-between mt-6">
          <Link to="/home/groups" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
            Back
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md focus:outline-none ${loading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {loading ? 'Submitting...' : edit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupRequest;
