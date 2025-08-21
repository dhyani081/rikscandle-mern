// client/src/components/Header.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useCart } from '../state/CartContext.jsx';

function cx(...cls) {
  return cls.filter(Boolean).join(' ');
}

function FirstName(name = '') {
  const n = String(name).trim();
  if (!n) return '';
  return n.split(' ')[0];
}

export default function Header() {
  const location = useLocation();
  const auth = (typeof useAuth === 'function' ? useAuth() : {});
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});
  const cartCtx = (typeof useCart === 'function' ? useCart() : {});
  const cartCount = Number(cartCtx?.count || 0);

  const [open, setOpen] = useState(false);       // mobile nav
  const [menuOpen, setMenuOpen] = useState(false); // user dropdown

  // close menus on route change
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const links = useMemo(() => {
    const base = [
      { to: '/', label: 'Home' },
      { to: '/shop', label: 'Shop' },
    ];
    if (user) base.push({ to: '/orders', label: 'My Orders' });
    return base;
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur bg-gradient-to-br from-amber-50 via-white">
      <div className="container flex items-center justify-between py-3 gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 ">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="RiksCandle" className="w-12 h-12" />
            <span className="font-bold text-2xl text-orange-600">RiksCandle</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cx(
                  'text-sm',
                  isActive ? 'text-amber-700 font-semibold' : 'text-slate-700 hover:text-amber-700'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Mobile burger */}
          <button
            className="md:hidden btn btn-outline"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>

          {/* If logged in: show user chip + (Cart) */}
          {user ? (
            <>
              {/* Cart (only when logged in) */}
              <Link
                to="/cart"
                className="btn btn-outline relative hidden sm:inline-flex"
                title="Cart"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile cart as icon (optional; comment if you don't want it) */}
              <Link
                to="/cart"
                className="btn btn-outline relative sm:hidden"
                title="Cart"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User chip always visible (mobile + desktop) */}
              <div className="relative">
                <button
                  className="btn btn-outline"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {/* Avatar initial */}
                  <span className="inline-flex items-center justify-center bg-amber-600 text-white rounded-full w-6 h-6 mr-2">
                    {String(user?.name || user?.email || '?').trim().charAt(0).toUpperCase()}
                  </span>
                  {/* Hi, Name → visible on all sizes so mobile user ko bhi pata chale */}
                  <span className="font-medium">Hi, {FirstName(user?.name || user?.email)}</span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 rounded border bg-white shadow z-50"
                    role="menu"
                  >
                    {user?.isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-sm hover:bg-amber-50"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-sm hover:bg-amber-50"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Guest actions
            <div className="flex items-center gap-2">
              <Link className="btn btn-outline" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-2 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'px-1 py-2 rounded',
                    isActive ? 'text-amber-700 font-semibold' : 'text-slate-700 hover:text-amber-700'
                  )
                }
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}

            {/* Guest quick links on mobile */}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link className="btn btn-outline w-1/2" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary w-1/2" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
