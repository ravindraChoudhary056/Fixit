import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTool } from 'react-icons/fi'; // Ek mast sa icon FixIt ke liye

const Navbar = () => {
  const navigate = useNavigate();
  // Abhi ke liye hum dummy check kar rahe hain ki token hai ya nahi
  const isAuthenticated = localStorage.getItem('token'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={{ backgroundColor: 'var(--bg-cream)', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
      
      {/* Logo Section */}
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary-brown)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: '700' }}>
        <FiTool style={{ color: 'var(--accent-orange)' }} />
        FixIt
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center', fontWeight: '500' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Home</Link>
        <Link to="/about" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>About</Link>
        <a href="/#features" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Features</a>
        
        {/* Auth Buttons */}
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--primary-brown)', fontWeight: '600' }}>Dashboard</Link>
            <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 16px' }}>Logout</button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/login" className="btn-outline" style={{ padding: '8px 16px', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;