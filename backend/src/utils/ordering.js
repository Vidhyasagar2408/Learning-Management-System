const { db } = require('../config/db');

async function getOrderedSubjectVideos(subjectId) {
  return db('videos as v')
    .join('sections as s', 'v.section_id', 's.id')
    .where('s.subject_id', subjectId)
    .select(
      'v.id',
      'v.section_id',
      'v.order_index as video_order',
      's.order_index as section_order'
    )
    .orderBy('s.order_index', 'asc')
    .orderBy('v.order_index', 'asc')
    .orderBy('v.id', 'asc');
}

function buildPrevNext(videos) {
  const map = new Map();
  for (let i = 0; i < videos.length; i += 1) {
    const prev = i > 0 ? videos[i - 1].id : null;
    const next = i < videos.length - 1 ? videos[i + 1].id : null;
    map.set(videos[i].id, { previous_video_id: prev, next_video_id: next });
  }
  return map;
}

async function getVideoContext(subjectId, videoId) {
  const videos = await getOrderedSubjectVideos(subjectId);
  const index = videos.findIndex((v) => Number(v.id) === Number(videoId));
  if (index === -1) return null;

  const previous = index > 0 ? videos[index - 1].id : null;
  const next = index < videos.length - 1 ? videos[index + 1].id : null;
  return {
    previous_video_id: previous,
    next_video_id: next,
    prerequisite_video_id: previous
  };
}

async function isVideoUnlocked({ userId, subjectId, videoId }) {
  const context = await getVideoContext(subjectId, videoId);
  if (!context) {
    return { locked: true, unlock_reason: 'video_not_found', previous_video_id: null, next_video_id: null };
  }

  if (!context.prerequisite_video_id) {
    return { locked: false, unlock_reason: 'first_video', ...context };
  }

  const prerequisiteProgress = await db('video_progress')
    .where({ user_id: userId, video_id: context.prerequisite_video_id })
    .first();

  const unlocked = Boolean(prerequisiteProgress?.is_completed);
  return {
    locked: !unlocked,
    unlock_reason: unlocked ? 'prerequisite_completed' : 'complete_previous_video',
    ...context
  };
}

module.exports = {
  getOrderedSubjectVideos,
  buildPrevNext,
  getVideoContext,
  isVideoUnlocked
};