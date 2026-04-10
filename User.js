//
// PROMPT USED TO GENERATE THIS FILE:
// Build Mongoose User model for TravelEase.
// Schema: name (String, required, trim), email (String, required, unique, lowercase), password (String, required, minlength:6), phone (String, required), role (enum: user/admin, default:user), avatar (String, default:''), isActive (Boolean, default:true), createdAt (Date, default:Date.now).
// pre('save'): if password modified, bcrypt.hash(password, 12).
// methods.comparePassword: bcrypt.compare(candidatePassword, this.password).
//

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
