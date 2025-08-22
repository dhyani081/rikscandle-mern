// client/src/lib/api.js
import axios from 'axios';

function cleanBase(u) {
  u = String(u || '').trim();
  if (!u) return '';
  // Handle shortcuts like ":5000" or "localhost:5000" or "5000"
  if (u.startsWith(':')) u = 'http://localhost' + u;
  if (/^\d+$/.test(u)) u = `http://localhost:${u}`;
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  // Strip trailing slash
  u = u.replace(/\/+$/, '');
  // If someone put /api at the end, strip it (our calls already start with /api/…)
  u = u.replace(/\/api$/i, '');
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
});

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('[API] baseURL =', api.defaults.baseURL);
}

export default api;
