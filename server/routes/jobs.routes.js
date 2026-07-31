const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/requirePermission');

router.get('/my-jobs', authMiddleware, jobsController.getMyJobs);
router.put('/:serviceId/status', authMiddleware, jobsController.updateTaskStatus);
router.put('/:serviceId/assign', authMiddleware, requirePermission('staff.manage'), jobsController.assignTask);

module.exports = router;
