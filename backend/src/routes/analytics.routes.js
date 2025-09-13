const express = require('express');
const { getBookingAnalytics, getOverallAnalytics } = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get booking analytics for a specific restaurant
router.get('/restaurants/:restaurantId/analytics', authenticateToken, getBookingAnalytics);

// Get overall analytics for all user's restaurants
router.get('/overview', authenticateToken, getOverallAnalytics);

module.exports = router;
