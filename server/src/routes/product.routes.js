// server/src/routes/product.routes.js
import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from '../controllers/product.controller.js';

const router = Router();

// Public
router.get('/', listProducts);
router.get('/:id', getProductById);

// Admin
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Reviews (logged-in customers)
router.post('/:id/reviews', protect, addReview);

export default router;
