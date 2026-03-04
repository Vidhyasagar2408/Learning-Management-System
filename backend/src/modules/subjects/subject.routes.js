const router = require('express').Router();
const controller = require('./subject.controller');
const { authMiddleware } = require('../../middleware/authMiddleware');

router.get('/', controller.listSubjects);
router.get('/:subjectId', controller.getSubject);
router.get('/:subjectId/tree', authMiddleware, controller.getTree);
router.get('/:subjectId/first-video', authMiddleware, controller.getFirstVideo);

module.exports = router;