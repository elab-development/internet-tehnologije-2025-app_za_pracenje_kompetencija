import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const PublicProfile = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setError("");

      try {
        // može i relativno "/api/..." ako imaš proxy
        const res = await axios.get(`http://127.0.0.1:8000/api/public-profile/${token}`);
        setProfile(res.data);
      } catch (e) {
        setError("Public profile not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPublicProfile();
  }, [token]);

  // === PREUZETO iz Competencies.jsx (ista logika za status) ===
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">{error || "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP BAR (kao na dashboardu, ali prilagođeno) */}
      <div className="px-8 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-900">
          {profile.name} {profile.surname}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow hover:bg-indigo-200 transition font-medium"
          >
            Profile Details 👤
          </button>

          <button
            onClick={() => navigate("/guest")}
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
          >
            Exit
          </button>
        </div>
      </div>

      {/* COMPETENCIES (preuzeto iz Competencies.jsx, samo bez akcija) */}
      <div className="px-8 pb-10">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">Competencies</h2>

        {(!profile.competencies || profile.competencies.length === 0) ? (
          <div className="bg-white p-6 rounded shadow text-gray-600">
            This user has no competencies yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.competencies.map((comp) => (
              <div
                key={comp.id}
                className="relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
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

                {renderStatus(comp.verifications)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROFILE DETAILS MODAL (iz UserDashboard, ali read-only) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Profile Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                <input
                  disabled
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100 text-gray-600"
                  value={profile.name || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                <input
                  disabled
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100 text-gray-600"
                  value={profile.surname || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  disabled
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100 text-gray-600"
                  value={profile.email || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Profile Description</label>
                <textarea
                  disabled
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded mt-1 resize-none bg-gray-100 text-gray-600"
                  value={profile.description || ""}
                />
              </div>
            </div>

            <div className="flex justify-end items-center mt-8">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
