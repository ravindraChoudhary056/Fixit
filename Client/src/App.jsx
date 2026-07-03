import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';

import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CreateComplaint from './pages/CreateComplaint';
import PublicComplaints from './pages/PublicComplaints';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import SolvedComplaints from './pages/SolvedComplaints';
import VerificationQueue from './pages/VerificationQueue';
import Forbidden from './pages/Forbidden';

// Why: Students and admins use separate dashboard routes for clearer access control
const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (role !== 'Admin') return <Forbidden />;
  return children;
};

const NavigationWrapper = () => {
  const location = useLocation();
  const hideNavbarRoutes = [
    '/dashboard',
    '/admin/dashboard',
    '/create-complaint',
    '/public-complaints',
    '/my-complaints',
    '/solved-complaints',
    '/verification-queue',
    '/profile',
    '/forbidden',
  ];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return showNavbar ? <Navbar /> : null;
};

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationWrapper />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/forbidden" element={<Forbidden />} />

          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/verification-queue"
            element={
              <StudentRoute>
                <VerificationQueue />
              </StudentRoute>
            }
          />
          <Route path="/create-complaint" element={<CreateComplaint />} />
          <Route path="/public-complaints" element={<PublicComplaints />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/solved-complaints" element={<SolvedComplaints />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
