import React from 'react';

const PaginationBar = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, hasMore } = pagination;

  return (
    <div className="pagination-bar">
      <button
        type="button"
        className="btn-outline pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages} ({total} total)
      </span>
      <button
        type="button"
        className="btn-outline pagination-btn"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationBar;
