// server/src/controllers/order.controller.js
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { buildInvoiceBuffer } from '../utils/invoice.js';

const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function calcTotals(items = []) {
  const subTotal = items.reduce((sum, it) => sum + toNumber(it.price, 0) * toNumber(it.qty, 0), 0);
  const shipping = toNumber(process.env.DEFAULT_SHIPPING, 0);
  const gstOff = String(process.env.DISABLE_GST || '').toLowerCase() === 'true';
  const gstPct = gstOff ? 0 : toNumber(process.env.GST_PERCENT, 0);
  const tax = Math.round((subTotal * gstPct) / 100);
  const grandTotal = subTotal + shipping + tax;
  return { subTotal, shipping, tax, discount: 0, grandTotal };
}

const pickProductId = (it = {}) =>
  it.product || it.productId || it.pid || it._id || it.id || it.product?._id;

export const createOrder = async (req, res, next) => {
  try {
    const { items = [], contact = {}, shippingAddress = {}, paymentMethod = 'COD', notes = '' } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });

    if (!contact.name || !contact.email || !contact.phone) {
      return res.status(400).json({ message: 'Contact name, email and phone are required' });
    }

    const { address = '', city = '', state = '', pin = '' } = shippingAddress || {};
    if (!address || !city || !state || !pin) {
      return res.status(400).json({ message: 'Address, city, state and PIN are required' });
    }
    const pinStr = String(pin).trim();
    if (!/^\d{6}$/.test(pinStr)) return res.status(400).json({ message: 'PIN must be a valid 6-digit code' });

    const normItems = items.map((raw, idx) => {
      const prodId = pickProductId(raw);
      if (!prodId) throw Object.assign(new Error(`Cart item ${idx + 1} missing product id`), { status: 400 });
      let img = raw.image;
      if (!img && Array.isArray(raw.images) && raw.images.length) {
        const first = raw.images[0];
        img = typeof first === 'string' ? first : first?.url || '';
      }
      return { product: prodId, name: raw.name, price: toNumber(raw.price, 0), qty: toNumber(raw.qty, 1), image: img || '' };
    });

    // link to user (logged-in or same email)
    let userId = req.user?._id || req.user?.id || undefined;
    if (!userId && contact?.email) {
      const u = await User.findOne({ email: String(contact.email).toLowerCase() }).select('_id');
      if (u) userId = u._id;
    }

    const totals = calcTotals(normItems);

    const order = await Order.create({
      user: userId,
      items: normItems,
      contact: { name: contact.name, email: contact.email, phone: contact.phone },
      shippingAddress: { address, city, state, pin: pinStr },
      paymentMethod,
      totals,
      isPaid: false,
      status: 'Placed',
      notes,
    });

    return res.status(201).json(order);
  } catch (err) {
    if (err?.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    // backfill guest orders (same email) to this user
    await Order.updateMany(
      { $or: [{ user: null }, { user: { $exists: false } }], 'contact.email': req.user.email },
      { $set: { user: req.user._id } }
    );
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Order not found' });
    const isOwner = o.user && (String(o.user) === String(req.user?._id || req.user?.id));
    if (!isOwner && !req.user?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    res.json(o);
  } catch (err) { next(err); }
};

export const updateOrder = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = o.status;
    if (typeof req.body.status === 'string') o.status = req.body.status;
    if (typeof req.body.isPaid === 'boolean') o.isPaid = req.body.isPaid;

    // When moving to Delivered for the FIRST time → deduct inventory & bump soldCount
    if (prevStatus !== 'Delivered' && o.status === 'Delivered') {
      if (!o.deliveredAt) o.deliveredAt = new Date();

      for (const it of o.items || []) {
        const qty = Math.max(0, Number(it.qty) || 0);
        const prodId = it.product;
        if (!prodId || qty === 0) continue;

        const p = await Product.findById(prodId).select('stock soldCount');
        if (p) {
          p.stock = Math.max(0, Number(p.stock || 0) - qty);
          p.soldCount = Math.max(0, Number(p.soldCount || 0) + qty);
          await p.save();
        }
      }
    }

    await o.save();
    res.json(o);
  } catch (err) { next(err); }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Order not found' });
    await o.deleteOne();
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Order not found' });
    const isOwner = o.user && (String(o.user) === String(req.user?._id || req.user?.id));
    if (!isOwner && !req.user?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const buf = await buildInvoiceBuffer(o);
    const shortId = String(o._id).slice(-6);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${shortId}.pdf`);
    res.setHeader('Content-Length', buf.length);
    res.send(buf);
  } catch (err) { next(err); }
};
