import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * 10)];
  return otp;
}

export async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

export async function verifyOTP(otp, hash) {
  return bcrypt.compare(otp, hash || '');
}
