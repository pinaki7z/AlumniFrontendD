import React, { useEffect, useState } from 'react';
import { ChevronDown, Check, X, Clock } from 'lucide-react';
import axios from 'axios';
import { Avatar } from '@mui/material';

const ValidateUser = () => {
  // Filter state
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState('all');

  // Users data
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);

  // Fetch users from API
  const fetchUsers = async () => {
    let api = `${process.env.REACT_APP_API_URL}/alumni/validate/user`;
    try {
      const response = await axios.get(api);
      setUsers(response.data.records);
      setCount(response.data.count);
    } catch (error) {
      console.error(error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on selections
  const filteredUsers = users.filter(user => {
    const matchesType = userTypeFilter === 'all' || user.type === userTypeFilter;
    const matchesValidation = validationFilter === 'all' || user.status === validationFilter;
    return matchesType && matchesValidation;
  });

  const validateUser = async(id)=>{
    let api = `${process.env.REACT_APP_API_URL}/alumni/alumni/${id}/validateAlumni`;
    try {
      const response = await axios.put(api);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  }

  const toggleDelete = async(id)=>{
    let api = `${process.env.REACT_APP_API_URL}/alumni/alumni/${id}/deleteAccount`;
    try {
      const response = await axios.put(api);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  }


  // Status icon component
  const StatusIcon = ({ status }) => {
    if (status === 'validated') return <Check className='h-6 w-5 text-green-500' />;
    if (status === 'not-validated') return <X className='h-6 w-5 text-orange-500' />;
    if (status === 'expired') return <Clock className='h-6 w-5 text-yellow-500' />;
    if (status === 'account-deleted') return <X className='h-6 w-5 text-red-500' />;
    return null;
  };

  return (
    <div className='container mx-auto p-6'>
      {/* <h1 className='text-2xl md:text-4xl font-bold mb-6'>Member Control Panel</h1> */}
      <div class="bg-[#cef3df] p-4 rounded-lg mb-3"><h2 class="text-[#136175] mb-2 text-3xl md:text-4xl font-bold">Member Control Panel</h2>
      <p class="text-base md:text-lg text-[#136175]">Manage your members and their access to the Alumni Portal.</p>
      </div>

      {/* Filters */}
      <div className='flex flex-col md:flex-row items-center justify-center gap-4 mb-6'>
        {/* User Type Filter */}
        <div className='w-full md:w-48'>
          <label htmlFor='userType' className='block text-sm text-center md:text-base font-medium text-gray-700 mb-1'>User Type</label>
          <select
            id='userType'
            value={userTypeFilter}
            onChange={e => setUserTypeFilter(e.target.value)}
            className='block w-full px-4 py-2 border border-gray-300 text-center rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All</option>
            <option value='student'>Student</option>
            <option value='alumni'>Alumni</option>
          </select>
        </div>

        {/* Validation Status Filter */}
        <div className='w-full md:w-48'>
          <label htmlFor='validationStatus' className='block text-sm text-center md:text-base font-medium text-gray-700 mb-1'>Validation Status</label>
          <select
            id='validationStatus'
            value={validationFilter}
            onChange={e => setValidationFilter(e.target.value)}
            className='block w-full px-4 py-2 border border-gray-300 text-center rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All</option>
            <option value='validated'>Validated</option>
            <option value='not-validated'>Not Validated</option>
            <option value='account-deleted'>Account Deleted</option>
            <option value='expired'>Expired</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>S.No</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Username</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>User Type</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredUsers.map((user, index) => (
              <tr key={user._id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{index + 1}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  <div className='flex items-center gap-3'>
                    <Avatar
                      src={user.profilePicture || ''}
                      alt={`${user.firstName} profile`}
                      sx={{ height: 40, width: 40 }}
                    />
                    {`${user.firstName} ${user.lastName}`}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize'>{user.type}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <StatusIcon status={user.status} />
                    <span className='ml-2 text-sm text-gray-700 capitalize'>{user.status.replace('-', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
  {/* VALIDATE / INVALIDATE */}
  {(user.status === 'expired' || user.status === 'not-validated') && (
    <button
      onClick={() => validateUser(user._id)}
      className="mr-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      Validate
    </button>
  )}

  {user.status === 'validated' && (
    <button
      onClick={() => validateUser(user._id)}
      className="mr-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
    >
      Invalidate
    </button>
  )}

  {/* DELETE BUTTON */}
  {(user.status === 'validated' ||
    user.status === 'expired' ||
    user.status === 'not-validated') && (
    <button
      onClick={() => toggleDelete(user._id)}
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Delete
    </button>
  )}

  {/* RECOVER BUTTON */}
  {user.status === 'account-deleted' && (
    <button
      onClick={() => toggleDelete(user._id)}
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Recover
    </button>
  )}
</td>


              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan='4' className='px-6 py-4 text-center text-sm text-gray-500'>
                  No users found matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidateUser;
