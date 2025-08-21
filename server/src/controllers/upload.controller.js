import cloudinary from '../config/cloudinary.js';
import stream from 'stream';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const pass = new stream.PassThrough();
    pass.end(req.file.buffer);

    const result = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'rikscandle/products' },       // change folder if needed
        (err, result) => (err ? reject(err) : resolve(result))
      );
      pass.pipe(upload);
    });

    // Tip: transformation-ready URL (auto format/quality)
    const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');

    res.status(201).json({ url: optimizedUrl, publicId: result.public_id });
  } catch (e) { next(e); }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const resp = await cloudinary.uploader.destroy(publicId);
    res.json({ ok: true, result: resp });
  } catch (e) { next(e); }
};
