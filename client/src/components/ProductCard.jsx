// client/src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../state/CartContext.jsx';

const ORIGIN = (api.defaults.baseURL || '').replace(/\/$/, '');
const absUrl = (u) => {
  if (!u) return '';
  u = String(u).trim().replace(/\\/g,'/');   // normalize
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return ORIGIN + u;
  return ORIGIN + '/' + u;
};
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="224"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#9ca3af">No Image</text></svg>`
  );

const Stars = ({ value = 0 }) => {
  const full = Math.round(Number(value || 0));
  return (
    <span className="text-amber-600 text-sm">
      {[1,2,3,4,5].map(i => <span key={i}>{i <= full ? '★' : '☆'}</span>)}
    </span>
  );
};

export default function ProductCard({ p }) {
  const { add } = (typeof useCart === 'function' ? useCart() : { add: () => {} });

  const firstImg = p.image || (Array.isArray(p.images) && p.images[0]?.url) || '';
  const img = absUrl(firstImg) || PLACEHOLDER;
  const showMrp = Number(p?.mrp || 0) > Number(p?.price || 0);
  const reviewCount = p?.numReviews || (Array.isArray(p?.reviews) ? p.reviews.length : 0);

  return (
    <div className="card overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-200">
      <Link to={`/product/${p._id}`} className="block relative">
        <img
          src={img}
          alt={p.name}
          className="w-full h-56 object-cover bg-white"
          onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
        />
      </Link>

      <div className="p-3">
        <Link to={`/product/${p._id}`} className="font-semibold line-clamp-1">{p.name}</Link>

        <div className="mt-1 flex items-center gap-2">
          <Stars value={p.rating} />
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <div className="text-lg font-bold">₹{Number(p.price).toFixed(2)}</div>
          {showMrp && <div className="text-sm text-gray-500 line-through">₹{Number(p.mrp).toFixed(2)}</div>}
        </div>

        <div className="mt-3">
          <button className="btn btn-outline w-full" onClick={() => add(p, 1)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
