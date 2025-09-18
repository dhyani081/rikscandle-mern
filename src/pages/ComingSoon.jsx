// client/src/pages/ComingSoon.jsx
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center border rounded-lg p-8 bg-white">
        <div className="text-3xl font-bold text-amber-700">Online Payments – Coming Soon</div>
        <p className="mt-4 text-gray-600">
          We are setting up secure online payments for RiksCandle. For now, please use
          <span className="font-medium"> Cash on Delivery (COD)</span> to place your order.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/checkout" className="btn btn-primary">
            Go to Checkout (COD)
          </Link>
          <Link to="/shop" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Need help? <a className="link" href="mailto:rikscandle@gmail.com">rikscandle@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
