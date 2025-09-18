import { useState } from 'react';

export default function Support() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', orderId: '' });
  const [msg, setMsg] = useState('');

  const submit = async () => {
    setMsg('Sending...');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) setMsg('Thanks! Ticket created: ' + data.ticketId);
      else setMsg(data.message || 'Failed');
    } catch {
      setMsg('Failed');
    }
  };

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Customer Support</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Related Order ID (optional)" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} />
        <textarea className="input md:col-span-2" rows="5" placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
      </div>
      <button className="btn btn-primary mt-3" onClick={submit}>Submit</button>
      {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
    </div>
  );
}
