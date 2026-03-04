const { db } = require('../../config/db');

async function getVideoById(videoId) {
  return db('videos as v')
    .join('sections as s', 'v.section_id', 's.id')
    .join('subjects as sub', 's.subject_id', 'sub.id')
    .where('v.id', videoId)
    .select(
      'v.id',
      'v.title',
      'v.description',
      'v.youtube_url',
      'v.order_index',
      'v.duration_seconds',
      'v.section_id',
      's.title as section_title',
      'sub.id as subject_id',
      'sub.title as subject_title',
      'sub.is_published'
    )
    .first();
}

module.exports = { getVideoById };