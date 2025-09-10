const express = require('express');
const cors = require('cors');
const pino = require('pino')();
const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurants.routes');
const bookingRoutes = require('./routes/bookings.routes');
const reviewRoutes = require('./routes/reviews.routes');
const waitlistRoutes = require('./routes/waitlist.routes');
const menuRoutes = require('./routes/menu.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.json({ ok: true, name: 'TableTrek API' }));

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', reviewRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/menus', menuRoutes);

// error handler
app.use((err, req, res, next) => {
  pino.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
