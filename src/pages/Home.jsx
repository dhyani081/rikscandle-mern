// client/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Hero from '../components/Hero.jsx';

export default function Home() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // top-rated
        const { data } = await api.get('/api/products', { params: { limit: 8, sort: 'rating', order: 'desc' } });
        setItems(data.items || data);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Hero />

      <div id="bestsellers" className="container py-10">
        <h2 className="text-2xl font-semibold mb-4">Best Sellers</h2>
        {loading && <div>Loading...</div>}
        {err && <div className="text-red-600">{err}</div>}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
      </div>
    </>
  );
}
