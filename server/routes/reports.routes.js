const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/analytics', authMiddleware, requirePermission('report.view'), reportsController.getExecutiveAnalytics);
router.get('/calendar', authMiddleware, requirePermission('booking.view'), reportsController.getCalendarEvents);

module.exports = router;
