// client/src/pages/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [mainImg, setMainImg] = useState('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/products/' + id);
        if (!mounted) return;
        setP(data);
        setMainImg(data.image || data.images?.[0]?.url || '');
        setQty(data.countInStock > 0 ? 1 : 0);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const submitReview = async () => {
    try {
      if (!rating || rating < 1 || rating > 5) return alert('Rating 1-5');
      await api.post(`/api/products/${id}/reviews`, { rating, comment });
      const { data } = await api.get('/api/products/' + id);
      setP(data);
      setRating(5);
      setComment('');
    } catch (e) {
      alert(e?.response?.data?.message || 'Could not submit review');
    }
  };

  if (loading) return <div className="container py-10">Loading...</div>;
  if (err) return <div className="container py-10 text-red-600">{err}</div>;
  if (!p) return <div className="container py-10">Not found</div>;

  const price = Number(p.price || 0);
  const mrp = Number(p.mrp ?? price);
  const hasDiscount = mrp > price && price > 0;
  const discount = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const canAdd = p.countInStock > 0 && qty > 0;
  const buyNow = () => { add(p, qty); navigate('/checkout'); };

  return (
    <div className="container py-10 grid md:grid-cols-2 gap-10">
      <div>
        <img
          src={mainImg || p.image || p.images?.[0]?.url}
          alt={p.name}
          className="w-full rounded shadow"
        />
        {!!p.images?.length && (
          <div className="flex gap-2 mt-3">
            {p.images.map((img, i) => (
              <img
                key={img.publicId || i}
                src={img.url}
                onClick={() => setMainImg(img.url)}
                className={`w-16 h-16 object-cover rounded border cursor-pointer ${mainImg === img.url ? 'ring-2 ring-amber-600' : ''}`}
                alt=""
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{p.name}</h1>

        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-amber-700 text-2xl font-bold">₹{price.toFixed(0)}</div>
          {hasDiscount && (
            <>
              <div className="text-gray-400 line-through">₹{mrp.toFixed(0)}</div>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {discount}% off
              </span>
            </>
          )}
        </div>

        <p className="mt-3 text-gray-700 whitespace-pre-line">{p.description}</p>
        <div className="mt-2 text-sm">Stock: {p.countInStock}</div>

        <div className="mt-4 flex items-center gap-2">
          <label className="text-sm">Qty</label>
          <input
            type="number"
            min="1"
            max={p.countInStock || 1}
            value={qty}
            onChange={(e) => {
              const v = Math.max(1, Math.min(Number(e.target.value || 1), p.countInStock || 1));
              setQty(v);
            }}
            className="input w-24"
            disabled={p.countInStock <= 0}
          />
          <button className="btn btn-primary" onClick={() => add(p, qty)} disabled={!canAdd}>
            {p.countInStock > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
          {p.countInStock > 0 && (
            <button className="btn btn-outline" onClick={buyNow}>Buy Now</button>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {p.reviews?.length ? (
            <div className="space-y-3 mt-3">
              {p.reviews.map((r, idx) => (
                <div key={r._id || idx} className="border rounded p-3">
                  <div className="text-sm text-gray-600">
                    {r.name} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </div>
                  <div className="font-medium">Rating: {r.rating}/5</div>
                  {r.comment && <p>{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mt-2">No reviews yet.</p>
          )}

          {user && (
            <div className="mt-4 card">
              <div className="font-medium mb-2">Write a review</div>
              <div className="flex items-center gap-2">
                <label>Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="input w-24"
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                />
              </div>
              <textarea
                className="input mt-2"
                rows="3"
                placeholder="Your thoughts..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button className="btn btn-primary mt-3" onClick={submitReview}>
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
