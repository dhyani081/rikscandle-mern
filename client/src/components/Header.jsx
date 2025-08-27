// // client/src/components/Header.jsx
// import { useEffect, useMemo, useState } from 'react';
// import { Link, NavLink, useLocation } from 'react-router-dom';
// import { useAuth } from '../state/AuthContext.jsx';
// import { useCart } from '../state/CartContext.jsx';

// function cx(...cls) {
//   return cls.filter(Boolean).join(' ');
// }

// function FirstName(name = '') {
//   const n = String(name).trim();
//   if (!n) return '';
//   return n.split(' ')[0];
// }

// export default function Header() {
//   const location = useLocation();
//   const auth = (typeof useAuth === 'function' ? useAuth() : {});
//   const user = auth?.user || null;
//   const logout = auth?.logout || (() => {});
//   const cartCtx = (typeof useCart === 'function' ? useCart() : {});
//   const cartCount = Number(cartCtx?.count || 0);

//   const [open, setOpen] = useState(false);       // mobile nav
//   const [menuOpen, setMenuOpen] = useState(false); // user dropdown

//   // close menus on route change
//   useEffect(() => {
//     setOpen(false);
//     setMenuOpen(false);
//   }, [location.pathname]);

//   const links = useMemo(() => {
//     const base = [
//       { to: '/', label: 'Home' },
//       { to: '/shop', label: 'Shop' },
//     ];
//     if (user) base.push({ to: '/orders', label: 'My Orders' });
//     return base;
//   }, [user]);

//   return (
//     <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur bg-gradient-to-br from-amber-50 via-white">
//       <div className="container flex items-center justify-between py-3 gap-3">
//         {/* Brand */}
//         <div className="flex items-center gap-2 ">
//           <Link to="/" className="flex items-center gap-2">
//             <img src="/favicon.svg" alt="RiksCandle" className="w-12 h-12" />
//             <span className="font-bold text-2xl text-orange-600">RiksCandle</span>
//           </Link>
//         </div>

//         {/* Desktop Nav */}
//         <nav className="hidden md:flex items-center gap-6">
//           {links.map((l) => (
//             <NavLink
//               key={l.to}
//               to={l.to}
//               className={({ isActive }) =>
//                 cx(
//                   'text-sm',
//                   isActive ? 'text-amber-700 font-semibold' : 'text-slate-700 hover:text-amber-700'
//                 )
//               }
//             >
//               {l.label}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Right actions */}
//         <div className="flex items-center gap-2">
//           {/* Mobile burger */}
//           <button
//             className="md:hidden btn btn-outline"
//             aria-label="Menu"
//             onClick={() => setOpen((v) => !v)}
//           >
//             ☰
//           </button>

//           {/* If logged in: show user chip + (Cart) */}
//           {user ? (
//             <>
//               {/* Cart (only when logged in) */}
//               <Link
//                 to="/cart"
//                 className="btn btn-outline relative hidden sm:inline-flex"
//                 title="Cart"
//               >
//                 Cart
//                 {cartCount > 0 && (
//                   <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {cartCount}
//                   </span>
//                 )}
//               </Link>

//               {/* Mobile cart as icon (optional; comment if you don't want it) */}
//               <Link
//                 to="/cart"
//                 className="btn btn-outline relative sm:hidden"
//                 title="Cart"
//               >
//                 🛒
//                 {cartCount > 0 && (
//                   <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {cartCount}
//                   </span>
//                 )}
//               </Link>

//               {/* User chip always visible (mobile + desktop) */}
//               <div className="relative">
//                 <button
//                   className="btn btn-outline"
//                   onClick={() => setMenuOpen((v) => !v)}
//                   aria-haspopup="menu"
//                   aria-expanded={menuOpen}
//                 >
//                   {/* Avatar initial */}
//                   <span className="inline-flex items-center justify-center bg-amber-600 text-white rounded-full w-6 h-6 mr-2">
//                     {String(user?.name || user?.email || '?').trim().charAt(0).toUpperCase()}
//                   </span>
//                   {/* Hi, Name → visible on all sizes so mobile user ko bhi pata chale */}
//                   <span className="font-medium">Hi, {FirstName(user?.name || user?.email)}</span>
//                 </button>

//                 {/* Dropdown */}
//                 {menuOpen && (
//                   <div
//                     className="absolute right-0 mt-2 w-44 rounded border bg-white shadow z-50"
//                     role="menu"
//                   >
//                     {user?.isAdmin && (
//                       <Link
//                         to="/admin"
//                         className="block px-3 py-2 text-sm hover:bg-amber-50"
//                         role="menuitem"
//                         onClick={() => setMenuOpen(false)}
//                       >
//                         Admin
//                       </Link>
//                     )}
//                     <Link
//                       to="/orders"
//                       className="block px-3 py-2 text-sm hover:bg-amber-50"
//                       role="menuitem"
//                       onClick={() => setMenuOpen(false)}
//                     >
//                       My Orders
//                     </Link>
//                     <button
//                       className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50"
//                       onClick={() => {
//                         setMenuOpen(false);
//                         logout();
//                       }}
//                       role="menuitem"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             // Guest actions
//             <div className="flex items-center gap-2">
//               <Link className="btn btn-outline" to="/login">
//                 Login
//               </Link>
//               <Link className="btn btn-primary" to="/register">
//                 Sign Up
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile Nav panel */}
//       {open && (
//         <div className="md:hidden border-t bg-white">
//           <nav className="container py-2 flex flex-col gap-1">
//             {links.map((l) => (
//               <NavLink
//                 key={l.to}
//                 to={l.to}
//                 className={({ isActive }) =>
//                   cx(
//                     'px-1 py-2 rounded',
//                     isActive ? 'text-amber-700 font-semibold' : 'text-slate-700 hover:text-amber-700'
//                   )
//                 }
//                 onClick={() => setOpen(false)}
//               >
//                 {l.label}
//               </NavLink>
//             ))}

//             {/* Guest quick links on mobile */}
//             {!user && (
//               <div className="flex gap-2 pt-2">
//                 <Link className="btn btn-outline w-1/2" to="/login">
//                   Login
//                 </Link>
//                 <Link className="btn btn-primary w-1/2" to="/register">
//                   Sign Up
//                 </Link>
//               </div>
//             )}
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }


// client/src/components/Header.jsx
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
