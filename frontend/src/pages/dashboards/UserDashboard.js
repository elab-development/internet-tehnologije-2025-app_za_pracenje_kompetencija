import React from 'react';
import { useNavigate } from 'react-router-dom';
import {Outlet} from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={()=>navigate('competencies')} className="bg-white p-4 rounded shadow cursor-pointer hover:bg-indigo-50 transition">View my competencies</div>
        <div className="bg-white p-4 rounded shadow">Add competency</div>
        <div className="bg-white p-4 rounded shadow">Edit my competencies</div>
        <div className="bg-white p-4 rounded shadow">View status</div>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="mt-8 bg-red-500 text-white px-6 py-2 rounded"
      >
        Logout
      </button>

       <Outlet />
    </div>
  );
};

export default UserDashboard;
