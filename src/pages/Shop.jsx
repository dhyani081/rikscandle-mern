// // client/src/pages/Shop.jsx
// import { useEffect, useState } from 'react';
// import api from '../lib/api.js';
// import ProductCard from '../components/ProductCard.jsx';

// export default function Shop() {
//   const [q, setQ] = useState('');
//   const [items, setItems] = useState([]);
//   const [err, setErr] = useState('');
//   const [loading, setLoading] = useState(true);

//   const load = async (query = '') => {
//     setLoading(true);
//     setErr('');
//     try {
//       const { data } = await api.get('/api/products', { params: { search: query } });
//       setItems(data.items || data);
//     } catch (e) {
//       setErr(e?.response?.data?.message || 'Failed to load products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(''); }, []);

//   const onSearch = (e) => {
//     e.preventDefault();
//     load(q.trim());
//   };

//   return (
//     <div className="container py-10">
//       <div className="flex gap-2 mb-6">
//         <form onSubmit={onSearch} className="flex gap-2 w-full">
//           <input className="input flex-1" placeholder="Search candles..." value={q} onChange={e => setQ(e.target.value)} />
//           <button className="btn btn-primary">Search</button>
//         </form>
//       </div>

//       {loading && <div>Loading...</div>}
//       {err && <div className="text-red-600">{err}</div>}

//       <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {items.map(p => <ProductCard key={p._id} p={p} />)}
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [sp, setSp] = useSearchParams();

  const page = Math.max(parseInt(sp.get('page') || '1'), 1);
  const limit = Math.min(Math.max(parseInt(sp.get('limit') || '12'), 1), 60);
  const search = sp.get('q') || '';
  const sort = sp.get('sort') || 'createdAt';
  const order = sp.get('order') || 'desc';

  const [data, setData] = useState({ items: [], page, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const res = await api.get('/api/products', {
        params: { page, limit, search, sort, order },
      });
      const d = res.data;
      const items = Array.isArray(d) ? d : d.items;
      const meta = Array.isArray(d) ? { page, totalPages: 1, totalItems: items.length } : d;
      setData({ ...meta, items: items || [] });
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, limit, search, sort, order]);

  const updateParam = (k, v) => {
    const s = new URLSearchParams(sp);
    s.set(k, v);
    if (k !== 'page') s.set('page', '1');   // filter/sort change -> go to page 1
    setSp(s, { replace: true });
  };

  const goPage = (p) => {
    updateParam('page', String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = useMemo(() => {
    const t = data.totalPages || 1;
    const current = data.page || page;
    const arr = [];
    const maxButtons = 5;
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(t, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [data.totalPages, data.page, page]);

  return (
    <div className="container py-8">
      {/* Filters / Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          className="input flex-1"
          placeholder="Search candles…"
          value={search}
          onChange={(e) => updateParam('q', e.target.value)}
        />
        <select
          className="input w-48"
          value={`${sort}:${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split(':');
            const S = new URLSearchParams(sp);
            S.set('sort', s);
            S.set('order', o);
            S.set('page', '1');
            setSp(S, { replace: true });
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="price:asc">Price: Low → High</option>
          <option value="price:desc">Price: High → Low</option>
          <option value="rating:desc">Top rated</option>
        </select>
        <select
          className="input w-28"
          value={limit}
          onChange={(e) => updateParam('limit', e.target.value)}
        >
          {[8, 12, 16, 24, 32].map((n) => (
            <option key={n} value={n}>{n}/page</option>
          ))}
        </select>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600">{err}</div>}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {data.items.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className="btn btn-outline btn-sm"
            disabled={data.page <= 1}
            onClick={() => goPage(data.page - 1)}
          >
            Prev
          </button>
          {pages.map((n) => (
            <button
              key={n}
              className={`btn btn-sm ${n === data.page ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => goPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="btn btn-outline btn-sm"
            disabled={data.page >= data.totalPages}
            onClick={() => goPage(data.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
