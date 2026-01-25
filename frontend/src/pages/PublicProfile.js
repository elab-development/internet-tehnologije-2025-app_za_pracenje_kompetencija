import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/public-profile/${id}`)
      .then(res => setProfile(res.data));
  }, [id]);

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">
        {profile.name} {profile.surname}
      </h1>

      <h2 className="text-xl font-semibold mb-4">Competencies</h2>

      {profile.competencies.map(c => (
        <div key={c.id} className="bg-white p-4 rounded shadow mb-3">
          <strong>{c.name}</strong> – Level {c.level}
        </div>
      ))}
    </div>
  );
};

export default PublicProfile;
