import React from 'react';
import { useLocation } from 'react-router-dom';

const NewsDetails = () => {
    const location = useLocation();
    const { userId, postId, description, title, createdAt, picturePath, videoPath, department, onDeletePost } = location.state || {};

    const formatDate = (dateString) => {
        if (!dateString) return '';
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

    const dummyImage = "https://via.placeholder.com/800x400.png?text=No+Image+Available";
    const dummyDescription = "No description provided. This is a placeholder description for the news content.";

    return (
        <div className=" mx-3 md:mx-8 bg-white shadow-md h-screen rounded-lg overflow-hidden my-4 py-3 md:my-8  md:p-6">
            <div className="border-b pb-4 mb-4 px-3">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800">{title || 'News Headline'}</h1>
                <p className="text-gray-600 text-sm md:text-base">Posted on {formatDate(createdAt)}</p>
                <p className="text-gray-600 text-sm md:text-lg font-semibold">By SuperAdmin</p>
            </div>

            <div className="w-full flex justify-center px-3">
                {picturePath || videoPath ? (
                    <>
                        {picturePath && <img src={picturePath} alt="News" className="w-full max-h-[400px] object-cover rounded-md" />}
                        {videoPath && (
                            <video controls className="w-full max-h-[400px] mt-4 rounded-md">
                                <source src={videoPath} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </>
                ) : (
                     <img src={dummyImage} alt="Dummy News" className="w-full max-h-[400px] object-cover rounded-md " />
                )}
            </div>

            <p className="text-gray-700 text-base mt-4 leading-relaxed px-3">
                {description || dummyDescription}
            </p>
        </div>
    );
};

export default NewsDetails;