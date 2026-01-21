import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    }

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">Manage users</div>
                <div className="bg-white p-4 rounded shadow">View statistics</div>
                <div className="bg-white p-4 rounded shadow">Verify competencies</div>
                <div className="bg-white p-4 rounded shadow">Edit all competencies</div>
            </div>

            <button
                onClick={logout}
                className="mt-8 bg-red-500 text-white px-6 py-2 rounded"
            >
                Logout
            </button>
        </div>
    );
};

export default AdminDashboard;