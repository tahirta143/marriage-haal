const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendors.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/', authMiddleware, requirePermission('staff.manage'), vendorsController.getAllStaff);
router.post('/', authMiddleware, requirePermission('staff.manage'), vendorsController.createStaff);

module.exports = router;
