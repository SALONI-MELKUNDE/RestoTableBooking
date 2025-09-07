const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createMenu,
  createMenuItem,
  createTable,
  getRestaurantBookings,
  updateBookingStatus
} = require('../controllers/restaurants.controller');

// Public routes
router.get('/', listRestaurants);
router.get('/:id', getRestaurant);

// Protected routes
router.post('/', authenticateToken, createRestaurant);
router.put('/:id', authenticateToken, updateRestaurant);
router.delete('/:id', authenticateToken, deleteRestaurant);

// Menu and table management
router.post('/:id/menus', authenticateToken, createMenu);
router.post('/menus/:id/items', authenticateToken, createMenuItem);
router.post('/:id/tables', authenticateToken, createTable);

// Booking management for restaurant owners
router.get('/:id/bookings', authenticateToken, getRestaurantBookings);
router.put('/bookings/:bookingId/status', authenticateToken, updateBookingStatus);

module.exports = router;
