import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminDashboardLayout from '../layouts/AdminDashboardLayout';
import PaginationBar from '../components/PaginationBar';
import api from '../services/api';
import { normalizeListResponse } from '../hooks/usePaginatedComplaints';

const DEFAULT_STATS = [
  { title: 'Total Complaints', count: 0, color: '#3b82f6' },
  { title: 'Pending', count: 0, color: '#eab308' },
  { title: 'In Progress', count: 0, color: '#f97316' },
  { title: 'Pending Verification', count: 0, color: '#8b5cf6' },
  { title: 'Solved', count: 0, color: '#22c55e' },
];

const STATUS_COLORS = {
  Pending: 'var(--status-pending)',
  'In Progress': 'var(--status-progress)',
  'Pending Verification': 'var(--status-verification)',
  Solved: 'var(--status-solved)',
  Verified: 'var(--status-verified)',
};

const ADMIN_STATUS_OPTIONS = ['Pending', 'In Progress', 'Pending Verification'];

const PAGE_SIZE = 20;

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, hasMore: false });
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: statusFilter,
      type: typeFilter,
      sortBy,
      sortOrder,
    }),
    [page, statusFilter, typeFilter, sortBy, sortOrder]
  );

  const buildStatsCards = (statsData) => [
    { title: 'Total Complaints', count: statsData.total ?? 0, color: '#3b82f6' },
    { title: 'Pending', count: statsData.pending ?? 0, color: '#eab308' },
    { title: 'In Progress', count: statsData.inProgress ?? 0, color: '#f97316' },
    { title: 'Pending Verification', count: statsData.pendingVerification ?? 0, color: '#8b5cf6' },
    { title: 'Solved', count: statsData.solved ?? 0, color: '#22c55e' },
  ];

  const fetchAdminData = useCallback(async (silent = false) => {
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/complaints/admin/stats'),
        api.get('/complaints/admin/all', { params: queryParams }),
      ]);

      setStats(buildStatsCards(statsRes.data));

      const { complaints: items, pagination: meta } = normalizeListResponse(complaintsRes.data);
      setComplaints(items);
      setPagination(meta);

      setSelectedComplaint((prev) => {
        if (!prev) return prev;
        const refreshed = items.find((c) => c._id === prev._id);
        return refreshed || prev;
      });
    } catch (err) {
      if (err.response?.status === 403) {
        window.location.href = '/forbidden';
        return;
      }
      console.error('Error fetching admin data:', err);
      if (!silent) {
        setComplaints([]);
        setStats(DEFAULT_STATS);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    const interval = setInterval(() => fetchAdminData(true), 15000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/complaints/admin/${id}/status`, { status: newStatus });

      // How: Patch local state immediately, then refresh stats for accurate counts
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? res.data.complaint : c))
      );

      if (selectedComplaint?._id === id) {
        setSelectedComplaint(res.data.complaint);
      }

      const statsRes = await api.get('/complaints/admin/stats');
      setStats(buildStatsCards(statsRes.data));
      await fetchAdminData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Open the detail modal for the selected complaint.
   * @param {Object} complaint - The complaint object to display.
   */
  const openComplaintDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailOpen(true);
  };

  /**
   * Close the complaint detail modal and clear selection.
   */
  const closeComplaintDetail = () => {
    setSelectedComplaint(null);
    setIsDetailOpen(false);
  };

  const renderStatusSelect = (c) => (
    <select
      value={c.status}
      disabled={updatingId === c._id}
      onChange={(e) => handleStatusChange(c._id, e.target.value)}
      className="form-select"
      style={{ opacity: updatingId === c._id ? 0.6 : 1, cursor: updatingId === c._id ? 'wait' : 'pointer' }}
    >
      {ADMIN_STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
      {(c.status === 'Solved' || c.status === 'Verified') && (
        <option value={c.status}>{c.status}</option>
      )}
    </select>
  );

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div>Loading admin dashboard...</div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="page-header">
        <h2>System Overview</h2>
        <p>Monitor and manage all complaints across the platform.</p>
      </div>

      <div className="bento-grid bento-grid--stats" style={{ marginBottom: 'var(--space-lg)' }}>
        {stats.map((stat, index) => (
          <div key={index} className="card bento-stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            <span style={{ color: 'var(--text-light)', fontSize: '1rem', fontWeight: '500' }}>{stat.title}</span>
            <span className="bento-stat-card__count">{stat.count}</span>
          </div>
        ))}
      </div>

      <div className="card admin-toolbar">
        <div className="admin-toolbar__field">
          <label>Status</label>
          <select value={statusFilter} onChange={handleFilterChange(setStatusFilter)} className="form-select">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Solved">Solved</option>
            <option value="Verified">Verified (legacy)</option>
          </select>
        </div>

        <div className="admin-toolbar__field">
          <label>Type</label>
          <select value={typeFilter} onChange={handleFilterChange(setTypeFilter)} className="form-select">
            <option value="All">All Types</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div className="admin-toolbar__field">
          <label>Sort By</label>
          <select value={sortBy} onChange={handleFilterChange(setSortBy)} className="form-select">
            <option value="date">Date</option>
            <option value="votes">Vote Count</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div className="admin-toolbar__field">
          <label>Order</label>
          <select value={sortOrder} onChange={handleFilterChange(setSortOrder)} className="form-select">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="admin-toolbar__count">
          Showing {complaints.length} of {pagination.total}
        </div>
      </div>

      {/* Desktop/tablet: scrollable table — mobile: stacked cards via CSS media query */}
      <div className="card admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Reported By</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Votes</th>
              <th>Status</th>
              <th>Verified By</th>
              <th>Update</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">No complaints match the current filters.</td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{c.title}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.8rem',
                        backgroundColor: c.complaintType === 'Public' ? '#dbeafe' : '#f3f4f6',
                        color: c.complaintType === 'Public' ? '#1d4ed8' : '#374151',
                      }}
                    >
                      {c.complaintType}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-light)' }}>{c.student?.fullName || '—'}</td>
                  <td style={{ color: 'var(--text-light)' }}>{c.category}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: '600',
                        color: c.priority === 'High' ? '#dc2626' : c.priority === 'Medium' ? '#d97706' : 'var(--text-light)',
                      }}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-dark)', fontWeight: '600' }}>{c.upvotes?.length || 0}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'white',
                        backgroundColor: STATUS_COLORS[c.status] || '#ccc',
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    {c.verifiedBy ? (c.verifiedBy === 'Self' ? 'Self' : c.verifiedBy.split(' (')[0]) : '—'}
                  </td>
                  <td>{renderStatusSelect(c)}</td>
                  <td>
                    <button type="button" onClick={() => openComplaintDetail(c)} className="btn-primary" style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem' }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-cards">
        {complaints.length === 0 ? (
          <div className="card empty-state">No complaints match the current filters.</div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="card">
              <h4 style={{ color: 'var(--primary-brown)', marginBottom: 'var(--space-sm)' }}>{c.title}</h4>
              <div className="admin-mobile-card__row"><span className="admin-mobile-card__label">Type</span><span>{c.complaintType}</span></div>
              <div className="admin-mobile-card__row"><span className="admin-mobile-card__label">Status</span><span>{c.status}</span></div>
              <div className="admin-mobile-card__row"><span className="admin-mobile-card__label">Priority</span><span>{c.priority}</span></div>
              <div className="admin-mobile-card__row"><span className="admin-mobile-card__label">Verified By</span><span>{c.verifiedBy ? (c.verifiedBy === 'Self' ? 'Self' : c.verifiedBy.split(' (')[0]) : '—'}</span></div>
              <div style={{ marginTop: 'var(--space-sm)' }}>{renderStatusSelect(c)}</div>
              <button type="button" onClick={() => openComplaintDetail(c)} className="btn-primary" style={{ width: '100%', marginTop: 'var(--space-sm)' }}>
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      <PaginationBar pagination={pagination} onPageChange={setPage} />

      {isDetailOpen && selectedComplaint && (
        <div className="modal-overlay" onClick={closeComplaintDetail}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-brown)' }}>{selectedComplaint.title}</h3>
                <p style={{ margin: '6px 0 0', color: 'var(--text-light)' }}>{selectedComplaint.category} · {selectedComplaint.priority}</p>
              </div>
              <button
                onClick={closeComplaintDetail}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-light)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <strong style={{ color: 'var(--text-light)' }}>Description</strong>
                <p style={{ margin: '10px 0 0', color: 'var(--text-dark)', lineHeight: '1.7' }}>
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="modal-grid-2">
                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Status</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderStatusSelect(selectedComplaint)}
                  </div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Verified By</strong>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-dark)' }}>
                    {selectedComplaint.verifiedBy
                      ? selectedComplaint.verifiedBy === 'Self'
                        ? 'Self'
                        : selectedComplaint.verifiedBy
                      : '—'}
                  </p>
                </div>
              </div>

              {selectedComplaint.image && (
                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Uploaded Image</strong>
                  <div style={{ marginTop: '10px', overflow: 'hidden', borderRadius: '14px' }}>
                    <img
                      src={`http://localhost:5000${selectedComplaint.image}`}
                      alt="Complaint Evidence"
                      style={{ width: '100%', maxHeight: '360px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Priority</strong>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-dark)' }}>{selectedComplaint.priority}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Type</strong>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-dark)' }}>{selectedComplaint.complaintType}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Reported By</strong>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-dark)' }}>{selectedComplaint.student?.fullName || '—'}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-light)' }}>Location</strong>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-dark)' }}>{selectedComplaint.locationName} · {selectedComplaint.floor}</p>
                </div>
                {selectedComplaint.roomNumber && (
                  <div>
                    <strong style={{ color: 'var(--text-light)' }}>Room Number</strong>
                    <p style={{ margin: '10px 0 0', color: 'var(--text-dark)' }}>{selectedComplaint.roomNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
