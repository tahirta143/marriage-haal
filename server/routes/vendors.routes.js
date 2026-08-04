const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendors.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

// Public endpoints
router.get('/', vendorsController.getAllVendors);
router.get('/me', authMiddleware, vendorsController.getVendorSelfProfile);
router.put('/me', authMiddleware, vendorsController.updateVendorSelfProfile);
router.get('/me/inquiries', authMiddleware, vendorsController.getVendorInquiries);
router.put('/me/inquiries/:inquiryId', authMiddleware, vendorsController.updateVendorInquiryStatus);

router.get('/:id', vendorsController.getVendorById);
router.get('/:id/packages', vendorsController.getVendorPackages);
router.post('/:id/inquiry', vendorsController.submitVendorInquiry);

// Package self management
router.post('/packages', authMiddleware, vendorsController.createVendorPackage);
router.put('/packages/:packageId', authMiddleware, vendorsController.updateVendorPackage);
router.delete('/packages/:packageId', authMiddleware, vendorsController.deleteVendorPackage);

// Admin management endpoints
router.post('/', authMiddleware, requirePermission('vendor.manage'), vendorsController.createVendor);
router.put('/:id', authMiddleware, requirePermission('vendor.manage'), vendorsController.updateVendor);
router.delete('/:id', authMiddleware, requirePermission('vendor.manage'), vendorsController.deleteVendor);

module.exports = router;
