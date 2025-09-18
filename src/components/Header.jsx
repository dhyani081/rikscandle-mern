
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useCart } from '../state/CartContext.jsx';
import api from '../lib/api.js';

const firstName = (name = '', email = '') => {
  const n = (name || email || '').trim();
  return n.split(' ')[0] || n;
};

const ORIGIN = (api?.defaults?.baseURL || '').replace(/\/$/, '');
const absUrl = (u) => {
  if (!u) return '';
  u = String(u).trim().replace(/\\/g, '/');
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return ORIGIN + u;
  return ORIGIN + '/' + u;
};

export default function Header() {
  const { user, logout } = (typeof useAuth === 'function' ? useAuth() : { user: null, logout: async () => {} });
  const cartCtx = (typeof useCart === 'function' ? useCart() : null);
  const items = Array.isArray(cartCtx?.items) ? cartCtx.items : [];
  const cartCount = useMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0), 0), [items]);

  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu when route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try { await logout(); } finally { setOpen(false); navigate('/'); }
  };

  const NavLink = ({ to, children }) => {
    const active =
      pathname === to ||
      (to !== '/' && pathname.startsWith(to));
    const cls = `px-2 py-1 rounded ${active ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'}`;
    return <Link to={to} className={cls} onClick={() => setOpen(false)}>{children}</Link>;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="container h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <img src="/favicon.svg" alt="RiksCandle" className="w-7 h-7" />
          <span className="text-xl font-semibold tracking-tight">RiksCandle</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user && <NavLink to="/orders">My Orders</NavLink>}
          {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {user && (
            <span className="text-sm text-gray-700 mr-1">
              Hi, <b className="font-semibold">{firstName(user?.name, user?.email)}</b>
            </span>
          )}

          {/* Cart visible only when logged-in; smaller than logout */}
          {user && (
            <Link
              to="/checkout"
              className="btn btn-outline btn-sm"
              onClick={() => setOpen(false)}
              title="Go to checkout"
            >
              Cart{cartCount ? ` (${cartCount})` : ''}
            </Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-outline" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </>
          ) : (
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border hover:bg-gray-50"
        >
          <span className="sr-only">Toggle navigation</span>
          <span className={`block w-5 h-0.5 bg-gray-800 transition ${open ? 'translate-y-1 rotate-45' : ''}`}></span>
          <span className={`block w-5 h-0.5 bg-gray-800 my-1 transition ${open ? 'opacity-0' : ''}`}></span>
          <span className={`block w-5 h-0.5 bg-gray-800 transition ${open ? '-translate-y-1 -rotate-45' : ''}`}></span>
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-white shadow-sm">
          <div className="container py-3">
            <div className="flex flex-col">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/shop">Shop</NavLink>
              {user && <NavLink to="/orders">My Orders</NavLink>}
              {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
            </div>

            <div className="my-3 h-px bg-gray-200" />

            {/* Auth / user section */}
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-700">
                  Hi, <b className="font-semibold">{firstName(user?.name, user?.email)}</b>
                </div>

                {/* Cart small button (only logged-in) */}
                <Link
                  to="/checkout"
                  className="btn btn-outline btn-sm"
                  onClick={() => setOpen(false)}
                >
                  Cart{cartCount ? ` (${cartCount})` : ''}
                </Link>

                <button className="btn btn-outline" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
