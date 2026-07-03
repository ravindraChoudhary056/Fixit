import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiPlusCircle, FiList, FiUser, FiLogOut, FiCheckCircle, FiShield, FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Create Complaint', path: '/create-complaint', icon: <FiPlusCircle /> },
    { name: 'Public Complaints', path: '/public-complaints', icon: <FiList /> },
    { name: 'Verification Queue', path: '/verification-queue', icon: <FiShield /> },
    { name: 'My Complaints', path: '/my-complaints', icon: <FiUser /> },
    { name: 'Solved Complaints', path: '/solved-complaints', icon: <FiCheckCircle /> },
    { name: 'Profile', path: '/profile', icon: <FiUser /> },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="dashboard-shell">
      {/* Mobile top bar with hamburger — visible below 768px via CSS media query */}
      <div className="dashboard-topbar">
        <button
          type="button"
          className="dashboard-hamburger"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu />
        </button>
        <span style={{ fontWeight: 600, color: 'var(--primary-brown)' }}>Student Panel</span>
        <div style={{ width: '2.5rem' }} />
      </div>

      <div
        className={`sidebar-backdrop ${mobileOpen ? 'sidebar-backdrop--visible' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside className={`dashboard-sidebar ${mobileOpen ? 'dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-sidebar__brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Student Panel
          {mobileOpen && (
            <button type="button" className="dashboard-hamburger" aria-label="Close menu" onClick={closeMobile}>
              <FiX />
            </button>
          )}
        </div>

        <nav className="dashboard-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={`dashboard-sidebar__link ${isActive(item.path) ? 'dashboard-sidebar__link--active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          <button
            type="button"
            onClick={handleLogout}
            className="btn-outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
};

export default DashboardLayout;
