
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GuestDashboard from './pages/dashboards/GuestDashboard';
import Competencies from './pages/Competencies';

import PublicProfile from './pages/PublicProfile';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminUserProfile from './pages/AdminUserProfile';



function App() {
  return (
    <Router>

      <Header />

      <Routes>
        {/*pocetna stranica*/}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/users/:id" element={<AdminUserProfile />} />


        {/* DASHBOARD + CHILDREN */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="competencies" element={<Competencies />} />
        </Route>




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
