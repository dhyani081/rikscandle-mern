// server/src/routes/payment.routes.js
import { Router } from 'express';
import { optionalAuth } from '../middleware/optionalAuth.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/payment.controller.js';

const router = Router();

// Guest can create Razorpay order (links to local pending Order)
router.post('/razorpay/order', optionalAuth, createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
