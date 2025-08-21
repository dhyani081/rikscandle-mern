// server/src/controllers/auth.controller.js
import User from '../models/User.js';
import { signTokenAndSetCookie, clearAuthCookie } from '../middleware/auth.js';

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, phone, isVerified: true });
  signTokenAndSetCookie(res, user._id);
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  signTokenAndSetCookie(res, user._id);
  res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
};

export const me = async (req, res) => res.json(req.user);

export const logout = async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
};
