import React from 'react';

const ShareProfile = () => {
  const userId = localStorage.getItem('user_id');
  const link = `http://localhost:3000/public-profile/${userId}`;

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Share your profile</h2>

      <p className="text-gray-600 mb-2">
        Share this link to allow others to view your competencies:
      </p>

      <input
        type="text"
        value={link}
        readOnly
        className="w-full border rounded p-2 mb-4"
      />

      <button
        onClick={() => navigator.clipboard.writeText(link)}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Copy link
      </button>
    </div>
  );
};

export default ShareProfile;
