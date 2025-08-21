// client/src/components/Header.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';
import { useCart } from '../state/CartContext.jsx';

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/favicon.svg" alt="RiksCandle" className="h-7 w-7" />
      <span className="text-2xl font-extrabold">
        <span className="text-amber-700">Riks</span>
        <span className="text-amber-600">Candle</span>
      </span>
    </Link>
  );
}

export default function Header() {
  // Auth context (robust access – if context absent, fallback to empty)
  const auth = (typeof useAuth === 'function' ? useAuth() : null) || {};
  const user = auth.user || null;

  // Always call hook (React rule), but guard its values
  const cartCtx = (typeof useCart === 'function' ? useCart() : null) || { count: 0, items: [] };
  const cartCount = Number(
    cartCtx?.count ??
    (Array.isArray(cartCtx?.items) ? cartCtx.items.reduce((s, x) => s + Number(x?.qty || 0), 0) : 0)
  );

  const navigate = useNavigate();

  const doLogout = async () => {
    try {
      if (typeof auth.logout === 'function') {
        await auth.logout();
      } else {
        await api.post('/api/auth/logout');
        if (typeof auth.setUser === 'function') auth.setUser(null);
      }
    } catch (_) {}
    navigate('/');
  };

  const firstName = user?.name ? String(user.name).split(' ')[0] : '';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="container flex items-center justify-between h-16">
        <Brand />

        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({isActive}) => isActive ? 'text-amber-700 font-semibold' : 'hover:text-amber-700'}>
            Home
          </NavLink>
          <NavLink to="/shop" className={({isActive}) => isActive ? 'text-amber-700 font-semibold' : 'hover:text-amber-700'}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/orders" className={({isActive}) => isActive ? 'text-amber-700 font-semibold' : 'hover:text-amber-700'}>
              My Orders
            </NavLink>
          )}
          {user?.isAdmin && (
            <NavLink to="/admin" className={({isActive}) => isActive ? 'text-amber-700 font-semibold' : 'hover:text-amber-700'}>
              Admin
            </NavLink>
          )}
          <NavLink to="/about" className={({isActive}) => isActive ? 'text-amber-700 font-semibold' : 'hover:text-amber-700'}>
            About
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart button ONLY for logged-in users */}
          {user && (
            <Link to="/cart" className="btn btn-outline relative">
              Cart
              {cartCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs bg-amber-600 text-white rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-sm text-gray-700">Hi, <b>{firstName}</b></span>
              <button onClick={doLogout} className="btn btn-outline">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
