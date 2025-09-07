const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/waitlist.controller');

// User routes
router.post('/restaurants/:restaurantId/waitlist', authenticateToken, ctrl.joinWaitlist);
router.delete('/waitlist/:id', authenticateToken, ctrl.leaveWaitlist);
router.get('/users/:userId/waitlist', authenticateToken, ctrl.getUserWaitlist);

// Admin routes
router.get('/admin/restaurants/:restaurantId/waitlist', authenticateToken, ctrl.getRestaurantWaitlist);
router.patch('/admin/waitlist/:id/notify', authenticateToken, ctrl.notifyWaitlistEntry);

module.exports = router;
