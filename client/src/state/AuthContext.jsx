// client/src/state/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api.js';
import notify from '../lib/notify.js';

const AuthCtx = createContext(null);

// Show a friendly first name in toasts
const firstName = (name = '', email = '') => {
  const n = (name || email || '').trim();
  return n.split(' ')[0] || n;
};

// Normalize Indian mobile: remove +91/leading 0s, keep last 10
const normalizePhone = (s) => {
  const digits = String(s || '').replace(/\D/g, '');
  let p = digits.replace(/^91(?=\d{10,}$)/, '').replace(/^0+/, '');
  if (p.length > 10) p = p.slice(-10);
  return p;
};
const isValidPhone = (p) => /^\d{10}$/.test(p) && /^[6-9]/.test(p);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try a "silent" session endpoint (200 with user or null). If not present, fall back to /me.
  // const restoreSession = async () => {
  //   // 1) Preferred: /auth/session (always returns 200)
  //   let res = await api.get('/api/auth/session', { validateStatus: () => true }).catch(() => null);
  //   if (!res || res.status === 404) {
  //     // 2) Fallback: /auth/me (401 when logged out) but don't throw
  //     res = await api.get('/api/auth/me', { validateStatus: () => true }).catch(() => null);
  //   }
  //   if (res && res.status === 200) return res.data || null;
  //   return null;
  // };


   // Restore session on load using only /me (remove /session call)
  const restoreSession = async () => {
    try {
      const res = await api.get('/api/auth/me', { 
        validateStatus: () => true,
        withCredentials: true // <--- important for cookie-based auth
      });
      if (res.status === 200) return res.data || null;
      return null;
    } catch {
      return null;
    }
  };

  // Restore session on load without throwing 401 errors
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await restoreSession();
        if (mounted) setUser(u);
      } catch (err) {
        if (mounted) setUser(null);
        // only surface non-401 errors
        if (err?.response?.status && err.response.status !== 401) notify.fromError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await notify.promise(
        api.post('/api/auth/login', { email, password }, {withCredentials: true}),
        { pending: 'Logging in…', success: 'Welcome back!' }
      );
      setUser(data);
      notify.success(`Hi, ${firstName(data?.name, data?.email)} 👋`);
      return data;
    } catch (e) {
      notify.fromError(e);
      throw e;
    }
  };

  // Expect a single object payload: { name, email, phone, password }
  const register = async (payload) => {
    try {
      const clean = {
        name: (payload?.name || '').trim(),
        email: (payload?.email || '').trim().toLowerCase(),
        password: payload?.password || '',
        phone: normalizePhone(payload?.phone),
      };

      if (!clean.name || !clean.email || !clean.password || !clean.phone || !isValidPhone(clean.phone)) {
        notify.error('Please enter valid name, email, 10‑digit phone (no +91/0), and password.');
        throw new Error('client_validation');
      }

      const { data } = await notify.promise(
        api.post('/api/auth/register', clean, { withCredentials: true }),
        { pending: 'Creating your account…', success: 'Account created!' }
      );
      setUser(data);
      notify.success(`Welcome, ${firstName(data?.name, data?.email)} 🎉`);
      return data;
    } catch (e) {
      notify.fromError(e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await notify.promise(api.post('/api/auth/logout', {}, { withCredentials: true }), {
        pending: 'Logging out…',
        success: 'Logged out',
      });
    } catch {
      setUser(null);
    }
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
