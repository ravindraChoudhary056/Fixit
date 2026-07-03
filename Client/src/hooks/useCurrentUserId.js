import { useMemo } from 'react';

/** Memoized JWT decode — avoids re-parsing token on every render */
const useCurrentUserId = () =>
  useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }, []);

export default useCurrentUserId;
