const { env } = require('../../config/env');
const { db } = require('../../config/db');

const CHAT_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 15000;

function buildLocalFallbackReply(message, context) {
  const q = String(message || '').toLowerCase();
  const {
    totalSubjects = 0,
    totalVideos = 0,
    completedVideos = 0,
    currentSubjectTitle = null,
    currentSubjectPercent = 0
  } = context || {};

  if (q.includes('how many course') || q.includes('how many subject') || q.includes('total course')) {
    return `There are currently ${totalSubjects} published courses with ${totalVideos} total videos.`;
  }

  if (q.includes('progress') || q.includes('completed')) {
    return `Your overall progress is ${completedVideos}/${totalVideos} videos completed (${totalVideos ? Math.round((completedVideos / totalVideos) * 100) : 0}%).`;
  }

  if ((q.includes('current') || q.includes('this course')) && currentSubjectTitle) {
    return `For "${currentSubjectTitle}", your completion is ${currentSubjectPercent}%.`;
  }

  return `I can help with course count, your progress, and what to watch next. Right now there are ${totalSubjects} courses in the LMS.`;
}

async function getLmsContext(userId) {
  const [{ count: subjectCountRaw }] = await db('subjects').where({ is_published: true }).count({ count: '*' });
  const totalSubjects = Number(subjectCountRaw || 0);

  const [{ count: totalVideosRaw }] = await db('videos as v')
    .join('sections as s', 'v.section_id', 's.id')
    .join('subjects as sub', 's.subject_id', 'sub.id')
    .where('sub.is_published', true)
    .count({ count: '*' });
  const totalVideos = Number(totalVideosRaw || 0);

  const [{ count: completedRaw }] = await db('video_progress as vp')
    .join('videos as v', 'vp.video_id', 'v.id')
    .join('sections as s', 'v.section_id', 's.id')
    .join('subjects as sub', 's.subject_id', 'sub.id')
    .where('vp.user_id', userId)
    .andWhere('vp.is_completed', true)
    .andWhere('sub.is_published', true)
    .count({ count: '*' });
  const completedVideos = Number(completedRaw || 0);

  const latest = await db('video_progress as vp')
    .join('videos as v', 'vp.video_id', 'v.id')
    .join('sections as s', 'v.section_id', 's.id')
    .join('subjects as sub', 's.subject_id', 'sub.id')
    .where('vp.user_id', userId)
    .andWhere('sub.is_published', true)
    .orderBy('vp.updated_at', 'desc')
    .select('sub.id as subject_id', 'sub.title as subject_title')
    .first();

  let currentSubjectTitle = null;
  let currentSubjectPercent = 0;
  if (latest?.subject_id) {
    currentSubjectTitle = latest.subject_title;

    const [{ count: subjectVideosRaw }] = await db('videos as v')
      .join('sections as s', 'v.section_id', 's.id')
      .where('s.subject_id', latest.subject_id)
      .count({ count: '*' });
    const subjectVideos = Number(subjectVideosRaw || 0);

    const [{ count: subjectCompletedRaw }] = await db('video_progress as vp')
      .join('videos as v', 'vp.video_id', 'v.id')
      .join('sections as s', 'v.section_id', 's.id')
      .where('vp.user_id', userId)
      .andWhere('vp.is_completed', true)
      .andWhere('s.subject_id', latest.subject_id)
      .count({ count: '*' });
    const subjectCompleted = Number(subjectCompletedRaw || 0);
    currentSubjectPercent = subjectVideos ? Math.round((subjectCompleted / subjectVideos) * 100) : 0;
  }

  return { totalSubjects, totalVideos, completedVideos, currentSubjectTitle, currentSubjectPercent };
}

async function sendMessage({ message, history, userId }) {
  const context = await getLmsContext(userId);
  if (!env.HF_TOKEN) {
    return { reply: buildLocalFallbackReply(message, context), mode: 'fallback' };
  }

  const clippedHistory = (history || []).slice(-10);
  const messages = [
    {
      role: 'system',
      content:
        `You are an LMS assistant. Give concise, practical answers about courses, progress, and learning guidance.
Published courses: ${context.totalSubjects}
Total videos: ${context.totalVideos}
User completed videos: ${context.completedVideos}
Current subject: ${context.currentSubjectTitle || 'N/A'}
Current subject completion: ${context.currentSubjectPercent}%`
    },
    ...clippedHistory,
    { role: 'user', content: message }
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: env.HF_MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.4
      }),
      signal: controller.signal
    });
  } catch (_error) {
    clearTimeout(timeout);
    return { reply: buildLocalFallbackReply(message, context), mode: 'fallback' };
  }
  clearTimeout(timeout);

  if (!response.ok) {
    return { reply: buildLocalFallbackReply(message, context), mode: 'fallback' };
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return { reply: buildLocalFallbackReply(message, context), mode: 'fallback' };
  }

  return { reply, mode: 'model' };
}

module.exports = { sendMessage };
