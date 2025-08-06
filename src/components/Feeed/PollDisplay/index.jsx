import React, { useState, useEffect } from 'react';
import { Modal } from '@mui/material';
import pic from "../../../images/profilepic.png";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { BarChart3, Trash2, Users, X, Eye } from "lucide-react";

const PollDisplay = ({ poll, userId, userData }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [updatedPoll, setUpdatedPoll] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
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
        toast.success('Vote submitted successfully!');
        setUpdatedPoll(response.data.poll);
        setHasVoted(true);
        setSelectedOption(null);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error(error.response?.data?.message || 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePoll = async () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/poll/${poll._id}`);
        if (response.status === 200) {
          toast.success('Poll deleted successfully.');
          window.location.reload();
        } else {
          toast.error('Failed to delete poll.');
        }
      } catch (error) {
        console.error('Error deleting poll:', error);
        toast.error('Failed to delete poll.');
      }
    }
  };

  const formatCreatedAt = (timestamp) => {
    const now = new Date();
    const pollTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - pollTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const calculatePercentages = (options) => {
    const totalVotes = options.reduce((acc, option) => acc + option.votes.length, 0);
    return options.map(option => ({
      ...option,
      percentage: totalVotes ? (option.votes.length / totalVotes) * 100 : 0,
      totalVotes
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
  const totalVotes = optionsWithPercentages[0]?.totalVotes || 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/home/members/${userId}`}
          className="flex items-center gap-2 sm:gap-3 no-underline text-gray-800 hover:text-[#71be95] transition-colors min-w-0 flex-1"
        >
          <div className="relative flex-shrink-0">
            <img 
              src={userData?.profilePicture || pic} 
              alt="profile" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'N/A'}
            </h4>
            <span className="text-xs text-gray-500">{formatCreatedAt(poll.createdAt)}</span>
          </div>
        </Link>
        
        {profile._id === userId && (
          <button
            onClick={deletePoll}
            className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Poll Content */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-100">
        {/* Poll Question */}
        <div className="flex items-start gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <h3 className="font-semibold text-base text-gray-900 leading-tight">{poll.question}</h3>
        </div>

        {/* Poll Stats */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
          {userId === profile._id && (
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <Eye className="w-3 h-3" />
              View Results
            </button>
          )}
        </div>

        {/* Poll Options */}
        <div className="space-y-2">
          {optionsWithPercentages.map((option) => (
            <div key={option._id} className="group">
              <label className={`flex items-center p-2 rounded-lg border transition-all cursor-pointer ${
                hasVoted 
                  ? 'border-gray-200 bg-white/60' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-white/80'
              }`}>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="radio"
                    name={`poll-option-${poll._id}`}
                    value={option._id}
                    disabled={hasVoted}
                    checked={selectedOption === option._id}
                    onChange={() => setSelectedOption(option._id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700 select-none">
                    {option.option}
                  </span>
                </div>

                {hasVoted && (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 rounded-full h-2 w-20 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 min-w-[2.5rem] text-right">
                      {option.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!hasVoted && selectedOption && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handleVote(selectedOption)}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-[#0A3A4C] to-[#174873] hover:shadow-lg text-white'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        )}
      </div>

      {/* Poll Results Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        className="flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Poll Results</h2>
            <button
              onClick={handleCloseModal}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Poll Question */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">{poll.question}</h3>
            <p className="text-sm text-gray-600 mt-1">Total votes: {totalVotes}</p>
          </div>

          {/* Results */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {optionsWithPercentages.map(option => (
                <div key={option._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{option.option}</h4>
                    <span className="text-sm font-semibold text-gray-600">
                      {option.votes.length} votes ({option.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {option.votes && option.votes.length > 0 ? (
                      option.votes.map((vote, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <img
                            src={vote.profilePicture || pic}
                            alt={vote.userName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700">{vote.userName}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No votes yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PollDisplay;
