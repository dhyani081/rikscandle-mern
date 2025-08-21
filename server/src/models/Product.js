// server/src/models/Product.js
import mongoose from 'mongoose';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    description: { type: String, default: '' },

    // pricing
    mrp: { type: Number, default: 0 },
    price: { type: Number, required: true },

    // images
    image: { type: String, default: '' },       // primary
    images: { type: [imageSchema], default: [] },

    // inventory
    stock: { type: Number, default: 20, min: 0, index: true },
    soldCount: { type: Number, default: 0, min: 0 },

    // reviews
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    // misc
    category: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// auto slug if missing or invalid
productSchema.pre('save', function (next) {
  if (!this.slug || this.slug === 'null' || this.slug === 'undefined') {
    if (this.name) {
      this.slug = slugify(this.name) + '-' + Math.random().toString(36).slice(2, 6);
    }
  }
  next();
});

export default mongoose.model('Product', productSchema);
