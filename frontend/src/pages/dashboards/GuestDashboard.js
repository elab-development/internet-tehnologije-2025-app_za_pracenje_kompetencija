import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const GuestDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [link, setLink] = useState(""); //cuva ono sto korisnik kuca u input
  const [error, setError] = useState("");

  const isViewingProfile = location.pathname.startsWith("/guest/u/");

  //iz onoga sto unese izvlaci samo uuid
  const extractUuid = (value) => {
    const v = value.trim();
    if (!v) return null;

    try {
      const url = new URL(v);
      const marker = "/public-profile/";
      if (!url.pathname.includes(marker)) return null;
      return url.pathname.split(marker)[1]?.split("/")[0] || null;
    } catch {
      const marker = "/public-profile/";
      if (v.includes(marker)) return v.split(marker)[1]?.split("/")[0] || null; //ako sadrzi publik-profile izvucem uuid a ako ne onda je to uuid
      return v;
    }
  };

  const handleOpen = (e) => {
    e.preventDefault();
    setError("");
    const uuid = extractUuid(link);

    if (!uuid) {
      setError("Please enter a valid public profile link or UUID.");
      return;
    }
    navigate(`/guest/u/${uuid}`);
  };

  //Ako gleda profil, ne prikazuj search card
  if (isViewingProfile) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-semibold text-center mb-2">
          Open a Public Profile
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Paste a public profile link to view the user profile
        </p>

        <form onSubmit={handleOpen} className="space-y-4">
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="http://127.0.0.1:8000/public-profile/uuid"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition"
          >
            Open profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestDashboard;
