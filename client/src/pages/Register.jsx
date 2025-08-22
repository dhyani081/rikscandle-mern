// client/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import notify from '../lib/notify.js';

const normalizePhone = (s) => {
  const digits = String(s || '').replace(/\D/g, '');
  // strip +91 and any leading 0s, keep last 10
  let p = digits.replace(/^91(?=\d{10,}$)/, '').replace(/^0+/, '');
  if (p.length > 10) p = p.slice(-10);
  return p;
};
const isValidPhone = (p) => /^\d{10}$/.test(p) && /^[6-9]/.test(p);

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const phone = normalizePhone(phoneRaw);
  const canSubmit =
    name.trim() && email.trim() && isValidPhone(phone) && (password?.length || 0) >= 6;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!isValidPhone(phone)) {
        notify.error('Enter 10‑digit mobile without +91/0 (starts 6–9)');
      } else {
        notify.error('Please fill all fields correctly');
      }
      return;
    }
    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone,
        password,
      });
      navigate('/');
    } catch (e) {
      notify.fromError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>

      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <input
            className="input"
            inputMode="numeric"
            placeholder="10‑digit mobile (no +91/0)"
            value={phoneRaw}
            onChange={(e) => setPhoneRaw(e.target.value)}
          />
          {phoneRaw && !isValidPhone(phone) && (
            <div className="text-xs text-red-600 mt-1">
              Phone must be 10 digits and start with 6–9.
            </div>
          )}
        </div>
        <input
          className="input"
          placeholder="Password (min 6)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-full" disabled={!canSubmit || busy}>
          {busy ? 'Please wait…' : 'Sign up'}
        </button>
      </form>

      <div className="text-sm mt-3">
        Already have an account? <Link className="link" to="/login">Login</Link>
      </div>
    </div>
  );
}
