// client/src/state/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

const LS_KEY = 'rc:cart';

function normalizeItem(p, qty = 1) {
  const id = p?.product?._id || p?.product || p?._id || p?.id;
  const image = p?.image || (Array.isArray(p?.images)
    ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
    : '');
  return { product: id, _id: id, name: p?.name, price: Number(p?.price || 0), qty: Number(qty || 1), image };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (p, qty = 1) => {
    const ni = normalizeItem(p, qty);
    if (!ni.product) return;
    setItems(prev => {
      const i = prev.findIndex(x => x.product === ni.product);
      if (i >= 0) {
        const copy = prev.slice();
        copy[i] = { ...copy[i], qty: Number(copy[i].qty) + Number(ni.qty) };
        return copy;
      }
      return [...prev, ni];
    });
  };
  const inc = (id) => setItems(prev => prev.map(x => x.product === id ? { ...x, qty: x.qty + 1 } : x));
  const dec = (id) => setItems(prev => prev.flatMap(x => x.product === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const remove = (id) => setItems(prev => prev.filter(x => x.product !== id));
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, x) => s + Number(x.qty || 0), 0), [items]);

  return (
    <Ctx.Provider value={{ items, add, inc, dec, remove, clear, count }}>
      {children}
    </Ctx.Provider>
  );
}

// Default export bhi rakho (taaki dono import styles chal sake)
export default CartProvider;
