// server/src/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  qty: Number,
}, { _id: false });

const addressSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  pin: String,
  phone: String,
  stateCode: String,
}, { _id: false });

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for guest
  contact: contactSchema,
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  paymentMethod: { type: String, default: 'COD' }, // COD | RAZORPAY
  totals: {
    subTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  status: {
    type: String,
    default: 'Placed',
    enum: ['Placed', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentResult: { type: Object },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
