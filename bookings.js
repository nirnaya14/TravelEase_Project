//
// PROMPT USED TO GENERATE THIS FILE:
// Build Express booking routes (routes/bookings.js) for TravelEase. All routes use auth middleware.
// POST /create: destructure full booking payload from req.body (transportType/from/to/journeyDate/transportName/transportNumber/departureTime/arrivalTime/duration/seatClass/passengers/totalPassengers/pricePerSeat/totalAmount/taxes/discount/finalAmount), attach userId/userName/userEmail/userPhone from req.user, new Booking().save(), return {success,booking}. bookingId+PNR generated in pre-save hook.
// GET /my-bookings (auth): Booking.find({userId:req.user._id}).sort({createdAt:-1}), return {success,count,bookings}.
// GET /:id (auth): find by _id where userId matches (security), 404 if not found.
// PUT /:id/cancel (auth): find booking, if already cancelled → 400. Set bookingStatus='cancelled', paymentStatus: paid→refunded else failed. Save + return {success,message,booking}.
//
//# prompt: Express booking routes - POST /create creates new booking, GET /my-bookings returns user's bookings, GET /:id returns booking details, PUT /:id/cancel cancels a booking

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

// @route POST /api/bookings/create
router.post('/create', auth, async (req, res) => {
  try {
    const {
      transportType, from, to, journeyDate, returnDate, isRoundTrip,
      transportName, transportNumber, departureTime, arrivalTime, duration,
      seatClass, passengers, totalPassengers, pricePerSeat,
      totalAmount, taxes, discount, finalAmount
    } = req.body;

    const booking = new Booking({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      transportType, from, to, journeyDate, returnDate, isRoundTrip,
      transportName, transportNumber, departureTime, arrivalTime, duration,
      seatClass, passengers, totalPassengers, pricePerSeat,
      totalAmount, taxes, discount, finalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();
    res.status(201).json({ success: true, message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Booking failed', error: err.message });
  }
});

// @route GET /api/bookings/my-bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.bookingStatus === 'cancelled')
      return res.status(400).json({ success: false, message: 'Already cancelled' });

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : 'failed';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
