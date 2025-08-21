// server/src/routes/captcha.routes.js
import { Router } from 'express';
import { issueCaptcha } from '../utils/captcha.js';

const router = Router();

// GET /api/captcha/new  -> { svg, token, ttlSeconds }
router.get('/new', (req, res) => {
  const { svg, token, ttlSeconds } = issueCaptcha();
  res.json({ svg, token, ttlSeconds });
});

export default router;
