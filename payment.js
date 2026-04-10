//
// PROMPT USED TO GENERATE THIS FILE:
// Build Express payment routes (routes/payment.js) for TravelEase. All routes use auth middleware.
// Try require('razorpay') — if fails set Razorpay=null (graceful mock fallback).
// POST /create-order: find booking by bookingId. If Razorpay available: create real order (amount in paise, receipt=booking.bookingId), save orderId, return {success,orderId,amount,currency,key}. If mock: generate 'order_mock_'+Date.now(), same response with isMock:true.
// POST /verify: find booking, if Razorpay+signature verify HMAC sha256 (orderId|paymentId against KEY_SECRET). Set booking.paymentId/paymentStatus=paid/bookingStatus=confirmed, save. Return {success,booking:{bookingId,pnr,finalAmount}}.
// POST /mock-success: find booking by _id, set paymentId='DEMO_PAY_'+Date.now(), paymentStatus=paid, bookingStatus=confirmed, save. Return {success,booking:{bookingId,pnr,finalAmount}}.
//
//# prompt: Express payment routes - POST /create-order creates Razorpay order, POST /verify verifies payment signature and updates booking status to paid/confirmed

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

// Razorpay integration (uses test keys - replace with real keys in production)
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.log('Razorpay not installed - using mock payment');
}

const getRazorpay = () => {
  if (!Razorpay) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
  });
};

// @route POST /api/payment/create-order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const razorpay = getRazorpay();

    if (razorpay) {
      // Real Razorpay order
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: booking.bookingId,
        notes: { bookingId: booking._id.toString() }
      });
      booking.orderId = order.id;
      await booking.save();
      res.json({ success: true, orderId: order.id, amount: order.amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
    } else {
      // Mock payment order for demo
      const mockOrderId = 'order_mock_' + Date.now();
      booking.orderId = mockOrderId;
      await booking.save();
      res.json({ success: true, orderId: mockOrderId, amount: Math.round(amount * 100), currency: 'INR', key: 'demo', isMock: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment order creation failed', error: err.message });
  }
});

// @route POST /api/payment/verify
router.post('/verify', auth, async (req, res) => {
  try {
    const { bookingId, paymentId, orderId, signature } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const razorpay = getRazorpay();

    if (razorpay && signature) {
      // Verify real Razorpay signature
      const crypto = require('crypto');
      const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId).digest('hex');

      if (expectedSig !== signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Update booking as paid and confirmed
    booking.paymentId = paymentId || 'mock_' + Date.now();
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment successful! Booking confirmed.',
      booking: { bookingId: booking.bookingId, pnr: booking.pnr, finalAmount: booking.finalAmount }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment verification failed', error: err.message });
  }
});

// @route POST /api/payment/mock-success (for demo without Razorpay keys)
router.post('/mock-success', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.paymentId = 'DEMO_PAY_' + Date.now();
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Demo payment successful! Booking confirmed.',
      booking: { bookingId: booking.bookingId, pnr: booking.pnr, finalAmount: booking.finalAmount }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
