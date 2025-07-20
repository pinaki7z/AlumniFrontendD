// V2PhotoGallary.jsx - Main Component
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import YearList from './YearList';
import DepartmentList from './DepartmentList';
import ShowImages from './ShowImages';
import { 
  Camera, 
  Image, 
  Calendar, 
  Building, 
  Users,
  TrendingUp
} from 'lucide-react';

export default function V2PhotoGallary() {
  const [stats, setStats] = useState({
    totalYears: 0,
    totalDepartments: 0,
    totalImages: 0,
    recentUploads: 0
  });
  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // You can add API calls to get statistics
      const yearsRes = await axios.get(`${process.env.REACT_APP_API_URL}/photoGallary/years`);
      setStats(prev => ({ ...prev, totalYears: yearsRes.data.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatsCard = (title, value, icon, color) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-[#CEF3DF] p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Camera size={20} className="sm:size-6 text-[#0A3A4C]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#136175]">
                  Photo Gallery
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[#136175]/80">
                  Relive memorable moments and explore highlights through our community's captured moments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {getStatsCard("Total Years", stats.totalYears, <Calendar size={20} className="text-blue-600" />, "bg-blue-100")}
          {getStatsCard("Departments", stats.totalDepartments, <Building size={20} className="text-green-600" />, "bg-green-100")}
          {getStatsCard("Total Images", stats.totalImages, <Image size={20} className="text-purple-600" />, "bg-purple-100")}
          {getStatsCard("Recent", stats.recentUploads, <TrendingUp size={20} className="text-orange-600" />, "bg-orange-100")}
        </div>

        {/* Routes */}
        <Routes>
          <Route path='/' element={<YearList />} />
          <Route path='/year/:yearId' element={<DepartmentList />} />
          <Route path='/year/:yearId/department/:deptId' element={<ShowImages />} />
        </Routes>
      </div>
    </div>
  );
}