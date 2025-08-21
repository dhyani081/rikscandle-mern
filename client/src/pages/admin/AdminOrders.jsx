// client/src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from 'react';
import api from '../../lib/api.js';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const money = (n) => '₹' + Number(n || 0).toFixed(2);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await api.get('/api/orders');
      setOrders(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (o, changes) => {
    try {
      await api.put(`/api/orders/${o._id}`, changes);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update order');
    }
  };

  const markDelivered = (o) => update(o, { status: 'Delivered', isPaid: true });

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <button className="btn btn-outline" onClick={load}>Refresh</button>
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading && <div>Loading…</div>}

      {!loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Items</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Paid</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map(o => {
                const total = o?.totals?.grandTotal ??
                  (o.items || []).reduce((s, it) => s + (Number(it.price)||0)*(Number(it.qty)||0), 0);
                return (
                  <tr key={o._id} className="border-b align-top">
                    <td className="py-2 pr-3">
                      <div className="font-medium">#{String(o._id).slice(-6)}</div>
                      <div className="text-xs text-gray-600">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div>{o?.contact?.name}</div>
                      <div className="text-xs text-gray-600">{o?.contact?.email} • {o?.contact?.phone}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <ul className="list-disc list-inside">
                        {(o.items||[]).map((it,i)=><li key={i}>{it.name} × {it.qty}</li>)}
                      </ul>
                    </td>
                    <td className="py-2 pr-3">{money(total)}</td>
                    <td className="py-2 pr-3">
                      <select className="input" value={o.status} onChange={e => update(o, { status: e.target.value })}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input type="checkbox" checked={!!o.isPaid} onChange={e => update(o, { isPaid: e.target.checked })} />
                    </td>
                    <td className="py-2 pr-3 flex items-center gap-2">
                      <a
                        className="btn btn-outline btn-sm"
                        href={`${(api.defaults.baseURL||'').replace(/\/$/,'')}/api/orders/${o._id}/invoice`}
                        target="_blank" rel="noreferrer"
                      >
                        Invoice
                      </a>
                      {o.status !== 'Delivered' && (
                        <button className="btn btn-primary btn-sm" onClick={() => markDelivered(o)}>Mark Delivered</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(orders || []).length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={7}>No orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
