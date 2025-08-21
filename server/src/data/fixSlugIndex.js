// server/src/data/fixSlugIndex.js
import 'dotenv/config.js';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const coll = mongoose.connection.db.collection('products');

  const idx = await coll.indexes();
  const has = idx.find(i => i.name === 'slug_1');
  if (has) {
    console.log('Dropping old slug_1 index …');
    await coll.dropIndex('slug_1').catch(e => console.log('drop warn:', e.message));
  }

  console.log('Creating partial unique index on slug …');
  await coll.createIndex(
    { slug: 1 },
    { name: 'slug_1', unique: true, partialFilterExpression: { slug: { $type: 'string', $ne: '' } } }
  );
  console.log('Done.');
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
