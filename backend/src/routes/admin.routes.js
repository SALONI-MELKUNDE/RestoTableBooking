const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { 
  requireAdmin,
  getAllUsers,
  createUser,
  deleteUser,
  updateUserRole,
  getAllBookings,
  updateRestaurantStatus,
  getSystemStats,
  getUserDetails,
  getRestaurantDetails
} = require('../controllers/admin.controller');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/role', updateUserRole);
router.get('/bookings', getAllBookings);
router.put('/restaurants/:restaurantId/status', updateRestaurantStatus);
router.get('/stats', getSystemStats);
router.get('/users/:userId', getUserDetails);
router.get('/restaurants/:restaurantId', getRestaurantDetails);

module.exports = router;
