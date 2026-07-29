const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

// Public read routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/:id/sub-services', categoriesController.getSubServices);

// Protected Write routes (requires 'category.manage' permission)
router.post('/', authMiddleware, requirePermission('category.manage'), categoriesController.createCategory);
router.post('/:id/packages', authMiddleware, requirePermission('category.manage'), categoriesController.createPackage);
router.put('/packages/:packageId', authMiddleware, requirePermission('category.manage'), categoriesController.updatePackage);
router.delete('/packages/:packageId', authMiddleware, requirePermission('category.manage'), categoriesController.deletePackage);

module.exports = router;
