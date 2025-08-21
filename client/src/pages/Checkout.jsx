// client/src/pages/Checkout.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';
import { useCart } from '../state/CartContext.jsx';

export default function Checkout() {
  const { user } = (typeof useAuth === 'function' ? useAuth() : {}) || {};
  const cartCtx = (typeof useCart === 'function' ? useCart() : { items: [], clear: () => {} }) || {};
  const items = Array.isArray(cartCtx.items) ? cartCtx.items : [];
  const navigate = useNavigate();

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [addr, setAddr] = useState({ address: '', pin: '', city: '', state: '' });
  const [pinErr, setPinErr] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prefill (user + saved)
  useEffect(() => {
    const uid = user?._id || 'guest';
    const saved = localStorage.getItem(`rc:ship:${uid}`);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        s?.contact && setContact(c => ({ ...c, ...s.contact }));
        s?.address && setAddr(a => ({ ...a, ...s.address }));
      } catch {}
    }
    if (user) {
      setContact(c => ({
        ...c,
        name: user.name || c.name,
        email: user.email || c.email,
        phone: user.phone || c.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const uid = user?._id || 'guest';
    try { localStorage.setItem(`rc:ship:${uid}`, JSON.stringify({ contact, address: addr })); } catch {}
  }, [contact, addr, user]);

  // PIN -> City/State
  useEffect(() => {
    const pin = (addr.pin || '').trim();
    setPinErr('');
    if (pin.length === 0) return;
    if (!/^\d{0,6}$/.test(pin)) { setPinErr('PIN must be digits only'); return; }
    if (pin.length < 6) return;

    const ctrl = new AbortController();
    (async () => {
      try {
        const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: ctrl.signal });
        const arr = await r.json();
        const ok = Array.isArray(arr) && arr[0]?.Status === 'Success' && arr[0].PostOffice?.length;
        if (!ok) { setAddr(a => ({ ...a, city: '', state: '' })); setPinErr('Invalid PIN code'); return; }
        const po = arr[0].PostOffice[0];
        setAddr(a => ({ ...a, city: po.District || po.Block || '', state: po.State || '' }));
      } catch { setPinErr('Could not verify PIN.'); }
    })();
    return () => ctrl.abort();
  }, [addr.pin]);

  const subTotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price)||0)*(Number(it.qty)||0), 0),
    [items]
  );
  const shipping = Number(import.meta.env.VITE_SHIP_FEE || 49);
  const grandTotal = subTotal + shipping;

  const validate = () => {
    if (!contact.name || !contact.email || !contact.phone || !addr.address || !addr.pin || !addr.city || !addr.state) {
      setErr('Please fill all required fields.');
      return false;
    }
    if (!/^\d{6}$/.test(addr.pin)) { setErr('Please enter a valid 6-digit PIN code.'); return false; }
    if (pinErr) { setErr(pinErr); return false; }
    if (!/^\d{10}$/.test(String(contact.phone).replace(/\D/g,''))) { setErr('Enter a valid 10-digit mobile number.'); return false; }
    setErr('');
    return true;
  };

  // Ensure every cart item carries a product id
  const normalizeItems = () => items.map((it) => {
    const prodId =
      it.product?._id || it.productId || it.product || it._id || it.id;
    return {
      product: prodId,
      name: it.name,
      price: Number(it.price),
      qty: Number(it.qty || 1),
      image: it.image || (Array.isArray(it.images) ? (typeof it.images[0]==='string' ? it.images[0] : it.images[0]?.url) : '')
    };
  });

  const placeCOD = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const orderItems = normalizeItems();
    // if any product id missing, stop early with readable message
    if (orderItems.some(x => !x.product)) {
      setErr('Cart items are missing product ids. Please re-add the product to cart and try again.');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post('/api/orders', {
        items: orderItems,
        contact,
        shippingAddress: addr,
        paymentMethod: 'COD'
      });
      if (typeof cartCtx.clear === 'function') cartCtx.clear();
      navigate(`/thank-you?o=${data._id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const payOnline = (e) => {
    e?.preventDefault();
    // Coming soon page
    navigate('/pay/online');
  };

  return (
    <div className="container py-10 grid md:grid-cols-3 gap-8">
      <form className="md:col-span-2 card space-y-4" onSubmit={placeCOD} noValidate>
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Full Name *</label>
            <input className="input mt-1" required
                   value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })}/>
          </div>
          <div>
            <label className="block text-sm font-medium">Email *</label>
            <input className="input mt-1" type="email" required
                   value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}/>
          </div>
          <div>
            <label className="block text-sm font-medium">Phone *</label>
            <input className="input mt-1" type="tel" inputMode="numeric" placeholder="10-digit mobile" pattern="^\d{10}$" required
                   value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value.replace(/\D/g,'').slice(0,10) })}/>
          </div>
          <div>
            <label className="block text-sm font-medium">PIN Code *</label>
            <input className="input mt-1" inputMode="numeric" maxLength={6} required
                   value={addr.pin} onChange={e => setAddr({ ...addr, pin: e.target.value.replace(/\D/g,'').slice(0,6) })}/>
            {pinErr && <div className="text-red-600 text-xs mt-1">{pinErr}</div>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Full Address *</label>
            <textarea className="input mt-1" rows={3} required
                      value={addr.address} onChange={e => setAddr({ ...addr, address: e.target.value })}/>
          </div>

          <div>
            <label className="block text-sm font-medium">City *</label>
            <input className="input mt-1" required
                   value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })}/>
          </div>
          <div>
            <label className="block text-sm font-medium">State *</label>
            <input className="input mt-1" required
                   value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })}/>
          </div>
        </div>

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <div className="flex flex-wrap gap-3 justify-end">
          <button type="button" className="btn btn-outline" onClick={payOnline}>Pay Online (UPI/Cards)</button>
          <button className="btn btn-primary" disabled={submitting || !!pinErr}>
            {submitting ? 'Placing…' : 'Place Order (COD)'}
          </button>
        </div>
      </form>

      <aside className="card h-fit">
        <div className="font-semibold mb-2">Order Summary</div>
        <div className="divide-y">
          {items.map((it, idx) => (
            <div key={idx} className="py-2 flex justify-between gap-4">
              <div className="truncate">{it.name} × {it.qty}</div>
              <div>₹{Number(it.price * it.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t pt-2 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
        </div>
      </aside>
    </div>
  );
}
