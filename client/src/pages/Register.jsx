// client/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, phone || undefined);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary w-full">Sign up</button>
      </form>
      <div className="text-sm mt-3">Already have an account? <Link className="link" to="/login">Login</Link></div>
    </div>
  );
}
