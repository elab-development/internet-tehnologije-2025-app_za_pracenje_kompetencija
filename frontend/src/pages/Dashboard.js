import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      <header className="w-full bg-red-500 text-white py-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Dashboard</h1>
      </header>

      <main className="flex-1 w-full flex justify-center p-8">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
            <p className="mb-6">This is your Dashboard where you can track your competentions.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Total competentions</h3>
                <p>Review of your competentions.</p>
              </div>
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Verify competentions</h3>
              </div>
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Pending verification</h3>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </footer>

    </div>
  );
};

export default Dashboard;
