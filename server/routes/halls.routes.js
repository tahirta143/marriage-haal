const express = require('express');
const router = express.Router();
const hallsController = require('../controllers/halls.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/', hallsController.getAllHalls);
router.get('/:id', hallsController.getHallById);
router.get('/:id/slots', hallsController.getHallSlots);

// Protected by 'hall.manage' permission
router.post('/', authMiddleware, requirePermission('hall.manage'), hallsController.createHall);

module.exports = router;
