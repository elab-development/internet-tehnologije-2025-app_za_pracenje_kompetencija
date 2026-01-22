import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('default'); // Stanje za promenu prikaza
    const [searchTerm, setSearchTerm] = useState(''); //Stanje koje cuva ono sto je korisnik ukucao, pocetna vrednost je prazan string

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
            alert(`Role was succesfully changend to ${newRole}`);
        } catch (error) {
            alert("Error ");
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
                    Logout
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
                        <h2 className="text-xl font-bold">User management</h2>
                        <button
                            onClick={() => setView('default')}
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            ← Back to main menu
                        </button>
                    </div>
                    <div className="mb-6">
                        <input
                            type="text"
                            // Povezujemo vrednost polja sa našim stanjem 'searchTerm' (Controlled Input)
                            value={searchTerm}
                            // Svaki put kada korisnik promeni tekst (otkuca slovo), poziva se ova funkcija
                            // e.target.value uzima trenutni tekst iz polja i šalje ga u setSearchTerm
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            // Tailwind klase za vizuelni izgled (padding, border, senka, plavi krug pri kliku)
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-3 border">User</th>
                                    <th className="p-3 border">Email</th>
                                    <th className="p-3 border">Role</th>
                                    <th className="p-3 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users
                                    .filter(user =>
                                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (user.surname && user.surname.toLowerCase().includes(searchTerm.toLowerCase()))
                                    )
                                    .map((user) => (
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