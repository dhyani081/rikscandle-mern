// client/src/state/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
const LS_KEY = 'rk_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (p, qty = 1) => {
    qty = Math.max(1, Number(qty) || 1);
    const price = Number(p?.price || 0);
    const image = p?.image || (Array.isArray(p?.images) && p.images[0]?.url) || '';

    setItems(prev => {
      const ix = prev.findIndex(x => x._id === p._id);
      if (ix >= 0) {
        const copy = [...prev];
        copy[ix] = { ...copy[ix], qty: (Number(copy[ix].qty) || 0) + qty };
        return copy;
      }
      return [...prev, { _id: p._id, name: p.name || 'Product', price, image, qty }];
    });
  };

  const remove = (id) => setItems(prev => prev.filter(x => x._id !== id));
  const changeQty = (id, qty) =>
    setItems(prev => prev.map(x => x._id === id ? { ...x, qty: Math.max(1, Number(qty) || 1) } : x));
  const clear = () => setItems([]);

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
  const count = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);

  const value = useMemo(() => ({
    items, add, remove, changeQty, clear, subtotal, count
  }), [items, subtotal, count]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);

// 👇 Add default export so `import CartProvider from './state/CartContext.jsx'` works
export default CartProvider;
