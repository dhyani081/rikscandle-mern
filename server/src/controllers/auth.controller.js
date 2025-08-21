// server/src/controllers/auth.controller.js
import User from '../models/User.js';
import { signTokenAndSetCookie, clearAuthCookie } from '../middleware/auth.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone = '' } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password,
      phone,
    });

    signTokenAndSetCookie(res, user._id);
    const safe = user.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    signTokenAndSetCookie(res, user._id);
    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  res.json(req.user);
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
};
