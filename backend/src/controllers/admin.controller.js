const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all users
async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// Create new user
async function createUser(req, res, next) {
  try {
    const { name, email, password, role = 'USER' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    next(err);
  }
}

// Delete user
async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    
    // Don't allow deleting the current admin
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    next(err);
  }
}

// Update user role
async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['USER', 'RESTAURANT_OWNER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// Get all bookings
async function getAllBookings(req, res, next) {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        table: {
          select: {
            id: true,
            label: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

// Update restaurant status
async function updateRestaurantStatus(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const { isActive } = req.body;
    
    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });
    
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

// Get system statistics
async function getSystemStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalRestaurants,
      activeRestaurants,
      totalBookings,
      todayBookings,
      totalReviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.review.count()
    ]);

    // Get user registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get booking trends by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const stats = {
      totalUsers,
      totalRestaurants,
      activeRestaurants,
      totalBookings,
      todayBookings,
      totalReviews,
      userGrowth,
      bookingsByStatus
    };
    
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

// Get user details
async function getUserDetails(req, res, next) {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        ownedRestaurants: {
          select: {
            id: true,
            name: true,
            city: true,
            isActive: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// Get restaurant details
async function getRestaurantDetails(req, res, next) {
  try {
    const { restaurantId } = req.params;
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tables: true,
        menus: {
          include: {
            items: true
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
};
