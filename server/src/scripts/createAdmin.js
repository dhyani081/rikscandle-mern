// server/src/scripts/createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.js';

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'RiksCandle Admin';

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
  console.log('MongoDB connected');

  let user = await User.findOne({ email: String(email).toLowerCase() });
  if (user) {
    user.isAdmin = true;
    user.password = password;
    user.name = name;
    await user.save();
    console.log('Updated existing user as admin:', email);
  } else {
    await User.create({ name, email: String(email).toLowerCase(), password, isAdmin: true });
    console.log('Created admin:', email);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
