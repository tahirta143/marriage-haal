const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/', authMiddleware, requirePermission('payment.view'), paymentsController.getAllPayments);
router.get('/booking/:bookingId', authMiddleware, requirePermission('payment.view'), paymentsController.getPaymentsByBookingId);
router.post('/', authMiddleware, requirePermission('payment.create'), paymentsController.recordPayment);

module.exports = router;
