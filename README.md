# 🚀 TravelEase — Transport Booking System
** Node.js + Express + MongoDB + Vanilla JS**

---

## ▶️ HOW TO RUN (Direct, No Commands Needed)

### Option 1 — Double-click START.sh (Linux/Mac)
```
./START.sh
```

### Option 2 — Terminal
```bash
cd backend
npm start
```

Then open: **http://localhost:5000**

---

## 📋 Login Credentials (Auto-Created)

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@transport.com      | admin123  |
| User  | user@test.com            | user123   |

Admin Login Page: **http://localhost:5000/admin-login**

---

## 🌟 All Pages & Features

| Page              | URL              | Description                              |
|-------------------|------------------|------------------------------------------|
| Home              | /                | Hero, search box, popular routes         |
| Search Results    | /book            | Live transport results with filters      |
| Seat Selection    | /seats           | Visual seat map (bus/train/flight)       |
| Payment           | /payment         | Passenger details + payment methods      |
| Success           | /success         | Booking confirmation + PNR               |
| Dashboard         | /dashboard       | User stats + quick search + recent bks  |
| My Bookings       | /my-bookings     | All bookings, filter, cancel             |
| Login             | /login           | User login                               |
| Register          | /register        | New user registration                    |
| Admin Login       | /admin-login     | Separate admin login                     |
| Admin Panel       | /admin           | Full admin dashboard                     |

---

## 👑 Admin Panel Features

- **Dashboard**: 8 stat cards in horizontal columns (users, bookings, confirmed, cancelled, pending, revenue, transports, avg/booking) + bookings by transport type + 7-day daily chart + recent bookings table
- **All Bookings**: Filter by status/type/search, update booking & payment status
- **Users**: All registered users, activate/deactivate accounts
- **Transports**: View by type, add new transport with full seat layout config

---

## 💺 Seat Selection

- **Bus**: 2×2 or 2×1 layout with ladies seats (pink), driver cabin shown
- **Train**: 3×2 layout with class separation
- **Flight**: 3×3 layout with business/economy separation
- Select up to 6 seats, click to toggle, real-time price update
- Seat numbers carry through to booking

---

## 🔌 API Endpoints

```
POST /api/auth/register        Register user
POST /api/auth/login           User login
POST /api/auth/admin-login     Admin-only login

GET  /api/transport/search     Search transports (mock fallback)
GET  /api/transport/cities     City list
GET  /api/transport/:id        Single transport

POST /api/bookings/create      Create booking
GET  /api/bookings/my-bookings User's bookings
PUT  /api/bookings/:id/cancel  Cancel booking
POST /api/payment/mock-success Confirm payment

GET  /api/admin/stats          Dashboard stats
GET  /api/admin/users          All users
PUT  /api/admin/users/:id/toggle Toggle user active
GET  /api/admin/bookings       All bookings (filterable)
PUT  /api/admin/bookings/:id/status Update status
POST /api/transport            Add transport (admin)
```

---

## 🗂️ Project Structure

```
travelease/
├── START.sh                   ← Run this to start!
├── backend/
│   ├── server.js              Auto-seeds DB on first run
│   ├── models/                User, Booking, Transport
│   ├── routes/                auth, bookings, transport, payment, admin
│   ├── middleware/            JWT auth + admin guard
│   ├── .env                   Config
│   └── package.json
└── frontend/
    ├── pages/
    │   ├── index.html         Home
    │   ├── login.html         User login
    │   ├── register.html      Register
    │   ├── admin-login.html   Admin login (separate)
    │   ├── admin.html         Full admin panel
    │   ├── book.html          Search results
    │   ├── seats.html         Seat selection map
    │   ├── payment.html       Payment flow
    │   ├── success.html       Booking confirmation
    │   ├── dashboard.html     User dashboard
    │   └── my-bookings.html   Booking history
    ├── styles/main.css
    └── js/utils.js
```

---

*MongoDB must be running locally. Install: https://www.mongodb.com/try/download/community*
