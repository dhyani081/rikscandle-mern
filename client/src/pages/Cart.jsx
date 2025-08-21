import { Link } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';

export default function Cart() {
  const { items, setQty, remove, subTotal, shipping, grandTotal } = useCart();

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="card">Cart is empty. <Link to="/shop" className="link ml-2">Go shopping</Link></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map(i => (
              <div key={i._id} className="card flex items-center gap-4">
                <img src={i.image} alt={i.name} className="w-20 h-20 object-cover rounded"/>
                <div className="flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-amber-700 font-semibold">₹{i.price}</div>
                </div>
                <input type="number" min="1" className="input w-24" value={i.qty} onChange={e => setQty(i._id, Number(e.target.value))} />
                <button className="btn" onClick={() => remove(i._id)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="font-semibold mb-2">Summary</div>
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
            <Link to="/checkout" className="btn btn-primary mt-4 block text-center">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
