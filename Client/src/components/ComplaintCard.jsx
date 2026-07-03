import React from 'react';
import { FiThumbsUp, FiMapPin, FiTag, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../services/api';

const ComplaintCard = ({ complaint, currentUserId, onUpvoteSuccess, verificationActions }) => {
  
  const handleUpvote = async () => {
    try {
      await api.put(`/complaints/${complaint._id}/upvote`);
      onUpvoteSuccess(); // Refresh list after upvote
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const hasUpvoted = complaint.upvotes?.includes(currentUserId);
  
  // Status colors based on CSS variables
  const statusColors = {
    'Pending': 'var(--status-pending)',
    'In Progress': 'var(--status-progress)',
    'Pending Verification': 'var(--status-verification)',
    'Solved': 'var(--status-solved)',
    'Verified': 'var(--status-verified)', // legacy
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
      
      {/* Header: Title & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ color: 'var(--primary-brown)', margin: 0, fontSize: '1.2rem', paddingRight: '15px' }}>
          {complaint.title}
        </h3>
        <span style={{ 
          backgroundColor: statusColors[complaint.status] || '#ccc', 
          color: 'white', 
          padding: '4px 10px', 
          borderRadius: '20px', 
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {complaint.status}
        </span>
      </div>

      {/* Meta Info */}
      <div style={{ display: 'flex', gap: '15px', color: 'var(--text-light)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiMapPin /> {complaint.locationName} ({complaint.floor})
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiTag /> {complaint.category}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiClock /> {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
        <span style={{ color: complaint.priority === 'High' ? 'red' : 'inherit', fontWeight: '600' }}>
          Priority: {complaint.priority}
        </span>
      </div>

      {/* Description */}
      <p style={{ color: 'var(--text-dark)', fontSize: '0.95rem', lineHeight: '1.5' }}>
        {complaint.description}
      </p>

      {/* Optional Image */}
      {complaint.image && (
        <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginTop: '5px' }}>
          <img 
            src={`http://localhost:5000${complaint.image}`} 
            alt="Complaint Evidence" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Footer: Author, verifier info, upvote / verification actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '15px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
          Reported by: <strong>{complaint.student?.fullName || 'Student'}</strong>
          {complaint.verifiedBy && (
            <span style={{ display: 'block', marginTop: '4px', color: 'var(--status-solved)', fontWeight: '600' }}>
              Verified by: {complaint.verifiedBy === 'Self' ? 'Self' : complaint.verifiedBy.split(' (')[0]}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Peer-verification actions — only rendered when student is eligible */}
          {verificationActions && (
            <>
              <button
                onClick={verificationActions.onVerify}
                disabled={verificationActions.loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '20px', border: 'none',
                  backgroundColor: 'var(--status-solved)', color: 'white',
                  cursor: verificationActions.loading ? 'wait' : 'pointer',
                  fontWeight: '600', opacity: verificationActions.loading ? 0.7 : 1,
                }}
              >
                <FiCheckCircle /> {verificationActions.verifyLabel || 'Verify'}
              </button>
              <button
                onClick={verificationActions.onCancel}
                disabled={verificationActions.loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '20px',
                  border: '1px solid #dc2626', backgroundColor: 'transparent',
                  color: '#dc2626',
                  cursor: verificationActions.loading ? 'wait' : 'pointer',
                  fontWeight: '600', opacity: verificationActions.loading ? 0.7 : 1,
                }}
              >
                <FiXCircle /> Cancel
              </button>
            </>
          )}

          {complaint.complaintType === 'Public' && !verificationActions && (
            <button 
              onClick={handleUpvote}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', borderRadius: '20px',
                border: hasUpvoted ? '1px solid var(--accent-orange)' : '1px solid #ccc',
                backgroundColor: hasUpvoted ? '#FFF3EB' : 'transparent',
                color: hasUpvoted ? 'var(--accent-orange)' : 'var(--text-light)',
                cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: '600'
              }}
            >
              <FiThumbsUp /> {complaint.upvotes?.length || 0} Upvotes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;