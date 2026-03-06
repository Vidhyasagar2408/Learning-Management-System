const service = require('./enrollment.service');

async function enroll(req, res, next) {
  try {
    const result = await service.enroll({
      userId: req.user.id,
      subjectId: Number(req.params.subjectId)
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function status(req, res, next) {
  try {
    const result = await service.getStatus({
      userId: req.user.id,
      subjectId: Number(req.params.subjectId)
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function myEnrollments(req, res, next) {
  try {
    const result = await service.myEnrollments(req.user.id);
    res.json({ items: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { enroll, status, myEnrollments };
