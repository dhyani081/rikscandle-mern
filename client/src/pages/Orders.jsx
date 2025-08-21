// client/src/pages/Orders.jsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api.js';

const money = (n) => '₹' + Number(n || 0).toFixed(2);
const shortId = (id) => String(id || '').slice(-6);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q] = useSearchParams();
  const highlightId = q.get('o') || localStorage.getItem('rc:lastOrderId') || '';

  const load = async () => {
    setLoading(true); setErr('');
    try {
      // Cache busting + no-cache headers
      const { data } = await api.get('/api/orders/my', {
        params: { t: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const list = Array.isArray(data) ? data : [];
      // sort newest first
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(list);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Tab pe wapas aate hi auto refresh
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Thank-You se aaye latest order ko ek dafa highlight
  useEffect(() => {
    if (highlightId) {
      // 5 sec baad highlight hata do
      const t = setTimeout(() => localStorage.removeItem('rc:lastOrderId'), 5000);
      return () => clearTimeout(t);
    }
  }, [highlightId]);

  const total = (o) => o?.totals?.grandTotal ?? (
    (o?.items || []).reduce((s, it) => s + (Number(it.price)||0)*(Number(it.qty)||0), 0)
  );

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <button className="btn btn-outline btn-sm" onClick={load}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && orders.length === 0 && (
        <div className="card">No orders yet.</div>
      )}

      <div className="grid gap-6">
        {orders.map(o => {
          const isNew = highlightId && String(o._id) === String(highlightId);
          return (
            <div
              key={o._id}
              className={`card ${isNew ? 'ring-2 ring-amber-500' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">
                  Order #{shortId(o._id)} • {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                </div>
                <div className="text-right font-semibold">{money(total(o))}</div>
              </div>

              <div className="text-sm text-gray-600 mt-1">Status: {o.status}{o.isPaid ? ' • Paid' : ''}</div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="border rounded p-3">
                  <div className="font-semibold mb-2">Contact</div>
                  <div>{o?.contact?.name}</div>
                  <div className="text-gray-700">Email: {o?.contact?.email}</div>
                  <div className="text-gray-700">Phone: {o?.contact?.phone}</div>
                </div>

                <div className="border rounded p-3">
                  <div className="font-semibold mb-2">Items</div>
                  <ul className="list-disc list-inside space-y-1">
                    {(o.items || []).map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="truncate mr-4">{it.name} × {it.qty}</span>
                        <span>{money((Number(it.price)||0)*(Number(it.qty)||0))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                {o._id && (
                  <a
                    className="btn btn-outline"
                    href={`${(api?.defaults?.baseURL || '').replace(/\/$/,'')}/api/orders/${o._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="mr-2" aria-hidden>⬇️</span> Download invoice
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
