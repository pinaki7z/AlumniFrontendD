import React from 'react';
import '../Post/Post.scss';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Avatar, TextField, IconButton, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { ThumbUpRounded, ChatBubbleOutlineRounded, NearMeRounded, DeleteRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import baseUrl from "../../config";
import newsImage from "../../images/d-group.jpg";
import { FaArrowCircleRight } from 'react-icons/fa';
import Slider from 'react-slick';

export const DisplayNews = ({ userId, postId, title, description, createdAt, picturePath, videoPath, department, onDeletePost ,author}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const profile = useSelector((state) => state.profile);
    const [loading, setLoading] = useState(false);
    const isUserDepartment = profile.department === 'All' || profile.department === department || department === 'All';
    const navigate = useNavigate();
    let admin;
    if (profile.profileLevel === 0) {
        admin = true;
    }

    const handlePlay = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                try {
                    await videoRef.current.pause();
                    setIsPlaying(false);
                } catch (error) {
                    console.error('Error playing video:', error);
                }
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleDeletePost = async () => {
        if (userId === profile._id) {
            try {
                await axios.delete(`${baseUrl}/news/${postId}`);
                onDeletePost(postId);
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        } else {
            console.log("Cannot Delete");
        }
    };

    const formatDate = (dateString) => {
        const dateParts = dateString.split(" ");
        const day = parseInt(dateParts[1], 10);
        const month = dateParts[2].substring(0, 3);
        const year = dateParts[3];

        const daySuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${day}${daySuffix(day)} ${month} ${year}`;
    };

    const handleReadMore = () => {
        navigate(`/home/news/news/${postId}`, {
            state: {
                userId,
                postId,
                description,
                createdAt,
                picturePath,
                videoPath,
                department,
                title,
                author
                //onDeletePost
            }
        }); // Pass props through state
    };

    return (
        <>
            {isUserDepartment && (
                <div className="bg-[#E9F5EF] shadow-md rounded-lg overflow-hidden border border-gray-200 p-2 flex flex-col md:flex-row">
                    {/* Left Section - Text Content */}
                    <div className="p-4 flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-[#0A3A4C]">{title || "News Headline"}</h3>
                        <div className="text-gray-600 text-sm font-semibold mt-1">
                            Posted on {createdAt}
                        </div>
                        <div className="text-gray-600 font-semibold text-sm">By {author}</div>

                        <button
                            className="mt-4 flex items-center gap-2 text-white py-2 px-3 rounded-lg bg-[#0A3A4C] font-semibold hover:text-blue-800 transition"
                            onClick={handleReadMore}
                        >
                            Read More <FaArrowCircleRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right Section - Image */}
                    <div className="relative flex-1">
                        {/* <img
                            src={picturePath || newsImage}
                            alt="News"
                            className="w-full h-48 object-cover rounded-lg"
                        /> */}
                        {(profile.profileLevel === 0 ||(userId === profile._id)) && (
                            <button
                                onClick={handleDeletePost}
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                            >
                                <DeleteRounded className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};
