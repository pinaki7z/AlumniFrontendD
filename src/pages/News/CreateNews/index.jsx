import React, { useState } from 'react';
import CKeditor from '../../../components/CKeditor/CKeditor.jsx';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

export const CreateNews = () => {
  const [newsData, setNewsData] = useState({
    title: '',
    description: '',
    author: '',
    picture: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const profile = useSelector((state) => state.profile);
  const navigateTo = useNavigate();

  const handleEditorChange = (value) => {
    setNewsData((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: '' }));
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setNewsData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!newsData.title.trim()) errs.title = 'Title is required.';
    if (!newsData.author.trim()) errs.author = 'Author is required.';
    if (!newsData.description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const handleCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const body = {
        userId: profile._id,
        title: newsData.title,
        author: newsData.author,
        picture: newsData.picture,
        description: newsData.description,
        department: profile.department,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/news/create`, body);
      toast.success('News Created successfully!');
      navigateTo('/home/news');
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Failed to create news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="  mx-4 p-6  rounded-lg ">
      <h1 className="text-2xl font-semibold mb-6">Create News</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={newsData.title}
            onChange={handleChange('title')}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Author</label>
          <input
            type="text"
            value={newsData.author}
            onChange={handleChange('author')}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Author"
          />
          {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <div className="border border-gray-300 rounded focus-within:ring-2 focus-within:ring-blue-500">
            <CKeditor
              value={newsData.description}
              onChange={handleEditorChange}
              setNewForum={setNewsData}
            />
          </div>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigateTo('/home/news')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};
