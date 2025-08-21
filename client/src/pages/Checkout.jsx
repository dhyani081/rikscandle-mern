import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../state/CartContext.jsx';
import notify from '../lib/notify.js';

const money = (n) => '₹' + Number(n || 0).toFixed(2);

// -------- PIN lookup (India Post) ----------
const pinCache = new Map();
async function lookupPin(pin, signal) {
  // Basic validation first
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('Please enter a valid 6-digit PIN');
  }
  if (pinCache.has(pin)) return pinCache.get(pin);

  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
  if (!res.ok) throw new Error('PIN service unavailable');
  const arr = await res.json();

  if (!Array.isArray(arr) || arr.length === 0) throw new Error('Invalid response');
  const obj = arr[0];
  if (obj.Status !== 'Success' || !Array.isArray(obj.PostOffice) || obj.PostOffice.length === 0) {
    throw new Error(obj?.Message || 'Invalid PIN');
  }
  // First office is enough
  const office = obj.PostOffice[0];
  const out = { city: office?.District || '', state: office?.State || '' };
  pinCache.set(pin, out);
  return out;
}
// ------------------------------------------

export default function Checkout() {
  // Cart state
  const cart = (typeof useCart === 'function' ? useCart() : {});
  const items = cart?.items || [];
  const clear = cart?.clear || (() => {});
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0),
    [items]
  );
  const shipping = subtotal > 0 ? 49 : 0;
  const grandTotal = subtotal + shipping;

  // Form state
  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    pin: '',
    address: '',
    city: '',
    state: '',
  });

  // PIN assistance
  const [pinErr, setPinErr] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const pinAbortRef = useRef(null);

  const navigate = useNavigate();

  // Auto fetch city/state when 6 digits are present
  useEffect(() => {
    const pin = String(f.pin || '').trim();
    setPinErr('');

    if (pin.length !== 6) return; // wait till full length

    // Abort previous in-flight request
    if (pinAbortRef.current) {
      pinAbortRef.current.abort();
    }
    const controller = new AbortController();
    pinAbortRef.current = controller;

    (async () => {
      try {
        setPinLoading(true);
        const { city, state } = await lookupPin(pin, controller.signal);
        setF((prev) => ({ ...prev, city, state }));
      } catch (e) {
        setPinErr(e?.message || 'Invalid PIN');
        notify.error(e?.message || 'Invalid PIN');
        // Don’t keep stale data
        setF((prev) => ({ ...prev, city: '', state: '' }));
      } finally {
        setPinLoading(false);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.pin]);

  const requiredFilled =
    f.name && f.email && f.phone && /^\d{6}$/.test(f.pin) && f.address && f.city && f.state && !pinErr;

  const onPlaceOrder = async () => {
    if (!items.length) return notify.warning('Your cart is empty');
    if (!requiredFilled) return notify.warning('Please complete all required fields');

    const payload = {
      contact: { name: f.name, email: f.email, phone: f.phone },
      shippingAddress: { address: f.address, city: f.city, state: f.state, pin: f.pin },
      items: items.map((it) => ({
        product: it._id,
        name: it.name,
        qty: it.qty,
        price: it.price,
        image: it.image,
      })),
      paymentMethod: 'COD',
    };

    try {
      const p = api.post('/api/orders', payload);
      await notify.promise(p, { pending: 'Placing your order…', success: 'Order placed!' });
      clear();
      navigate('/thank-you'); // ya '/orders' — aapke routing ke hisab se
    } catch (e) {
      notify.fromError(e);
    }
  };

  const goOnline = () => {
    // If you already have a ComingSoon page/route:
    navigate('/coming-soon');
    // Agar route nahi hai to bas ye use kar sakte ho:
    // notify.info('Online payments coming soon');
  };

  return (
    <div className="container py-10 grid md:grid-cols-3 gap-8">
      {/* LEFT: Form */}
      <div className="md:col-span-2 card p-4 space-y-4">
        <h1 className="text-xl font-semibold">Checkout</h1>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Full Name *</label>
            <input
              className="input w-full"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email *</label>
            <input
              className="input w-full"
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone *</label>
            <input
              className="input w-full"
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
              placeholder="10-digit mobile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">PIN Code *</label>
            <input
              className={`input w-full ${pinErr ? 'border-red-500 focus:border-red-500' : ''}`}
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit PIN"
              value={f.pin}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
                setF({ ...f, pin: onlyDigits });
              }}
            />
            <div className="h-5 mt-1 text-xs">
              {pinLoading ? (
                <span className="text-gray-500">Fetching city & state…</span>
              ) : pinErr ? (
                <span className="text-red-600">{pinErr}</span>
              ) : f.city && f.state ? (
                <span className="text-green-700">✓ {f.city}, {f.state}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Full Address *</label>
          <textarea
            className="input w-full"
            rows={3}
            value={f.address}
            onChange={(e) => setF({ ...f, address: e.target.value })}
            placeholder="House no, Street, Area…"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">City *</label>
            <input
              className="input w-full"
              value={f.city}
              onChange={(e) => setF({ ...f, city: e.target.value })}
              placeholder="Auto-filled"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State *</label>
            <input
              className="input w-full"
              value={f.state}
              onChange={(e) => setF({ ...f, state: e.target.value })}
              placeholder="Auto-filled"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            className="btn btn-primary"
            onClick={onPlaceOrder}
            disabled={!requiredFilled || pinLoading}
            title={!requiredFilled ? 'Complete all required fields' : undefined}
          >
            Place Order (COD)
          </button>

          {/* Online payments - Coming soon */}
          <button className="btn btn-outline" onClick={goOnline}>
            Pay Online (Coming Soon)
          </button>
        </div>
      </div>

      {/* RIGHT: Summary */}
      <div className="card p-4 h-fit">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
        {items.length === 0 ? (
          <div className="text-gray-600">Your cart is empty.</div>
        ) : (
          <>
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it._id} className="flex justify-between text-sm">
                  <span>{it.name} × {it.qty}</span>
                  <span>{money((Number(it.price) || 0) * (Number(it.qty) || 0))}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-3">
              <span>Subtotal</span><span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span><span>{money(shipping)}</span>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span><span>{money(grandTotal)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
