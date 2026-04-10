//
// PROMPT :
// Build Express transport routes (routes/transport.js) for TravelEase.
// MOCK(type,from,to) generator: creates 5 realistic mock transports per type using operator arrays, price tiers, time slots, amenities, random availableSeats, correct seatLayout per type (bus:2x2, train:3x2, flight:3x3, car/auto/bike:1x1). Returns _id prefixed "mock_".
// GET /search: require type+from+to query params, query Transport.find({type, from:regex, to:regex, isActive:true}), if 0 results return MOCK(type,from,to) fallback. Return {success,count,transports}.
// GET /cities: return static array of 22 Indian cities.
// GET /:id: if id starts with "mock_" return error. Else Transport.findById, 404 if not found.
// POST /:id/book-seat (auth): push seatNumber to transport.bookedSeats, decrement availableSeats, save.
// POST / (adminAuth): create new Transport from req.body.
// DELETE /:id (adminAuth): findByIdAndDelete.
//
const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');
const { auth } = require('../middleware/auth');

const MOCK = (type, from, to) => {
  const ops = { bus:['VRL Travels','RedBus','KSRTC','Orange Tours','SRS Travels'], train:['Rajdhani Exp','Shatabdi Exp','Duronto Exp','Vande Bharat','Intercity'], flight:['IndiGo','Air India','SpiceJet','GoAir','Vistara'], car:['Ola Outstation','Uber','Zoomcar','Savaari','MyCabs'], auto:['Ola Auto','Rapido','City Auto','Quick Auto','Metro Auto'], bike:['Rapido','Ola Bike','Bounce','Vogo','Yulu'] };
  const prices = { bus:[300,600,900], train:[400,800,1500], flight:[2200,5000,11000], car:[1200,2200,3500], auto:[80,120,180], bike:[40,70,110] };
  const layouts = { bus:'2x2', train:'3x2', flight:'3x3', car:'1x1', auto:'1x1', bike:'1x1' };
  const times = ['05:00 AM','06:30 AM','08:00 AM','09:30 AM','11:00 AM','12:30 PM','02:00 PM','03:30 PM','05:00 PM','06:30 PM','08:00 PM','10:00 PM'];
  const dur = { bus:['4h 30m','5h','6h','7h','8h'], train:['2h','3h','4h','5h 30m','8h'], flight:['1h','1h 30m','2h','2h 30m','3h'], car:['5h','6h','7h','8h','10h'], auto:['20m','30m','45m','1h','1h 15m'], bike:['15m','25m','35m','45m','1h'] };
  const ams = { bus:['AC','WiFi','Charging','Blanket'], train:['AC','Meal','Bedroll','WiFi'], flight:['Meal','Entertainment','WiFi','Snacks'], car:['AC','GPS','Driver'], auto:['GPS'], bike:['Helmet'] };
  return (ops[type]||ops.bus).map((name,i) => ({
    _id:'mock_'+type+'_'+i, type, name: name+' '+type.toUpperCase().slice(0,2)+(1000+i),
    number:type.toUpperCase().slice(0,2)+(1001+i), operator:name, from, to,
    departureTime:times[i*2], arrivalTime:times[i*2+2]||times[i+1]||'11:59 PM',
    duration:dur[type][i%5], totalSeats: type==='flight'?180:type==='train'?80:40,
    availableSeats: Math.floor(Math.random()*25)+5,
    seatLayout: layouts[type]||'2x2',
    bookedSeats:[],
    priceEconomy:prices[type][0]+(i*50),
    priceBusiness:prices[type][1]?(prices[type][1]+(i*100)):null,
    priceFirst:prices[type][2]?(prices[type][2]+(i*200)):null,
    amenities: ams[type]||['AC'],
    rating:+(3.5+Math.random()*1.5).toFixed(1)
  }));
};

router.get('/search', async (req, res) => {
  try {
    const { type, from, to } = req.query;
    if (!type||!from||!to) return res.status(400).json({ success:false, message:'type, from, to required' });
    let transports = await Transport.find({ type, from:new RegExp(from,'i'), to:new RegExp(to,'i'), isActive:true });
    if (transports.length === 0) transports = MOCK(type, from, to);
    res.json({ success:true, count:transports.length, transports });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

router.get('/cities', (req, res) => {
  res.json({ success:true, cities:['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Surat','Lucknow','Nagpur','Kochi','Coimbatore','Mysore','Goa','Agra','Bhopal','Indore','Patna','Visakhapatnam','Vadodara'] });
});

router.get('/:id', async (req, res) => {
  try {
    if (req.params.id.startsWith('mock_')) {
      return res.json({ success:false, message:'Mock transport - no detail page' });
    }
    const t = await Transport.findById(req.params.id);
    if (!t) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, transport:t });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// Book a seat (mark as taken)
router.post('/:id/book-seat', auth, async (req, res) => {
  try {
    const { seatNumber } = req.body;
    const t = await Transport.findById(req.params.id);
    if (!t) return res.status(404).json({ success:false, message:'Not found' });
    if (t.bookedSeats.includes(seatNumber)) return res.status(400).json({ success:false, message:'Seat already booked' });
    t.bookedSeats.push(seatNumber);
    t.availableSeats = Math.max(0, t.availableSeats - 1);
    await t.save();
    res.json({ success:true, message:'Seat reserved' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// Admin: add transport
router.post('/', require('../middleware/auth').adminAuth, async (req, res) => {
  try {
    const t = new Transport(req.body);
    await t.save();
    res.status(201).json({ success:true, transport:t });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// Admin: delete transport
router.delete('/:id', require('../middleware/auth').adminAuth, async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Deleted' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;
