const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/bookings.controller');

router.get('/restaurants/:restaurantId/availability', ctrl.checkAvailability);
router.post('/', authenticateToken, ctrl.createBooking);
router.patch('/:id/cancel', authenticateToken, ctrl.cancelBooking);
router.patch('/:id/status', authenticateToken, ctrl.updateBookingStatus);
router.get('/users/:userId/bookings', authenticateToken, ctrl.getUserBookings);
router.get('/admin/restaurants/:id/bookings', authenticateToken, ctrl.getRestaurantBookings); // restrict to owner/admin in controller

module.exports = router;
