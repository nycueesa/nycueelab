// VITE_API_BASE_URL is the server origin plus any deployment prefix, without /api.
const root = (import.meta.env.VITE_API_BASE_URL || import.meta.env.BASE_URL).replace(/\/+$/, '');
export const API_BASE = `${root}/api`;
