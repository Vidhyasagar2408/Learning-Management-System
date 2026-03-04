const service = require('./subject.service');

async function listSubjects(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const q = String(req.query.q || '');
    const result = await service.listSubjects({ page, pageSize, q });
    res.json({ page, pageSize, total: result.total, items: result.items });
  } catch (error) {
    next(error);
  }
}

async function getSubject(req, res, next) {
  try {
    const subject = await service.getSubject(req.params.subjectId);
    res.json(subject);
  } catch (error) {
    next(error);
  }
}

async function getTree(req, res, next) {
  try {
    const tree = await service.getTree({ subjectId: req.params.subjectId, userId: req.user.id });
    res.json(tree);
  } catch (error) {
    next(error);
  }
}

async function getFirstVideo(req, res, next) {
  try {
    const payload = await service.getFirstUnlockedVideo({
      subjectId: req.params.subjectId,
      userId: req.user.id
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

module.exports = { listSubjects, getSubject, getTree, getFirstVideo };