// // server/src/server.js
// import express from 'express';
// import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import morgan from 'morgan';

// import connectDB from './config/db.js';

// import authRoutes from './routes/auth.routes.js';
// import productRoutes from './routes/product.routes.js';
// import orderRoutes from './routes/order.routes.js';
// import uploadRoutes from './routes/upload.routes.js';
// import path from 'path';
// import { fileURLToPath } from 'url';

// dotenv.config();

// const app = express();

// // trust proxy (prod/CDN/proxy me zaroori; dev me harmless)
// app.set('trust proxy', 1);

// // CORS + cookies
// const allowedOrigins = ['https://rikscandle.com', 'https://rikscandle.in', 'https://www.rikscandle.in', 'https://www.rikscandle.com'];
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
// if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// // Connect DB then start server
// connectDB()
//   .then(() => {
//     app.get('/api/health', (req, res) => res.json({ ok: true }));

//     app.use('/api/auth', authRoutes);
//     app.use('/api/products', productRoutes);
//     app.use('/api/orders', orderRoutes);
//     app.use('/api/uploads', uploadRoutes);

//     app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
//     app.use((err, req, res, next) => {
//       console.error(err);
//       res.status(500).json({ message: err.message || 'Server error' });
//     });

//     const port = process.env.PORT || 5000;
//     app.listen(port, () => console.log(`RiksCandle server running on port ${port}`));
//   })
//   .catch((err) => {
//     console.error('DB connection failed:', err?.message || err);
//     process.exit(1);
//   });


import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// trust proxy (prod/CDN/proxy me zaroori; dev me harmless)
app.set('trust proxy', 1);

// CORS + cookies
const allowedOrigins = [
  'https://rikscandle.com',
  'https://rikscandle.in',
  'https://www.rikscandle.in',
  'https://www.rikscandle.com'
];

// // Force HTTPS in production
// if (process.env.NODE_ENV === 'production') {
//   app.use((req, res, next) => {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect(301, 'https://' + req.headers.host + req.url);
//     }
//     next();
//   });
// }

app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the origin is in the allowed list or allow localhost in development
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // To allow cookies to be sent with requests
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Connect DB then start server
connectDB()
  .then(() => {
    app.get('/api/health', (req, res) => res.json({ ok: true }));

    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/uploads', uploadRoutes);

    app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ message: err.message || 'Server error' });
    });

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`RiksCandle server running on port ${port}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err?.message || err);
    process.exit(1);
  });
