const PROD_FALLBACK_API = 'https://learning-management-system-9gdi.onrender.com';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : PROD_FALLBACK_API);
