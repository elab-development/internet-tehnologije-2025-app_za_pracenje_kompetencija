import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Competencies = () => {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return <div className="p-8">Loading competencies...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-900">
          My Competencies
        </h1>
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
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold text-indigo-700 mb-2">
                {comp.name}
              </h2>

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
                <p className="text-sm text-gray-500 mt-2">
                   {comp.evidence}
                </p>
              )}

              {comp.verifications?.length > 0 && (
                <div className="mt-3 text-xs text-green-700 font-semibold">
                   Verified ({comp.verifications.length})
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Competencies;
