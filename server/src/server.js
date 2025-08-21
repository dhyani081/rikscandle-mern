// server/src/server.js
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import captchaRoutes from './routes/captcha.routes.js';
import { razorpayWebhook } from './controllers/payment.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

connectDB();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());

// Razorpay webhook (raw body) BEFORE json parser
app.post('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// Normal parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({ origin: ORIGIN, credentials: true }));

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Serve local uploads (fallback mode)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/captcha', captchaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`RiksCandle server running on port ${PORT}`);
});
