import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('default'); // Stanje za promenu prikaza
    const [searchTerm, setSearchTerm] = useState(''); //Stanje koje cuva ono sto je korisnik ukucao, pocetna vrednost je prazan string
    const [profileData, setProfileData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('user_id');

        // Kreiramo prazan objekat u koji ćemo pakovati samo popunjena polja
        const dataToSend = {};

        // Proveravamo svako polje. Ako nije prazno, dodajemo ga u objekat za slanje.
        if (profileData.name && profileData.name.trim() !== "") {
            // Ovde možeš zadržati tvoju proveru za dužinu i brojeve
            if (profileData.name.length <= 2 || /\d/.test(profileData.name)) {
                alert("First Name must be longer than 2 characters and cannot contain numbers! ❌");
                return;
            }
            dataToSend.name = profileData.name;
        }

        if (profileData.surname && profileData.surname.trim() !== "") {
            if (profileData.surname.length <= 2 || /\d/.test(profileData.surname)) {
                alert("Last Name must be longer than 2 characters and cannot contain numbers! ❌");
                return;
            }
            dataToSend.surname = profileData.surname;
        }

        // KLJUČNI DEO: Email šaljemo samo ako nije prazan
        if (profileData.email && profileData.email.trim() !== "") {
            dataToSend.email = profileData.email;
        }

        if (profileData.description && profileData.description.trim() !== "") {
            dataToSend.description = profileData.description;
        }

        if (profileData.password && profileData.password.length > 0) {
            if (profileData.password.length < 6) {
                alert("The new password must be at least 6 characters long! 🔐");
                return;
            }
            dataToSend.password = profileData.password;
        }

        try {
            // Šaljemo pročišćeni objekat dataToSend umesto profileData
            const response = await axios.put(`http://127.0.0.1:8000/api/users/${userId}`, dataToSend);

            if (response.status === 200) {
                alert("Profile updated successfully! ✅");
                // ... ostatak tvog koda za localStorage i modal
            }
        } catch (error) {
            // Ako Laravel validacija ipak baci grešku (npr. neispravan email format), ovde je hvatamo
            if (error.response && error.response.status === 422) {
                console.log("Validation errors:", error.response.data.errors);
                alert("Validation failed: " + JSON.stringify(error.response.data.errors));
            } else {
                console.error("Error updating profile:", error);
                alert("Failed to update profile. ❌");
            }
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-900">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)} // Otvara prozor za izmenu
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow hover:bg-indigo-200 transition font-medium"
                    >
                        Change Profile 👤
                    </button>

                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                        Logout
                    </button>
                </div>
            </div>



            {/* AKO JE VIEW DEFAULT - PRIKAŽI KARTICE */}
            {view === 'default' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        onClick={fetchUsers}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition"
                    >
                        <h3 className="font-bold text-lg text-blue-700 underline">Manage users</h3>
                        <p className="text-gray-600">Click here to open list of all users and to change their roles.</p>
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
                                                <span className="text-gray-400 italic text-xs">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-900">Update Profile Settings</h2>

                        <div className="space-y-4">
                            {/* First Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>

                            {/* Last Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.surname}
                                    onChange={(e) => setProfileData({ ...profileData, surname: e.target.value })}
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.password}
                                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                                />
                            </div>

                            {/* Profile Description - Textarea */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Profile Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    placeholder="Describe your role or bio..."
                                    value={profileData.description}
                                    onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges} // Povezujemo sa našom proverom
                                className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-bold"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;