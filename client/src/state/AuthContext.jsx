// client/src/state/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api.js';
import notify from '../lib/notify.js';

const AuthCtx = createContext(null);

const firstName = (name = '', email = '') => {
  const n = (name || email || '').trim();
  return n.split(' ')[0] || n;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (mounted) setUser(data);
      } catch (err) {
        // 401 = not logged in → ignore quietly
        if (err?.response?.status !== 401) notify.fromError(err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await notify.promise(
        api.post('/api/auth/login', { email, password }),
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

  const register = async (payload) => {
    try {
      const { data } = await notify.promise(
        api.post('/api/auth/register', payload),
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
      await notify.promise(api.post('/api/auth/logout'), {
        pending: 'Logging out…',
        success: 'Logged out',
      });
    } catch {}
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
