import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function VerifyOTP() {
  const [params] = useSearchParams();
  const [type, setType] = useState('email'); // email | phone
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const userId = params.get('userId');
  const { verifyOtp } = useAuth();

  const resend = async () => {
    setMsg('Sending...');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, userId })
      });
      const data = await res.json();
      setMsg(data.message || 'OTP sent');
    } catch {
      setMsg('Failed to send OTP');
    }
  };

  const submit = async () => {
    setMsg('Verifying...');
    try {
      await verifyOtp({ type, code, userId });
      navigate('/');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Verify your {type.toUpperCase()}</h1>
      <div className="mb-3 text-sm text-gray-600">Enter the 6-digit code sent to your {type}.</div>

      <div className="mb-3 flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" checked={type==='email'} onChange={() => setType('email')} /> Email
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={type==='phone'} onChange={() => setType('phone')} /> Phone
        </label>
      </div>

      <input className="input mb-3" placeholder="OTP code" value={code} onChange={e => setCode(e.target.value)} />
      <div className="flex gap-2">
        <button className="btn btn-outline" onClick={resend}>Resend OTP</button>
        <button className="btn btn-primary" onClick={submit}>Verify</button>
      </div>

      {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
    </div>
  );
}
