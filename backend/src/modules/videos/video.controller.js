const service = require('./video.service');

async function getVideo(req, res, next) {
  try {
    const data = await service.getVideo({
      videoId: req.params.videoId,
      userId: req.user.id
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = { getVideo };