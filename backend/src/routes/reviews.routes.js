const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/reviews.controller');

// Public routes
router.get('/restaurants/:restaurantId/reviews', ctrl.getRestaurantReviews);

// Authenticated routes
router.post('/restaurants/:restaurantId/reviews', authenticateToken, ctrl.createReview);
router.patch('/reviews/:id', authenticateToken, ctrl.updateReview);
router.delete('/reviews/:id', authenticateToken, ctrl.deleteReview);

module.exports = router;

