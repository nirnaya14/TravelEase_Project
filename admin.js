//
// PROMPT USED TO GENERATE THIS FILE:
// Build Express admin routes (routes/admin.js) for TravelEase. All routes use adminAuth middleware.
// GET /stats: parallel queries for totalUsers (role:user), totalBookings, confirmedBookings, cancelledBookings, pendingBookings. Aggregate sum of finalAmount where paymentStatus:paid → totalRevenue. Aggregate bookings by transportType → byType[]. Find last 10 bookings with populate userId. Find last 10 users. Aggregate daily bookings last 7 days. Return all in stats object.
// GET /users: paginated (page/limit), optional search regex on name+email, select -password, return {users,total,pages}.
// GET /bookings: paginated, optional filter by transportType+bookingStatus+search on bookingId/userName/userEmail.
// PUT /bookings/:id/status: update bookingStatus + paymentStatus fields, return updated booking.
// PUT /users/:id/toggle: toggle user.isActive, return new value.
// POST /seed: create admin user if not exists.
//
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { adminAuth } = require('../middleware/auth');

// @route GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });

    // Revenue calculation
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Bookings by transport type
    const byType = await Booking.aggregate([
      { $group: { _id: '$transportType', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { count: -1 } }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(10)
      .populate('userId', 'name email');

    // Recent users
    const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(10).select('-password');

    // Daily bookings for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalBookings, confirmedBookings, cancelledBookings,
        pendingBookings, totalRevenue, byType, recentBookings, recentUsers, dailyBookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(query).select('-password')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/bookings
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search = '' } = req.query;
    const query = {};
    if (type) query.transportType = type;
    if (status) query.bookingStatus = status;
    if (search) query.$or = [{ bookingId: new RegExp(search, 'i') }, { userName: new RegExp(search, 'i') }, { userEmail: new RegExp(search, 'i') }];

    const bookings = await Booking.find(query).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await Booking.countDocuments(query);

    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PUT /api/admin/bookings/:id/status
router.put('/bookings/:id/status', adminAuth, async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus, paymentStatus, updatedAt: Date.now() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Status updated', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/admin/seed (create admin user + sample data)
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@transport.com' });
    if (!existingAdmin) {
      const admin = new User({ name: 'Admin', email: 'admin@transport.com', password: 'admin123', phone: '9999999999', role: 'admin' });
      await admin.save();
    }
    res.json({ success: true, message: 'Admin created: admin@transport.com / admin123' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seed failed', error: err.message });
  }
});

module.exports = router;
