import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CKeditor from "../../CKeditor/CKeditor.jsx";
import "./CreateForum.css";
import axios from 'axios';
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';
import baseUrl from '../../../config.js';

const CreateForum = () => {
  const [forumData, setForumData] = useState({
    title: "",
    description: "",
    picture: "",
    type: "Public"
  });
  const [editorValue, setEditorValue] = useState('');
  const { id } = useParams();  // Get forum ID if editing
  const location = useLocation();  // Get current URL
  const navigateTo = useNavigate();
  const profile = useSelector((state) => state.profile);
  const isEditing = location.pathname.includes("edit"); // Check if editing

  useEffect(() => {
    if (isEditing && id) {
      fetchForumDetails();
    }
  }, [id, isEditing]);

  const fetchForumDetails = async () => {
    try {
      const response = await axios.get(`${baseUrl}/forums/${id}`);
      const forum = response.data;
      setForumData({
        title: forum.title,
        description: forum.description,
        picture: forum.picture || "",
        type: forum.type
      });
      setEditorValue(forum.description);
    } catch (error) {
      console.error("Error fetching forum details:", error);
    }
  };

  const handleTitleChange = (e) => {
    setForumData({ ...forumData, title: e.target.value });
  };

  const handleEditorChange = (value) => {
    setForumData({ ...forumData, description: value });
    setEditorValue(value);
  };

  const handleTypeChange = (e) => {
    setForumData({ ...forumData, type: e.target.value });
  };

  const handleCreate = async () => {
    try {
      const body = {
        userId: profile._id,
        title: forumData.title,
        picture: forumData.picture,
        description: forumData.description,
        type: forumData.type,
        department: profile.department,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture
      };

      await axios.post(`${baseUrl}/forums/createForum`, body);
      toast.success("New Forum Created");
      navigateTo("/home/forums");
    } catch (error) {
      console.error("Error creating forum:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const body = {
        title: forumData.title,
        picture: forumData.picture,
        description: forumData.description,
        type: forumData.type
      };

      await axios.put(`${baseUrl}/forums/edit/${id}`, body);
      toast.success("Forum Updated Successfully");
      navigateTo("/home/forums");
    } catch (error) {
      console.error("Error updating forum:", error);
    }
  };

  return (
    <div className="create-forum-container">
      <h1 className="create-forum-title">{isEditing ? "Edit Forum" : "Create New Forum"}</h1>
      <div className="form-container">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input 
            type='text' 
            name='title' 
            placeholder='Enter Title' 
            className="form-input" 
            value={forumData.title} 
            onChange={handleTitleChange} 
            required 
          />
        </div>
        <div className="form-group">
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
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <CKeditor value={editorValue} onChange={handleEditorChange} setNewForum={setForumData} />
        </div>
        <div className="form-buttons">
          <button className="back-button" onClick={() => navigateTo("/forums")}>Back</button>
          <button className="create-button" onClick={isEditing ? handleEdit : handleCreate}>
            {isEditing ? "Submit" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateForum;
