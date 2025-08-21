import { useEffect, useState } from 'react';
import api from '../../lib/api.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const { data } = await api.get('/api/orders');
    setOrders(data);
  };

  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    await api.put('/api/orders/' + id, { status });
    await load();
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o._id} className="card">
            <div className="flex justify-between">
              <div className="font-medium">#{o._id.slice(-6)} • {o.user?.name}</div>
              <div className="text-amber-700 font-semibold">₹{o.totals?.grandTotal?.toFixed(2)}</div>
            </div>
            <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
            <div className="mt-2 text-sm">{o.items.map(i => <span key={i.product} className="mr-3">{i.name} × {i.qty}</span>)}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <select className="input w-48" value={o.status} onChange={e => update(o._id, e.target.value)}>
                {['Placed','Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
