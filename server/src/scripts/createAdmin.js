// server/src/scripts/createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD; // set once, then remove from .env
  const name = process.env.ADMIN_NAME || 'Site Admin';

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  let user = await User.findOne({ email });
  if (user) {
    user.isAdmin = true;
    if (password) user.password = password; // pre-save hook hashes it
    user.name = name;
    await user.save();
    console.log('Updated existing user as admin:', email);
  } else {
    user = await User.create({ name, email, password, isAdmin: true });
    console.log('Created admin:', email);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
