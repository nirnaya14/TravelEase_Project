//
// PROMPT USED TO GENERATE THIS FILE:
// Build Express auth routes (routes/auth.js) using JWT + bcrypt for TravelEase.
// POST /register: require name/email/phone/password, check duplicate email, new User().save(), sign JWT {id} 7d, return {success,token,user:{id,name,email,phone,role}}.
// POST /login: find user by email, user.comparePassword(password) (bcrypt), sign JWT, return same structure.
// POST /admin-login: find user by email where role=admin, comparePassword, sign JWT 1d, return {success,token,user:{id,name,email,role}}.
// GET /profile (auth middleware): return {success, user: req.user}.
// PUT /profile (auth middleware): update name+phone via findByIdAndUpdate, return updated user.
// JWT_SECRET from process.env.JWT_SECRET || 'transport_booking_secret'.
//
//# prompt: Express auth routes - POST /register creates new user, POST /login returns JWT token, GET /profile returns logged-in user data, PUT /profile updates user info

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = new User({ name, email, password, phone });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'transport_booking_secret', { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'transport_booking_secret', { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route GET /api/auth/profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, select: '-password' }
    );
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/auth/admin-login (special admin login)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) return res.status(400).json({ success: false, message: 'Admin not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'transport_booking_secret', { expiresIn: '1d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
