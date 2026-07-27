const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/my-jobs', authMiddleware, jobsController.getMyJobs);
router.put('/:serviceId/status', authMiddleware, jobsController.updateTaskStatus);
router.put('/:serviceId/assign', authMiddleware, jobsController.assignTask);

module.exports = router;
