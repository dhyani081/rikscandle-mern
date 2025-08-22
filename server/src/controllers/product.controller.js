// // server/src/controllers/product.controller.js
// import Product from '../models/Product.js';

// export const listProducts = async (req, res, next) => {
//   try {
//     const {
//       search = '',
//       limit = 20,
//       page = 1,
//       sort = 'createdAt',
//       order = 'desc',
//     } = req.query;

//     const q = {};
//     if (search) {
//       q.name = { $regex: String(search), $options: 'i' };
//     }

//     const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
//     const lim = Math.min(100, Math.max(1, Number(limit)));
//     const skip = (Math.max(1, Number(page)) - 1) * lim;

//     const [items, total] = await Promise.all([
//       Product.find(q).sort(sortObj).skip(skip).limit(lim),
//       Product.countDocuments(q),
//     ]);

//     res.json({ items, total, page: Number(page), limit: lim });
//   } catch (e) {
//     next(e);
//   }
// };

// export const getProductById = async (req, res, next) => {
//   try {
//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: 'Product not found' });
//     res.json(p);
//   } catch (e) {
//     next(e);
//   }
// };

// export const createProduct = async (req, res, next) => {
//   try {
//     const {
//       name,
//       description,
//       image,
//       images,
//       price,
//       mrp,
//       category,
//       brand,
//       countInStock,
//     } = req.body;

//     if (!name || price == null) {
//       return res.status(400).json({ message: 'Name and price are required' });
//     }

//     const product = await Product.create({
//       name,
//       description,
//       image,
//       images,
//       price: Number(price),
//       mrp: mrp != null ? Number(mrp) : undefined, // fallback preset in model
//       category,
//       brand,
//       countInStock: Number(countInStock || 0),
//     });

//     res.status(201).json(product);
//   } catch (e) {
//     next(e);
//   }
// };

// export const updateProduct = async (req, res, next) => {
//   try {
//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: 'Product not found' });

//     const fields = [
//       'name',
//       'description',
//       'image',
//       'images',
//       'price',
//       'mrp',
//       'category',
//       'brand',
//       'countInStock',
//     ];

//     for (const f of fields) {
//       if (req.body[f] !== undefined) {
//         p[f] = f === 'price' || f === 'mrp' || f === 'countInStock'
//           ? Number(req.body[f])
//           : req.body[f];
//       }
//     }

//     // If mrp not provided and price changed, ensure mrp defaults
//     if (req.body.price !== undefined && req.body.mrp === undefined && (p.mrp == null || p.mrp === 0)) {
//       p.mrp = p.price;
//     }

//     await p.save();
//     res.json(p);
//   } catch (e) {
//     next(e);
//   }
// };

// export const deleteProduct = async (req, res, next) => {
//   try {
//     const p = await Product.findByIdAndDelete(req.params.id);
//     if (!p) return res.status(404).json({ message: 'Product not found' });
//     res.json({ message: 'Deleted' });
//   } catch (e) {
//     next(e);
//   }
// };

// export const addReview = async (req, res, next) => {
//   try {
//     const { rating, comment } = req.body;
//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: 'Product not found' });

//     // Optional: prevent multiple reviews by same user
//     const already = p.reviews?.find(r => String(r.user) === String(req.user._id));
//     if (already) return res.status(400).json({ message: 'Already reviewed' });

//     p.reviews.push({
//       user: req.user._id,
//       name: req.user.name,
//       rating: Number(rating || 0),
//       comment: comment || '',
//     });
//     p.numReviews = p.reviews.length;
//     p.rating =
//       p.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
//       (p.reviews.length || 1);

//     await p.save();
//     res.status(201).json(p);
//   } catch (e) {
//     next(e);
//   }
// };


// server/src/controllers/product.controller.js
import Product from '../models/product.model.js';

// GET /api/products
// Supports both modes:
//  - Legacy (no page): returns pure array (backward compatible for Home/Admin etc.)
//  - Paginated (with ?page=): returns {items, page, totalPages, totalItems, ...}
export async function listProducts(req, res) {
  const {
    page,                 // when present -> paginated mode
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

  // ---- Legacy mode (no page param) -> return plain array ----
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
