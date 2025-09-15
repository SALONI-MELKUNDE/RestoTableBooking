const { Worker } = require('bullmq');
const prisma = require('../config/db');
const sendEmail = require('../services/email.service');
const sendSMS = require('../services/sms.service');

let worker;

if (process.env.REDIS_URL) {
  const connection = { url: process.env.REDIS_URL };
  worker = new Worker('notifications', async job => {
  const { name, data } = job;
  
  if (name === 'booking_confirm') {
    const booking = await prisma.booking.findUnique({ 
      where: { id: data.bookingId }, 
      include: { user: true, restaurant: true, table: true }
    });
    
    if (!booking) {
      console.error('Booking not found:', data.bookingId);
      return;
    }
    
    // compose message
    const text = `Your booking at ${booking.restaurant.name} is confirmed for ${booking.startTime}`;
    
    // send email + sms
    if (booking.user.email) {
      try {
        await sendEmail(booking.user.email, 'Booking confirmed', text);
      } catch (error) {
        console.error('Email send failed:', error);
      }
    }
    
    if (booking.user.phone) {
      try {
        await sendSMS(booking.user.phone, text);
      } catch (error) {
        console.error('SMS send failed:', error);
      }
    }
    
    // save notification record
    await prisma.notification.create({ 
      data: { 
        userId: booking.userId, 
        bookingId: booking.id, 
        type: 'BOOKING_CONFIRMED', 
        status: 'SENT', 
        payload: { message: text } 
      }
    });
  }
  
  if (name === 'booking_cancel') {
    const booking = await prisma.booking.findUnique({ 
      where: { id: data.bookingId }, 
      include: { user: true, restaurant: true }
    });
    
    if (!booking) {
      console.error('Booking not found:', data.bookingId);
      return;
    }
    
    const text = `Your booking at ${booking.restaurant.name} has been cancelled`;
    
    if (booking.user.email) {
      try {
        await sendEmail(booking.user.email, 'Booking cancelled', text);
      } catch (error) {
        console.error('Email send failed:', error);
      }
    }
    
    if (booking.user.phone) {
      try {
        await sendSMS(booking.user.phone, text);
      } catch (error) {
        console.error('SMS send failed:', error);
      }
    }
    
    await prisma.notification.create({ 
      data: { 
        userId: booking.userId, 
        bookingId: booking.id, 
        type: 'BOOKING_CANCELLED', 
        status: 'SENT', 
        payload: { message: text } 
      }
    });
  }
  
  if (name === 'waitlist_notify') {
    const waitlistEntry = await prisma.waitlistEntry.findUnique({ 
      where: { id: data.waitlistEntryId }, 
      include: { user: true, restaurant: true }
    });
    
    if (!waitlistEntry) {
      console.error('Waitlist entry not found:', data.waitlistEntryId);
      return;
    }
    
    const text = data.message;
    
    if (waitlistEntry.user.email) {
      try {
        await sendEmail(waitlistEntry.user.email, 'Table Available - TableTrek', text);
      } catch (error) {
        console.error('Email send failed:', error);
      }
    }
    
    if (waitlistEntry.user.phone) {
      try {
        await sendSMS(waitlistEntry.user.phone, text);
      } catch (error) {
        console.error('SMS send failed:', error);
      }
    }
    
    await prisma.notification.create({ 
      data: { 
        userId: waitlistEntry.userId, 
        type: 'WAITLIST_NOTIFICATION', 
        status: 'SENT', 
        payload: { message: text } 
      }
    });
  }
}, { connection });
} else {
  // Mock worker for development without Redis
  worker = {
    on: () => {},
    close: () => Promise.resolve()
  };
  console.log('Notification worker running in mock mode (no Redis)');
}

module.exports = worker;


