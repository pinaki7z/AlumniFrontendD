import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function YearList() {
    const profile = useSelector((state) => state.profile);
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchYears(); }, []);

  const fetchYears = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years`);
    setYears(res.data);
  };

  const addYear = async () => {
    if (!newYear) return;
    await axios.post(`${process.env.REACT_APP_API_URL}/photoGallary/years`, { year: Number(newYear) });
    setNewYear('');
    fetchYears();
  };

  return (
    <div className="min-h-screen  p-6">
      <div className=" bg-white rounded-2xl  p-6">
        <nav className="text-lg font-bold text-[#0A3A4C] mb-4">
          <Link to="/home/photo-gallery" className="hover:text-[#136175]">Home</Link> / <span className="text-[#136175] underline">Years</span>
        </nav>
        <h1 className="text-3xl font-semibold text-center text-[#0A3A4C] mb-6">Select Year</h1>
        <div className="gap-3 flex flex-wrap  mb-6">
          {years.map(y => (
            <li
              key={y._id}
              onClick={() => navigate(`/home/photo-gallery/year/${y._id}`)}
              className="cursor-pointer  p-3 rounded-lg bg-[#0A3A4C] text-white text-lg font-semibold hover:bg-[#136175] transition"
            >
              {y.year}
            </li>
          ))}
        </div>
         {profile.profileLevel === 0 &&

        <div className="flex space-x-2">

          <input
            type="number"
            value={newYear}
            onChange={e => setNewYear(e.target.value)}
            placeholder="Add year"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136175]"
          />
         {profile.profileLevel === 0 &&
          <button
            onClick={addYear}
            className="px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#136175] transition"
          >
            Add
          </button>
          }
        </div>
          }

      </div>
    </div>
  );
}

