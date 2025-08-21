// client/src/pages/Shop.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (query = '') => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/api/products', { params: { search: query } });
      setItems(data.items || data);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load(q.trim());
  };

  return (
    <div className="container py-10">
      <div className="flex gap-2 mb-6">
        <form onSubmit={onSearch} className="flex gap-2 w-full">
          <input className="input flex-1" placeholder="Search candles..." value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading && <div>Loading...</div>}
      {err && <div className="text-red-600">{err}</div>}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(p => <ProductCard key={p._id} p={p} />)}
      </div>
    </div>
  );
}
