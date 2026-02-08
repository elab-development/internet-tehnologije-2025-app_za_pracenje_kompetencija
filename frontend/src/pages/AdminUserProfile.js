import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AdminUserProfile = () => {
  const { id } = useParams(); //da uzme id iz urla
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
