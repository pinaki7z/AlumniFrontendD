
// YearList.jsx - Enhanced Year List Component
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Plus, 
  ChevronRight, 
  Home, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function YearList() {
  const profile = useSelector((state) => state.profile);
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isAdmin = profile.profileLevel === 0;

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years`);
      setYears(res.data.sort((a, b) => b.year - a.year));
    } catch (error) {
      console.error('Error fetching years:', error);
      setError('Failed to load years');
    } finally {
      setLoading(false);
    }
  };

  const addYear = async () => {
    if (!newYear || !newYear.trim()) {
      setError('Please enter a valid year');
      return;
    }

    const yearNum = Number(newYear);
    if (yearNum < 1900 || yearNum > new Date().getFullYear() + 10) {
      setError('Please enter a valid year between 1900 and ' + (new Date().getFullYear() + 10));
      return;
    }

    if (years.some(y => y.year === yearNum)) {
      setError('This year already exists');
      return;
    }

    setAdding(true);
    setError('');
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/photoGallary/years`, { 
        year: yearNum 
      });
      setNewYear('');
      await fetchYears();
    } catch (error) {
      console.error('Error adding year:', error);
      setError('Failed to add year');
    } finally {
      setAdding(false);
    }
  };

  const LoadingGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="bg-gray-200 rounded-xl p-4 animate-pulse">
          <div className="h-12 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Years Added</h3>
      <p className="text-gray-600 mb-4">Get started by adding your first year to organize photos.</p>
      {isAdmin && (
        <button
          onClick={() => document.getElementById('yearInput')?.focus()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200"
        >
          <Plus size={16} />
          Add First Year
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Home size={16} />
          <Link to="/home/photo-gallery" className="hover:text-[#0A3A4C] transition-colors duration-200">
            Gallery
          </Link>
          <ChevronRight size={16} />
          <span className="text-[#0A3A4C] font-medium">Years</span>
        </nav>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Select Year</h2>
          <p className="text-gray-600">Browse photos organized by year</p>
        </div>

        {/* Add Year Section (Admin Only) */}
        {isAdmin && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Year</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  id="yearInput"
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="Enter year (e.g., 2024)"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200"
                />
                {error && (
                  <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
              </div>
              <button
                onClick={addYear}
                disabled={adding}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0A3A4C] text-white rounded-lg hover:bg-[#0A3A4C]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                <span>{adding ? 'Adding...' : 'Add Year'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Years Grid */}
        {loading ? (
          <LoadingGrid />
        ) : years.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {years.map((year) => (
              <div
                key={year._id}
                onClick={() => navigate(`/home/photo-gallery/year/${year._id}`)}
                className="group bg-gradient-to-br from-[#0A3A4C] to-[#136175] text-white rounded-xl p-4 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Calendar size={20} className="text-white/80" />
                  <ChevronRight size={16} className="text-white/60 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-xl font-bold">{year.year}</h3>
                <p className="text-white/80 text-sm">
                  {year.departmentCount || 0} departments
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
