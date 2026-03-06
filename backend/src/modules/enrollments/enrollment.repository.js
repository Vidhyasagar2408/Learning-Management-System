const { db } = require('../../config/db');

async function createEnrollment({ userId, subjectId }) {
  const existing = await db('enrollments').where({ user_id: userId, subject_id: subjectId }).first();
  if (existing) return existing;

  const [id] = await db('enrollments').insert({
    user_id: userId,
    subject_id: subjectId,
    created_at: new Date()
  });
  return db('enrollments').where({ id }).first();
}

async function findEnrollment({ userId, subjectId }) {
  return db('enrollments').where({ user_id: userId, subject_id: subjectId }).first();
}

async function listEnrollmentsByUser(userId) {
  return db('enrollments as e')
    .join('subjects as s', 'e.subject_id', 's.id')
    .where('e.user_id', userId)
    .select('e.id', 'e.subject_id', 'e.created_at', 's.title', 's.slug', 's.thumbnail_url', 's.price_amount')
    .orderBy('e.created_at', 'desc');
}

module.exports = { createEnrollment, findEnrollment, listEnrollmentsByUser };
