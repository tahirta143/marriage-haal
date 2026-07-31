const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');

router.get('/', notificationsController.getNotifications);
router.post('/', notificationsController.createNotification);
router.put('/read-all', notificationsController.markAllRead);

module.exports = router;
