// ===== File: frontend/src/pages/DepartmentList.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function DepartmentList() {
    const profile = useSelector((state) => state.profile);
  const { yearId } = useParams();
  const navigate = useNavigate();
  const [year, setYear] = useState({});
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');

  useEffect(() => {
    fetchYear();
    fetchDepartments();
  }, [yearId]);

  const fetchYear = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years`);
    const selected = res.data.find(y => y._id === yearId) || {};
    setYear(selected);
  };

  const fetchDepartments = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years/${yearId}/departments`);
    setDepartments(res.data);
  };

  const addDept = async () => {
    if (!newDept) return;
    await axios.post(`${process.env.REACT_APP_API_URL}/photoGallary/years/${yearId}/departments`, { name: newDept });
    setNewDept('');
    fetchDepartments();
  };

  return (
    <div className="min-h-screen  p-6">
      <div className=" bg-white rounded-2xl  p-6">
        <nav className="text-lg font-bold text-[#0A3A4C] mb-4">
          <Link to="/home/photo-gallery" className="hover:text-[#136175]">Home</Link> / 
          <span
            onClick={() => navigate('/home/photo-gallery')}
            className="cursor-pointer hover:text-[#136175]"
          > Years</span> / <span className="text-[#136175] underline">{year.year}</span>
        </nav>
        <h1 className="text-3xl font-semibold text-center text-[#0A3A4C] mb-6">
          Select Department for {year.year}
        </h1>
        {!departments.length && (
          <div className="text-center text-gray-500 mt-6">
            No department added yet
          </div>
        )}
        {!!departments.length && (
          <ul className="gap-3 flex flex-wrap  mb-6">
            {departments.map(d => (
              <li
                key={d._id}
                onClick={() => navigate(`/home/photo-gallery/year/${yearId}/department/${d._id}`)}
                className="cursor-pointer px-6 py-3 rounded-lg bg-[#0A3A4C] text-white text-lg font-semibold hover:bg-[#136175] transition"
              >
                {d.name}
              </li>
            ))}
          </ul>
        )}
                 {profile.profileLevel === 0 &&

        <div className="flex space-x-2">
          <input
            value={newDept}
            onChange={e => setNewDept(e.target.value)}
            placeholder="Add department"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136175]"
          />
       {profile.profileLevel === 0 &&   <button
            onClick={addDept}
            className="px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#136175] transition"
          >
            Add
          </button>}
        </div>
                  }

      </div>
    </div>
  );
}

// ===