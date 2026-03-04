const videoRepo = require('./video.repository');
const { isVideoUnlocked } = require('../../utils/ordering');

async function getVideo({ videoId, userId }) {
  const video = await videoRepo.getVideoById(videoId);
  if (!video || !video.is_published) {
    const err = new Error('Video not found');
    err.status = 404;
    throw err;
  }

  const orderInfo = await isVideoUnlocked({
    userId,
    subjectId: video.subject_id,
    videoId: video.id
  });

  if (orderInfo.unlock_reason === 'video_not_found') {
    const err = new Error('Video not found in subject order');
    err.status = 404;
    throw err;
  }

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    youtube_url: video.youtube_url,
    order_index: video.order_index,
    duration_seconds: video.duration_seconds,
    section_id: video.section_id,
    section_title: video.section_title,
    subject_id: video.subject_id,
    subject_title: video.subject_title,
    previous_video_id: orderInfo.previous_video_id,
    next_video_id: orderInfo.next_video_id,
    locked: orderInfo.locked,
    unlock_reason: orderInfo.unlock_reason
  };
}

module.exports = { getVideo };