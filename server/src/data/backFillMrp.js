    // server/src/data/backfillMrp.js
import 'dotenv/config.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const res = await Product.updateMany(
    { $or: [{ mrp: { $exists: false } }, { mrp: null }] },
    [{ $set: { mrp: { $ifNull: ['$mrp', '$price'] } } }]
  );
  console.log('Backfill done:', res.modifiedCount, 'products updated');
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
