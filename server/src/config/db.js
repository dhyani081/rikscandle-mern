// server/src/config/db.js
import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME; // e.g., rikscandle
  if (!uri) throw new Error('MONGO_URI missing');

  const conn = await mongoose.connect(uri, { dbName: dbName || undefined });
  console.log(`MongoDB connected: ${conn.connection.host} | db: ${conn.connection.name}`);
  return conn;
}
