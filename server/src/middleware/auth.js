// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function signTokenAndSetCookie(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function clearAuthCookie(res) {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function protect(req, res, next) {
  try {
    const token =
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
}

// guest allowed, attach user if token available
export async function maybeAuth(req, res, next) {
  try {
    const token =
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch {}
  next();
}

export function admin(req, res, next) {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: 'Forbidden' });
}

// alias for backward compatibility
export const adminOnly = admin;
