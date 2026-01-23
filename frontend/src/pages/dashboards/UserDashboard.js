import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        name: localStorage.getItem('user_name') || '',
        surname: localStorage.getItem('user_surname') || '',
        email: localStorage.getItem('user_email') || '',
        password: '',
        description: localStorage.getItem('user_description') || '',
    });

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Funkcija za čuvanje izmena 💾
    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('user_id');
        const dataToSend = {};

        if (profileData.name?.trim()) {
            if (profileData.name.length <= 2 || /\d/.test(profileData.name)) {
                alert("First Name invalid! ❌"); return;
            }
            dataToSend.name = profileData.name;
        }
        if (profileData.surname?.trim()) {
            if (profileData.surname.length <= 2 || /\d/.test(profileData.surname)) {
                alert("Last Name invalid! ❌"); return;
            }
            dataToSend.surname = profileData.surname;
        }
        if (profileData.email?.trim()) dataToSend.email = profileData.email;
        if (profileData.description?.trim()) dataToSend.description = profileData.description;
        if (profileData.password.length > 0) {
            if (profileData.password.length < 6) {
                alert("Password too short! 🔐"); return;
            }
            dataToSend.password = profileData.password;
        }

        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/users/${userId}`, dataToSend);
            if (response.status === 200) {
                alert("Profile updated! ✅");
                localStorage.setItem('user_name', profileData.name);
                setIsModalOpen(false);
            }
        } catch (error) {
            alert("Update failed! ❌");
        }
    };

    // Funkcija za trajno brisanje naloga 🗑️
    const handleDeleteAccount = async () => {
        const userId = localStorage.getItem('user_id');

        const confirmDelete = window.confirm(
            "Are you sure you want to PERMANENTLY delete your account? This action cannot be undone! ⚠️"
        );

        if (confirmDelete) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
                if (response.status === 200) {
                    alert("Your account has been successfully deleted. 👋");
                    localStorage.clear();
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error deleting account:", error);
                alert("Failed to delete account. Please try again later. ❌");
            }
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-900">User Dashboard</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow hover:bg-indigo-200 transition font-medium"
                    >
                        Change Profile 👤
                    </button>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                        Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => navigate('competencies')} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition">
                    <h3 className="font-bold text-lg text-blue-700 underline">View my competencies</h3>
                    <p className="text-gray-600">See all your currently assigned and achieved skills.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition">
                    <h3 className="font-bold text-lg text-green-700">Add competency</h3>
                    <p className="text-gray-600">Request a new competency to be added to your profile.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition">
                    <h3 className="font-bold text-lg text-yellow-700">Edit my competencies</h3>
                    <p className="text-gray-600">Modify existing competency details or progress.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 cursor-pointer hover:bg-red-50 transition">
                    <h3 className="font-bold text-lg text-red-700">View status</h3>
                    <p className="text-gray-600">Check the approval status of your requested changes.</p>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-900">Update Profile Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                                <input type="text" className="w-full p-2 border border-gray-300 rounded mt-1"
                                    value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                                <input type="text" className="w-full p-2 border border-gray-300 rounded mt-1"
                                    value={profileData.surname} onChange={(e) => setProfileData({ ...profileData, surname: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <input type="email" className="w-full p-2 border border-gray-300 rounded mt-1"
                                    value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">New Password</label>
                                <input type="password" placeholder="Leave blank to keep current" className="w-full p-2 border border-gray-300 rounded mt-1"
                                    value={profileData.password} onChange={(e) => setProfileData({ ...profileData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Profile Description</label>
                                <textarea rows="3" className="w-full p-2 border border-gray-300 rounded mt-1 resize-none"
                                    value={profileData.description} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-8">
                            <button onClick={handleDeleteAccount} className="text-red-600 hover:text-red-800 font-medium underline text-sm">Delete Account</button>
                            <div className="flex gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                                <button onClick={handleSaveChanges} className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-bold">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <Outlet />
            </div>
        </div>
    );
};

export default UserDashboard;