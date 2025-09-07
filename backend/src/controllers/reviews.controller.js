const prisma = require('../config/db');

async function getRestaurantReviews(req, res, next) {
  try {
    const { restaurantId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const { rating, text } = req.body;
    
    // Check if user has a confirmed booking at this restaurant
    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: req.user.id,
        restaurantId,
        status: 'CONFIRMED',
        endTime: { lt: new Date() } // Only allow reviews after the booking has ended
      }
    });
    
    if (!hasBooking) {
      return res.status(403).json({ 
        message: 'You can only review restaurants you have dined at' 
      });
    }
    
    // Check if user already reviewed this restaurant
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        restaurantId
      }
    });
    
    if (existingReview) {
      return res.status(409).json({ 
        message: 'You have already reviewed this restaurant' 
      });
    }
    
    const review = await prisma.review.create({
      data: {
        restaurantId,
        userId: req.user.id,
        rating: parseInt(rating),
        text
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    
    const review = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ? parseInt(rating) : review.rating,
        text: text !== undefined ? text : review.text
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    res.json({ review: updatedReview });
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await prisma.review.delete({
      where: { id }
    });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRestaurantReviews,
  createReview,
  updateReview,
  deleteReview
};
