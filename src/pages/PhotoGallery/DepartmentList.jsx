import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Building, 
  Plus, 
  ChevronRight, 
  Home, 
  Calendar,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function DepartmentList() {
  const profile = useSelector((state) => state.profile);
  const { yearId } = useParams();
  const navigate = useNavigate();
  const [year, setYear] = useState({});
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = profile.profileLevel === 0;

  useEffect(() => {
    fetchYear();
    fetchDepartments();
  }, [yearId]);

  const fetchYear = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years`);
      const selected = res.data.find(y => y._id === yearId) || {};
      setYear(selected);
    } catch (error) {
      console.error('Error fetching year:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years/${yearId}/departments`);
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDept = async () => {
    if (!newDept || !newDept.trim()) {
      setError('Please enter a department name');
      return;
    }

    if (departments.some(d => d.name.toLowerCase() === newDept.toLowerCase())) {
      setError('This department already exists');
      return;
    }

    setAdding(true);
    setError('');

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/photoGallary/years/${yearId}/departments`, { 
        name: newDept.trim() 
      });
      setNewDept('');
      await fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
      setError('Failed to add department');
    } finally {
      setAdding(false);
    }
  };

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="bg-gray-200 rounded-lg p-4 sm:p-6 animate-pulse">
          <div className="h-12 sm:h-16 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 sm:py-12">
      <Building size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Added</h3>
      <p className="text-gray-600 mb-4 text-sm sm:text-base">Add departments to organize photos for {year.year}.</p>
      {isAdmin && (
        <button
          onClick={() => document.getElementById('deptInput')?.focus()}
          className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
        >
          <Plus size={16} />
          Add First Department
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/home/photo-gallery')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Years
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              Departments for {year.year}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">Select a department to view photos</p>
          </div>

          {/* Add Department - Right side */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <input
                  id="deptInput"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="Department name"
                  className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                />
              </div>
              <button
                onClick={addDept}
                disabled={adding}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                <span>{adding ? 'Adding...' : 'Add Dept'}</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-2 bg-red-50 rounded-lg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Departments Grid */}
        {loading ? (
          <LoadingGrid />
        ) : departments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {departments.map((dept) => (
              <div
                key={dept._id}
                onClick={() => navigate(`/home/photo-gallery/year/${yearId}/department/${dept._id}`)}
                className="group bg-gradient-to-br from-[#0A3A4C] to-[#174873] text-white rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Building size={20} className="sm:size-6 text-white/80" />
                  <ChevronRight size={16} className="sm:size-5 text-white/60 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 capitalize">{dept.name}</h3>
                <p className="text-white/80 text-xs sm:text-sm">
                  {dept.photoCount || 0} photos
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
