// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";

// const AdminUserProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");

//   const api = axios.create({
//     baseURL: "http://127.0.0.1:8000/api",
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//   });

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // ====== Profile modal (editable) ======
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [profileForm, setProfileForm] = useState({
//     name: "",
//     surname: "",
//     email: "",
//     description: "",
//     password: "",
//   });

//   // ====== Competency edit/delete ======
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedCompetency, setSelectedCompetency] = useState(null);

//   const [showFormModal, setShowFormModal] = useState(false);
//   const [editingId, setEditingId] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     level: "",
//     acquired_at: "",
//     institution_id: "",
//     type_id: "",
//     source_id: "",
//     evidence: "",
//   });

//   const [institutions, setInstitutions] = useState([]);
//   const [types, setTypes] = useState([]);
//   const [sources, setSources] = useState([]);

//   const toDateInputValue = (value) => {
//     if (!value) return "";
//     return String(value).slice(0, 10);
//   };

//   // ====== Status helpers (same as Competencies.jsx) ======
//   const getLatestVerification = (verifications = []) => {
//     if (!Array.isArray(verifications) || verifications.length === 0) return null;
//     return [...verifications].sort((a, b) => Number(b.id) - Number(a.id))[0];
//   };

//   const renderStatus = (verifications) => {
//     const v = getLatestVerification(verifications);
//     if (!v) return null;

//     switch (Number(v.status_verification_id)) {
//       case 1:
//         return <div className="mt-3 text-xs text-yellow-600 font-semibold">Pending</div>;
//       case 2:
//         return <div className="mt-3 text-xs text-green-700 font-semibold">Verified</div>;
//       case 3:
//         return (
//           <div className="mt-3">
//             <div className="text-xs text-red-600 font-semibold">Rejected</div>
//             {v.note && <div className="text-[10px] text-red-500 italic mt-1">Reason: {v.note}</div>}
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   // ====== Load user profile ======
//   const fetchUserProfile = async () => {
//     setLoading(true);
//     setErr("");

//     try {
//       const res = await api.get(`/admin/users/${id}/profile`);
//       setUser(res.data);

//       setProfileForm({
//         name: res.data.name || "",
//         surname: res.data.surname || "",
//         email: res.data.email || "",
//         description: res.data.description || "",
//         password: "",
//       });
//     } catch (e) {
//       setErr(e.response?.data?.message || "Failed to load user profile.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ====== Load dropdown options for competency edit ======
//   const loadDropdowns = async () => {
//     try {
//       const res = await api.get("/competency-options");
//       setInstitutions(res.data?.institutions || []);
//       setTypes(res.data?.types || []);
//       setSources(res.data?.sources || []);
//     } catch (e) {
//       console.log("Dropdown load error:", e.response?.status, e.response?.data || e.message);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//     loadDropdowns();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // ====== Admin save user profile ======
//   const handleAdminSaveUser = async () => {
//     try {
//       const payload = {};
//       if (profileForm.name?.trim()) payload.name = profileForm.name;
//       if (profileForm.surname?.trim()) payload.surname = profileForm.surname;
//       if (profileForm.email?.trim()) payload.email = profileForm.email;
//       if (profileForm.description?.trim()) payload.description = profileForm.description;
//       if (profileForm.password?.trim()) payload.password = profileForm.password;

//       const res = await api.put(`/admin/users/${id}`, payload);

//       // update UI
//       setUser((prev) => ({
//         ...prev,
//         ...res.data.user,
//       }));

//       setProfileForm((prev) => ({ ...prev, password: "" }));
//       setIsProfileModalOpen(false);
//       alert("User profile updated!");
//     } catch (e) {
//       if (e.response?.status === 422) {
//         alert("Validation failed: " + JSON.stringify(e.response.data.errors));
//       } else {
//         alert(e.response?.data?.message || "Failed to update user.");
//       }
//     }
//   };

//   // ====== Open edit competency modal ======
//   const openEditCompetency = (comp) => {
//     setEditingId(comp.id);

//     setFormData({
//       name: comp.name || "",
//       level: comp.level ?? "",
//       acquired_at: toDateInputValue(comp.acquired_at),
//       institution_id: String(comp.institution?.id ?? comp.institution_id ?? ""),
//       type_id: String(comp.type?.id ?? comp.type_id ?? ""),
//       source_id: String(comp.source?.id ?? comp.source_id ?? ""),
//       evidence: comp.evidence || "",
//     });

//     setShowFormModal(true);
//   };

//   const closeForm = () => {
//     setShowFormModal(false);
//     setEditingId(null);
//   };

//   // ====== Save competency (admin) ======
//   const handleSaveCompetency = async (e) => {
//     e.preventDefault();

//     const payload = {
//       name: formData.name,
//       level: parseInt(formData.level, 10),
//       acquired_at: formData.acquired_at || null,
//       institution_id: parseInt(formData.institution_id, 10),
//       type_id: parseInt(formData.type_id, 10),
//       // source_id: parseInt(formData.source_id, 10), // intentionally disabled
//       evidence: formData.evidence,
//     };

//     try {
//       const res = await api.put(`/admin/competencies/${editingId}`, payload);

//       // update UI locally
//       setUser((prev) => ({
//         ...prev,
//         competencies: prev.competencies.map((c) => (c.id === editingId ? res.data : c)),
//       }));

//       closeForm();
//       alert("Competency updated!");
//     } catch (e2) {
//       if (e2.response?.status === 422) {
//         alert("Validation failed: " + JSON.stringify(e2.response.data.errors));
//       } else {
//         alert(e2.response?.data?.message || "Failed to update competency.");
//       }
//     }
//   };

//   // ====== Delete competency (admin) ======
//   const handleDelete = (competency) => {
//     setSelectedCompetency(competency);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedCompetency) return;

//     try {
//       await api.delete(`/admin/competencies/${selectedCompetency.id}`);

//       setUser((prev) => ({
//         ...prev,
//         competencies: prev.competencies.filter((c) => c.id !== selectedCompetency.id),
//       }));

//       setShowDeleteModal(false);
//       setSelectedCompetency(null);
//       alert("Competency deleted!");
//     } catch (e) {
//       alert(e.response?.data?.message || "Delete failed.");
//     }
//   };

//   if (loading) {
//     return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
//   }

//   if (err) {
//     return <div className="min-h-screen p-8 bg-gray-100 text-red-600">{err}</div>;
//   }

//   if (!user) return null;

//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       {/* Top bar */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-indigo-900">
//           {user.name} {user.surname}
//         </h1>

//         <div className="flex gap-2">
//           <button
//             onClick={() => setIsProfileModalOpen(true)}
//             className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow hover:bg-indigo-200 transition font-medium"
//           >
//             Profile Details 👤
//           </button>

//           <button
//             onClick={() => navigate(-1)}
//             className="text-indigo-600 font-semibold hover:underline"
//           >
//             ← Back
//           </button>
//         </div>
//       </div>

//       {/* Competencies */}
//       <h2 className="text-3xl font-bold text-indigo-900 mb-6">Competencies</h2>

//       {!user.competencies || user.competencies.length === 0 ? (
//         <div className="bg-white p-6 rounded shadow text-gray-600">
//           This user has no competencies yet.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {user.competencies.map((comp) => (
//             <div key={comp.id} className="relative bg-white p-6 pb-14 rounded-lg shadow hover:shadow-lg transition">
//               <h2 className="text-xl font-bold text-indigo-700 mb-2">{comp.name}</h2>

//               <p className="text-sm text-gray-600 mb-1">
//                 <strong>Level:</strong> {comp.level}
//               </p>

//               {comp.type && (
//                 <p className="text-sm text-gray-600">
//                   <strong>Type:</strong> {comp.type.name}
//                 </p>
//               )}

//               {comp.source && (
//                 <p className="text-sm text-gray-600">
//                   <strong>Source:</strong> {comp.source.name}
//                 </p>
//               )}

//               {comp.institution && (
//                 <p className="text-sm text-gray-600">
//                   <strong>Institution:</strong> {comp.institution.name}
//                 </p>
//               )}

//               {comp.evidence && <p className="text-sm text-gray-500 mt-2">{comp.evidence}</p>}

//               {renderStatus(comp.verifications)}

//               {/* Admin actions */}
//               <div className="absolute bottom-4 right-4 flex gap-2">
//                 <button
//                   onClick={() => openEditCompetency(comp)}
//                   className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
//                   title="Edit"
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                     <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                     <path
//                       d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </button>

//                 <button
//                   onClick={() => handleDelete(comp)}
//                   className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
//                   title="Delete"
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                     <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                     <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
//                     <path d="M6 6l1 16h10l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
//                     <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ====== PROFILE DETAILS (editable) MODAL ====== */}
//       {isProfileModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
//             <h2 className="text-2xl font-bold mb-6 text-indigo-900">Edit User Profile</h2>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">First Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border border-gray-300 rounded mt-1"
//                   value={profileForm.name}
//                   onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">Last Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border border-gray-300 rounded mt-1"
//                   value={profileForm.surname}
//                   onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">Email</label>
//                 <input
//                   type="email"
//                   className="w-full p-2 border border-gray-300 rounded mt-1"
//                   value={profileForm.email}
//                   onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">Description</label>
//                 <textarea
//                   rows="3"
//                   className="w-full p-2 border border-gray-300 rounded mt-1 resize-none"
//                   value={profileForm.description}
//                   onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">New Password</label>
//                 <input
//                   type="password"
//                   placeholder="Leave blank to keep current"
//                   className="w-full p-2 border border-gray-300 rounded mt-1"
//                   value={profileForm.password}
//                   onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 mt-8">
//               <button
//                 onClick={() => setIsProfileModalOpen(false)}
//                 className="px-4 py-2 text-gray-600 font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAdminSaveUser}
//                 className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-bold"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ====== DELETE MODAL ====== */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete competency</h3>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete{" "}
//               <span className="font-semibold">{selectedCompetency?.name}</span>? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowDeleteModal(false);
//                   setSelectedCompetency(null);
//                 }}
//                 className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
//               >
//                 Yes, delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ====== EDIT COMPETENCY MODAL ====== */}
//       {showFormModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Edit Competency (Admin)</h2>
//               <button onClick={closeForm} className="text-gray-500 hover:text-gray-800">
//                 ✕
//               </button>
//             </div>

//             <form onSubmit={handleSaveCompetency} className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium">Competency Name</label>
//                 <input
//                   className="w-full border rounded-md px-3 py-2"
//                   value={formData.name}
//                   onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium">Level (1-5)</label>
//                   <input
//                     type="number"
//                     className="w-full border rounded-md px-3 py-2"
//                     value={formData.level}
//                     onChange={(e) => setFormData((p) => ({ ...p, level: e.target.value }))}
//                     required
//                     min="1"
//                     max="5"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium">Date Acquired</label>
//                   <input
//                     type="date"
//                     className="w-full border rounded-md px-3 py-2"
//                     value={formData.acquired_at || ""}
//                     onChange={(e) => setFormData((p) => ({ ...p, acquired_at: e.target.value }))}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Type</label>
//                 <select
//                   className="w-full border rounded-md px-3 py-2"
//                   value={formData.type_id}
//                   onChange={(e) => setFormData((p) => ({ ...p, type_id: e.target.value }))}
//                   required
//                 >
//                   <option value="">Select Type</option>
//                   {types.map((t) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Institution</label>
//                 <select
//                   className="w-full border rounded-md px-3 py-2"
//                   value={formData.institution_id}
//                   onChange={(e) => setFormData((p) => ({ ...p, institution_id: e.target.value }))}
//                   required
//                 >
//                   <option value="">Select Institution</option>
//                   {institutions.map((i) => (
//                     <option key={i.id} value={i.id}>
//                       {i.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Source</label>
//                 <select
//                   disabled
//                   className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
//                   value={formData.source_id}
//                 >
//                   <option value="">Select Source</option>
//                   {sources.map((s) => (
//                     <option key={s.id} value={s.id}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </select>

//                 <p className="text-xs text-gray-400 mt-1">Source cannot be changed after creation.</p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Evidence (URL/Note)</label>
//                 <textarea
//                   className="w-full border rounded-md px-3 py-2"
//                   rows={3}
//                   value={formData.evidence}
//                   onChange={(e) => setFormData((p) => ({ ...p, evidence: e.target.value }))}
//                 />
//               </div>

//               <div className="flex justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={closeForm}
//                   className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminUserProfile;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const getLatestVerification = (verifications = []) => {
    if (!Array.isArray(verifications) || verifications.length === 0) return null;
    return [...verifications].sort((a, b) => Number(b.id) - Number(a.id))[0];
  };

  const renderStatus = (verifications) => {
    const v = getLatestVerification(verifications);
    if (!v) return null;

    switch (Number(v.status_verification_id)) {
      case 1:
        return <div className="mt-3 text-xs text-yellow-600 font-semibold">Pending</div>;
      case 2:
        return <div className="mt-3 text-xs text-green-700 font-semibold">Verified</div>;
      case 3:
        return (
          <div className="mt-3">
            <div className="text-xs text-red-600 font-semibold">Rejected</div>
            {v.note && <div className="text-[10px] text-red-500 italic mt-1">Reason: {v.note}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setErr("");

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://127.0.0.1:8000/api/admin/users/${id}/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (err) return <div className="min-h-screen p-8 bg-gray-100 text-red-600">{err}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">
          {user.name} {user.surname}
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 font-semibold hover:underline"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Profile Details</h2>
        <p><strong>Email:</strong> {user.email}</p>
        {user.description && <p className="mt-2 text-gray-700">{user.description}</p>}
      </div>

      <h2 className="text-3xl font-bold text-indigo-900 mb-6">Competencies</h2>

      {(!user.competencies || user.competencies.length === 0) ? (
        <div className="bg-white p-6 rounded shadow text-gray-600">
          This user has no competencies yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.competencies.map((comp) => (
            <div key={comp.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold text-indigo-700 mb-2">{comp.name}</h2>

              <p className="text-sm text-gray-600 mb-1"><strong>Level:</strong> {comp.level}</p>
              {comp.type && <p className="text-sm text-gray-600"><strong>Type:</strong> {comp.type.name}</p>}
              {comp.source && <p className="text-sm text-gray-600"><strong>Source:</strong> {comp.source.name}</p>}
              {comp.institution && <p className="text-sm text-gray-600"><strong>Institution:</strong> {comp.institution.name}</p>}
              {comp.evidence && <p className="text-sm text-gray-500 mt-2">{comp.evidence}</p>}

              {renderStatus(comp.verifications)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
