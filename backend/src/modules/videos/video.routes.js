const router = require('express').Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const controller = require('./video.controller');

router.get('/:videoId', authMiddleware, controller.getVideo);

module.exports = router;