const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendors.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/', authMiddleware, requirePermission('vendor.manage'), vendorsController.getAllVendors);
router.post('/', authMiddleware, requirePermission('vendor.manage'), vendorsController.createVendor);

module.exports = router;
