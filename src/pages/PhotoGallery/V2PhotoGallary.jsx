import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import YearList from './YearList';
import DepartmentList from './DepartmentList';
import ShowImages from './ShowImages';

export default function V2PhotoGallary() {
  
  return (
    <div  className='flex flex-col w-full py-[2%] px-[5%]'>
      <div className='bg-[#cef3df] p-4 rounded-lg mb-3'>
        <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Photo Gallery</h2>
        <p className='text-base md:text-lg text-[#136175]' >
          Relive memorable moments and explore highlights through our community’s captured moments.
        </p>
       
      </div>

        <Routes>
            <Route path='/' element={<YearList />} />
            <Route path='/year/:yearId' element={<DepartmentList />} />
            <Route path='/year/:yearId/department/:deptId' element={<ShowImages />} />
        </Routes>
      
    </div>
  );
}