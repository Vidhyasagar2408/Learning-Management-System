const service = require('./progress.service');

async function getSubjectProgress(req, res, next) {
  try {
    const result = await service.getSubjectProgress({
      userId: req.user.id,
      subjectId: req.params.subjectId
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getVideoProgress(req, res, next) {
  try {
    const result = await service.getVideoProgress({
      userId: req.user.id,
      videoId: req.params.videoId
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function upsertVideoProgress(req, res, next) {
  try {
    const result = await service.upsertVideoProgress({
      userId: req.user.id,
      videoId: req.params.videoId,
      body: req.body
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getSubjectProgress, getVideoProgress, upsertVideoProgress };