const router = require('express').Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const controller = require('./chatbot.controller');

router.post('/message', authMiddleware, controller.postMessage);

module.exports = router;
