const prisma = require('../config/db');
const { notificationQueue } = require('../jobs/queue');

async function joinWaitlist(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const { partySize, requestedTime, date, time } = req.body;
    
    let requestedDateTime;
    if (requestedTime) {
      requestedDateTime = new Date(requestedTime);
    } else if (date && time) {
      const dateTimeStr = `${date}T${time}:00`;
      requestedDateTime = new Date(dateTimeStr);
    } else {
      return res.status(400).json({ message: 'Either requestedTime or (date, time) is required' });
    }
    
    // Check if user is already on waitlist for this time
    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        userId: req.user.id,
        restaurantId,
        requestedTime: requestedDateTime,
        status: 'PENDING'
      }
    });
    
    if (existingEntry) {
      return res.status(409).json({ 
        message: 'You are already on the waitlist for this time' 
      });
    }
    
    // Get current position in waitlist
    const waitlistCount = await prisma.waitlistEntry.count({
      where: {
        restaurantId,
        requestedTime: requestedDateTime,
        status: 'PENDING'
      }
    });
    
    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        restaurantId,
        userId: req.user.id,
        partySize: parseInt(partySize),
        requestedTime: requestedDateTime,
        position: waitlistCount + 1
      }
    });
    
    res.status(201).json({ waitlistEntry });
  } catch (err) {
    next(err);
  }
}

async function leaveWaitlist(req, res, next) {
  try {
    const { id } = req.params;
    
    const waitlistEntry = await prisma.waitlistEntry.findUnique({
      where: { id }
    });
    
    if (!waitlistEntry) {
      return res.status(404).json({ message: 'Waitlist entry not found' });
    }
    
    if (waitlistEntry.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to leave this waitlist entry' });
    }
    
    await prisma.waitlistEntry.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    res.json({ message: 'Left waitlist successfully' });
  } catch (err) {
    next(err);
  }
}

async function getUserWaitlist(req, res, next) {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this waitlist' });
    }
    
    const waitlistEntries = await prisma.waitlistEntry.findMany({
      where: { 
        userId,
        status: 'PENDING'
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            city: true
          }
        }
      },
      orderBy: { requestedTime: 'asc' }
    });
    
    res.json({ waitlistEntries });
  } catch (err) {
    next(err);
  }
}

async function getRestaurantWaitlist(req, res, next) {
  try {
    const { restaurantId } = req.params;
    
    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view waitlist for this restaurant' });
    }
    
    const waitlistEntries = await prisma.waitlistEntry.findMany({
      where: { 
        restaurantId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { requestedTime: 'asc' },
        { position: 'asc' }
      ]
    });
    
    res.json({ waitlistEntries });
  } catch (err) {
    next(err);
  }
}

async function notifyWaitlistEntry(req, res, next) {
  try {
    const { id } = req.params;
    
    const waitlistEntry = await prisma.waitlistEntry.findUnique({
      where: { id },
      include: {
        user: true,
        restaurant: true
      }
    });
    
    if (!waitlistEntry) {
      return res.status(404).json({ message: 'Waitlist entry not found' });
    }
    
    // Check if user owns the restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: waitlistEntry.restaurantId }
    });
    
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to notify this waitlist entry' });
    }
    
    // Update waitlist entry status
    await prisma.waitlistEntry.update({
      where: { id },
      data: { status: 'NOTIFIED' }
    });
    
    // Send notification
    const message = `A table is now available at ${waitlistEntry.restaurant.name} for your requested time of ${waitlistEntry.requestedTime}. Please confirm your reservation within 15 minutes.`;
    
    await notificationQueue.add('waitlist_notify', { 
      waitlistEntryId: waitlistEntry.id,
      message 
    }, { 
      attempts: 3, 
      backoff: { type: 'exponential', delay: 1000 }
    });
    
    res.json({ message: 'Waitlist entry notified successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  joinWaitlist,
  leaveWaitlist,
  getUserWaitlist,
  getRestaurantWaitlist,
  notifyWaitlistEntry
};
