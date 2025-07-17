import React, { useState, useEffect } from 'react';
import './pollDisplay.css';
import { Avatar, IconButton, Modal, Box } from '@mui/material';
import pic from "../../../images/profilepic.jpg";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from "react-toastify";
import baseUrl from '../../../config';
import { Link } from 'react-router-dom';
// import profilePic from "";

const PollDisplay = ({ poll, userId , userData}) => {
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [updatedPoll, setUpdatedPoll] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const profile = useSelector((state) => state.profile);

    useEffect(() => {
        const userVoted = poll.options.some(option =>
            option.votes.some(vote => vote.userId === profile._id)
        );

        setHasVoted(userVoted);
        if (userVoted) {
            setUpdatedPoll(poll);
        }
    }, [poll, profile._id]);

    const handleVote = async (optionId) => {
        if (userId === profile._id) {
            toast.error("You cannot vote on your own poll.");
            return;
        }

        try {
            let body = {
                userId: profile._id,
                optionId: optionId,
                userName: `${profile.firstName} ${profile.lastName}`,
                profilePicture: profile.profilePicture
            };

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/poll/${poll._id}`,
                body
            );

            if (response.status === 200) {
                toast.success('Vote submitted successfully.');
                setUpdatedPoll(response.data.poll);
                setHasVoted(true);
            } else {
                console.error('Unexpected response status:', response.status, response.message);
                alert('An unexpected error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            toast.error(error.response.data.message);
        }
    };

    const deletePoll = async () => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/poll/${poll._id}`);
            if (response.status === 200) {
                toast.success('Poll deleted successfully.');
                window.location.reload();
            } else {
                console.error('Unexpected response status:', response.status, response.message);
                alert('An unexpected error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting poll:', error);
            toast.error(error.response.data.message);
        }
    };

    const formatCreatedAt = (timestamp) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
        const dateString = new Date(timestamp).toLocaleDateString();

        return `${dateString} ${timeString}`;
    };

    const calculatePercentages = (options) => {
        const totalVotes = options.reduce((acc, option) => acc + option.votes.length, 0);
        return options.map(option => ({
            ...option,
            percentage: totalVotes ? (option.votes.length / totalVotes) * 100 : 0
        }));
    };

    const handleOpenModal = () => {
        if (userId === profile._id) {
            setModalOpen(true);
        } else {
            toast.error("You are not authorized to view this information.");
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const pollData = hasVoted ? updatedPoll : poll;
    const optionsWithPercentages = calculatePercentages(pollData.options);

    return (
        <>
            <div className='flex items-center justify-between'>
                <Link
                    to={`/home/members/${userId}`}
                    className='flex items-center gap-2 no-underline text-black'
                >
                    {poll.profilePicture ? (
                        // <img src={poll.profilePicture} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                        // <Avatar src={userData?.profilePicture} style={{ width: '50px', height: '50px' }} />
                                      <img src={userData?.profilePicture || "/images/profilepic.jpg"} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                        
                    ) : (
                        <Avatar src={pic} style={{ width: '50px', height: '50px' }} />
                    )}
                    <div className='flex flex-col'>
                        <h4 className='font-semibold text-sm'>{userData?.firstName} {userData?.lastName}</h4>
                        <span className='text-sm text-gray-600 text-[12px]'>{formatCreatedAt(poll.createdAt)}</span>
                    </div>
                    </Link>
                    {profile._id === userId && (
                        <div onClick={deletePoll}  className='delete-button' style={{ marginRight: '10px', marginLeft: 'auto' }}>
                            <svg width="15" height="15" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z" fill="#003366" />
                            </svg>
                        </div>
                    )}
            </div>
            <h3 className="font-semibold text-sm mt-4 text-gray-800  leading-relaxed">{poll.question}</h3>

              <div className="space-y-4">
        {userId === profile._id && (
          <div className="flex justify-end mb-1">
            <button
              className="text-blue-600 hover:text-blue-700 font-medium text-sm underline underline-offset-2 transition-colors duration-200"
              onClick={handleOpenModal}
            >
              See Poll Results
            </button>
          </div>
        )}

        <form className="space-y-2">
          {optionsWithPercentages.map((option) => (
            <div key={option._id} className="group">
              <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="poll-option"
                    value={option._id}
                    disabled={hasVoted}
                    checked={selectedOption === option._id}
                    onChange={() => setSelectedOption(option._id)}
                    className="w-4 h-4 text-blue-600 border-gray-300   disabled:opacity-50"
                  />
                  <span className="text-gray-700 font-medium text-sm select-none">{option.option}</span>
                </div>

                {hasVoted && (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 rounded-full h-2 w-24 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 min-w-[3rem] text-right">
                      {option.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </label>
            </div>
          ))}
        </form>

        {!hasVoted && selectedOption && (
          <div className=" flex justify-center">
            <button
              className="bg-[#0A3A4C] text-sm hover:bg-teal-900 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              onClick={() => handleVote(selectedOption)}
            >
              Submit Vote
            </button>
          </div>
        )}
      </div>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box className='poll-modal-box'>
                    <div className='voters-container'>
                        {pollData.options.map(option => (
                            <div key={option._id} className='option-result'>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3>{option.option} </h3>
                                    <h3>Total votes- {option.votes.length} </h3>
                                </div>
                                {option.votes && option.votes.length > 0 ? (
                                    option.votes.map(vote => (
                                        <div key={vote.userId} className='voter-info'>
                                            <Avatar src={vote.profilePicture || pic} />
                                            <span>{vote.userName}</span>
                                        </div>
                                    ))
                                ) : (
                                    <>No voters</>
                                )}
                            </div>
                        ))}
                    </div>
                </Box>
            </Modal>
        </>
    );
};

export default PollDisplay;
