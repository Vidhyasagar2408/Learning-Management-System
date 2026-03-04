const { db } = require('../../config/db');

async function getVideoProgress({ userId, videoId }) {
  return db('video_progress').where({ user_id: userId, video_id: videoId }).first();
}

async function upsertVideoProgress({ userId, videoId, lastPositionSeconds, isCompleted, completedAt }) {
  const existing = await getVideoProgress({ userId, videoId });
  const payload = {
    user_id: userId,
    video_id: videoId,
    last_position_seconds: lastPositionSeconds,
    is_completed: isCompleted,
    completed_at: completedAt,
    updated_at: new Date()
  };

  if (existing) {
    await db('video_progress').where({ id: existing.id }).update(payload);
    return getVideoProgress({ userId, videoId });
  }

  await db('video_progress').insert({ ...payload, created_at: new Date() });
  return getVideoProgress({ userId, videoId });
}

async function getSubjectProgress({ userId, subjectId }) {
  const [totals] = await db('videos as v')
    .join('sections as s', 'v.section_id', 's.id')
    .where('s.subject_id', subjectId)
    .count({ total_videos: '*' });

  const [completed] = await db('video_progress as vp')
    .join('videos as v', 'vp.video_id', 'v.id')
    .join('sections as s', 'v.section_id', 's.id')
    .where('s.subject_id', subjectId)
    .andWhere('vp.user_id', userId)
    .andWhere('vp.is_completed', true)
    .count({ completed_videos: '*' });

  const last = await db('video_progress as vp')
    .join('videos as v', 'vp.video_id', 'v.id')
    .join('sections as s', 'v.section_id', 's.id')
    .where('s.subject_id', subjectId)
    .andWhere('vp.user_id', userId)
    .orderBy('vp.updated_at', 'desc')
    .select('vp.video_id', 'vp.last_position_seconds')
    .first();

  return {
    total_videos: Number(totals.total_videos || 0),
    completed_videos: Number(completed.completed_videos || 0),
    last_video_id: last?.video_id || null,
    last_position_seconds: last?.last_position_seconds || 0
  };
}

module.exports = { getVideoProgress, upsertVideoProgress, getSubjectProgress };