const express = require('express');
const { 
  getRestaurantMenus, 
  createMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require('../controllers/menu.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantMenus);

// Protected routes (require authentication)
router.post('/restaurant/:restaurantId', authenticateToken, createMenu);
router.post('/:menuId/items', authenticateToken, addMenuItem);
router.put('/items/:itemId', authenticateToken, updateMenuItem);
router.delete('/items/:itemId', authenticateToken, deleteMenuItem);

module.exports = router;

