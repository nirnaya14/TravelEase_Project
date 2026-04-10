//
// PROMPT:
// Build Express server (server.js) for TravelEase transport booking backend.
// Setup: express, mongoose, cors (origin:'*'), dotenv, path. Middleware: express.json(), urlencoded. Serve static ../frontend.
// MongoDB: connect to MONGO_URI (default localhost/transportbooking). On connect run autoSeed().
// if no admin user create admin@transport.com/admin123 (role:admin). If no demo user create user@test.com/user123. If Transport.count=0 insert 13 seed records (4 buses: VRL Volvo, KSRTC, RedBus Premium, Orange Travels; 3 trains: Rajdhani, Shatabdi, Vande Bharat; 3 flights: IndiGo 6E-201, Air India AI-505, SpiceJet SG-420; 1 car Innova, 1 auto, 1 bike) with full fields: type/name/number/operator/from/to/departureTime/arrivalTime/duration/totalSeats/availableSeats/seatLayout/priceEconomy/priceBusiness/priceFirst/amenities/rating.
// Routes: /api/auth, /api/transport, /api/bookings, /api/payment, /api/admin.
// SPA route map: '/'→index.html, '/login'→login.html, '/register'→register.html, '/book'→book.html, '/seats'→seats.html, '/payment'→payment.html, '/success'→success.html, '/dashboard'→dashboard.html, '/my-bookings'→my-bookings.html, '/admin-login'→admin-login.html, '/admin'→admin.html.
// Listen on PORT (default 3000).
//
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transportbooking';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => { console.log('✅ MongoDB Connected'); await autoSeed(); })
  .catch(err => console.log('❌ MongoDB Error:', err.message));

async function autoSeed() {
  try {
    const User = require('./models/User');
    const Transport = require('./models/Transport');
    const admin = await User.findOne({ email: 'admin@transport.com' });
    if (!admin) {
      await new User({ name: 'Admin', email: 'admin@transport.com', password: 'admin123', phone: '9999999999', role: 'admin' }).save();
      console.log('✅ Admin: admin@transport.com / admin123');
    }
    const demo = await User.findOne({ email: 'user@test.com' });
    if (!demo) {
      await new User({ name: 'Demo User', email: 'user@test.com', password: 'user123', phone: '9876543210', role: 'user' }).save();
      console.log('✅ Demo user: user@test.com / user123');
    }
    const count = await Transport.countDocuments();
    if (count === 0) {
      const transports = [
        { type:'bus', name:'VRL Volvo AC', number:'VRL001', operator:'VRL Travels', from:'Mumbai', to:'Pune', departureTime:'06:00 AM', arrivalTime:'10:30 AM', duration:'4h 30m', totalSeats:40, availableSeats:28, seatLayout:'2x2', priceEconomy:350, priceBusiness:650, amenities:['AC','WiFi','Charging','Water Bottle'], rating:4.5 },
        { type:'bus', name:'KSRTC Express', number:'KA001', operator:'KSRTC', from:'Bangalore', to:'Mysore', departureTime:'07:00 AM', arrivalTime:'10:00 AM', duration:'3h', totalSeats:45, availableSeats:20, seatLayout:'2x2', priceEconomy:200, priceBusiness:380, amenities:['AC','Charging'], rating:3.8 },
        { type:'bus', name:'RedBus Premium', number:'RB201', operator:'RedBus', from:'Chennai', to:'Coimbatore', departureTime:'10:00 PM', arrivalTime:'04:00 AM', duration:'6h', totalSeats:40, availableSeats:15, seatLayout:'2x1', priceEconomy:450, priceBusiness:800, amenities:['AC','Blanket','Charging'], rating:4.2 },
        { type:'bus', name:'Orange Travels', number:'OT301', operator:'Orange Tours', from:'Hyderabad', to:'Bangalore', departureTime:'08:00 PM', arrivalTime:'06:00 AM', duration:'10h', totalSeats:40, availableSeats:22, seatLayout:'2x2', priceEconomy:600, priceBusiness:1100, amenities:['AC','WiFi','Blanket','Meal'], rating:4.4 },
        { type:'train', name:'Rajdhani Express', number:'12951', operator:'Indian Railways', from:'Mumbai', to:'Delhi', departureTime:'05:00 PM', arrivalTime:'08:35 AM', duration:'15h 35m', totalSeats:60, availableSeats:45, seatLayout:'3x2', priceEconomy:1500, priceBusiness:2800, priceFirst:4500, amenities:['Meal','Bedroll','AC'], rating:4.3 },
        { type:'train', name:'Shatabdi Express', number:'12001', operator:'Indian Railways', from:'Delhi', to:'Agra', departureTime:'06:00 AM', arrivalTime:'08:00 AM', duration:'2h', totalSeats:80, availableSeats:32, seatLayout:'3x2', priceEconomy:450, priceBusiness:900, amenities:['Breakfast','AC'], rating:4.6 },
        { type:'train', name:'Vande Bharat', number:'20901', operator:'Indian Railways', from:'Bangalore', to:'Chennai', departureTime:'06:00 AM', arrivalTime:'10:30 AM', duration:'4h 30m', totalSeats:72, availableSeats:60, seatLayout:'3x2', priceEconomy:1200, priceBusiness:2200, amenities:['Meal','WiFi','AC'], rating:4.8 },
        { type:'flight', name:'IndiGo 6E-201', number:'6E-201', operator:'IndiGo', from:'Mumbai', to:'Delhi', departureTime:'06:00 AM', arrivalTime:'08:00 AM', duration:'2h', totalSeats:180, availableSeats:90, seatLayout:'3x3', priceEconomy:2500, priceBusiness:8000, amenities:['Snacks','Entertainment'], rating:4.1 },
        { type:'flight', name:'Air India AI-505', number:'AI-505', operator:'Air India', from:'Bangalore', to:'Kolkata', departureTime:'10:30 AM', arrivalTime:'01:30 PM', duration:'3h', totalSeats:150, availableSeats:45, seatLayout:'3x3', priceEconomy:4500, priceBusiness:12000, priceFirst:20000, amenities:['Meal','Entertainment','WiFi'], rating:4.0 },
        { type:'flight', name:'SpiceJet SG-420', number:'SG-420', operator:'SpiceJet', from:'Chennai', to:'Hyderabad', departureTime:'08:00 AM', arrivalTime:'09:15 AM', duration:'1h 15m', totalSeats:160, availableSeats:75, seatLayout:'3x3', priceEconomy:1800, priceBusiness:5500, amenities:['Snacks','Entertainment'], rating:3.9 },
        { type:'car', name:'Innova Crysta', number:'MH01-0001', operator:'Ola Outstation', from:'Mumbai', to:'Goa', departureTime:'06:00 AM', arrivalTime:'04:00 PM', duration:'10h', totalSeats:6, availableSeats:5, priceEconomy:4500, amenities:['AC','GPS','Driver'], rating:4.4 },
        { type:'auto', name:'City Auto', number:'AUTO-001', operator:'Ola Auto', from:'Bangalore', to:'Electronic City', departureTime:'08:00 AM', arrivalTime:'08:45 AM', duration:'45m', totalSeats:3, availableSeats:2, priceEconomy:120, amenities:['GPS'], rating:3.9 },
        { type:'bike', name:'Rapido Bike', number:'BIKE-001', operator:'Rapido', from:'Bangalore', to:'Koramangala', departureTime:'08:00 AM', arrivalTime:'08:25 AM', duration:'25m', totalSeats:1, availableSeats:1, priceEconomy:60, amenities:['Helmet'], rating:4.1 }
      ];
      await Transport.insertMany(transports);
      console.log('✅ ' + transports.length + ' transports seeded');
    }
  } catch(e) { /* non-fatal */ }
}

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/payment',   require('./routes/payment'));
app.use('/api/admin',     require('./routes/admin'));

const pages = { '/':'index', '/login':'login', '/register':'register', '/dashboard':'dashboard', '/book':'book', '/payment':'payment', '/my-bookings':'my-bookings', '/admin':'admin', '/admin-login':'admin-login', '/success':'success', '/seats':'seats' };
Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(__dirname, `../frontend/pages/${file}.html`)));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log('🌐  App:   http://localhost:' + PORT);
  console.log('👑  Admin: http://localhost:' + PORT + '/admin-login');
  console.log('📧  admin@transport.com  / admin123');
  console.log('👤  user@test.com        / user123');
  console.log('🚀 ═══════════════════════════════════════════════');
});
