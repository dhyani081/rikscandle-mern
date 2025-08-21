// server/src/services/pricing.service.js
import Product from '../models/Product.js';

export async function computeTotalsFromDB(items = [], couponCode = null, shippingAddress = null) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('No items provided');
  const ids = items.map(i => i.productId);
  const prods = await Product.find({ _id: { $in: ids } });

  let subTotal = 0;
  const normalized = items.map(i => {
    const p = prods.find(pp => String(pp._id) === String(i.productId));
    if (!p) throw new Error('Product not found: ' + i.productId);
    if (i.qty > p.countInStock) throw new Error(`Insufficient stock for ${p.name}`);
    subTotal += p.price * i.qty;
    return { product: p._id, name: p.name, image: p.image, price: p.price, qty: i.qty };
  });

  const discount = 0;
  const shipping = subTotal >= 999 ? 0 : (subTotal > 0 ? 49 : 0);
  const tax = 0;
  const grandTotal = subTotal - discount + shipping + tax;

  return { subTotal, discount, shipping, tax, grandTotal, itemsNormalized: normalized };
}
