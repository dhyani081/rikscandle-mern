// client/src/pages/ThankYou.jsx
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function ThankYou() {
  const [q] = useSearchParams();
  const oid = q.get('o') || '';

  useEffect(() => {
    if (oid) {
      try { localStorage.setItem('rc:lastOrderId', oid); } catch {}
    }
  }, [oid]);

  return (
    <div className="container py-14">
      <div className="max-w-xl mx-auto card text-center">
        <div className="text-3xl font-extrabold">Thank you for your order! 🎉</div>
        <p className="mt-3 text-gray-600">
          Your order has been placed successfully.
          {oid ? <> Order ID: <b>#{String(oid).slice(-6)}</b></> : null}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
          <Link to={`/orders${oid ? `?o=${oid}` : ''}`} className="btn btn-primary">View My Orders</Link>
        </div>
      </div>
    </div>
  );
}
