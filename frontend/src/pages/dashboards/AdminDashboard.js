import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('default'); // Stanje za promenu prikaza

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/users');
            setUsers(response.data);
            setView('users'); // Kada povuče podatke, promeni prikaz na tabelu
        } catch (error) {
            console.error("Greška pri učitavanju korisnika", error);
        }
    };

    const changeRole = async (userId, newRole) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/users/${userId}/role`, { role: newRole });
            const response = await axios.get('http://127.0.0.1:8000/api/users');
            setUsers(response.data);
            alert(`Rola uspešno promenjena u ${newRole}`);
        } catch (error) {
            alert("Greška pri promeni role");
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-900">Admin Dashboard</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                    Odjavi se
                </button>
            </div>

            {/* AKO JE VIEW DEFAULT - PRIKAŽI KARTICE */}
            {view === 'default' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        onClick={fetchUsers}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition"
                    >
                        <h3 className="font-bold text-lg text-blue-700 underline">Manage users</h3>
                        <p className="text-gray-600">Klikni ovde da vidiš listu svih korisnika i menjaš role.</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 opacity-50">
                        <h3 className="font-bold text-lg">View statistics</h3>
                        
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 opacity-50">
                        <h3 className="font-bold text-lg">Verify competencies</h3>
                        
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 opacity-50">
                        <h3 className="font-bold text-lg">Edit all competencies</h3>
                        
                    </div>
                </div>
            )}

            {/* AKO JE VIEW USERS - PRIKAŽI TABELU KORISNIKA */}
            {view === 'users' && (
                <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Upravljanje korisnicima</h2>
                        <button
                            onClick={() => setView('default')}
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            ← Nazad na kartice
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-3 border">Korisnik</th>
                                    <th className="p-3 border">Email</th>
                                    <th className="p-3 border">Rola</th>
                                    <th className="p-3 border">Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-3 border font-medium">{user.name} {user.surname}</td>
                                        <td className="p-3 border">{user.email}</td>
                                        <td className="p-3 border text-sm font-bold text-indigo-600 uppercase">{user.role}</td>
                                        <td className="p-3 border flex gap-2">
                                            {user.role !== 'admin' ? (
                                                <>
                                                    <button
                                                        onClick={() => changeRole(user.id, 'moderator')}
                                                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs hover:bg-indigo-200"
                                                    >
                                                        Moderator
                                                    </button>
                                                    <button
                                                        onClick={() => changeRole(user.id, 'user')}
                                                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200"
                                                    >
                                                        User
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Zaštićen nalog</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;