export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://axionix-backend-sage.vercel.app')
).replace(/\/$/, '');
