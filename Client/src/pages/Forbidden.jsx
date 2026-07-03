import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-cream)',
      }}
    >
      <div className="card" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-brown)', fontSize: '3rem', marginBottom: '10px' }}>403</h1>
        <h2 style={{ color: 'var(--text-dark)', marginBottom: '12px' }}>Access Forbidden</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
          You do not have permission to access the admin dashboard.
        </p>
        <Link
          to="/dashboard"
          className="btn-primary"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          Go to Student Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
