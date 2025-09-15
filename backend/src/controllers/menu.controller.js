const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all menus for a restaurant
async function getRestaurantMenus(req, res, next) {
  try {
    const { restaurantId } = req.params;
    
    const menus = await prisma.menu.findMany({
      where: { restaurantId },
      include: {
        items: {
          where: { available: true },
          orderBy: { category: 'asc' }
        }
      }
    });
    
    res.json({ menus });
  } catch (err) {
    next(err);
  }
}

// Create a new menu
async function createMenu(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const { name, description } = req.body;
    
    // Check if user owns the restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const menu = await prisma.menu.create({
      data: {
        restaurantId,
        name,
        description
      }
    });
    
    res.status(201).json({ menu });
  } catch (err) {
    next(err);
  }
}

// Add menu item
async function addMenuItem(req, res, next) {
  try {
    const { menuId } = req.params;
    const { name, description, price, category, imageUrl, ingredients, allergens } = req.body;
    
    // Check if user owns the restaurant
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true }
    });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    if (menu.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const menuItem = await prisma.menuItem.create({
      data: {
        menuId,
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        ingredients,
        allergens
      }
    });
    
    res.status(201).json({ menuItem });
  } catch (err) {
    next(err);
  }
}

// Update menu item
async function updateMenuItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { name, description, price, category, imageUrl, ingredients, allergens, available } = req.body;
    
    // Check if user owns the restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { 
        menu: { 
          include: { restaurant: true } 
        } 
      }
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    if (menuItem.menu.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
        imageUrl,
        ingredients,
        allergens,
        available
      }
    });
    
    res.json({ menuItem: updatedItem });
  } catch (err) {
    next(err);
  }
}

// Delete menu item
async function deleteMenuItem(req, res, next) {
  try {
    const { itemId } = req.params;
    
    // Check if user owns the restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { 
        menu: { 
          include: { restaurant: true } 
        } 
      }
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    if (menuItem.menu.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await prisma.menuItem.delete({
      where: { id: itemId }
    });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRestaurantMenus,
  createMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};