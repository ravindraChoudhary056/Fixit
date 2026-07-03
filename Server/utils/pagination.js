/**
 * Parses page/limit query params for list endpoints.
 * Optimized query with pagination — caps limit to prevent oversized payloads.
 */
const parsePagination = (req) => {
  const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(Math.max(rawLimit || 20, 1), 100);
  const skip = isPaginated ? (page - 1) * limit : 0;

  return { page, limit, skip, isPaginated };
};

/**
 * Builds a pagination metadata object for JSON responses.
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
};

/**
 * Sends paginated payload when ?page or ?limit is present; otherwise legacy array.
 * Zero-break: clients without query params receive the same array shape as before.
 */
const sendListResponse = (res, items, total, pagination) => {
  if (pagination.isPaginated) {
    return res.status(200).json({
      complaints: items,
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    });
  }
  return res.status(200).json(items);
};

/**
 * Applies skip/limit only when the client requested pagination.
 */
const applyPagination = (query, pagination) => {
  if (pagination.isPaginated) {
    return query.skip(pagination.skip).limit(pagination.limit);
  }
  return query;
};

module.exports = { parsePagination, buildPaginationMeta, sendListResponse, applyPagination };
