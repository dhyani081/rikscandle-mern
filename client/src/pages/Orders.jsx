// client/src/pages/Orders.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api.js';
import notify from '../lib/notify.js';

const money = (n) => '₹' + Number(n || 0).toFixed(2);
const shortId = (id) => String(id || '').slice(-6);
const ORIGIN = (api?.defaults?.baseURL || '').replace(/\/$/, '');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [needLogin, setNeedLogin] = useState(false);
  const [q] = useSearchParams();
  const highlightId = q.get('o') || localStorage.getItem('rc:lastOrderId') || '';

  const abortRef = useRef(null);
  const retryTimer = useRef(null);

  const cleanupTimers = () => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const load = async ({ silent = false } = {}) => {
    cleanupTimers();
    if (!silent) { setLoading(true); }
    setErr('');
    setNeedLogin(false);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Do not throw on non-2xx so we can handle 401 cleanly
      const res = await api.get('/api/orders/my', {
        params: { t: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        validateStatus: () => true,
        signal: controller.signal,
      });

      if (res.status === 200) {
        const list = Array.isArray(res.data) ? res.data : [];
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(list);
      } else if (res.status === 401) {
        // Session expired or not logged in
        setNeedLogin(true);
      } else if (res.status >= 500 || res.status === 0) {
        setErr('Server is waking up or temporary issue. Please try again.');
      } else {
        setErr(res.data?.message || 'Failed to load orders');
      }
    } catch (e) {
      // Network/cold start
      if (e?.code === 'ERR_NETWORK' || e?.message?.includes('Network Error')) {
        setErr('Network issue or server waking up. Please retry.');
        // optional: gentle auto-retry after a short delay
        retryTimer.current = setTimeout(() => load({ silent: true }), 3000);
      } else if (e?.name !== 'CanceledError') {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load orders');
      }
    } finally {
      if (!silent) { setLoading(false); }
    }
  };

  useEffect(() => {
    load();
    return () => cleanupTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when tab is visible again (helps after server cold start)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') load({ silent: true });
    };
    const onFocus = () => load({ silent: true });
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Thank‑you highlight cleanup
  useEffect(() => {
    if (highlightId) {
      const t = setTimeout(() => localStorage.removeItem('rc:lastOrderId'), 5000);
      return () => clearTimeout(t);
    }
  }, [highlightId]);

  const total = (o) =>
    o?.totals?.grandTotal ??
    (o?.items || []).reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  const retryNow = () => {
    notify.info('Retrying…');
    load();
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <button className="btn btn-outline btn-sm" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {loading && <div>Loading…</div>}

      {!loading && needLogin && (
        <div className="card p-4">
          Please{' '}
          <Link className="text-amber-700 underline" to="/login?redirect=/orders">
            login
          </Link>{' '}
          to view your orders.
        </div>
      )}

      {!loading && !needLogin && err && (
        <div className="card p-4 text-red-700">
          <div className="mb-2">{err}</div>
          <button className="btn btn-outline btn-sm" onClick={retryNow}>
            Retry
          </button>
        </div>
      )}

      {!loading && !needLogin && !err && orders.length === 0 && (
        <div className="card p-4">No orders yet.</div>
      )}

      {!loading && !needLogin && !err && orders.length > 0 && (
        <div className="grid gap-6">
          {orders.map((o) => {
            const isNew = highlightId && String(o._id) === String(highlightId);
            return (
              <div key={o._id} className={`card ${isNew ? 'ring-2 ring-amber-500' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold">
                    Order #{shortId(o._id)} •{' '}
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                  </div>
                  <div className="text-right font-semibold">{money(total(o))}</div>
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  Status: {o.status}
                  {o.isPaid ? ' • Paid' : ''}
                </div>

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
                          <span className="truncate mr-4">
                            {it.name} × {it.qty}
                          </span>
                          <span>{money((Number(it.price) || 0) * (Number(it.qty) || 0))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4">
                  {o._id && (
                    <a
                      className="btn btn-outline"
                      href={`${ORIGIN}/api/orders/${o._id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="mr-2" aria-hidden>
                        ⬇️
                      </span>{' '}
                      Download invoice
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
