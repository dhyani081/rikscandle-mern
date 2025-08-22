// server/src/routes/product.routes.js
import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct,
  addReview,
} from '../controllers/product.controller.js';

const router = Router();

// Public
router.get('/', listProducts);      // supports ?page=&limit=&search=&sort=&order=
router.get('/:id', getProduct);

// Admin
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, removeProduct);

// Reviews (logged-in customers)
router.post('/:id/reviews', protect, addReview);

export default router;
