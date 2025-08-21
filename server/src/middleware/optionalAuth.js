// server/src/middleware/optionalAuth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const TOKEN_NAME = 'cc_token';

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[TOKEN_NAME];
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) req.user = user;
  } catch {
    // ignore errors for guest
  }
  next();
};
