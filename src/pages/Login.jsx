// client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import notify from '../lib/notify.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return notify.warning('Email and password required');
    setBusy(true);
    try {
      const u = await login(email, password);
      // If you want admins to go to /admin:
      if (u?.isAdmin) navigate('/admin', { replace: true });
      else navigate(redirect, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="input w-full"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            className="input w-full"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Please wait…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
