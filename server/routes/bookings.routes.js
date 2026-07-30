const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

// Optional auth: attaches user if token present, but doesn't block anonymous requests
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
};

router.get('/', authMiddleware, requirePermission('booking.view'), bookingsController.getAllBookings);
router.get('/:id', authMiddleware, requirePermission('booking.view'), bookingsController.getBookingById);
// POST is public (inquiry submission) — optionalAuth attaches user info if logged in
router.post('/', optionalAuth, bookingsController.createBooking);
router.put('/:id/status', authMiddleware, requirePermission('booking.edit'), bookingsController.updateBookingStatus);

module.exports = router;

