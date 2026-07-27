const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbac.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

// RBAC Management endpoints - Protected by 'rbac.manage' permission
router.get('/permissions', authMiddleware, requirePermission('rbac.manage'), rbacController.getAllPermissions);
router.get('/groups', authMiddleware, requirePermission('rbac.manage'), rbacController.getAllGroups);
router.post('/groups', authMiddleware, requirePermission('rbac.manage'), rbacController.createGroup);
router.put('/groups/:id/permissions', authMiddleware, requirePermission('rbac.manage'), rbacController.updateGroupPermissions);

module.exports = router;
