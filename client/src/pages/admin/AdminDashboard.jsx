// client/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../lib/api.js';

const STATUS = ['Placed', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function IconDownload(props) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 8.293 10.293L10.586 12.586V4a1 1 0 0 1 1-1z"/>
      <path d="M5 20a1 1 0 1 1 0-2h14a1 1 0 1 1 0 2H5z"/>
    </svg>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [prods, setProds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({ name: '', description: '', price: '', mrp: '', countInStock: '', image: '' });
  const [imgPreview, setImgPreview] = useState('');
  const [uploadingCreate, setUploadingCreate] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [editPreview, setEditPreview] = useState('');
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const [orderOpen, setOrderOpen] = useState(false);
  const [orderView, setOrderView] = useState(null);

  const API_BASE = (api?.defaults?.baseURL || '').replace(/\/$/, '');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const p = await api.get('/api/products?limit=100&sort=createdAt&order=desc');
      setProds(p.data.items || p.data);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load admin data');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load orders');
    }
  };
  useEffect(() => { if (tab === 'orders' && orders.length === 0) loadOrders(); }, [tab]);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/api/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (!data?.url) throw new Error('Upload failed');
    return data.url;
  };

  const onCreateFile = async (file) => {
    setUploadingCreate(true);
    try {
      const local = URL.createObjectURL(file);
      setImgPreview(local);
      const url = await uploadImage(file);
      setImgPreview(url);
      setForm(prev => ({ ...prev, image: url }));
    } catch (e) {
      console.error(e); alert('Image upload failed. Try again.');
      setImgPreview(''); setForm(prev => ({ ...prev, image: '' }));
    } finally { setUploadingCreate(false); }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    if (uploadingCreate) return alert('Please wait for image upload to finish');
    if (form.image.startsWith('blob:')) return alert('Invalid image URL. Re-upload the image.');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        mrp: form.mrp !== '' ? Number(form.mrp) : undefined,
        countInStock: Number(form.countInStock || 0),
        image: form.image || undefined,
      };
      await api.post('/api/products', payload);
      setForm({ name: '', description: '', price: '', mrp: '', countInStock: '', image: '' });
      setImgPreview('');
      await load();
      alert('Product created');
    } catch (e) {
      alert(e?.response?.data?.message || 'Create failed');
    }
  };

  const delProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete('/api/products/' + id);
    await load();
  };

  const openEdit = (p) => {
    const img = p.image || (Array.isArray(p.images) ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : '');
    setEdit({
      _id: p._id,
      name: p.name || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      mrp: String(p.mrp ?? ''),
      countInStock: String(p.countInStock ?? ''),
      image: img || '',
    });
    setEditPreview(img || '');
    setEditOpen(true);
  };

  const onEditFile = async (file) => {
    setUploadingEdit(true);
    try {
      const local = URL.createObjectURL(file);
      setEditPreview(local);
      const url = await uploadImage(file);
      setEdit(prev => ({ ...prev, image: url }));
      setEditPreview(url);
    } catch (e) {
      console.error(e); alert('Image upload failed. Try again.');
      setEditPreview(edit?.image || '');
    } finally { setUploadingEdit(false); }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (uploadingEdit) return alert('Please wait for image upload to finish');
    if (edit.image?.startsWith('blob:')) return alert('Invalid image URL. Re-upload the image.');
    try {
      const payload = {
        name: edit.name,
        description: edit.description,
        price: Number(edit.price),
        mrp: edit.mrp !== '' ? Number(edit.mrp) : undefined,
        countInStock: Number(edit.countInStock || 0),
        image: edit.image || undefined,
      };
      await api.put('/api/products/' + edit._id, payload);
      setEditOpen(false);
      await load();
      alert('Product updated');
    } catch (e) {
      alert(e?.response?.data?.message || 'Update failed');
    }
  };

  const updateOrder = async (o, change) => {
    try {
      const payload = { status: change.status ?? o.status, isPaid: change.isPaid ?? o.isPaid };
      const { data } = await api.put('/api/orders/' + o._id, payload);
      setOrders(prev => prev.map(x => (x._id === o._id ? data : x)));
      if (orderOpen && orderView?._id === o._id) setOrderView(data);
    } catch (e) {
      alert(e?.response?.data?.message || 'Update failed');
    }
  };

  const deleteOrder = async (o) => {
    if (!confirm(`Delete order #${String(o._id).slice(-6)}?`)) return;
    try {
      await api.delete('/api/orders/' + o._id);
      setOrders(prev => prev.filter(x => x._id !== o._id));
      if (orderOpen && orderView?._id === o._id) { setOrderOpen(false); setOrderView(null); }
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
    }
  };

  const shortId = (id) => String(id).slice(-6);
  const money = (n) => '₹' + Number(n || 0).toFixed(2);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button type="button" className={`btn ${tab==='products'?'btn-primary':''}`} onClick={() => setTab('products')}>Products</button>
          <button type="button" className={`btn ${tab==='orders'?'btn-primary':''}`} onClick={() => setTab('orders')}>Orders</button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {err && <div className="text-red-600">{err}</div>}

      {tab === 'products' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Create product */}
          <div className="md:col-span-1 card">
            <div className="font-semibold mb-3">Add Product</div>
            <form className="space-y-2" onSubmit={createProduct}>
              <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <textarea className="input" rows="3" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="Sale Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <input className="input" placeholder="MRP (₹)" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
              </div>
              <input className="input" placeholder="Stock" value={form.countInStock} onChange={e => setForm({ ...form, countInStock: e.target.value })} />
              <input className="input" placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onCreateFile(e.target.files[0])} />
                {imgPreview && <img src={imgPreview} alt="" className="w-16 h-16 object-cover rounded border" />}
                {uploadingCreate && <span className="text-xs text-gray-500">Uploading…</span>}
              </div>
              <button className="btn btn-primary w-full" disabled={uploadingCreate}>{uploadingCreate ? 'Uploading…' : 'Create'}</button>
            </form>
          </div>

          {/* Product list */}
          <div className="md:col-span-2 card overflow-x-auto">
            <div className="font-semibold mb-3">Products</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Image</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">MRP</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prods.map(p => {
                  const img = p.image || (Array.isArray(p.images) ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : '');
                  return (
                    <tr key={p._id} className="border-b">
                      <td className="py-2 pr-3">{img ? <img src={img} alt="" className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-gray-100 rounded" />}</td>
                      <td className="py-2 pr-3">{p.name}</td>
                      <td className="py-2 pr-3">₹{Number(p.price || 0).toFixed(0)}</td>
                      <td className="py-2 pr-3">
                        {Number(p.mrp ?? p.price) > Number(p.price || 0)
                          ? <span className="line-through text-gray-400">₹{Number(p.mrp).toFixed(0)}</span>
                          : <span>₹{Number(p.mrp ?? p.price).toFixed(0)}</span>}
                      </td>
                      <td className="py-2 pr-3">{p.countInStock}</td>
                      <td className="py-2 pr-3 flex gap-2">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => delProduct(p._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {!prods.length && <tr><td className="py-2 text-gray-500" colSpan="6">No products</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Orders</div>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadOrders}>Refresh</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Paid</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className="border-b">
                  <td className="py-2 pr-3">#{shortId(o._id)}</td>
                  <td className="py-2 pr-3">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                  <td className="py-2 pr-3">
                    {o.contact?.name || '—'}
                    <br />
                    {o.contact?.email && <span className="text-gray-500">{o.contact.email}</span>}
                    {o.contact?.phone && (<><br /><span className="text-gray-500">{o.contact.phone}</span></>)}
                  </td>
                  <td className="py-2 pr-3">{money(o?.totals?.grandTotal)}</td>
                  <td className="py-2 pr-3">
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={!!o.isPaid} onChange={e => updateOrder(o, { isPaid: e.target.checked })} />
                      <span>{o.isPaid ? 'Yes' : 'No'}</span>
                    </label>
                  </td>
                  <td className="py-2 pr-3">
                    <select className="input" value={o.status} onChange={e => updateOrder(o, { status: e.target.value })}>
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3 flex gap-2">
                    <a
                      className="btn btn-outline btn-sm inline-flex items-center gap-1"
                      href={`${API_BASE}/api/orders/${o._id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                      title="Download invoice"
                    >
                      <IconDownload className="w-4 h-4" />
                    </a>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => { setOrderView(o); setOrderOpen(true); }}>
                      View
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => deleteOrder(o)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!orders.length && <tr><td className="py-2 text-gray-500" colSpan="7">No orders</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editOpen && edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[680px] max-w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-lg">Edit Product</div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditOpen(false)}>Close</button>
            </div>
            <form className="grid grid-cols-2 gap-3" onSubmit={saveEdit}>
              <input className="input col-span-2" placeholder="Name" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
              <textarea className="input col-span-2" rows="3" placeholder="Description" value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} />
              <input className="input" placeholder="Sale Price (₹)" value={edit.price} onChange={e => setEdit({ ...edit, price: e.target.value })} />
              <input className="input" placeholder="MRP (₹)" value={edit.mrp} onChange={e => setEdit({ ...edit, mrp: e.target.value })} />
              <input className="input" placeholder="Stock" value={edit.countInStock} onChange={e => setEdit({ ...edit, countInStock: e.target.value })} />
              <input className="input col-span-2" placeholder="Image URL (optional)" value={edit.image} onChange={e => setEdit({ ...edit, image: e.target.value })} />
              <div className="col-span-2 flex items-center gap-3">
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onEditFile(e.target.files[0])} />
                {editPreview && <img src={editPreview} alt="" className="w-16 h-16 object-cover rounded border" />}
                {uploadingEdit && <span className="text-xs text-gray-500">Uploading…</span>}
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" className="btn btn-outline" onClick={() => setEditOpen(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={uploadingEdit}>{uploadingEdit ? 'Uploading…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {orderOpen && orderView && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[760px] max-w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-lg">Order #{shortId(orderView._id)}</div>
              <div className="flex items-center gap-2">
                <a
                  className="btn btn-outline btn-sm inline-flex items-center gap-2"
                  href={`${API_BASE}/api/orders/${orderView._id}/invoice`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconDownload className="w-4 h-4" />
                  Invoice
                </a>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setOrderOpen(false)}>Close</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <div className="font-medium mb-1">Customer</div>
                <div>{orderView.contact?.name || '—'}</div>
                {orderView.contact?.email && <div className="text-sm text-gray-600">Email: {orderView.contact.email}</div>}
                {orderView.contact?.phone && <div className="text-sm text-gray-600">Phone: {orderView.contact.phone}</div>}
                <div className="mt-2 font-medium">Shipping</div>
                <div className="text-sm">
                  {orderView.shippingAddress?.address}<br/>
                  {[orderView.shippingAddress?.city, orderView.shippingAddress?.state, orderView.shippingAddress?.pin].filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>Payment: {orderView.paymentMethod} {orderView.isPaid ? '(Paid)' : ''}</div>
                  <div>Status: <b>{orderView.status}</b></div>
                </div>
                <div className="mt-2">Total: <b>{money(orderView?.totals?.grandTotal)}</b></div>
                <div className="mt-2 flex gap-2">
                  <select className="input" value={orderView.status} onChange={e => { const s = e.target.value; setOrderView(prev => ({ ...prev, status: s })); updateOrder(orderView, { status: s }); }}>
                    {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label className="inline-flex items-center gap-1">
                    <input type="checkbox" checked={!!orderView.isPaid} onChange={e => { const v = e.target.checked; setOrderView(prev => ({ ...prev, isPaid: v })); updateOrder(orderView, { isPaid: v }); }} />
                    <span>Paid</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-medium mb-1">Items</div>
              <div className="border rounded divide-y">
                {orderView.items?.map((it, idx) => (
                  <div key={idx} className="p-2 flex justify-between">
                    <div>{it.name} × {it.qty}</div>
                    <div>{money(it.price)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn btn-outline" onClick={() => deleteOrder(orderView)}>Delete Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
