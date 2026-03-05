const { chatMessageSchema } = require('./chatbot.validator');
const chatbotService = require('./chatbot.service');

async function postMessage(req, res, next) {
  try {
    const payload = chatMessageSchema.parse(req.body || {});
    const result = await chatbotService.sendMessage({ ...payload, userId: req.user.id });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { postMessage };
