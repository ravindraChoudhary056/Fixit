import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('email', res.data.email);

      alert('Login successful!');

      // Why: Backend assigns Admin role only to ADMIN_EMAIL — redirect accordingly
      if (res.data.isAdmin || res.data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2 style={{ color: 'var(--primary-brown)', textAlign: 'center', marginBottom: '0.625rem' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>Login to your FixIt account</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <input
            type="email"
            name="email"
            placeholder="Institute Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
          />

          <button type="submit" className="btn-primary" style={{ marginTop: '0.625rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;