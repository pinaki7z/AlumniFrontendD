import React, { useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';

const PollModal = ({ show, onHide, onCreatePoll }) => {
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '', '']);
  const [optionCount, setOptionCount] = useState(2);

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleAddOption = () => {
    if (optionCount < 5) {
      setOptionCount(optionCount + 1);
    }
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions
      .filter(opt => opt.trim() !== '')
      .map(opt => ({ option: opt, votes: [] }));

    if (pollQuestion.trim() && validOptions.length >= 2) {
      onCreatePoll(pollQuestion, validOptions);
      setPollQuestion('');
      setPollOptions(['', '', '', '', '']);
      setOptionCount(2);
      onHide();
    } else {
      alert('Please provide a poll question and at least 2 options.');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create Poll</h2>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onHide}
        >
          <IoCloseSharp size={20} />
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poll Question:
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
          />
        </div>

        {Array.from({ length: optionCount }).map((_, index) => (
          <div key={index} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Option {index + 1}:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={pollOptions[index]}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}

        {optionCount < 5 && (
          <button
            className="text-indigo-600 hover:text-indigo-800 text-sm mb-4"
            onClick={handleAddOption}
          >
            + Add Option
          </button>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={onHide}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={handleCreatePoll}
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollModal;
