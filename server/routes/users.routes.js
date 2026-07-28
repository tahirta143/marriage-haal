const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/', authMiddleware, requirePermission('rbac.manage'), usersController.getAllUsers);
router.post('/', authMiddleware, requirePermission('rbac.manage'), usersController.createUser);
router.put('/:id', authMiddleware, requirePermission('rbac.manage'), usersController.updateUser);
router.put('/:id/group', authMiddleware, requirePermission('rbac.manage'), usersController.updateUserGroup);

module.exports = router;
