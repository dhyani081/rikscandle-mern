// server/src/routes/upload.routes.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import streamifier from 'streamifier';
import { cloudinary, hasCloudinary } from '../config/cloudinary.js';

const router = Router();

// Multer in-memory (so we can send to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    // Prefer Cloudinary if configured
    if (hasCloudinary) {
      const folder = process.env.CLOUDINARY_FOLDER || 'rikscandle';
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (err, r) => (err ? reject(err) : resolve(r))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      return res.status(201).json({
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
      });
    }

    // Fallback: save to local /uploads (make absolute URL)
    const outDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(outDir, { recursive: true });

    const ext = path.extname(req.file.originalname || '') || '.jpg';
    const fname = `${Date.now()}-${randomUUID()}${ext}`;
    const full = path.join(outDir, fname);
    await fs.writeFile(full, req.file.buffer);

    // Build absolute URL (important for frontend)
    const base =
      process.env.PUBLIC_API_URL ||
      `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/${fname}`;

    return res.status(201).json({
      url,
      publicId: '',
      provider: 'local',
    });
  } catch (e) {
    console.error('UPLOAD ERROR:', e);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
