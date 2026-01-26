import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Competencies = () => {
    const [competencies, setCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCompetency, setSelectedCompetency] = useState(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showCantEditModal, setShowCantEditModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        level: "",
        acquired_at: "",        // ✅ NEW (ako uvodiš datum)
        institution_id: "",     // držimo kao string zbog <select>
        type_id: "",
        source_id: "",
        evidence: ""
    });


    const [institutions, setInstitutions] = useState([]);
    const [types, setTypes] = useState([]);
    const [sources, setSources] = useState([]);

    useEffect(() => {
        const fetchCompetencies = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    'http://127.0.0.1:8000/api/competencies',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setCompetencies(res.data);
            } catch (error) {
                console.error('Error fetching competencies:', error);
                alert('Unauthorized or server error');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchCompetencies();
    }, [navigate]);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const [instRes, typeRes, srcRes] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/api/institutions", { headers }),
                    axios.get("http://127.0.0.1:8000/api/types", { headers }),
                    axios.get("http://127.0.0.1:8000/api/sources", { headers }),
                ]);
                setInstitutions(instRes.data || []);
                setTypes(typeRes.data || []);
                setSources(srcRes.data || []);
            } catch (e) {
                console.log("Dropdown load error:", e.response?.data || e.message);
            }
        };
        loadDropdowns();
    }, []);

    // FUNKCIJA ZA DINAMIČKI PRIKAZ STATUSA (DODATO)
    const renderStatus = (verifications) => {
        if (!verifications || verifications.length === 0) return null;
        const v = verifications[0];

        switch (v.status_verification_id) {
            case 1:
                return <div className="mt-3 text-xs text-yellow-600 font-semibold">Pending</div>;
            case 2:
                return <div className="mt-3 text-xs text-green-700 font-semibold">Verified</div>;
            case 3:
                return (
                    <div className="mt-3">
                        <div className="text-xs text-red-600 font-semibold">Rejected </div>
                        {v.note && <div className="text-[10px] text-red-500 italic mt-1">Reason: {v.note}</div>}
                    </div>
                );
            default:
                return null;
        }
    };

    const getLatestVerification = (verifications = []) => {
        if (!Array.isArray(verifications) || verifications.length === 0) return null;
        return [...verifications].sort((a, b) => Number(b.id) - Number(a.id))[0];
    };

    const canEditCompetency = (comp) => {
        // ✅ Informal po SOURCE
        const sourceId = Number(comp.source?.id ?? comp.source_id);
        const sourceName = String(comp.source?.name ?? "").toLowerCase();
        const isInformal = sourceId === 2 || sourceName.includes("informal");

        // ✅ Pending: poslednja verifikacija
        const latest = getLatestVerification(comp.verifications);
        const statusId = Number(latest?.status_verification_id);
        const isPending = statusId === 1;

        // ✅ Informal uvek sme, pending sme
        return isInformal || isPending;
    };






    const openEdit = (comp) => {
        if (!canEditCompetency(comp)) {
            setShowCantEditModal(true);
            return;
        }

        setIsEditing(true);
        setEditingId(comp.id);

        setFormData({
            name: comp.name || "",
            level: comp.level ?? "",
            acquired_at: comp.acquired_at ?? "",
            institution_id: String(comp.institution?.id ?? comp.institution_id ?? ""),
            type_id: String(comp.type?.id ?? comp.type_id ?? ""),
            source_id: String(comp.source?.id ?? comp.source_id ?? ""),
            evidence: comp.evidence || ""
        });

        setShowFormModal(true);
    };







    const closeForm = () => {
        setShowFormModal(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const dataToSend = {
            name: formData.name,
            level: parseInt(formData.level, 10),
            acquired_at: formData.acquired_at || null, // ✅ NEW (ako uvodiš datum)
            institution_id: parseInt(formData.institution_id, 10),
            type_id: parseInt(formData.type_id, 10),
            source_id: parseInt(formData.source_id, 10),
            evidence: formData.evidence
        };

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(
                `http://127.0.0.1:8000/api/competencies/${editingId}`,
                dataToSend,
                { headers }
            );
            setCompetencies((prev) =>
                prev.map((c) => (c.id === editingId ? response.data : c))
            );
            closeForm();
        } catch (error) {
            alert("Error: " + JSON.stringify(error.response?.data?.errors || error.message));
        }
    };

    const handleDelete = (competency) => {
        setSelectedCompetency(competency);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedCompetency) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://127.0.0.1:8000/api/competencies/${selectedCompetency.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompetencies((prev) => prev.filter((c) => c.id !== selectedCompetency.id));
            setShowDeleteModal(false);
            setSelectedCompetency(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Delete failed.');
        }
    };

    if (loading) {
        return <div className="p-8">Loading competencies...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-900">My Competencies</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-indigo-600 font-semibold hover:underline"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {competencies.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-gray-600">
                    You have no competencies yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {competencies.map((comp) => (
                        <div
                            key={comp.id}
                            className="relative bg-white p-6 pb-14 rounded-lg shadow hover:shadow-lg transition"
                        >
                            <h2 className="text-xl font-bold text-indigo-700 mb-2">{comp.name}</h2>
                            <p className="text-sm text-gray-600 mb-1">
                                <strong>Level:</strong> {comp.level}
                            </p>
                            {comp.type && (
                                <p className="text-sm text-gray-600">
                                    <strong>Type:</strong> {comp.type.name}
                                </p>
                            )}
                            {comp.source && (
                                <p className="text-sm text-gray-600">
                                    <strong>Source:</strong> {comp.source.name}
                                </p>
                            )}
                            {comp.institution && (
                                <p className="text-sm text-gray-600">
                                    <strong>Institution:</strong> {comp.institution.name}
                                </p>
                            )}
                            {comp.evidence && (
                                <p className="text-sm text-gray-500 mt-2">{comp.evidence}</p>
                            )}

                            {/* IZMENJEN PRIKAZ STATUSA */}
                            {renderStatus(comp.verifications)}

                            {/* ACTION BUTTONS */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button
                                    onClick={() => openEdit(comp)}
                                    className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                                    title="Edit"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(comp)}
                                    className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                                    title="Delete"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                        <path d="M6 6l1 16h10l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete competency</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{selectedCompetency?.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setSelectedCompetency(null); }} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Yes, delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CANT EDIT MODAL */}
            {showCantEditModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Editing Not Allowed</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            This competency cannot be edited because it has already been verified.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowCantEditModal(false)}
                                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* EDIT MODAL */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Edit Competency</h2>
                            <button onClick={closeForm} className="text-gray-500 hover:text-gray-800">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Competency Name</label>
                                <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* Level + Date Acquired (same row like Add form) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Level (1-5)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.level}
                                        onChange={(e) => setFormData(p => ({ ...p, level: e.target.value }))}
                                        required
                                        min="1"
                                        max="5"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Date Acquired</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.acquired_at || ""}
                                        onChange={(e) => setFormData(p => ({ ...p, acquired_at: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={formData.type_id}
                                    onChange={(e) => setFormData(p => ({ ...p, type_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Institution</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={formData.institution_id}
                                    onChange={(e) => setFormData(p => ({ ...p, institution_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map(i => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Source</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={formData.source_id}
                                    onChange={(e) => setFormData(p => ({ ...p, source_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {sources.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Evidence (URL/Note)</label>
                                <textarea
                                    className="w-full border rounded-md px-3 py-2"
                                    rows={3}
                                    value={formData.evidence}
                                    onChange={(e) => setFormData(p => ({ ...p, evidence: e.target.value }))}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Competencies;