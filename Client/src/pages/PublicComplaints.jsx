import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import PaginationBar from '../components/PaginationBar';
import usePaginatedComplaints from '../hooks/usePaginatedComplaints';
import useCurrentUserId from '../hooks/useCurrentUserId';

const PublicComplaints = () => {
  const [page, setPage] = useState(1);
  const currentUserId = useCurrentUserId();
  const { complaints, pagination, loading, refresh } = usePaginatedComplaints('/complaints/public', {
    page,
    limit: 20,
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Public Complaints</h2>
        <p>View and upvote issues reported by the community.</p>
      </div>

      {loading ? (
        <div>Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">No public complaints found.</div>
      ) : (
        <>
          <div className="complaint-list">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                currentUserId={currentUserId}
                onUpvoteSuccess={refresh}
              />
            ))}
          </div>
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
};

export default PublicComplaints;
