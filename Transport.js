//
// PROMPT USED TO GENERATE THIS FILE:
// Build Mongoose Transport model for TravelEase.
// Schema: type (enum: bus/car/flight/train/auto/bike, required), name (required), number (required), operator (required), from (required), to (required), departureTime (required), arrivalTime (required), duration (required), totalSeats (Number, required), availableSeats (Number, required), seatLayout (String, default:'2x2'), bookedSeats ([String]), priceEconomy (required), priceBusiness (Number), priceFirst (Number), amenities ([String]), rating (Number, default:4.0, min:1, max:5), isActive (Boolean, default:true), createdAt (Date, default:Date.now).
//
const mongoose = require('mongoose');
const transportSchema = new mongoose.Schema({
  type: { type: String, enum: ['bus','car','flight','train','auto','bike'], required: true },
  name: { type: String, required: true },
  number: { type: String, required: true },
  operator: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  seatLayout: { type: String, default: '2x2' },
  bookedSeats: [String],
  priceEconomy: { type: Number, required: true },
  priceBusiness: { type: Number },
  priceFirst: { type: Number },
  amenities: [String],
  rating: { type: Number, default: 4.0, min: 1, max: 5 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Transport', transportSchema);
