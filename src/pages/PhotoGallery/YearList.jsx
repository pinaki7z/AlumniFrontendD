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
  CheckCircle,
  ArrowLeft
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="bg-gray-200 rounded-lg p-3 sm:p-4 animate-pulse">
          <div className="h-8 sm:h-12 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 sm:py-12">
      <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Years Added</h3>
      <p className="text-gray-600 mb-4 text-sm sm:text-base">Get started by adding your first year to organize photos.</p>
      {isAdmin && (
        <button
          onClick={() => document.getElementById('yearInput')?.focus()}
          className="inline-flex items-center gap-2 px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
        >
          <Plus size={16} />
          Add First Year
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-3">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Select Year</h2>
            <p className="text-xs sm:text-sm text-gray-600">Browse photos organized by year</p>
          </div>
          
          {/* Add Year - Right side on desktop, full width on mobile */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <input
                  id="yearInput"
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="Enter year (e.g., 2024)"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A3A4C] focus:border-[#0A3A4C] transition-colors duration-200 text-sm"
                />
              </div>
              <button
                onClick={addYear}
                disabled={adding}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 dynamic-site-bg text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                <span>{adding ? 'Adding...' : 'Add Year'}</span>
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

        {/* Years Grid */}
        {loading ? (
          <LoadingGrid />
        ) : years.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
            {years.map((year) => (
              <div
                key={year._id}
                onClick={() => navigate(`/home/photo-gallery/year/${year._id}`)}
                className="group bg-gradient-to-br from-[#0A3A4C] to-[#174873] text-white rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Calendar size={16} className="sm:size-5 text-white/80" />
                  <ChevronRight size={14} className="sm:size-4 text-white/60 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{year.year}</h3>
                <p className="text-white/80 text-xs sm:text-sm">
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
