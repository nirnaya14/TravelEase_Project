//
// PROMPT USED TO GENERATE THIS FILE:
// Build Mongoose Booking model for TravelEase.
// Schema fields: userId (ObjectId ref User, required), userName, userEmail, userPhone (from req.user at creation time). transportType (enum: bus/car/flight/train/auto/bike). from/to/journeyDate (required), returnDate, isRoundTrip. transportName/transportNumber/departureTime/arrivalTime/duration/seatClass (default Economy). passengers array [{name,age,gender:enum male/female/other,seatNumber}]. totalPassengers (default:1). pricePerSeat/totalAmount/finalAmount (required), taxes/discount (default:0). paymentId/orderId/paymentMethod (default:online). paymentStatus (enum: pending/paid/failed/refunded, default:pending). bookingStatus (enum: confirmed/cancelled/completed/pending, default:pending). bookingId (String, unique), pnr (String). createdAt/updatedAt.
// pre('save'): if !bookingId generate 'TRB'+Date.now().slice(-8)+random 4 chars uppercase; generate pnr = random 8 chars uppercase. Set updatedAt=Date.now().
//
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, required: true },

  transportType: {
    type: String,
    enum: ['bus', 'car', 'flight', 'train', 'auto', 'bike'],
    required: true
  },

  // Route Details
  from: { type: String, required: true },
  to: { type: String, required: true },
  journeyDate: { type: Date, required: true },
  returnDate: { type: Date },
  isRoundTrip: { type: Boolean, default: false },

  // Transport Details
  transportName: { type: String, required: true },
  transportNumber: { type: String },
  departureTime: { type: String },
  arrivalTime: { type: String },
  duration: { type: String },
  seatClass: { type: String, default: 'Economy' },

  // Passengers
  passengers: [{
    name: String,
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    seatNumber: String
  }],
  totalPassengers: { type: Number, default: 1 },

  // Pricing
  pricePerSeat: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  taxes: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },

  // Payment
  paymentId: { type: String },
  orderId: { type: String },
  paymentMethod: { type: String, default: 'online' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'pending'],
    default: 'pending'
  },

  bookingId: { type: String, unique: true },
  pnr: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate booking ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'TRB' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    this.pnr = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
