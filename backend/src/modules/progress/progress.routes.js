const router = require('express').Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const controller = require('./progress.controller');

router.get('/subjects/:subjectId', authMiddleware, controller.getSubjectProgress);
router.get('/videos/:videoId', authMiddleware, controller.getVideoProgress);
router.post('/videos/:videoId', authMiddleware, controller.upsertVideoProgress);

module.exports = router;