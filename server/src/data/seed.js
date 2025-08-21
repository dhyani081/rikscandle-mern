// server/src/data/seed.js
import 'dotenv/config.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Product from '../models/Product.js';
import User from '../models/User.js';
// import Order from '../models/Order.js'; // If you want to wipe orders also

async function run() {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  const dbName = conn.connection.db?.databaseName || '(unknown-db)';
  console.log('Seeding DB:', dbName);

  // WIPE
  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({}),
    // Order.deleteMany({}),
  ]);

  // Admin + sample user
  const adminPass = process.env.SEED_ADMIN_PASS || 'Admin@123';
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@rikscandle.test',
    password: bcrypt.hashSync(adminPass, 10),
    isAdmin: true,
  });
  const user = await User.create({
    name: 'User',
    email: 'user@rikscandle.test',
    password: bcrypt.hashSync('User@123', 10),
    isAdmin: false,
  });

  // Sample products (slug auto-generate hoga)
  const prods = [
    {
      name: 'Vanilla Bean Soy Candle',
      description: 'Warm vanilla with creamy notes. Hand‑poured.',
      price: 299, mrp: 399, countInStock: 25,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'Lavender Calm',
      description: 'Relaxing lavender for cozy evenings.',
      price: 349, mrp: 449, countInStock: 18,
      image: 'https://images.unsplash.com/photo-1520931737576-7aa27dd879d8?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'Citrus Burst',
      description: 'Bright notes of orange & lemon.',
      price: 279, mrp: 349, countInStock: 30,
      image: 'https://images.unsplash.com/photo-1485561531591-7f61d4f10fd2?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'Sandalwood Amber',
      description: 'Woody & warm, perfect for night.',
      price: 399, mrp: 499, countInStock: 12,
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'Rose Blush',
      description: 'Soft floral notes with a sweet finish.',
      price: 329, mrp: 429, countInStock: 20,
      image: 'https://images.unsplash.com/photo-1519681393700-61e88b4a6191?q=80&w=1200&auto=format&fit=crop'
    },
    {
      name: 'Cocoa Spice',
      description: 'Chocolatey spice—cozy winter pick.',
      price: 359, mrp: 459, countInStock: 15,
      image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop'
    },
  ];

  await Product.insertMany(prods);

  console.log('Seed complete.');
  console.log(`Admin: ${admin.email}  Pass: ${adminPass}`);
  console.log('User : user@rikscandle.test  Pass: User@123');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
