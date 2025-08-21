// client/src/pages/admin/AdminProducts.jsx
import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api.js';

const money = (n) => '₹' + Number(n || 0).toFixed(2);

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // product object or null

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await api.get('/api/products?limit=200');
      const list = Array.isArray(data) ? data : (data?.items || []);
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = (Array.isArray(items) ? items : []).filter(p =>
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

  const onDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>Add Product</button>
      </div>

      <div className="mb-4">
        <input
          className="input w-full sm:max-w-md"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading && <div>Loading…</div>}

      {!loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">MRP</th>
                <th className="py-2 pr-3">Stock</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} className="border-b">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                  </td>
                  <td className="py-2 pr-3">{money(p.price)}</td>
                  <td className="py-2 pr-3">{Number(p?.mrp||0) > Number(p?.price||0) ? money(p.mrp) : '-'}</td>
                  <td className="py-2 pr-3">{p.stock ?? '-'}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-outline btn-sm" onClick={() => onDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={5}>No products.</td></tr>
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
    </div>
  );
}

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
    const { data } = await api.post('/api/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
      alert(e?.response?.data?.message || 'Upload failed');
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
      alert(e?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGallery = (idx) => {
    setF(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  };

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
      if (f._id) await api.put(`/api/products/${f._id}`, payload);
      else await api.post('/api/products', payload);
      await onSaved();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

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
                placeholder="https://…"
                value={f.image}
                onChange={e => setF({ ...f, image: e.target.value })}
              />
              <label className="btn btn-outline text-center cursor-pointer">
                {uploadingMain ? 'Uploading…' : 'Choose file'}
                <input ref={mainInputRef} type="file" className="hidden" onChange={pickMain} />
              </label>
            </div>
            {f.image && <img src={f.image} alt="primary" className="mt-2 w-28 h-28 object-cover rounded border" />}
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium">Gallery Images (multiple)</label>
            <div className="flex items-center gap-3">
              <label className="btn btn-outline cursor-pointer">
                {uploadingGallery ? 'Uploading…' : 'Choose files'}
                <input ref={galleryInputRef} type="file" className="hidden" multiple onChange={pickGallery} />
              </label>
              <span className="text-sm text-gray-600">You can also paste external URLs using the field above (Primary) if needed.</span>
            </div>

            {!!(f.images || []).length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {f.images.map((im, i) => (
                  <div key={i} className="relative">
                    <img src={im.url} alt="" className="w-20 h-20 object-cover rounded border" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-sm"
                      onClick={() => removeGallery(i)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
