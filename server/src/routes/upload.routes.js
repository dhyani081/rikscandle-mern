// server/src/routes/upload.routes.js
import { Router } from 'express';
import multer from 'multer';
// import { protect, adminOnly } from '../middleware/auth.js';
import { uploadImage, deleteImage } from '../controllers/upload.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // buffer → Cloudinary/local

router.post('/', /* protect, adminOnly, */ upload.single('file'), uploadImage);
router.delete('/:publicId', /* protect, adminOnly, */ deleteImage);

export default router;
