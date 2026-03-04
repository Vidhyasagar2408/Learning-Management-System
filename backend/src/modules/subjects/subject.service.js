const subjectRepo = require('./subject.repository');
const { db } = require('../../config/db');
const { getOrderedSubjectVideos, buildPrevNext, isVideoUnlocked } = require('../../utils/ordering');

async function listSubjects({ page = 1, pageSize = 10, q = '' }) {
  return subjectRepo.listPublishedSubjects({ page, pageSize, q });
}

async function getSubject(subjectId) {
  const subject = await subjectRepo.getSubjectById(subjectId);
  if (!subject) {
    const err = new Error('Subject not found');
    err.status = 404;
    throw err;
  }
  return subject;
}

async function getTree({ subjectId, userId }) {
  const payload = await subjectRepo.getSubjectTree(subjectId);
  if (!payload) {
    const err = new Error('Subject not found');
    err.status = 404;
    throw err;
  }

  const videos = await getOrderedSubjectVideos(subjectId);
  const prevNextMap = buildPrevNext(videos);

  const completedRows = await db('video_progress as vp')
    .join('videos as v', 'vp.video_id', 'v.id')
    .join('sections as s', 'v.section_id', 's.id')
    .where('vp.user_id', userId)
    .andWhere('s.subject_id', subjectId)
    .andWhere('vp.is_completed', true)
    .select('vp.video_id');

  const completedSet = new Set(completedRows.map((x) => Number(x.video_id)));

  const sectionsMap = new Map();
  for (const row of payload.rows) {
    if (!sectionsMap.has(row.section_id)) {
      sectionsMap.set(row.section_id, {
        id: row.section_id,
        title: row.section_title,
        order_index: row.section_order_index,
        videos: []
      });
    }

    if (row.video_id) {
      const neighbors = prevNextMap.get(row.video_id) || { previous_video_id: null, next_video_id: null };
      const locked = neighbors.previous_video_id ? !completedSet.has(Number(neighbors.previous_video_id)) : false;
      sectionsMap.get(row.section_id).videos.push({
        id: row.video_id,
        title: row.video_title,
        order_index: row.video_order_index,
        is_completed: completedSet.has(Number(row.video_id)),
        locked
      });
    }
  }

  return {
    id: payload.subject.id,
    title: payload.subject.title,
    description: payload.subject.description,
    sections: Array.from(sectionsMap.values())
  };
}

async function getFirstUnlockedVideo({ subjectId, userId }) {
  const videos = await getOrderedSubjectVideos(subjectId);
  for (const video of videos) {
    const unlock = await isVideoUnlocked({ userId, subjectId, videoId: video.id });
    if (!unlock.locked) {
      return { video_id: video.id };
    }
  }
  return { video_id: null };
}

module.exports = { listSubjects, getSubject, getTree, getFirstUnlockedVideo };