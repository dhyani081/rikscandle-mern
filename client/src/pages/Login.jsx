// client/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

export default function Login() {
  // No test/admin autofill — empty by default
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = (typeof useAuth === 'function' ? useAuth() : null) || {};
  const navigate = useNavigate();
  const location = useLocation();
  const from = new URLSearchParams(location.search).get('from') || '/';

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) {
      setErr('Please enter email and password.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/auth/login', { email, password });
      // Try to refresh user in context if function exists
      if (typeof auth.refresh === 'function') await auth.refresh();
      if (typeof auth.refetch === 'function') await auth.refetch();
      navigate(from, { replace: true });
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-14">
      <div className="max-w-md mx-auto card">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        <form onSubmit={onSubmit} autoComplete="off" noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                className="input mt-1"
                type="email"
                name="email"
                inputMode="email"
                autoComplete="off"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                className="input mt-1"
                type="password"
                name="password"
                autoComplete="new-password"  // discourage browser autofill of saved creds
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {err && <div className="text-red-600 text-sm">{err}</div>}

            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </div>
        </form>

        <div className="text-sm text-gray-600 mt-4">
          Don’t have an account?{' '}
          <Link to="/register" className="text-amber-700 underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
