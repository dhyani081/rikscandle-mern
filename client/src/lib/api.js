// client/src/lib/api.js
import axios from 'axios';

function resolveBaseURL() {
  let u = (import.meta.env.VITE_API_URL || '').trim();

  // Handle common mistakes: ":5000", "localhost:5000", "5000"
  if (!u) u = 'http://localhost:5000';
  if (u.startsWith(':')) u = 'http://localhost' + u;      // ":5000" -> "http://localhost:5000"
  if (/^\d+$/.test(u)) u = `http://localhost:${u}`;        // "5000" -> "http://localhost:5000"
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;         // "localhost:5000" -> "http://localhost:5000"

  return u.replace(/\/+$/, ''); // remove trailing slash
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true, // cookies for auth
});

// Helpful in dev:
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('[API] baseURL =', api.defaults.baseURL);
}

export default api;
