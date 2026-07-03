import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';

/**
 * Normalizes paginated API responses.
 * Zero-break: plain arrays from legacy calls are wrapped automatically.
 */
export const normalizeListResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      complaints: data,
      pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1, hasMore: false },
    };
  }
  return {
    complaints: Array.isArray(data?.complaints) ? data.complaints : [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1, hasMore: false },
  };
};

/**
 * Memoized paginated fetch hook — avoids redundant API calls via stable deps + abort.
 * Optimized state: only re-fetches when endpoint, page, or serialized params change.
 */
const usePaginatedComplaints = (endpoint, { page = 1, limit = 20, params = {}, enabled = true } = {}) => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 1, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchData = useCallback(async (silent = false) => {
    if (!enabled) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) setLoading(true);
    setError(null);

    try {
      const res = await api.get(endpoint, {
        params: { page, limit, ...params },
        signal: controller.signal,
      });
      const { complaints: items, pagination: meta } = normalizeListResponse(res.data);
      setComplaints(items);
      setPagination(meta);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err);
      setComplaints([]);
    } finally {
      if (!controller.signal.aborted && !silent) setLoading(false);
    }
  }, [endpoint, page, limit, paramsKey, enabled]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { complaints, pagination, loading, error, refresh, setComplaints };
};

export default usePaginatedComplaints;
