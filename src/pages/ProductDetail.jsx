import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import notify from '../lib/notify.js';

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
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#9ca3af">No Image</text></svg>`
  );

const Stars = ({ value = 0 }) => {
  const full = Math.round(Number(value || 0));
  return (
    <div className="flex gap-1 text-amber-600">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= full ? '★' : '☆'}</span>
      ))}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const cart = (typeof useCart === 'function' ? useCart() : {});
  const add = cart?.add || (() => {});
  const { user } = (typeof useAuth === 'function' ? useAuth() : {});

  const load = async () => {
    const { data } = await api.get('/api/products/' + id);
    setP(data);
    setMainIndex(0);
  };

  useEffect(() => { load(); }, [id]);

  const imageUrls = useMemo(() => {
    if (!p) return [];
    const raw = [];
    if (p.image) raw.push(p.image);
    if (Array.isArray(p.images)) {
      for (const im of p.images) raw.push(im?.url || im);
    }
    const uniq = [...new Set(raw.filter(Boolean))];
    return uniq.map(absUrl);
  }, [p]);

  const mainSrc = imageUrls[mainIndex] || PLACEHOLDER;
  const showMrp = Number(p?.mrp || 0) > Number(p?.price || 0);
  const reviewsCount = p?.numReviews || (Array.isArray(p?.reviews) ? p.reviews.length : 0);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await notify.promise(api.post(`/api/products/${id}/reviews`, { rating, comment }), {
        pending: 'Posting review…',
        success: 'Review submitted',
      });
      setRating(5); setComment('');
      await load();
    } catch (er) {
      notify.fromError(er);
    }
  };

  if (!p) return <div className="container py-10">Loading…</div>;

  return (
    <div className="container py-10 space-y-10">
      {/* images + details */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-6">
          <div className="flex gap-3">
            <div className="hidden md:flex flex-col gap-2 w-20 max-h-[520px] overflow-y-auto">
              {imageUrls.map((u, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setMainIndex(i)}
                  className={`border rounded overflow-hidden w-20 h-20 bg-white ${i === mainIndex ? 'ring-2 ring-amber-600' : ''}`}
                  title={`Image ${i + 1}`}
                >
                  <img
                    src={u}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
            <div className="flex-1 border rounded bg-white flex items-center justify-center group">
              <img
                src={mainSrc}
                alt={p.name}
                className="max-h-[520px] object-contain transition-transform duration-200 group-hover:scale-[1.05]"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
              />
            </div>
          </div>
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto">
            {imageUrls.map((u, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setMainIndex(i)}
                className={`border rounded overflow-hidden w-20 h-20 bg-white ${i === mainIndex ? 'ring-2 ring-amber-600' : ''}`}
                title={`Image ${i + 1}`}
              >
                <img
                  src={u}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 space-y-4">
          <h1 className="text-2xl font-semibold">{p.name}</h1>

          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">₹{Number(p.price || 0).toFixed(2)}</div>
            {showMrp && (
              <div className="text-lg text-gray-500 line-through">
                ₹{Number(p.mrp || 0).toFixed(2)}
              </div>
            )}
            <div className="ml-2"><Stars value={p.rating} /></div>
            <div className="text-sm text-gray-600">({reviewsCount} reviews)</div>
          </div>

          <p className="text-gray-700 whitespace-pre-line">{p.description}</p>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Qty</label>
            <input
              type="number"
              min={1}
              className="input w-24"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
            />
            <button
              className="btn btn-primary"
              onClick={() => { add(p, qty); notify.success('Added to cart'); }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <div className="flex items-center gap-2">
            <Stars value={p.rating} />
            <span className="text-sm text-gray-600">{reviewsCount} total</span>
          </div>
        </div>

        {(p.reviews || []).length === 0 && <div className="text-gray-600">No reviews yet.</div>}

        <ul className="space-y-3">
          {(p.reviews || []).map((r, i) => (
            <li key={i} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.name || r.userName || 'User'}</div>
                <Stars value={r.rating} />
              </div>
              <div className="text-sm text-gray-600">
                {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
              </div>
              <p className="mt-1">{r.comment}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t pt-4">
          {user ? (
            <form className="grid gap-3 sm:grid-cols-3 items-start" onSubmit={submitReview}>
              <div>
                <label className="block text-sm font-medium">Rating</label>
                <select
                  className="input w-full"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Comment</label>
                <div className="flex gap-2">
                  <input
                    className="input w-full"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience…"
                  />
                  <button className="btn btn-primary shrink-0">Submit</button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-sm text-gray-600">Please login to write a review.</div>
          )}
        </div>
      </div>
    </div>
  );
}
