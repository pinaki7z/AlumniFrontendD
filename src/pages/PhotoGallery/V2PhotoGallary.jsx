import React, { useState, useEffect } from "react";
import { Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import YearList      from "./YearList";
import DepartmentList from "./DepartmentList";
import ShowImages     from "./ShowImages";
import {
  Camera, Calendar, Building, Image, TrendingUp
} from "lucide-react";

export default function V2PhotoGallery() {
  const [stats, setStats] = useState({
    totalYears: 0, totalDepartments: 0, totalImages: 0, recentUploads: 0
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/photoGallary/years`
        );
        setStats(s => ({ ...s, totalYears: data.length }));
      } catch (err) { console.error(err); }
    })();
  }, []);

  const Stat = ({ title, value, icon, tint }) => (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
      <div>
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${tint}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-[#0A3A4C] to-[#174873] flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Photo Gallery
            </h1>
          </div>

          {/* (Example future action) */}
          {/* <Link …>Add Year</Link> */}
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <Stat title="Years"     value={stats.totalYears}       icon={<Calendar size={18} className="text-blue-600" />}   tint="bg-blue-50"/>
          <Stat title="Depts"     value={stats.totalDepartments} icon={<Building size={18} className="text-green-600" />}  tint="bg-green-50"/>
          <Stat title="Images"    value={stats.totalImages}      icon={<Image    size={18} className="text-violet-600"/>}   tint="bg-violet-50"/>
          <Stat title="Recent"    value={stats.recentUploads}    icon={<TrendingUp size={18} className="text-orange-600"/>} tint="bg-orange-50"/>
        </section>

        {/* Routes */}
        <Routes>
          <Route path="/"                                              element={<YearList/>}/>
          <Route path="/year/:yearId"                                  element={<DepartmentList/>}/>
          <Route path="/year/:yearId/department/:deptId"               element={<ShowImages/>}/>
        </Routes>
      </div>
    </div>
  );
}
