// client/src/pages/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';
import api from '../lib/api.js';

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
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#9ca3af">No Image</text></svg>`
  );
const fmt = (v) => '₹' + (Number(v) || 0).toFixed(2);

export default function Cart() {
  const cart = useCart() || {};
  const { items = [], changeQty = () => {}, remove = () => {}, clear = () => {}, subtotal = 0 } = cart;
  const navigate = useNavigate();

  const shipping = subtotal > 0 ? 49 : 0;
  const total = (Number(subtotal) || 0) + shipping;

  if (!items.length) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold mb-4">Cart</h1>
        <div className="card p-6">
          <div className="text-gray-600">Your cart is empty.</div>
          <div className="mt-4">
            <Link className="btn btn-primary" to="/shop">Go to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 card p-4">
        <h2 className="text-xl font-semibold mb-3">Items</h2>
        <ul className="divide-y">
          {items.map(it => (
            <li key={it._id} className="py-3 flex items-center gap-3">
              <img
                src={absUrl(it.image) || PLACEHOLDER}
                onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
                className="w-20 h-20 object-cover rounded border"
                alt=""
              />
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">{fmt(it.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  className="input w-20"
                  value={Number(it.qty) || 1}
                  onChange={e => changeQty(it._id, e.target.value)}
                />
                <button className="btn btn-outline" onClick={() => remove(it._id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <button className="btn btn-outline" onClick={clear}>Clear Cart</button>
        </div>
      </div>

      <div className="card p-4 h-fit">
        <h2 className="text-xl font-semibold mb-3">Summary</h2>
        <div className="flex justify-between py-1">
          <span>Subtotal</span><span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Shipping</span><span>{fmt(shipping)}</span>
        </div>
        <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
          <span>Total</span><span>{fmt(total)}</span>
        </div>
        <button className="btn btn-primary w-full mt-4" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
