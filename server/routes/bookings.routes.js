const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/', authMiddleware, requirePermission('booking.view'), bookingsController.getAllBookings);
router.get('/:id', authMiddleware, requirePermission('booking.view'), bookingsController.getBookingById);
router.post('/', authMiddleware, requirePermission('booking.create'), bookingsController.createBooking);
router.put('/:id/status', authMiddleware, requirePermission('booking.edit'), bookingsController.updateBookingStatus);

module.exports = router;
