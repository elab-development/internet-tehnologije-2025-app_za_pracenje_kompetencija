import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GuestDashboard from './pages/dashboards/GuestDashboard';
import Competencies from './pages/Competencies';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        {/*pocetna stranica*/}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD + CHILDREN */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="competencies" element={<Competencies />} />
        </Route>

        <Route path="/profile" element={<Profile />} />


        {/* za one koji otvore link za deljenje profila */}
        <Route path="/public-profile/:token" element={<PublicProfile />} />

        <Route path="/guest" element={<GuestDashboard />}>
          <Route path="u/:token" element={<PublicProfile />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
