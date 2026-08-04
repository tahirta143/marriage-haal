const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

// Public read routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/:id/sub-services', categoriesController.getSubServices);

// Protected Category routes (requires 'category.manage' permission)
router.post('/', authMiddleware, requirePermission('category.manage'), categoriesController.createCategory);
router.put('/:id', authMiddleware, requirePermission('category.manage'), categoriesController.updateCategory);
router.delete('/:id', authMiddleware, requirePermission('category.manage'), categoriesController.deleteCategory);

// Protected Sub-Service routes
router.post('/:id/sub-services', authMiddleware, requirePermission('category.manage'), categoriesController.createSubService);
router.put('/sub-services/:subId', authMiddleware, requirePermission('category.manage'), categoriesController.updateSubService);
router.delete('/sub-services/:subId', authMiddleware, requirePermission('category.manage'), categoriesController.deleteSubService);

// Protected Category Package routes
router.post('/:id/packages', authMiddleware, requirePermission('category.manage'), categoriesController.createPackage);
router.put('/packages/:packageId', authMiddleware, requirePermission('category.manage'), categoriesController.updatePackage);
router.delete('/packages/:packageId', authMiddleware, requirePermission('category.manage'), categoriesController.deletePackage);

module.exports = router;
