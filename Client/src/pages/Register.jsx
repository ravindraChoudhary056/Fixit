import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // State for OTP flow
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    setLoading(true);
    try {
      // Calling our backend API
      const res = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      alert(res.data.message); // Will say "OTP sent..."
      setIsOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });
      alert('Account verified successfully!');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('email', res.data.email);

      if (res.data.isAdmin || res.data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      } 
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-cream)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <h2 style={{ color: 'var(--primary-brown)', textAlign: 'center', marginBottom: '10px' }}>Create an Account</h2>
        <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: '30px' }}>Join the FixIt community</p>

        {!isOtpSent ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              name="fullName" 
              placeholder="e.g., Ravindra Choudhary" 
              required 
              value={formData.fullName} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="e.g., IIT2024056@iiita.ac.in" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              required 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
              OTP sent to {formData.email} (Check terminal if mail doesn't arrive)
            </div>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              required 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              style={inputStyle} 
            />
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: '600' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

// Reusable styling for inputs
const inputStyle = {
  padding: '12px 15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none',
  width: '100%'
};

export default Register;