import React, { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import PaginationBar from '../components/PaginationBar';
import usePaginatedComplaints from '../hooks/usePaginatedComplaints';
import useCurrentUserId from '../hooks/useCurrentUserId';
import api from '../services/api';

/**
 * Peer-verification queue: complaints marked "Pending Verification" by admin.
 * Public complaints — any student may verify. Private — only the owner may verify.
 */
const VerificationQueue = () => {
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);
  const currentUserId = useCurrentUserId();
  const { complaints, pagination, loading, refresh } = usePaginatedComplaints('/complaints/verification-queue', {
    page,
    limit: 20,
  });

  const canActOnComplaint = useMemo(
    () => (complaint) => {
      if (complaint.complaintType === 'Public') return true;
      const ownerId = complaint.student?._id || complaint.student;
      return ownerId?.toString() === currentUserId;
    },
    [currentUserId]
  );

  const handleVerify = async (id) => {
    setActionId(id);
    try {
      await api.put(`/complaints/${id}/verify`);
      await refresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify complaint');
    } finally {
      setActionId(null);
    }
  };

  const handleCancelVerification = async (id) => {
    setActionId(id);
    try {
      await api.put(`/complaints/${id}/cancel-verification`);
      await refresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel verification');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Verification Queue</h2>
        <p>
          Confirm fixes reported by administration. Public issues can be verified by any student;
          private issues only by the original reporter.
        </p>
      </div>

      {loading ? (
        <div>Loading verification queue...</div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">No complaints awaiting verification.</div>
      ) : (
        <>
          <div className="complaint-list">
            {complaints.map((complaint) => {
              const canAct = canActOnComplaint(complaint);
              const isPrivate = complaint.complaintType === 'Private';

              return (
                <div key={complaint._id} style={{ position: 'relative' }}>
                  {isPrivate && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-0.625rem',
                        right: '-0.625rem',
                        backgroundColor: '#374151',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      Private — Owner Only
                    </div>
                  )}

                  <ComplaintCard
                    complaint={complaint}
                    currentUserId={currentUserId}
                    onUpvoteSuccess={refresh}
                    verificationActions={
                      canAct
                        ? {
                            onVerify: () => handleVerify(complaint._id),
                            onCancel: () => handleCancelVerification(complaint._id),
                            loading: actionId === complaint._id,
                            verifyLabel: isPrivate ? 'Verify (Self)' : 'Verify',
                          }
                        : null
                    }
                  />

                  {!canAct && isPrivate && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      Only the original reporter can verify this private complaint.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
};

export default VerificationQueue;
