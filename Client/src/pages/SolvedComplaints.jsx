import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import PaginationBar from '../components/PaginationBar';
import usePaginatedComplaints from '../hooks/usePaginatedComplaints';
import useCurrentUserId from '../hooks/useCurrentUserId';

const SolvedComplaints = () => {
  const [page, setPage] = useState(1);
  const currentUserId = useCurrentUserId();
  const { complaints, pagination, loading, refresh } = usePaginatedComplaints('/complaints/public/solved', {
    page,
    limit: 20,
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Solved Complaints</h2>
        <p>Public issues verified by the community after administration marks them resolved.</p>
      </div>

      {loading ? (
        <div>Loading solved complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">No solved public complaints yet.</div>
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

export default SolvedComplaints;
