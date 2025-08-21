import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: { type: String, default: 'open', enum: ['open','closed'] }
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportSchema);
