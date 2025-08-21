// server/src/routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
// If you want to protect uploads for admin only, uncomment next line + route below
// import { protect, adminOnly } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * We want to store files in: server/uploads
 * __dirname = server/src/routes
 * path.join(__dirname, '..', '..', 'uploads') -> server/uploads
 */
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
// Make sure directory exists (Windows safe)
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '.jpg');
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

const router = express.Router();

// If you want auth: router.post('/', protect, adminOnly, upload.single('file'), handler);
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  // Always return a web-safe POSIX URL
  const url = `/uploads/${req.file.filename}`;
  return res.status(201).json({ url });
});

export default router;
