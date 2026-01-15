import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Competencies from './pages/Competencies';
import Profile from './pages/Profile';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        {/*pocetna stranica*/}
        <Route path="/" element={<Navigate to="/login" />}/>

        {/* auth */}
        <Route path="/login" element={<Login /> }/>
        <Route path="/register" element={<Register />} />

        
        {/* ostale stranice (kasnije će biti zaštićene) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/competencies" element={<Competencies />} />
        <Route path="/profile" element={<Profile />} />
     
      </Routes>
    </Router>
  );
}

export default App;
