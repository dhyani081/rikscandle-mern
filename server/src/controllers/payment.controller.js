// server/src/controllers/payment.controller.js
import crypto from 'crypto';
import { razorpay } from '../config/razorpay.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { computeTotalsFromDB } from '../services/pricing.service.js';
import { sendMail } from '../config/mailer.js';
import { buildInvoiceBuffer } from '../utils/invoice.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { items, couponCode, shippingAddress, contact } = req.body;
    if (!contact || (!contact.email && !contact.phone))
      return res.status(400).json({ message: 'Contact email or phone is required' });

    const totals = await computeTotalsFromDB(items, couponCode, shippingAddress);
    const amountPaise = Math.round(Number(totals.grandTotal) * 100);

    const localOrder = await Order.create({
      user: req.user?._id,
      contact,
      items: totals.itemsNormalized,
      shippingAddress,
      paymentMethod: 'RAZORPAY',
      totals,
      status: 'Pending',
      isPaid: false,
    });

    const rpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${localOrder._id}`,
      notes: { orderId: String(localOrder._id) },
    });

    localOrder.paymentResult = { razorpayOrderId: rpOrder.id };
    await localOrder.save();

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      rzpOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      orderId: localOrder._id,
    });
  } catch (e) { next(e); }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const order = await Order.findOne({ 'paymentResult.razorpayOrderId': razorpay_order_id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // decrement stock now (after successful payment)
    for (const it of order.items) {
      const p = await Product.findById(it.product);
      if (!p) continue;
      p.countInStock = Math.max(0, (p.countInStock || 0) - it.qty);
      await p.save();
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'Confirmed';
    order.paymentResult = {
      ...order.paymentResult,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };
    await order.save();

    const toEmail = order.contact?.email;
    if (toEmail) {
      try {
        const pdf = await buildInvoiceBuffer(order);
        await sendMail({
          to: toEmail,
          subject: `Your RiksCandle Order #${String(order._id).slice(-6)} (Paid)`,
          html: `<p>Payment received successfully. Thank you!</p><p>Total: ₹${order.totals.grandTotal.toFixed(2)}</p>`,
          attachments: [{ filename: `invoice-${order._id}.pdf`, content: pdf }],
        });
      } catch (e) {
        console.warn('Invoice email failed (Razorpay):', e?.message || e);
      }
    }

    res.json({ ok: true, orderId: order._id });
  } catch (e) { next(e); }
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    // req.body is Buffer because of express.raw in server.js
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (expected !== signature) return res.status(400).send('Invalid signature');

    // Parse event if needed: const event = JSON.parse(req.body.toString('utf8'));
    // Handle payment.captured / order.paid etc. as needed.

    res.json({ received: true });
  } catch (e) { next(e); }
};
