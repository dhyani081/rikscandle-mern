// server/src/models/Product.js
import mongoose from 'mongoose';

// Simple slugify (no extra dependency)
function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[\s\W_]+/g, '-')  // non-word -> hyphen
    .replace(/^-+|-+$/g, '');
}

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    rating: Number,
    comment: String,
  },
  { timestamps: true }
);

const imageSchema = new mongoose.Schema(
  { url: String, publicId: String },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, default: undefined }, // auto-filled
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    images: [imageSchema],
    // price model
    price: { type: Number, required: true }, // sale price
    mrp: {
      type: Number,
      default: function () { return this.price || 0; },
    },
    category: { type: String, default: '' },
    brand: { type: String, default: '' },
    countInStock: { type: Number, default: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Partial unique index: only when slug is a non-empty string
productSchema.index(
  { slug: 1 },
  {
    name: 'slug_1',
    unique: true,
    partialFilterExpression: { slug: { $type: 'string', $ne: '' } },
  }
);

// Auto-generate unique slug from name (on create/update)
productSchema.pre('validate', async function (next) {
  if (!this.name) return next();

  // Only regenerate when name changed or slug missing/empty
  if (!this.isModified('name') && this.slug) return next();

  const base = slugify(this.name);
  if (!base) return next();

  const Product = this.constructor;
  let candidate = base;
  let suffix = 2;

  // Ensure unique (ignore self on updates)
  // loop adds -2, -3, ... if clashes
  while (await Product.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${base}-${suffix++}`;
  }
  this.slug = candidate;
  next();
});

// Keep mrp sane
productSchema.pre('save', function (next) {
  if (this.mrp == null) this.mrp = this.price || 0;
  next();
});

export default mongoose.model('Product', productSchema);
