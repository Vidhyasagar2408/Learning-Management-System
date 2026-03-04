const { z } = require('zod');
const repo = require('./progress.repository');
const { db } = require('../../config/db');

const upsertSchema = z.object({
  last_position_seconds: z.number().int().nonnegative().default(0),
  is_completed: z.boolean().default(false)
});

async function getVideoProgress({ userId, videoId }) {
  const row = await repo.getVideoProgress({ userId, videoId });
  return {
    last_position_seconds: row?.last_position_seconds || 0,
    is_completed: row?.is_completed || false
  };
}

async function upsertVideoProgress({ userId, videoId, body }) {
  const payload = upsertSchema.parse(body);
  const existing = await repo.getVideoProgress({ userId, videoId });

  const video = await db('videos').where({ id: videoId }).first();
  if (!video) {
    const err = new Error('Video not found');
    err.status = 404;
    throw err;
  }

  const cap = Number(video.duration_seconds || payload.last_position_seconds);
  const lastPositionSeconds = Math.max(0, Math.min(payload.last_position_seconds, cap));
  const isCompleted = Boolean(payload.is_completed || existing?.is_completed);
  const completedAt = isCompleted ? existing?.completed_at || new Date() : null;

  await repo.upsertVideoProgress({
    userId,
    videoId,
    lastPositionSeconds,
    isCompleted,
    completedAt
  });

  return {
    last_position_seconds: lastPositionSeconds,
    is_completed: isCompleted
  };
}

async function getSubjectProgress({ userId, subjectId }) {
  const base = await repo.getSubjectProgress({ userId, subjectId });
  const percent = base.total_videos === 0 ? 0 : Math.round((base.completed_videos / base.total_videos) * 100);

  return {
    total_videos: base.total_videos,
    completed_videos: base.completed_videos,
    percent_complete: percent,
    last_video_id: base.last_video_id,
    last_position_seconds: base.last_position_seconds
  };
}

module.exports = { getVideoProgress, upsertVideoProgress, getSubjectProgress };
