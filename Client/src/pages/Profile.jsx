import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboardLayout from '../layouts/AdminDashboardLayout';
import api from '../services/api';

const inputStyle = {
  padding: '12px 15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none',
  width: '100%',
};

const Profile = () => {
  const isAdmin = localStorage.getItem('role') === 'Admin';
  const Layout = isAdmin ? AdminDashboardLayout : DashboardLayout;

  const [profile, setProfile] = useState({ fullName: '', email: '', role: '' });
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Why: Always fetch fresh profile from backend instead of unreliable localStorage
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
      setFullName(res.data.fullName);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // How: Client-side validation mirrors backend rules for immediate feedback
    const isChangingPassword = newPassword || confirmPassword || currentPassword;

    if (isChangingPassword) {
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to change your password' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { fullName: fullName.trim() };

      if (isChangingPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);

      setProfile(res.data.user);
      setFullName(res.data.user.fullName);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: res.data.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary-brown)', marginBottom: '5px' }}>My Profile</h2>
        <p style={{ color: 'var(--text-light)' }}>Update your account details and password.</p>
      </div>

      {/* Why: Show read-only account info so users know which account they are editing */}
      <div className="card" style={{ marginBottom: '25px', maxWidth: '600px' }}>
        <p style={{ marginBottom: '8px' }}>
          <strong style={{ color: 'var(--primary-brown)' }}>Email:</strong>{' '}
          <span style={{ color: 'var(--text-dark)' }}>{profile.email}</span>
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong style={{ color: 'var(--primary-brown)' }}>Role:</strong>{' '}
          <span style={{ color: 'var(--text-dark)' }}>{profile.role}</span>
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {message.text && (
          <div
            style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '0.9rem',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
            Leave password fields blank if you only want to update your name.
          </p>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required only when changing password"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
