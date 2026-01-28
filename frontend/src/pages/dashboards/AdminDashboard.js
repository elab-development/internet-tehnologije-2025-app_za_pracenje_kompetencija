import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('default');
    const [searchTerm, setSearchTerm] = useState('');
    const [profileData, setProfileData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [systemType, setSystemType] = useState('institutions');

    const [institutions, setInstitutions] = useState([]);
    const [newInstitution, setNewInstitution] = useState('');
    const [competencies, setCompetencies] = useState([]);

    const [systemLogs, setSystemLogs] = useState([]);

    // Definisanje ID-a trenutnog admina iz localStorage-a kako bismo znali koji profil je tvoj 
    const currentAdminId = localStorage.getItem('user_id');
    const api = axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setView('users');
        } catch (error) {
            console.error("Error during loading users", error);
        }
    };

    // Brisanje korisnika iz baze i ažuriranje tabele 
    const deleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this profile?")) {
            try {
                await api.delete(`/users/${userId}`);

                await logAction({
                    action: 'Delete User',
                    entity: 'User',
                    entity_id: userId,
                    description: 'User deleted from admin panel',
                });

                // Filtriramo listu tako da odmah sklonimo obrisanog korisnika iz prikaza
                setUsers(users.filter(user => user.id !== userId));
                alert("User deleted successfully!");
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user.");
            }
        }
    };

    const changeRole = async (userId, newRole) => {
        try {
            //menja rolu korisnika
            await api.patch(`/users/${userId}/role`, { role: newRole });

            // Logujemo akciju
            await logAction({
                action: 'Change Role',
                entity: 'User',
                entity_id: userId,
                description: `Role changed to ${newRole}`,
            });

            //psvezi listu korisnika
            const response = await api.get('/users');
            setUsers(response.data);
            alert(`Role was successfully changed to ${newRole}`);
        } catch (error) {
            alert("Error");
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('user_id');
        const dataToSend = {};

        if (profileData.name && profileData.name.trim() !== "") {
            if (profileData.name.length <= 2 || /\d/.test(profileData.name)) {
                alert("First Name must be longer than 2 characters and cannot contain numbers!");
                return;
            }
            dataToSend.name = profileData.name;
        }

        if (profileData.surname && profileData.surname.trim() !== "") {
            if (profileData.surname.length <= 2 || /\d/.test(profileData.surname)) {
                alert("Last Name must be longer than 2 characters and cannot contain numbers!");
                return;
            }
            dataToSend.surname = profileData.surname;
        }

        if (profileData.email && profileData.email.trim() !== "") {
            dataToSend.email = profileData.email;
        }

        if (profileData.description && profileData.description.trim() !== "") {
            dataToSend.description = profileData.description;
        }

        if (profileData.password && profileData.password.length > 0) {
            if (profileData.password.length < 6) {
                alert("The new password must be at least 6 characters long!");
                return;
            }
            dataToSend.password = profileData.password;
        }

        try {
            const response = await api.put(`/users/${userId}`, dataToSend);
            if (response.status === 200) {
                await logAction({
                    action: 'Update Profile',
                    entity: 'User',
                    entity_id: userId,
                    description: 'Admin updated their profile',
                });

                alert("Profile updated successfully!");
                setIsModalOpen(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                alert("Validation failed: " + JSON.stringify(error.response.data.errors));
            } else {
                alert("Failed to update profile.");
            }
        }
    };


    const logAction = async ({ action, entity, entity_id, description }) => {
        try {
            await api.post('/system-logs', {
                action,
                entity,
                entity_id,
                description,
            });
        } catch (error) {
            console.error('Failed to log action', error);
        }
    };

    const fetchInstitutions = async () => {
        try {
            const res = await api.get('/institutions');
            setInstitutions(res.data);
            setView('institutions');
        } catch {
            alert('Failed to load institutions');
        }
    };



    const fetchCompetencies = async () => {
        try {
            const res = await api.get('/all-competencies');
            setCompetencies(res.data);
            setView('competencies');
        } catch {
            alert('Failed to load competencies');
        }
    };


    const fetchSystemData = (type) => {
        if (type === 'institutions') {
            fetchInstitutions();
        } else if (type === 'competencies') {
            fetchCompetencies();
        }
    };

    const deleteInstitution = async (id) => {
        if (!window.confirm('Delete this institution?')) return;

        try {
            await api.delete(`/institutions/${id}`);
            setInstitutions(institutions.filter(i => i.id !== id));
        } catch {
            alert('Failed to delete institution');
        }
    };


    const editInstitution = async (id) => {
        const newName = prompt('Enter new institution name:');
        if (!newName) return;

        try {
            const res = await api.put(`/institutions/${id}`, { name: newName });
            setInstitutions(
                institutions.map(i => i.id === id ? res.data : i)
            );
        } catch {
            alert('Failed to update institution');
        }
    };

    // const deleteCompetency = async (id) => {
    //     if (!window.confirm('Delete this competency?')) return;

    //     try {
    //         await api.delete(`/competencies/${id}`);
    //         setCompetencies(competencies.filter(c => c.id !== id));
    //     } catch {
    //         alert('Failed to delete competency');
    //     }
    // };

    // const editCompetency = (id) => {
    //     alert('Edit competency (ID: ' + id + ') – to be implemented');
    // };
    const fetchSystemLogs = async () => {
        try {
            const res = await api.get('/system-logs');
            setSystemLogs(res.data);
            setView('systemLogs');
        } catch (error) {
            alert('Failed to load system logs');
        }
    };






    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-900">Admin Dashboard</h1>
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

            {view === 'default' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        onClick={fetchUsers}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition"
                    >
                        <h3 className="font-bold text-lg text-blue-700 underline">Manage users</h3>
                        <p className="text-gray-600">Click here to open list of all users and to change their roles.</p>
                    </div>

                    <div
                        onClick={() => fetchSystemData('institutions')}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition"
                    >
                        <h3 className="font-bold text-lg text-green-700 underline">
                            Manage system data
                        </h3>
                        <p className="text-gray-600">
                            Manage competency categories and dictionaries.
                        </p>
                    </div>


                    <div
                        onClick={fetchSystemLogs}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition"
                    >
                        <h3 className="font-bold text-lg text-yellow-700 underline">
                            System overview
                        </h3>
                        <p className="text-gray-600">
                            View moderator actions and system events.
                        </p>
                    </div>


                </div>
            )}

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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
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

                                                {user.role !== 'admin' ? ( // Mogusnot da admin brise naloge usera i moderatora 
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

                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    // Ako je korisnik admin, ispisujemo "Protected"
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

            {/* Modal za izmenu profila ostaje nepromenjen */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-900">Update Profile Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.surname}
                                    onChange={(e) => setProfileData({ ...profileData, surname: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
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
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                            <button onClick={handleSaveChanges} className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-bold">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}



            {view === 'institutions' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold mb-4">Institutions</h2>
                        <button onClick={() => setView('default')} className="text-blue-600 hover:underline mb-4">← Back to main menu</button>
                    </div>

                    <table className="w-full border">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 border">Name</th>
                                <th className="p-3 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {institutions.map(inst => (
                                <tr key={inst.id} className="hover:bg-gray-50">
                                    <td className="p-3 border">{inst.name}</td>
                                    <td className="p-3 border flex gap-2">
                                        <button onClick={() => editInstitution(inst.id)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        <button onClick={() => deleteInstitution(inst.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* {view === 'competencies' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Competencies</h2>
                    <button onClick={() => setView('default')} className="text-blue-600 hover:underline mb-4">← Back</button>

                    <table className="w-full border">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 border">User</th>
                                <th className="p-3 border">Name</th>
                                <th className="p-3 border">Level</th>
                                <th className="p-3 border">Institution</th>
                                <th className="p-3 border">Type</th>
                                <th className="p-3 border">Source</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competencies.map(comp => (
                                <tr key={comp.id} className="hover:bg-gray-50">
                                    <td className="p-3 border">{comp.user?.name} {comp.user?.surname}</td>
                                    <td className="p-3 border">{comp.name}</td>
                                    <td className="p-3 border">{comp.level}</td>
                                    <td className="p-3 border">{comp.institution?.name}</td>
                                    <td className="p-3 border">{comp.type?.name}</td>
                                    <td className="p-3 border">{comp.source?.name}</td>
                                    <td className="p-3 border flex gap-2">
                                        <button onClick={() => editCompetency(comp.id)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        <button onClick={() => deleteCompetency(comp.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )} */}

            {view === 'systemLogs' && (
                <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">System activity log</h2>
                        <button
                            onClick={() => setView('default')}
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            ← Back to main menu
                        </button>
                    </div>

                    <table className="w-full border">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">User</th>
                                <th className="p-3 border">Role</th>
                                <th className="p-3 border">Action</th>
                                <th className="p-3 border">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {systemLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="p-3 border">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="p-3 border">
                                        {log.user?.name} {log.user?.surname}
                                    </td>
                                    <td className="p-3 border uppercase font-semibold text-sm">
                                        {log.user?.role}
                                    </td>
                                    <td className="p-3 border font-medium text-indigo-700">
                                        {log.action}
                                    </td>
                                    <td className="p-3 border text-gray-600">
                                        {log.description}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


        </div>
    );
};

export default AdminDashboard;