// server/src/controllers/product.controller.js
import mongoose from 'mongoose';
import Product from '../models/Product.js';

/**
 * GET /api/products
 * Two modes:
 *  - Legacy (no "page"): returns array of items (backward compatible)
 *  - Paginated (with "page"): returns { items, page, totalPages, totalItems, ... }
 */
export async function listProducts(req, res) {
  const {
    page,           // if present => paginated mode
    limit = 8,
    search = '',
    sort = 'createdAt',
    order = 'desc',
    category,
    minPrice,
    maxPrice,
    inStock,
  } = req.query;

  // Build query
  const q = {};
  if (search) {
    q.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) q.category = category;
  if (inStock === 'true') q.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
  }

  const sortObj = { [sort]: String(order).toLowerCase() === 'asc' ? 1 : -1 };

  // ---- Legacy mode (no page) -> return plain array ----
  if (page === undefined) {
    const l = Math.min(Math.max(parseInt(limit) || 8, 1), 100);
    const items = await Product.find(q).sort(sortObj).limit(l);
    return res.json(items);
  }

  // ---- Paginated mode ----
  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit) || 12, 1), 60);
  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    Product.find(q).sort(sortObj).skip(skip).limit(l),
    Product.countDocuments(q),
  ]);

  const totalPages = Math.max(Math.ceil(total / l), 1);

  return res.json({
    items,
    page: p,
    limit: l,
    totalItems: total,
    totalPages,
    hasPrev: p > 1,
    hasNext: p < totalPages,
  });
}

/**
 * GET /api/products/:id
 */
export async function getProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }
  const p = await Product.findById(id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}

/**
 * POST /api/products
 * body: { name, description, price, mrp, stock, image, images[], category }
 */
export async function createProduct(req, res) {
  const { name, description, price, mrp, stock, image, images, category } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ message: 'Name & price are required' });
  }

  const doc = new Product({
    name,
    description,
    price: Number(price),
    mrp: mrp != null ? Number(mrp) : undefined,
    stock: stock != null ? Number(stock) : undefined,
    image,
    images,
    category,
  });

  try {
    const saved = await doc.save();
    return res.status(201).json(saved);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key', key: e.keyValue });
    }
    throw e;
  }
}

/**
 * PUT /api/products/:id
 */
export async function updateProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const update = {};
  const allowed = ['name', 'description', 'price', 'mrp', 'stock', 'image', 'images', 'category'];
  for (const k of allowed) {
    if (k in req.body) update[k] = req.body[k];
  }

  try {
    const p = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key', key: e.keyValue });
    }
    throw e;
  }
}

/**
 * DELETE /api/products/:id
 */
export async function removeProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }
  const r = await Product.findByIdAndDelete(id);
  if (!r) return res.status(404).json({ message: 'Product not found' });
  res.json({ ok: true });
}

/**
 * POST /api/products/:id/reviews
 * body: { rating, comment }
 * req.user must be set by auth middleware
 */
export async function addReview(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // prevent duplicate review by same user
  const uid = String(req.user?._id || '');
  const already = (product.reviews || []).find((r) => String(r.user) === uid);
  if (already) {
    return res.status(400).json({ message: 'You have already reviewed this product' });
  }

  product.reviews.push({
    user: req.user?._id,
    name: req.user?.name || 'User',
    rating: Number(rating) || 5,
    comment: comment || '',
  });

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / (product.numReviews || 1);

  await product.save();
  res.status(201).json(product);
}

/* ---- Aliases for older imports (optional but safe) ---- */
export const getProductById = getProduct;
export const deleteProduct = removeProduct;
