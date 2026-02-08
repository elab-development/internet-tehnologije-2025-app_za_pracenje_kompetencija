import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]); //zahtevi za verifikaciju
  const [view, setView] = useState('default'); //defalt,verificatiins,history
  const [searchTerm, setSearchTerm] = useState(''); //za filter u tabeli
  const [profileData, setProfileData] = useState({ //podaci za izmenu profila
    name: '',
    surname: '',
    email: '',
    password: '',
    description: ''
  });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); //da li je reject modal otvoren
  const [selectedRequestId, setSelectedRequestId] = useState(null); //za koji zahtev radim reject
  const [rejectNote, setRejectNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // modal aza change profile 

  const [historyRequests, setHistoryRequests] = useState([]);


  // ucitaj tabelu POST /verify/{id}
  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/moderator/pending-verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(res.data); //cuvamo rezultat
      setView('verifications'); //prikaz ekrana sa tabelom
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/moderator/verify/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Competency successfully verified! ✅");
      // Refresh the list
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/moderator/pending-verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(res.data);
    } catch (err) {
      alert("Error during verification.");
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.post(`http://127.0.0.1:8000/api/moderator/reject/${selectedRequestId}`,
        { note: rejectNote },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      alert("Request rejected.");
      setIsRejectModalOpen(false);
      setRejectNote('');
      fetchPending(); // Osveži tabelu
    } catch (err) {
      alert("Error rejecting request.");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSaveChanges = async () => {
    const userId = localStorage.getItem('user_id');
    const dataToSend = {};

    if (profileData.name?.trim()) dataToSend.name = profileData.name;
    if (profileData.surname?.trim()) dataToSend.surname = profileData.surname;
    if (profileData.email?.trim()) dataToSend.email = profileData.email;
    if (profileData.description?.trim()) dataToSend.description = profileData.description;
    if (profileData.password?.length >= 6) dataToSend.password = profileData.password;

    try {
      await axios.put(`http://127.0.0.1:8000/api/users/${userId}`, dataToSend);
      alert("Profile updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  const fetchHistory = async () => {
    console.log("FETCH HISTORY CLICKED");
    setView('history');

    try {
      const res = await axios.get(
        'http://127.0.0.1:8000/api/moderator/verification-history',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log("HISTORY RESPONSE:", res.data);
      setHistoryRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">Moderator Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow hover:bg-indigo-200 transition font-medium"
          >
            Change Profile 👤
          </button>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition font-medium">
            Logout
          </button>
        </div>
      </div>

      {/* Pocetna kartica */}
      {view === 'default' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={fetchPending}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition"
          >
            <h3 className="font-bold text-lg text-yellow-700 underline">View Requests for Verification</h3>
            <p className="text-gray-600">You have new competencies waiting for your approval.</p>
          </div>

          <div
            onClick={fetchHistory}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition"
          >
            <h3 className="font-bold text-lg text-green-700 underline">
              Verification History
            </h3>
            <p className="text-gray-600">
              Review previously approved or rejected items.
            </p>
          </div>

        </div>
      )}

      {/* Verifications Table View */}
      {view === 'verifications' && (
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-900">Pending Requests</h2>
            <button
              onClick={() => setView('default')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              ← Back to main menu
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user or competency name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 border">User</th>
                  <th className="p-3 border">Competency</th>
                  <th className="p-3 border text-center">Level</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests
                  .filter(req =>
                    req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.competency?.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 border font-medium">
                        {req.user?.name} {req.user?.surname}
                      </td>
                      <td className="p-3 border italic text-gray-600">
                        {req.competency?.name}
                      </td>
                      <td className="p-3 border text-center">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                          Lvl {req.competency?.level}
                        </span>
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="bg-green-500 text-white px-4 py-1 rounded shadow hover:bg-green-600 transition text-sm font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            setIsRejectModalOpen(true);
                          }}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition text-sm font-bold"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-5 text-center text-gray-400">No requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'history' && (
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-900">Verification History</h2>
            <button
              onClick={() => setView('default')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              ← Back to main menu
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 border">User</th>
                  <th className="p-3 border">Competency</th>
                  <th className="p-3 border text-center">Status</th>
                  <th className="p-3 border">Note</th>
                  <th className="p-3 border text-center">Verified at</th>
                </tr>
              </thead>
              <tbody>
                {historyRequests.length > 0 ? (
                  historyRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition">
                      {/* User koji poseduje kompetenciju */}
                      <td className="p-3 border font-medium">
                        {req.competency?.user?.name || req.user?.name || "-"}{" "}
                        {req.competency?.user?.surname || req.user?.surname || ""}
                      </td>


                      {/* Naziv kompetencije */}
                      <td className="p-3 border italic text-gray-600">
                        {req.competency?.name || "-"}
                      </td>

                      {/* Status */}
                      <td className="p-3 border text-center">
                        {req.status_verification_id === 2 && (
                          <span className="text-green-700 font-bold">Approved</span>
                        )}
                        {req.status_verification_id === 3 && (
                          <span className="text-red-600 font-bold">Rejected</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="p-3 border text-sm text-gray-600">
                        {req.note || "-"}
                      </td>

                      {/* Datum verifikacije */}
                      <td className="p-3 border text-center text-sm">
                        {req.verified_at
                          ? new Date(req.verified_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-5 text-center text-gray-400">
                      No history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}








      {/* Profile Change Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Moderator Settings</h2>
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
                <label className="block text-sm font-semibold text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
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
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-700">Reject Competency</h2>
            <p className="text-sm text-gray-600 mb-2">Please explain why this competency is being rejected:</p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none resize-none"
              rows="4"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Missing valid certificate link..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;
