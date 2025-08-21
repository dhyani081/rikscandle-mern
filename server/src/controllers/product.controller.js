// server/src/controllers/product.controller.js
import Product from '../models/Product.js';

export const listProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      limit = 20,
      page = 1,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const q = {};
    if (search) {
      q.name = { $regex: String(search), $options: 'i' };
    }

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    const lim = Math.min(100, Math.max(1, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * lim;

    const [items, total] = await Promise.all([
      Product.find(q).sort(sortObj).skip(skip).limit(lim),
      Product.countDocuments(q),
    ]);

    res.json({ items, total, page: Number(page), limit: lim });
  } catch (e) {
    next(e);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) {
    next(e);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      image,
      images,
      price,
      mrp,
      category,
      brand,
      countInStock,
    } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const product = await Product.create({
      name,
      description,
      image,
      images,
      price: Number(price),
      mrp: mrp != null ? Number(mrp) : undefined, // fallback preset in model
      category,
      brand,
      countInStock: Number(countInStock || 0),
    });

    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });

    const fields = [
      'name',
      'description',
      'image',
      'images',
      'price',
      'mrp',
      'category',
      'brand',
      'countInStock',
    ];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        p[f] = f === 'price' || f === 'mrp' || f === 'countInStock'
          ? Number(req.body[f])
          : req.body[f];
      }
    }

    // If mrp not provided and price changed, ensure mrp defaults
    if (req.body.price !== undefined && req.body.mrp === undefined && (p.mrp == null || p.mrp === 0)) {
      p.mrp = p.price;
    }

    await p.save();
    res.json(p);
  } catch (e) {
    next(e);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });

    // Optional: prevent multiple reviews by same user
    const already = p.reviews?.find(r => String(r.user) === String(req.user._id));
    if (already) return res.status(400).json({ message: 'Already reviewed' });

    p.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating || 0),
      comment: comment || '',
    });
    p.numReviews = p.reviews.length;
    p.rating =
      p.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
      (p.reviews.length || 1);

    await p.save();
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
};
