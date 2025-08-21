import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = Router();

router.get('/stats', protect, adminOnly, async (req, res) => {
  const [users, products, orders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments()
  ]);
  const revenueAgg = await Order.aggregate([
    { $group: { _id: null, revenue: { $sum: "$totals.grandTotal" } } }
  ]);
  res.json({
    users,
    products,
    orders,
    revenue: revenueAgg?.[0]?.revenue || 0
  });
});

export default router;
