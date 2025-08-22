// client/src/lib/api.js
import axios from 'axios';
import notify from './notify.js';

function cleanBase(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (u.startsWith(':')) u = 'http://localhost' + u;
  if (/^\d+$/.test(u)) u = `http://localhost:${u}`;
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  u = u.replace(/\/+$/, '');     // strip trailing slash
  u = u.replace(/\/api$/i, '');  // if someone appended /api by mistake
  return u;
}
function resolveBaseURL() {
  let u = cleanBase(import.meta.env.VITE_API_URL || '');
  if (!u) u = 'http://localhost:5000';
  return u;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
  timeout: 45000, // better UX on Render cold starts
});

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('[API] baseURL =', api.defaults.baseURL);
}

// ---- Global response handling ----
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = (err?.config?.url || '').toString();

    // Network/cold start hint
    if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || status === 0) {
      notify.info('Waking server or network issue. Please try again in a moment.');
      return Promise.reject(err);
    }

    // Silent endpoints to ignore 401 (if you use /auth/session)
    const isSilentAuth = /\/api\/auth\/(session|me|login|register)$/.test(url);

    if (status === 401 && !isSilentAuth) {
      // Clear session UI and nudge user to login
      notify.info('Your session has ended. Please log in again.');
      const loc = window.location;
      const current = loc.pathname + loc.search;
      if (!/\/login/.test(loc.pathname)) {
        loc.href = `/login?redirect=${encodeURIComponent(current)}`;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
