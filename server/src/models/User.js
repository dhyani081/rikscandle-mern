import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },

  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },

  // OTP (hashed) + expiry
  emailOTPHash: String,
  emailOTPExpires: Date,
  phoneOTPHash: String,
  phoneOTPExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

export default mongoose.model('User', userSchema);
