const mongoose = require("mongoose");
const User = require("../models/User");
const Transport = require("../models/Transport");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/transportbooking";

const sampleTransports = [
  { type:'bus', name:'VRL Volvo AC', number:'VRL001', operator:'VRL Travels', from:'Mumbai', to:'Pune', departureTime:'06:00', arrivalTime:'10:30', duration:'4h 30m', totalSeats:40, availableSeats:28, priceEconomy:350, priceBusiness:650, amenities:['AC','WiFi','Charging','Water Bottle'], rating:4.5 },
  { type:'bus', name:'KSRTC Express', number:'KA001', operator:'KSRTC', from:'Bangalore', to:'Mysore', departureTime:'07:00', arrivalTime:'10:00', duration:'3h', totalSeats:45, availableSeats:20, priceEconomy:200, amenities:['AC'], rating:3.8 },
  { type:'bus', name:'RedBus Premium', number:'RB201', operator:'RedBus', from:'Chennai', to:'Coimbatore', departureTime:'22:00', arrivalTime:'04:00', duration:'6h', totalSeats:40, availableSeats:15, priceEconomy:450, priceBusiness:800, amenities:['AC','Blanket','Charging'], rating:4.2 },

  { type:'train', name:'Rajdhani Express', number:'12951', operator:'Indian Railways', from:'Mumbai', to:'Delhi', departureTime:'17:00', arrivalTime:'08:35', duration:'15h 35m', totalSeats:100, availableSeats:45, priceEconomy:1500, priceBusiness:2800, priceFirst:4500, amenities:['Meal','Bedroll','AC'], rating:4.3 },
  { type:'train', name:'Shatabdi Express', number:'12001', operator:'Indian Railways', from:'Delhi', to:'Agra', departureTime:'06:00', arrivalTime:'08:00', duration:'2h', totalSeats:80, availableSeats:32, priceEconomy:450, priceBusiness:900, amenities:['Breakfast','AC'], rating:4.6 },
  { type:'train', name:'Vande Bharat', number:'20901', operator:'Indian Railways', from:'Bangalore', to:'Chennai', departureTime:'06:00', arrivalTime:'10:30', duration:'4h 30m', totalSeats:100, availableSeats:60, priceEconomy:1200, priceBusiness:2200, amenities:['Meal','WiFi','AC'], rating:4.8 },

  { type:'flight', name:'IndiGo 6E-201', number:'6E-201', operator:'IndiGo', from:'Mumbai', to:'Delhi', departureTime:'06:00', arrivalTime:'08:00', duration:'2h', totalSeats:180, availableSeats:90, priceEconomy:2500, priceBusiness:8000, amenities:['Snacks','Entertainment'], rating:4.1 },
  { type:'flight', name:'Air India AI-505', number:'AI-505', operator:'Air India', from:'Bangalore', to:'Kolkata', departureTime:'10:30', arrivalTime:'13:30', duration:'3h', totalSeats:150, availableSeats:45, priceEconomy:4500, priceBusiness:12000, priceFirst:20000, amenities:['Meal','Entertainment','WiFi'], rating:4.0 },

  { type:'car', name:'Innova Crysta', number:'MH01-0001', operator:'Ola Outstation', from:'Mumbai', to:'Goa', departureTime:'06:00', arrivalTime:'16:00', duration:'10h', totalSeats:6, availableSeats:5, priceEconomy:4500, amenities:['AC','GPS','Driver'], rating:4.4 },

  { type:'auto', name:'City Auto', number:'AUTO-001', operator:'Ola Auto', from:'Bangalore', to:'Electronic City', departureTime:'08:00', arrivalTime:'08:45', duration:'45m', totalSeats:3, availableSeats:2, priceEconomy:120, amenities:['GPS'], rating:3.9 },

  { type:'bike', name:'Rapido Bike', number:'BIKE-001', operator:'Rapido', from:'Bangalore', to:'Koramangala', departureTime:'08:00', arrivalTime:'08:25', duration:'25m', totalSeats:1, availableSeats:1, priceEconomy:60, amenities:['Helmet'], rating:4.1 }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "admin@transport.com" });
    if (!existingAdmin) {
      await new User({
        name: "Admin User",
        email: "admin@transport.com",
        password: "admin123",
        phone: "9999999999",
        role: "admin",
      }).save();
      console.log("✅ Admin created: admin@transport.com / admin123");
    }

    const existingUser = await User.findOne({ email: "test@test.com" });
    if (!existingUser) {
      await new User({
        name: "Test User",
        email: "test@test.com",
        password: "test123",
        phone: "9876543210",
        role: "user",
      }).save();
      console.log("✅ Test user created");
    }

    const count = await Transport.countDocuments();
    if (count === 0) {
      await Transport.insertMany(sampleTransports);
      console.log(`✅ ${sampleTransports.length} transport routes added`);
    }

    console.log("\n🎉 Seed complete! Run: npm start");
    process.exit();
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();