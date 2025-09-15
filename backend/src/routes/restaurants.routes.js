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
  getRestaurantMenus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenu,
  deleteMenu,
  createTable,
  getRestaurantBookings,
  updateBookingStatus,
  getRestaurantTables,
  updateTable,
  deleteTable
} = require('../controllers/restaurants.controller');

// Public routes
router.get('/', listRestaurants);
router.get('/:id', getRestaurant);

// Protected routes
router.post('/', authenticateToken, createRestaurant);
router.put('/:id', authenticateToken, updateRestaurant);
router.delete('/:id', authenticateToken, deleteRestaurant);

// Menu and table management
router.get('/:id/menus', authenticateToken, getRestaurantMenus);
router.post('/:id/menus', authenticateToken, createMenu);
router.put('/menus/:menuId', authenticateToken, updateMenu);
router.delete('/menus/:menuId', authenticateToken, deleteMenu);
router.post('/menus/:id/items', authenticateToken, createMenuItem);
router.put('/menu-items/:itemId', authenticateToken, updateMenuItem);
router.delete('/menu-items/:itemId', authenticateToken, deleteMenuItem);
router.post('/:id/tables', authenticateToken, createTable);

// Booking management for restaurant owners
router.get('/:id/bookings', authenticateToken, getRestaurantBookings);
router.put('/bookings/:bookingId/status', authenticateToken, updateBookingStatus);

// Tables management
router.get('/:id/tables', authenticateToken, getRestaurantTables);
router.put('/:id/tables/:tableId', authenticateToken, updateTable);
router.delete('/:id/tables/:tableId', authenticateToken, deleteTable);

module.exports = router;


