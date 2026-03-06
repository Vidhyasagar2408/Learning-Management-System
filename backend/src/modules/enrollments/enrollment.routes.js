const router = require('express').Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const controller = require('./enrollment.controller');

router.get('/me', authMiddleware, controller.myEnrollments);
router.get('/:subjectId/status', authMiddleware, controller.status);
router.post('/:subjectId', authMiddleware, controller.enroll);

module.exports = router;
