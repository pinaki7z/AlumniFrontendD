import React, { useState, useEffect } from 'react';
import CKeditor from '../../../components/CKeditor/CKeditor.jsx';
import { useSelector } from 'react-redux';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios';
import baseUrl from '../../../config.js';

export const CreateNews = () => {
  const [newsData, setNewsData] = useState({
    title: "",
    description: "",
    //picture: "",
    author: "",
    picture: "",
    //type: "Public"
  });
  const profile = useSelector((state) => state.profile);
  const navigateTo = useNavigate();
  const [editorValue, setEditorValue] = useState('');
  const handleEditorChange = (value) => {
    setNewsData({ ...newsData, description: value });
    setEditorValue(value);
  };

  const handleTitleChange = (e) => {
    setNewsData({ ...newsData, title: e.target.value });
  };

  const handleAuthorChange = (e) => {
    setNewsData({ ...newsData, author: e.target.value });
  };

  const handleCreate = async () => {
    try {
      const body = {
        userId: profile._id,
        title: newsData.title,
        picture: newsData.picture,
        //picture: forumData.picture,
        description: newsData.description,
        //type: newsData.type,
        department: profile.department,
        author: newsData.author
        //userName: `${profile.firstName} ${profile.lastName}`,
        //profilePicture: profile.profilePicture
      };

      await axios.post(`${baseUrl}/news/create`, body);
      toast.success("News Created");
      navigateTo("/home/news");
    } catch (error) {
      console.error("Error creating news:", error);
    }
  };


  return (
    <div className="create-forum-container">
      <h1 className="create-forum-title"> Create News</h1>
      <div className="form-container">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type='text'
            name='title'
            placeholder='Enter Title'
            className="form-input"
            value={newsData.title}
            onChange={handleTitleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Author</label>
          <input
            type='text'
            name='title'
            placeholder='Enter Author'
            className="form-input"
            value={newsData.author}
            onChange={handleAuthorChange}
            required
          />
        </div>
        {/* <div className="form-group">
          <label className="form-label">Type</label>
          <select
            value={forumData.type}
            onChange={handleTypeChange}
            className="form-input"
            required
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div> */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <CKeditor value={editorValue} onChange={handleEditorChange} setNewForum={setNewsData} />
        </div>
        <div className="form-buttons">
          <button className="back-button" onClick={() => navigateTo("/home/news")}>Back</button>
          <button 
          className="create-button" 
          //onClick={isEditing ? handleEdit : handleCreate}
          onClick={handleCreate}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
