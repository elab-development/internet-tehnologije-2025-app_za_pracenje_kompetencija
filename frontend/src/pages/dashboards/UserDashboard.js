import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCompModalOpen, setIsCompModalOpen] = useState(false); // Modal za kompetencije

    const [profileData, setProfileData] = useState({
        name: localStorage.getItem('user_name') || '',
        surname: localStorage.getItem('user_surname') || '',
        email: localStorage.getItem('user_email') || '',
        password: '',
        description: localStorage.getItem('user_description') || '',
    });

    // Form data za novu kompetenciju
    const [formData, setFormData] = useState({
        name: '',
        level: 1,
        institution_id: '',
        type_id: '',
        source_id: '',
        evidence: '',
        acquired_at: ''
    });

    // Liste za dropdown-ove
    const [options, setOptions] = useState({
        institutions: [],
        types: [],
        sources: []
    });

    // Učitavanje opcija pri paljenju dashboard-a
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/competency-options');

                // Laravel nam vraća objekat sa tri niza unutra
                setOptions({
                    institutions: response.data.institutions,
                    types: response.data.types,
                    sources: response.data.sources
                });
            } catch (err) {
                console.error("Greška pri učitavanju opcija:", err);
            }
        };
        fetchOptions();
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Funkcija za slanje kompetencije na backend
    const handleAddCompetency = async (e) => {
        e.preventDefault();

        // Proveri šta tačno šalješ. 
        // Ako si u migraciji obrisao acquired_at, izbaci ga odavde!
        const dataToSend = {
            name: formData.name,
            level: parseInt(formData.level), // Mora biti broj
            institution_id: formData.institution_id,
            type_id: formData.type_id,
            source_id: formData.source_id,
            evidence: formData.evidence
        };
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/api/competencies', dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // ... uspeh
        } catch (error) {
            // OVO ĆE TI REĆI TAČNO ŠTA NIJE U REDU
            console.log("Server response error:", error.response.data);
            alert("Greška: " + JSON.stringify(error.response.data.errors));
        }
    };

    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('user_id');
        const dataToSend = {};
        if (profileData.name?.trim()) dataToSend.name = profileData.name;
        if (profileData.surname?.trim()) dataToSend.surname = profileData.surname;
        if (profileData.email?.trim()) dataToSend.email = profileData.email;
        if (profileData.description?.trim()) dataToSend.description = profileData.description;
        if (profileData.password.length >= 6) dataToSend.password = profileData.password;

        try {
            await axios.put(`http://127.0.0.1:8000/api/users/${userId}`, dataToSend);
            alert("Profile updated!");
            localStorage.setItem('user_name', profileData.name);
            setIsProfileModalOpen(false);
        } catch (error) { alert("Update failed!"); }
    };

    const handleDeleteAccount = async () => {
        const userId = localStorage.getItem('user_id');
        if (window.confirm("Delete account permanently?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
                localStorage.clear();
                navigate('/login');
            } catch (error) { alert("Failed to delete account."); }
        }
    };

    const handleShareProfile = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Token not found! User is not logged in.");

            const res = await axios.post(
                `http://127.0.0.1:8000/api/generate-share-link/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const link = res.data.link;
            alert(`Your shareable profile link: ${link}`);
        } catch (error) {
            console.log("Full error:", error.response ? error.response.data : error);
            alert("Error generating link: " + (error.response?.data?.message || error.message));
        }
    };



    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-900">User Dashboard</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsProfileModalOpen(true)} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow hover:bg-indigo-200 transition font-medium">
                        Change Profile 👤
                    </button>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => navigate('competencies')} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition">
                    <h3 className="font-bold text-lg text-blue-700 underline">View my competencies</h3>
                    <p className="text-gray-600">See all your currently assigned and achieved skills.</p>
                </div>

                {/* KARTICA ZA DODAVANJE - Sada otvara modal */}
                <div onClick={() => setIsCompModalOpen(true)} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition">
                    <h3 className="font-bold text-lg text-green-700">Add competency</h3>
                    <p className="text-gray-600">Request a new competency to be added to your profile.</p>
                </div>

                <div onClick={handleShareProfile} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition">
                    <h3 className="font-bold text-lg text-yellow-700">Share profile</h3>
                    <p className="text-gray-600">Generate a secure link to share your profile.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 cursor-pointer hover:bg-red-50 transition">
                    <h3 className="font-bold text-lg text-red-700">View status</h3>
                    <p className="text-gray-600">Check approval status.</p>
                </div>
            </div>

            {/* MODAL ZA DODAVANJE KOMPETENCIJE */}
            {isCompModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-6 text-green-800">New Competency</h2>
                        <form onSubmit={handleAddCompetency} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold">Competency Name</label>
                                <input type="text" required className="w-full p-2 border rounded mt-1"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold">Level (1-5)</label>
                                    <input type="number" min="1" max="5" required className="w-full p-2 border rounded mt-1"
                                        value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold">Date Acquired</label>
                                    <input type="date" required className="w-full p-2 border rounded mt-1"
                                        value={formData.acquired_at} onChange={e => setFormData({ ...formData, acquired_at: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Type</label>
                                <select required className="w-full p-2 border rounded mt-1" value={formData.type_id} onChange={e => setFormData({ ...formData, type_id: e.target.value })}>
                                    <option value="">Select Type</option>
                                    {options.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Institution</label>
                                <select required className="w-full p-2 border rounded mt-1" value={formData.institution_id} onChange={e => setFormData({ ...formData, institution_id: e.target.value })}>
                                    <option value="">Select Institution</option>
                                    {options.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Source</label>
                                <select required className="w-full p-2 border rounded mt-1" value={formData.source_id} onChange={e => setFormData({ ...formData, source_id: e.target.value })}>
                                    <option value="">Select Source</option>
                                    {options.sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Evidence (URL/Note)</label>
                                <input type="text" className="w-full p-2 border rounded mt-1"
                                    value={formData.evidence} onChange={e => setFormData({ ...formData, evidence: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCompModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold">Add to Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ZA PROFIL - Tvoj postojeći modal */}
            {isProfileModalOpen && (
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
                                <label className="block text-sm font-semibold text-gray-700">Profile Description</label>
                                <textarea rows="3" className="w-full p-2 border border-gray-300 rounded mt-1 resize-none"
                                    value={profileData.description} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-8">
                            <button onClick={handleDeleteAccount} className="text-red-600 hover:text-red-800 font-medium underline text-sm">Delete Account</button>
                            <div className="flex gap-3">
                                <button onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
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