const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all restaurants
const listRestaurants = async (req, res, next) => {
  try {
    const { city, cuisine, rating, priceRange, availableDate, availableTime } = req.query;
    
    let whereClause = {};
    
    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }
    
    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        tables: true,
        menus: {
          include: {
            items: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });
    
    // Filter by availability if requested
    let filteredRestaurants = restaurants;
    if (availableDate && availableTime) {
      const requestedDate = new Date(`${availableDate}T${availableTime}`);
      const endTime = new Date(requestedDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      filteredRestaurants = await Promise.all(
        restaurants.map(async (restaurant) => {
          const conflictingBookings = await prisma.booking.count({
            where: {
              restaurantId: restaurant.id,
              status: { not: 'CANCELLED' },
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: requestedDate } }
              ]
            }
          });
          
          const totalTables = restaurant.tables.length;
          const availableTables = totalTables - conflictingBookings;
          
          return availableTables > 0 ? { ...restaurant, availableTables } : null;
        })
      );
      
      filteredRestaurants = filteredRestaurants.filter(Boolean);
    }
    
    res.json(filteredRestaurants);
  } catch (err) {
    next(err);
  }
};

// Get single restaurant
const getRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        tables: true,
        menus: {
          include: {
            items: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};

// Create restaurant with menu and tables
const createRestaurant = async (req, res, next) => {
  try {
    const { 
      name, address, city, state, zipCode, country, phone, website, 
      description, cuisine, priceRange, lat, lon, openingTime, closingTime,
      tables = [], // Array of table objects {label, seats}
      menuName = 'Main Menu',
      menuDescription = 'Our delicious offerings'
    } = req.body;
    
    // Create restaurant with menu and tables in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name,
          address,
          city,
          state,
          zipCode,
          country,
          phone,
          website,
          description,
          cuisine,
          priceRange,
          lat: lat ? parseFloat(lat) : null,
          lon: lon ? parseFloat(lon) : null,
          openingTime,
          closingTime,
          ownerId: req.user.id
        }
      });
      
      // Create default menu
      const menu = await tx.menu.create({
        data: {
          name: menuName,
          description: menuDescription,
          restaurantId: restaurant.id
        }
      });
      
      // Create tables if provided
      const createdTables = [];
      if (tables.length > 0) {
        for (const table of tables) {
          const createdTable = await tx.restaurantTable.create({
            data: {
              label: table.label,
              seats: parseInt(table.seats),
              restaurantId: restaurant.id
            }
          });
          createdTables.push(createdTable);
        }
      }
      
      return { restaurant, menu, tables: createdTables };
    });
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Update restaurant (Admin only)
const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, city, lat, lon, openingTime, closingTime } = req.body;
    
    // Check if user owns this restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!existingRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (existingRestaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        address,
        city,
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
        openingTime,
        closingTime
      }
    });
    
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};

// Delete restaurant (Admin only)
const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user owns this restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!existingRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (existingRestaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }
    
    await prisma.restaurant.delete({
      where: { id }
    });
    
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Create menu (Admin only)
const createMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create menu for this restaurant' });
    }
    
    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        restaurantId: id
      }
    });
    
    res.status(201).json(menu);
  } catch (err) {
    next(err);
  }
};

// Create menu item (Admin only)
const createMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, available, category, ingredients, allergens } = req.body;
    
    // Check if user owns the restaurant that owns this menu
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: { restaurant: true }
    });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    if (menu.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create menu item for this menu' });
    }
    
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        available: available !== false,
        category: category || 'MAIN_COURSE',
        ingredients,
        allergens,
        menuId: id
      }
    });
    
    res.status(201).json(menuItem);
  } catch (err) {
    next(err);
  }
};

// Update menu item
const updateMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, available, category, ingredients, allergens } = req.body;
    
    // Check if user owns the restaurant that owns this menu item
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
      return res.status(403).json({ message: 'Not authorized to update this menu item' });
    }
    
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        available: available !== undefined ? available : undefined,
        category,
        ingredients,
        allergens
      }
    });
    
    res.json(updatedMenuItem);
  } catch (err) {
    next(err);
  }
};

// Delete menu item
const deleteMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    
    // Check if user owns the restaurant that owns this menu item
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
      return res.status(403).json({ message: 'Not authorized to delete this menu item' });
    }
    
    await prisma.menuItem.delete({
      where: { id: itemId }
    });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Update menu
const updateMenu = async (req, res, next) => {
  try {
    const { menuId } = req.params;
    const { name, description } = req.body;
    
    // Check if user owns the restaurant that owns this menu
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true }
    });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    if (menu.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this menu' });
    }
    
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: { name, description }
    });
    
    res.json(updatedMenu);
  } catch (err) {
    next(err);
  }
};

// Get restaurant menus
const getRestaurantMenus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: {
          include: {
            items: true
          }
        }
      }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this restaurant\'s menus' });
    }
    
    res.json({ menus: restaurant.menus });
  } catch (err) {
    next(err);
  }
};

// Delete menu
const deleteMenu = async (req, res, next) => {
  try {
    const { menuId } = req.params;
    
    // Check if user owns the restaurant that owns this menu
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true }
    });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    if (menu.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this menu' });
    }
    
    await prisma.menu.delete({
      where: { id: menuId }
    });
    
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Create table (Admin only)
const createTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, seats } = req.body;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create table for this restaurant' });
    }
    
    const table = await prisma.restaurantTable.create({
      data: {
        label,
        seats: parseInt(seats),
        restaurantId: id
      }
    });
    
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
};

// Get restaurant bookings for owner
const getRestaurantBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view bookings for this restaurant' });
    }
    
    const bookings = await prisma.booking.findMany({
      where: { restaurantId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        table: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// Update booking status (approve/reject)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        restaurant: true,
        user: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns the restaurant
    if (booking.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: true,
        restaurant: true,
        table: true
      }
    });
    
    // Send email notification
    const { sendEmail } = require('../services/email.service');
    const statusText = status === 'CONFIRMED' ? 'confirmed' : 'cancelled';
    const emailSubject = `Booking ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - TableTrek`;
    const emailBody = `Hi ${booking.user.name},\n\nYour booking at ${booking.restaurant.name} has been ${statusText} by the restaurant.\n\nBooking Details:\n📅 Date: ${new Date(booking.startTime).toLocaleDateString()}\n⏰ Time: ${new Date(booking.startTime).toLocaleTimeString()}\n👥 Party Size: ${booking.partySize}\n📍 Restaurant: ${booking.restaurant.name}\n\nThank you for using TableTrek!`;
    
    await sendEmail(booking.user.email, emailSubject, emailBody);
    
    res.json(updatedBooking);
  } catch (err) {
    next(err);
  }
};

// Get restaurant tables
const getRestaurantTables = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view tables for this restaurant' });
    }
    
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId: id },
      orderBy: { label: 'asc' }
    });
    
    res.json({ tables });
  } catch (err) {
    next(err);
  }
};

// Update table
const updateTable = async (req, res, next) => {
  try {
    const { id, tableId } = req.params;
    const { label, seats, isActive } = req.body;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update tables for this restaurant' });
    }
    
    const table = await prisma.restaurantTable.update({
      where: { id: tableId },
      data: {
        label,
        seats: seats ? parseInt(seats) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    
    res.json(table);
  } catch (err) {
    next(err);
  }
};

// Delete table
const deleteTable = async (req, res, next) => {
  try {
    const { id, tableId } = req.params;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete tables for this restaurant' });
    }
    
    await prisma.restaurantTable.delete({
      where: { id: tableId }
    });
    
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createMenu,
  getRestaurantMenus,
  updateMenu,
  deleteMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createTable,
  getRestaurantBookings,
  updateBookingStatus,
  getRestaurantTables,
  updateTable,
  deleteTable
};
