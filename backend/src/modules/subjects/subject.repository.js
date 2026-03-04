const { db } = require('../../config/db');

async function listPublishedSubjects({ page, pageSize, q }) {
  const query = db('subjects').where({ is_published: true });
  if (q) query.andWhere('title', 'like', `%${q}%`);

  const [{ count }] = await query.clone().count({ count: '*' });
  const items = await query
    .clone()
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total: Number(count) };
}

async function getSubjectById(subjectId) {
  return db('subjects').where({ id: subjectId, is_published: true }).first();
}

async function getSubjectTree(subjectId) {
  const subject = await db('subjects').where({ id: subjectId, is_published: true }).first();
  if (!subject) return null;

  const rows = await db('sections as s')
    .leftJoin('videos as v', 'v.section_id', 's.id')
    .where('s.subject_id', subjectId)
    .select(
      's.id as section_id',
      's.title as section_title',
      's.order_index as section_order_index',
      'v.id as video_id',
      'v.title as video_title',
      'v.order_index as video_order_index'
    )
    .orderBy('s.order_index', 'asc')
    .orderBy('v.order_index', 'asc');

  return { subject, rows };
}

module.exports = { listPublishedSubjects, getSubjectById, getSubjectTree };