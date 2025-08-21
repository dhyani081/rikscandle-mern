import { Router } from 'express';
import {
  createOrder, getOrders, getMyOrders, getOrder,
  updateOrder, deleteOrder, downloadInvoice
} from '../controllers/order.controller.js';
import { protect, admin, maybeAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', maybeAuth, createOrder);     // ✅ link user if logged-in / email-match
router.get('/', protect, admin, getOrders);
router.get('/my', protect, getMyOrders);      // ✅ needs login
router.get('/:id/invoice', protect, downloadInvoice);
router.get('/:id', protect, getOrder);
router.put('/:id', protect, admin, updateOrder);
router.delete('/:id', protect, admin, deleteOrder);

export default router;
