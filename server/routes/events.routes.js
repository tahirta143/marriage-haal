const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);
router.get('/:id/sub-events', eventsController.getSubEvents);

// Protected mutation routes
router.post('/', authMiddleware, eventsController.createEvent);
router.put('/:id', authMiddleware, eventsController.updateEvent);
router.delete('/:id', authMiddleware, eventsController.deleteEvent);

module.exports = router;
