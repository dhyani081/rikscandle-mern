import { useEffect, useState } from 'react';
import api from '../../lib/api.js';

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    countInStock: '',
    image: '',        // primary cover
    images: [],       // [{ url, publicId }]
    description: ''
  });

  const load = async () => {
    const { data } = await api.get('/api/products?limit=100');
    setItems(data.items);
  };

  useEffect(() => { load(); }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);

    try {
      const { data } = await api.post('/api/uploads', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // data => { url, publicId }
      setForm(prev => {
        const next = { ...prev, images: [...(prev.images || []), data] };
        if (!next.image) next.image = data.url; // set cover if empty
        return next;
      });
    } catch (err) {
      alert(err?.response?.data?.message || 'Upload failed');
    } finally {
      // reset input so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const removeUploaded = async (idx) => {
    const img = form.images[idx];
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

    // Clean Cloudinary (optional but nice)
    if (img?.publicId) {
      try { await api.delete('/api/uploads/' + encodeURIComponent(img.publicId)); }
      catch { /* ignore errors to keep UI snappy */ }
    }

    // If cover was this image, reset cover
    if (form.image === img?.url) {
      setForm(prev => ({ ...prev, image: prev.images?.[0]?.url || '' }));
    }
  };

  const setAsCover = (url) => setForm(prev => ({ ...prev, image: url }));

  const resetForm = () => setForm({
    name: '', price: '', countInStock: '', image: '', images: [], description: ''
  });

  const save = async () => {
    if (!form.name || !form.price) {
      alert('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/products', {
        name: form.name,
        price: Number(form.price),
        countInStock: Number(form.countInStock || 0),
        image: form.image,
        images: form.images, // <<—— important
        description: form.description
      });
      resetForm();
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete('/api/products/' + id);
    await load();
  };

  return (
    <div className="container py-10 grid md:grid-cols-2 gap-6">
      {/* LEFT: List */}
      <div>
        <h1 className="text-xl font-semibold mb-4">Products</h1>
        <div className="space-y-3">
          {items.map(p => (
            <div key={p._id} className="card flex items-center gap-3">
              <img
                src={p.image || p.images?.[0]?.url}
                alt=""
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-sm text-gray-600">
                  ₹{p.price} • Stock {p.countInStock}
                </div>
              </div>
              <button className="btn" onClick={() => removeProduct(p._id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="card">
        <h2 className="font-semibold mb-3">Add Product</h2>
        <div className="space-y-2">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              placeholder="Price (₹)"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <input
              className="input"
              placeholder="Count in stock"
              value={form.countInStock}
              onChange={e => setForm({ ...form, countInStock: e.target.value })}
            />
          </div>

          {/* Upload */}
          <div className="mt-2">
            <label className="block text-sm mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleFile} />
            <p className="text-xs text-gray-500 mt-1">
              JPG/PNG, up to 5 MB. First upload becomes cover automatically.
            </p>
          </div>

          {/* Previews */}
          {!!form.images?.length && (
            <div className="flex gap-2 flex-wrap mt-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img.url}
                    alt=""
                    className={`w-16 h-16 object-cover rounded border ${form.image === img.url ? 'ring-2 ring-amber-600' : ''}`}
                    onClick={() => setAsCover(img.url)}
                    title="Click to set as cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-xs"
                    onClick={() => removeUploaded(idx)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Optional: direct URL fallback */}
          <input
            className="input"
            placeholder="(optional) Image URL"
            value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
          />

          <textarea
            className="input"
            rows="3"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-2">
            <button className="btn btn-primary flex-1" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn flex-1" onClick={resetForm}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
