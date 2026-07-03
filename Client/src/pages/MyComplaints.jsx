import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import PaginationBar from '../components/PaginationBar';
import usePaginatedComplaints from '../hooks/usePaginatedComplaints';
import useCurrentUserId from '../hooks/useCurrentUserId';

const MyComplaints = () => {
  const [page, setPage] = useState(1);
  const currentUserId = useCurrentUserId();
  const { complaints, pagination, loading, refresh } = usePaginatedComplaints('/complaints/me', {
    page,
    limit: 20,
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>My Complaints</h2>
        <p>Track the status of issues you have personally reported.</p>
      </div>

      {loading ? (
        <div>Loading your history...</div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">You haven't submitted any complaints yet.</div>
      ) : (
        <>
          <div className="complaint-list">
            {complaints.map((complaint) => (
              <div key={complaint._id} style={{ position: 'relative' }}>
                {complaint.complaintType === 'Private' && (
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
                    Private Note
                  </div>
                )}
                <ComplaintCard
                  complaint={complaint}
                  currentUserId={currentUserId}
                  onUpvoteSuccess={refresh}
                />
              </div>
            ))}
          </div>
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
};

export default MyComplaints;
