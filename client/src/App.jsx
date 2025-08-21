// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Orders from './pages/Orders.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

import Terms from './pages/policy/Terms.jsx';
import Privacy from './pages/policy/Privacy.jsx';
import Refund from './pages/policy/Refund.jsx';
import About from './pages/About.jsx';

import ComingSoon from './pages/ComingSoon.jsx';
import ThankYou from './pages/ThankYou.jsx';

import { useAuth } from './state/AuthContext.jsx';

function Protected({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Payments */}
          <Route path="/pay/online" element={<ComingSoon />} />
          <Route path="/coming-soon" element={<ComingSoon />} />

          {/* Thank you */}
          <Route path="/thank-you" element={<ThankYou />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><AdminDashboard /></Protected>} />

          <Route path="/about" element={<About />} />
          <Route path="/policy/terms" element={<Terms />} />
          <Route path="/policy/privacy" element={<Privacy />} />
          <Route path="/policy/refund" element={<Refund />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
