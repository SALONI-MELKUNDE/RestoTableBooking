const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBookingAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.params;

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: userId
      }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or access denied' });
    }

    // Get date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Booking trends over last 30 days
    const bookingTrends = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        restaurantId: restaurantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Process booking trends by day
    const dailyBookings = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyBookings[dateStr] = 0;
    }

    bookingTrends.forEach(trend => {
      const dateStr = trend.createdAt.toISOString().split('T')[0];
      dailyBookings[dateStr] = trend._count.id;
    });

    const bookingTrendData = Object.entries(dailyBookings).map(([date, count]) => ({
      date,
      bookings: count
    }));

    // Booking status distribution
    const bookingStatusData = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        restaurantId: restaurantId
      },
      _count: {
        id: true
      }
    });

    const statusDistribution = bookingStatusData.map(status => ({
      status: status.status,
      count: status._count.id
    }));

    // Revenue estimation (assuming average meal price)
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        restaurantId: restaurantId,
        status: 'CONFIRMED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        table: true
      }
    });

    // Estimate revenue based on party size and average price per person
    const avgPricePerPerson = restaurant.priceRange === '$' ? 25 : 
                             restaurant.priceRange === '$$' ? 50 : 
                             restaurant.priceRange === '$$$' ? 75 : 100;

    const revenueData = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      revenueData[dateStr] = 0;
    }

    confirmedBookings.forEach(booking => {
      const dateStr = booking.createdAt.toISOString().split('T')[0];
      const estimatedRevenue = booking.partySize * avgPricePerPerson;
      revenueData[dateStr] += estimatedRevenue;
    });

    const revenueChartData = Object.entries(revenueData).map(([date, revenue]) => ({
      date,
      revenue
    }));

    // Peak hours analysis
    const hourlyBookings = await prisma.booking.findMany({
      where: {
        restaurantId: restaurantId,
        status: 'CONFIRMED'
      },
      select: {
        startTime: true
      }
    });

    const peakHoursData = {};
    for (let hour = 0; hour < 24; hour++) {
      peakHoursData[hour] = 0;
    }

    hourlyBookings.forEach(booking => {
      const hour = booking.startTime.getHours();
      peakHoursData[hour] += 1;
    });

    const peakHoursChartData = Object.entries(peakHoursData).map(([hour, count]) => ({
      hour: `${hour}:00`,
      bookings: count
    }));

    // Table utilization
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId: restaurantId }
    });

    const tableUtilization = await Promise.all(
      tables.map(async (table) => {
        const bookingCount = await prisma.booking.count({
          where: {
            tableId: table.id,
            status: 'CONFIRMED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        return {
          tableLabel: table.label,
          bookings: bookingCount,
          seats: table.seats
        };
      })
    );

    res.json({
      bookingTrends: bookingTrendData,
      statusDistribution,
      revenueEstimate: revenueChartData,
      peakHours: peakHoursChartData,
      tableUtilization,
      summary: {
        totalBookings: confirmedBookings.length,
        totalRevenue: Object.values(revenueData).reduce((sum, val) => sum + val, 0),
        avgBookingsPerDay: bookingTrendData.reduce((sum, day) => sum + day.bookings, 0) / 30
      }
    });

  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all restaurants owned by user
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: userId },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        tables: true,
        menus: {
          include: {
            items: true
          }
        }
      }
    });

    // Restaurant performance comparison
    const restaurantPerformance = restaurants.map(restaurant => ({
      name: restaurant.name,
      bookings: restaurant.bookings.length,
      tables: restaurant.tables.length,
      menuItems: restaurant.menus.reduce((total, menu) => total + menu.items.length, 0),
      revenue: restaurant.bookings
        .filter(b => b.status === 'CONFIRMED')
        .reduce((total, booking) => {
          const avgPrice = restaurant.priceRange === '$' ? 25 : 
                          restaurant.priceRange === '$$' ? 50 : 
                          restaurant.priceRange === '$$$' ? 75 : 100;
          return total + (booking.partySize * avgPrice);
        }, 0)
    }));

    res.json({
      restaurantPerformance,
      totalRestaurants: restaurants.length,
      totalBookings: restaurants.reduce((sum, r) => sum + r.bookings.length, 0),
      totalTables: restaurants.reduce((sum, r) => sum + r.tables.length, 0),
      totalMenuItems: restaurants.reduce((sum, r) => sum + r.menus.reduce((total, menu) => total + menu.items.length, 0), 0)
    });

  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getBookingAnalytics,
  getOverallAnalytics
};
