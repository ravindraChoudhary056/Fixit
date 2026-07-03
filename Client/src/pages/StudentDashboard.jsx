import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import api from '../services/api';
import useCurrentUserId from '../hooks/useCurrentUserId';
import { normalizeListResponse } from '../hooks/usePaginatedComplaints';

const DEFAULT_STATS = [
  { title: 'Total Complaints', count: 0, color: '#3b82f6' },
  { title: 'Pending', count: 0, color: '#eab308' },
  { title: 'In Progress', count: 0, color: '#f97316' },
  { title: 'Solved', count: 0, color: '#22c55e' },
];

const StudentDashboard = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = useCurrentUserId();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/complaints/my-stats'),
        api.get('/complaints/me', { params: { page: 1, limit: 3 } }),
      ]);

      const statsData = statsRes.data;
      setStats([
        { title: 'Total Complaints', count: statsData.total ?? 0, color: '#3b82f6' },
        { title: 'Pending', count: statsData.pending ?? 0, color: '#eab308' },
        { title: 'In Progress', count: statsData.inProgress ?? 0, color: '#f97316' },
        { title: 'Solved', count: statsData.solved ?? 0, color: '#22c55e' },
      ]);

      const { complaints } = normalizeListResponse(complaintsRes.data);
      setRecentComplaints(complaints.slice(0, 3));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStats(DEFAULT_STATS);
      setRecentComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back! Here is a summary of your complaints.</p>
      </div>

      {loading ? (
        <div>Loading dashboard...</div>
      ) : (
        <>
          <div className="bento-grid bento-grid--stats">
            {stats.map((stat, index) => (
              <div key={index} className="card bento-stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
                <span style={{ color: 'var(--text-light)', fontSize: '1rem', fontWeight: '500' }}>{stat.title}</span>
                <span className="bento-stat-card__count">{stat.count}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <h3 style={{ color: 'var(--primary-brown)', marginBottom: 'var(--space-sm)' }}>Recent Activity</h3>
            {recentComplaints.length === 0 ? (
              <div className="card empty-state">No recent complaints found.</div>
            ) : (
              <div className="complaint-list">
                {recentComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint._id}
                    complaint={complaint}
                    currentUserId={currentUserId}
                    onUpvoteSuccess={fetchDashboardData}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
