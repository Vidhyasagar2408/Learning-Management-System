const { db } = require('../../config/db');
const repo = require('./enrollment.repository');

async function ensureSubjectExists(subjectId) {
  const subject = await db('subjects').where({ id: subjectId, is_published: true }).first();
  if (!subject) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return subject;
}

async function enroll({ userId, subjectId }) {
  const subject = await ensureSubjectExists(subjectId);
  await repo.createEnrollment({ userId, subjectId });
  return {
    enrolled: true,
    subject_id: Number(subject.id),
    title: subject.title,
    price_amount: Number(subject.price_amount || 0)
  };
}

async function getStatus({ userId, subjectId }) {
  await ensureSubjectExists(subjectId);
  const enrollment = await repo.findEnrollment({ userId, subjectId });
  return { enrolled: Boolean(enrollment) };
}

async function myEnrollments(userId) {
  const rows = await repo.listEnrollmentsByUser(userId);
  return rows.map((row) => ({ ...row, price_amount: Number(row.price_amount || 0) }));
}

module.exports = { enroll, getStatus, myEnrollments };
