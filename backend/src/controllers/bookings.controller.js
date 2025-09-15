const prisma = require('../config/db');
const { acquireLock, releaseLock } = require('../utils/redisLock');
const { notificationQueue } = require('../jobs/queue');
const sendEmail = require('../services/email.service');

async function checkAvailability(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const { date, time, partySize, startTime, endTime } = req.query;
    
    let start, end;
    if (startTime && endTime) {
      start = new Date(startTime);
      end = new Date(endTime);
    } else if (date && time) {
      // Convert date and time to startTime and endTime (assuming 2-hour booking)
      const dateTimeStr = `${date}T${time}:00`;
      start = new Date(dateTimeStr);
      end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    } else {
      return res.status(400).json({ message: 'Either (startTime, endTime) or (date, time) parameters are required' });
    }
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId, isActive: true, seats: { gte: Number(partySize) } }
    });
    const tableIds = tables.map(t => t.id);
    const overlapping = await prisma.booking.findMany({
      where: {
        restaurantId,
        tableId: { in: tableIds },
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      }
    });
    const busyTableIds = new Set(overlapping.map(b => b.tableId));
    const freeTables = tables.filter(t => !busyTableIds.has(t.id));
    res.json({ available: freeTables.length > 0, freeTables });
  } catch (err) { next(err); }
}

async function createBooking(req, res, next) {
  const { restaurantId, startTime, endTime, partySize } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const lockKey = `booking_lock:${restaurantId}:${start.toISOString()}:${partySize}`;
  const token = await acquireLock(lockKey, 10000, 100, 20);
  if (!token) return res.status(409).json({ message: 'Could not acquire lock, try again' });

  try {
    // same availability logic as above, find first free table
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId, isActive: true, seats: { gte: Number(partySize) } },
      orderBy: { seats: 'asc' }
    });
    const tableIds = tables.map(t => t.id);
    const overlapping = await prisma.booking.findMany({
      where: {
        restaurantId,
        tableId: { in: tableIds },
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      }
    });
    const busy = new Set(overlapping.map(b => b.tableId));
    const free = tables.find(t => !busy.has(t.id));
    
    // Always create booking as PENDING; admin will review/confirm
    const bookingStatus = 'PENDING';
    const assignedTableId = null;


    const booking = await prisma.booking.create({
      data: {
        restaurantId,
        userId: req.user.id,
        tableId: assignedTableId,
        partySize: Number(partySize),
        startTime: start,
        endTime: end,
        status: bookingStatus
      },
      include: {
        user: true,
        restaurant: true,
        table: true
      }
    });

    // Send appropriate email based on booking status
    const bookingDate = start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

await sendEmail(
  booking.user.email,
  'Booking Request Received - TableTrek 🍽️',
  `Hi ${booking.user.name},\n\nThank you for your booking request! We've received your reservation request and it's currently pending review.\n\n📍 Restaurant: ${booking.restaurant.name}\n📅 Date: ${bookingDate}\n🕐 Time: ${bookingTime}\n👥 Party Size: ${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}\n📋 Booking ID: #${booking.id}\n\nOur restaurant team will review your request and confirm availability shortly. You'll receive another email once your booking is confirmed or if we need to suggest alternative times.\n\nThank you for your patience!\n\nBest regards,\nThe TableTrek Team`
);

await notificationQueue.add(
  'booking_pending',
  { bookingId: booking.id },
  { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
);

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  } finally {
    await releaseLock(lockKey, token);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, restaurant: true }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns the booking OR is the restaurant owner (admin)
    const isOwner = booking.userId === req.user.id;
    const isRestaurantOwner = booking.restaurant.ownerId === req.user.id;
    
    if (!isOwner && !isRestaurantOwner) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    // Send cancellation email notification
    const bookingDate = booking.startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = booking.startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const cancelledBy = isRestaurantOwner && !isOwner ? 'restaurant' : 'customer';
    const emailSubject = cancelledBy === 'restaurant' 
      ? 'Booking Cancelled by Restaurant - TableTrek'
      : 'Booking Cancellation - TableTrek';
    
    const emailMessage = cancelledBy === 'restaurant'
      ? `Hi ${booking.user.name},\n\nWe regret to inform you that your table reservation has been cancelled by the restaurant.\n\n📍 Restaurant: ${booking.restaurant.name}\n📅 Date: ${bookingDate}\n🕐 Time: ${bookingTime}\n👥 Party Size: ${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}\n📋 Booking ID: #${booking.id}\n\nWe apologize for any inconvenience this may cause. Please contact the restaurant directly for more information or to reschedule.\n\nBest regards,\nThe TableTrek Team`
      : `Hi ${booking.user.name},\n\nYour table reservation has been successfully cancelled.\n\n📍 Restaurant: ${booking.restaurant.name}\n📅 Date: ${bookingDate}\n🕐 Time: ${bookingTime}\n👥 Party Size: ${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}\n📋 Booking ID: #${booking.id}\n\nWe're sorry to see you cancel your reservation. We hope to serve you another time!\n\nIf you need to make a new reservation, you can visit our website anytime.\n\nBest regards,\nThe TableTrek Team`;

    await sendEmail(
      booking.user.email,
      emailSubject,
      emailMessage
    );
    
    // Send cancellation notification
    await notificationQueue.add('booking_cancel', { bookingId: booking.id }, { 
      attempts: 3, 
      backoff: { type: 'exponential', delay: 1000 }
    });
    
    res.json({ booking: updatedBooking });
  } catch (err) {
    next(err);
  }
}

async function getUserBookings(req, res, next) {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }
    
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            city: true
          }
        },
        table: {
          select: {
            label: true,
            seats: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });
    
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

async function getRestaurantBookings(req, res, next) {
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
            name: true,
            email: true,
            phone: true
          }
        },
        table: {
          select: {
            label: true,
            seats: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });
    
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, restaurant: true, table: true }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the restaurant owner
    if (booking.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // If confirming a pending booking, assign a table
    let updateData = { status };
    if (status === 'CONFIRMED' && booking.status === 'PENDING') {
      if (!tableId) {
        // Find an available table
        const tables = await prisma.restaurantTable.findMany({
          where: { 
            restaurantId: booking.restaurantId, 
            isActive: true, 
            seats: { gte: booking.partySize } 
          },
          orderBy: { seats: 'asc' }
        });
        
        const tableIds = tables.map(t => t.id);
        const overlapping = await prisma.booking.findMany({
          where: {
            restaurantId: booking.restaurantId,
            tableId: { in: tableIds },
            status: { not: 'CANCELLED' },
            AND: [
              { startTime: { lt: booking.endTime } },
              { endTime: { gt: booking.startTime } }
            ]
          }
        });
        
        const busy = new Set(overlapping.map(b => b.tableId));
        const availableTable = tables.find(t => !busy.has(t.id));
        
        if (!availableTable) {
          // Admin override: If no tables available, assign to the smallest suitable table anyway
          // This allows overbooking at admin's discretion
          const smallestTable = tables[0]; // Already sorted by seats ascending
          if (smallestTable) {
            updateData.tableId = smallestTable.id;
            console.log(`Admin override: Assigning table ${smallestTable.id} for overbooking`);
          } else {
            // If no tables exist for this party size, still allow admin to confirm
            // They can manually manage the seating arrangement
            console.log('No suitable tables found, but allowing admin override');
            updateData.tableId = null; // Admin will handle manually
          }
        } else {
          updateData.tableId = availableTable.id;
        }
      } else {
        updateData.tableId = tableId;
      }
    }
    
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        table: {
          select: {
            label: true,
            seats: true
          }
        },
        restaurant: true
      }
    });
    
    // Send notification email for status changes
    const bookingDate = booking.startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = booking.startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (status === 'CONFIRMED') {
      await sendEmail(
        booking.user.email,
        'Booking Confirmed - TableTrek 🍽️',
        `Hi ${booking.user.name},\n\nGreat news! Your table reservation has been confirmed by the restaurant.\n\n📍 Restaurant: ${booking.restaurant.name}\n📅 Date: ${bookingDate}\n🕐 Time: ${bookingTime}\n👥 Party Size: ${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}\n🪑 Table: ${updatedBooking.table?.label || 'TBD'}\n📋 Booking ID: #${booking.id}\n\nPlease arrive on time for your reservation. We look forward to serving you!\n\nBest regards,\nThe TableTrek Team`
      );
    } else if (status === 'CANCELLED') {
      await sendEmail(
        booking.user.email,
        'Booking Cancelled - TableTrek 🍽️',
        `Hi ${booking.user.name},\n\nWe regret to inform you that your table reservation has been cancelled.\n\n📍 Restaurant: ${booking.restaurant.name}\n📅 Date: ${bookingDate}\n🕐 Time: ${bookingTime}\n📋 Booking ID: #${booking.id}\n\nWe apologize for any inconvenience. Please feel free to make a new reservation for a different time.\n\nBest regards,\nThe TableTrek Team`
      );
    }
    
    res.json({ booking: updatedBooking });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  checkAvailability, 
  createBooking, 
  cancelBooking, 
  getUserBookings, 
  getRestaurantBookings,
  updateBookingStatus
};
