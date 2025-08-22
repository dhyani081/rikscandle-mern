// server/src/controllers/upload.controller.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import stream from 'stream';
import { cloudinary, hasCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // --- Cloudinary (production / persistent) ---
    if (hasCloudinary) {
      const pass = new stream.PassThrough();
      pass.end(req.file.buffer);

      const result = await new Promise((resolve, reject) => {
        const up = cloudinary.uploader.upload_stream(
          { folder: 'rikscandle/products' },
          (err, out) => (err ? reject(err) : resolve(out))
        );
        pass.pipe(up);
      });

      // auto format/quality for perf
      const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
      return res
        .status(201)
        .json({ url: optimizedUrl, path: optimizedUrl, publicId: result.public_id });
    }

    // --- Local fallback (DEV only; Render is ephemeral) ---
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(req.file.originalname || '.jpg').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadsDir, name);

    await fs.promises.writeFile(filePath, req.file.buffer);

    const rel = `/uploads/${name}`; // use abs origin on the client
    return res.status(201).json({ url: rel, path: rel });
  } catch (e) {
    next(e);
  }
}

export async function deleteImage(req, res, next) {
  try {
    const { publicId } = req.params;
    if (hasCloudinary && publicId) {
      const resp = await cloudinary.uploader.destroy(publicId);
      return res.json({ ok: true, result: resp });
    }
    // local fallback: nothing to delete here via API
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
