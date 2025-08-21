import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api.js';
import notify from '../../lib/notify.js';

// ------------ helpers ------------
const money = (n) => '₹' + Number(n || 0).toFixed(2);
const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const ORIGIN = (api.defaults.baseURL || '').replace(/\/$/, '');
const absUrl = (u) => {
  if (!u) return '';
  u = String(u).trim().replace(/\\/g, '/');
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return ORIGIN + u;
  return ORIGIN + '/' + u;
};

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#9ca3af">No Image</text></svg>`
  );

// =================================

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showOrder, setShowOrder] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/api/products?limit=200'),
        api.get('/api/orders'),
      ]);
      const pList = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.items || []);
      const oList = Array.isArray(oRes.data) ? oRes.data : (oRes.data?.items || []);
      setProducts(pList);
      setOrders(oList);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load admin data');
      notify.fromError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = (Array.isArray(products) ? products : []).filter(p =>
    String(p?.name || '').toLowerCase().includes(q.toLowerCase())
  );

  const openCreate = () => {
    setEditing({
      _id: null,
      name: '',
      description: '',
      price: 0,
      mrp: 0,
      stock: 10,
      image: '',
      images: [],
    });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing({
      _id: p._id,
      name: p.name || '',
      description: p.description || '',
      price: Number(p.price || 0),
      mrp: Number(p.mrp || 0),
      stock: Number(p.stock ?? 0),
      image: p.image || '',
      images: Array.isArray(p.images) ? p.images : [],
    });
    setShowForm(true);
  };

  const onDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await notify.promise(api.delete(`/api/products/${id}`), {
        pending: 'Deleting product…',
        success: 'Product deleted',
      });
      await load();
    } catch (e) {
      notify.fromError(e);
    }
  };

  const updateOrder = async (o, changes) => {
    try {
      await notify.promise(api.put(`/api/orders/${o._id}`, changes), {
        pending: 'Updating order…',
        success: 'Order updated',
      });
      await load();
      if (activeOrder && activeOrder._id === o._id) {
        setActiveOrder({ ...activeOrder, ...changes });
      }
    } catch (e) {
      notify.fromError(e);
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await notify.promise(api.delete(`/api/orders/${id}`), {
        pending: 'Deleting order…',
        success: 'Order deleted',
      });
      setShowOrder(false);
      setActiveOrder(null);
      await load();
    } catch (e) {
      notify.fromError(e);
    }
  };

  const openOrder = async (o) => {
    try {
      const { data } = await api.get(`/api/orders/${o._id}`);
      setActiveOrder(data || o);
    } catch {
      setActiveOrder(o);
    }
    setShowOrder(true);
  };

  const markDelivered = (o) => updateOrder(o, { status: 'Delivered', isPaid: true });

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <button className={`btn ${tab==='products' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('products')}>Products</button>
        <button className={`btn ${tab==='orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('orders')}>Orders</button>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-outline" onClick={load}>Refresh</button>
          {tab==='products' && <button className="btn btn-primary" onClick={openCreate}>Add Product</button>}
        </div>
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading && <div>Loading…</div>}

      {/* PRODUCTS TAB */}
      {!loading && tab==='products' && (
        <>
          <div className="mb-4">
            <input
              className="input w-full sm:max-w-md"
              placeholder="Search product by name…"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
            />
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Image</th>
                  <th className="py-2 pr-3">Details</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">MRP</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const img = absUrl(p.image || p.images?.[0]?.url) || PLACEHOLDER;
                  return (
                    <tr key={p._id} className="border-b">
                      <td className="py-2 pr-3">
                        <img
                          src={img}
                          className="w-14 h-14 rounded border object-cover bg-white"
                          alt=""
                          onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{p.description}</div>
                      </td>
                      <td className="py-2 pr-3">{money(p.price)}</td>
                      <td className="py-2 pr-3">{Number(p?.mrp||0) > Number(p?.price||0) ? money(p.mrp) : '-'}</td>
                      <td className="py-2 pr-3">{p.stock ?? '-'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-outline btn-sm" onClick={() => onDeleteProduct(p._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td className="py-3 text-gray-500" colSpan={6}>No products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ORDERS TAB */}
      {!loading && tab==='orders' && (
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
                        {(o.items||[]).slice(0,2).map((it,i)=><li key={i}>{it.name} × {it.qty}</li>)}
                        {(o.items||[]).length > 2 && <li>+{(o.items||[]).length - 2} more</li>}
                      </ul>
                    </td>
                    <td className="py-2 pr-3">{money(total)}</td>
                    <td className="py-2 pr-3">
                      <select className="input" value={o.status} onChange={e => updateOrder(o, { status: e.target.value })}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input type="checkbox" checked={!!o.isPaid} onChange={e => updateOrder(o, { isPaid: e.target.checked })} />
                    </td>
                    <td className="py-2 pr-3 flex flex-wrap gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => openOrder(o)}>View</button>
                      <a
                        className="btn btn-outline btn-sm"
                        href={`${ORIGIN}/api/orders/${o._id}/invoice`}
                        target="_blank" rel="noreferrer"
                      >
                        Invoice
                      </a>
                      {o.status !== 'Delivered' && (
                        <button className="btn btn-primary btn-sm" onClick={() => markDelivered(o)}>
                          Mark Delivered
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => deleteOrder(o._id)}>
                        Delete
                      </button>
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

      {showForm && (
        <ProductForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={async () => { setShowForm(false); setEditing(null); await load(); }}
        />
      )}

      {showOrder && activeOrder && (
        <OrderDetailModal
          order={activeOrder}
          onClose={()=>{ setShowOrder(false); setActiveOrder(null); }}
          onUpdate={(changes)=>updateOrder(activeOrder, changes)}
          onDelete={()=>deleteOrder(activeOrder._id)}
        />
      )}
    </div>
  );
}

// --------------------- Product Form ---------------------
function ProductForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const uploadOne = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const req = api.post('/api/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    const { data } = await notify.promise(req, { pending: 'Uploading…', success: 'Uploaded' });
    return data?.url || data?.secure_url || data?.path || '';
  };

  const pickMain = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingMain(true);
      const url = await uploadOne(file);
      if (url) setF(prev => ({ ...prev, image: url }));
    } catch (e) {
      notify.fromError(e);
    } finally {
      setUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  const pickGallery = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setUploadingGallery(true);
      const urls = [];
      for (const file of files) {
        const url = await uploadOne(file);
        if (url) urls.push({ url });
      }
      setF(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch (e) {
      notify.fromError(e);
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGallery = (idx) =>
    setF(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: f.name,
        description: f.description,
        price: Number(f.price || 0),
        mrp: Number(f.mrp || 0),
        stock: Number(f.stock ?? 0),
        image: f.image || '',
        images: Array.isArray(f.images) ? f.images : [],
      };
      if (f._id) {
        await notify.promise(api.put(`/api/products/${f._id}`, payload), {
          pending: 'Saving product…',
          success: 'Product updated',
        });
      } else {
        await notify.promise(api.post('/api/products', payload), {
          pending: 'Creating product…',
          success: 'Product created',
        });
      }
      await onSaved();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSaving(false);
    }
  };

  const mainPreview = absUrl(f.image) || PLACEHOLDER;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow w-full max-w-3xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">{f._id ? 'Edit Product' : 'Add Product'}</div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>

        <form className="p-4 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="input w-full" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="input w-full"
              rows={3}
              value={f.description}
              onChange={e => setF({ ...f, description: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Price (₹)</label>
              <input type="number" className="input w-full" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium">MRP (optional)</label>
              <input type="number" className="input w-full" value={f.mrp} onChange={e => setF({ ...f, mrp: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input type="number" className="input w-full" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} />
            </div>
          </div>

          {/* Primary Image */}
          <div>
            <label className="block text-sm font-medium">Primary Image URL</label>
            <div className="grid sm:grid-cols-3 gap-3 items-center">
              <input
                className="input sm:col-span-2"
                placeholder="https://… or /uploads/…"
                value={f.image}
                onChange={e => setF({ ...f, image: e.target.value })}
              />
              <label className="btn btn-outline text-center cursor-pointer">
                {uploadingMain ? 'Uploading…' : 'Choose file'}
                <input ref={mainInputRef} type="file" className="hidden" onChange={pickMain} />
              </label>
            </div>
            <img
              src={mainPreview}
              alt="primary"
              className="mt-2 w-28 h-28 object-cover rounded border"
              onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
            />
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium">Gallery Images (multiple)</label>
            <label className="btn btn-outline cursor-pointer">
              {uploadingGallery ? 'Uploading…' : 'Choose files'}
              <input ref={galleryInputRef} type="file" className="hidden" multiple onChange={pickGallery} />
            </label>

            {!!(f.images || []).length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {f.images.map((im, i) => {
                  const src = absUrl(im.url) || PLACEHOLDER;
                  return (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt=""
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-sm"
                        onClick={() => removeGallery(i)}
                        title="Remove"
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving}>{f._id ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------- Order Detail Modal -------------------
function OrderDetailModal({ order, onClose, onUpdate, onDelete }) {
  const total = order?.totals?.grandTotal ??
    (order.items || []).reduce((s, it) => s + (Number(it.price)||0)*(Number(it.qty)||0), 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow w-full max-w-4xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Order #{String(order._id).slice(-6)}</div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-6">
          <div className="card p-3">
            <div className="font-medium mb-1">Customer</div>
            <div>{order?.contact?.name}</div>
            <div className="text-sm text-gray-600">{order?.contact?.email}</div>
            <div className="text-sm text-gray-600">{order?.contact?.phone}</div>
          </div>

          <div className="card p-3">
            <div className="font-medium mb-1">Payment</div>
            <div>Method: <span className="font-medium">{order?.paymentMethod || 'COD'}</span></div>
            <div>Status: <span className="font-medium">{order?.status}</span></div>
            <div className="mt-2 border-t pt-2">Total: <span className="font-semibold">{money(total)}</span></div>
          </div>

          <div className="md:col-span-2 card p-3">
            <div className="font-medium mb-2">Items</div>
            <div className="space-y-2">
              {(order.items || []).map((it, i) => {
                const src = absUrl(it.image) || PLACEHOLDER;
                return (
                  <div key={i} className="flex items-center gap-3 border rounded p-2">
                    <img
                      src={src}
                      alt=""
                      className="w-14 h-14 object-cover rounded border bg-white"
                      onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-600">Qty {it.qty}</div>
                    </div>
                    <div className="font-medium">{money(Number(it.price) * Number(it.qty))}</div>
                  </div>
                );
              })}
              {(order.items||[]).length === 0 && <div className="text-gray-600">No items.</div>}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-gray-600">Status</label>
              <select className="input" value={order.status} onChange={(e)=>onUpdate({ status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="ml-4 text-sm text-gray-600">Paid</label>
              <input type="checkbox" checked={!!order.isPaid} onChange={(e)=>onUpdate({ isPaid: e.target.checked })} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-between">
          <a
            className="btn btn-outline"
            href={`${ORIGIN}/api/orders/${order._id}/invoice`}
            target="_blank" rel="noreferrer"
          >
            Download Invoice
          </a>
          <div className="flex gap-2">
            {order.status !== 'Delivered' && (
              <button className="btn btn-primary" onClick={()=>onUpdate({ status: 'Delivered', isPaid: true })}>
                Mark Delivered
              </button>
            )}
            <button className="btn btn-outline" onClick={onDelete}>Delete Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}
