import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestDashboard = () => {
   return (
    <>
      <div className="p-4 bg-yellow-100 text-yellow-800 text-center">
        Viewing a shared public profile
      </div>
      <Outlet />
    </>
  );
};


export default GuestDashboard;