// server/src/utils/captcha.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SECRET = process.env.CAPTCHA_SECRET || process.env.JWT_SECRET || 'dev-secret';
const EXPIRES_IN = '5m';

function normalize(s) {
  return String(s || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

function randomText(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0,O,1,I
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function hmac(str) {
  return crypto.createHmac('sha256', SECRET).update(str).digest('hex');
}

function makeSVG(text) {
  const width = 180, height = 60;
  // simple noisy SVG
  const chars = text.split('').map((ch, i) => {
    const x = 20 + i * 30 + Math.random() * 5;
    const y = 40 + (Math.random() * 8 - 4);
    const rot = (Math.random() * 30 - 15).toFixed(1);
    const size = 28 + Math.floor(Math.random() * 3);
    return `<text x="${x}" y="${y}" fill="#1f2937" font-size="${size}" transform="rotate(${rot} ${x} ${y})" font-family="monospace" font-weight="700">${ch}</text>`;
  }).join('');

  const lines = Array.from({ length: 6 }, () => {
    const x1 = Math.random() * width, y1 = Math.random() * height;
    const x2 = Math.random() * width, y2 = Math.random() * height;
    const c = ['#f59e0b', '#10b981', '#ef4444'][Math.floor(Math.random() * 3)];
    const o = (0.2 + Math.random() * 0.2).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2" opacity="${o}"/>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#fef3c7"/>
  <g>${lines}</g>
  <g>${chars}</g>
</svg>`;
}

export function issueCaptcha() {
  const text = randomText(5);
  const answerHash = hmac(normalize(text));
  const token = jwt.sign({ h: answerHash }, SECRET, { expiresIn: EXPIRES_IN });
  const svg = makeSVG(text);
  return { svg, token, ttlSeconds: 300 };
}

export function verifyCaptchaToken(token, answer) {
  try {
    const payload = jwt.verify(token, SECRET);
    const inputHash = hmac(normalize(answer));
    return payload?.h && inputHash === payload.h;
  } catch {
    return false;
  }
}
