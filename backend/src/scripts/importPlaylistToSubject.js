const { spawnSync } = require('node:child_process');
const { db } = require('../config/db');

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLbtI3_MArDOkxh7XzixN2G4NAGIVqTFon';
const SUBJECT_SLUG = 'full-stack-web-development-complete-course';
const SECTION_TITLE = 'Complete Course';
const SECTION_ORDER = 1;

function extractPlaylistId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('list');
  } catch (_err) {
    return null;
  }
}

function extractVideoId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('v');
  } catch (_err) {
    return null;
  }
}

function fetchPlaylistUrlsWithPython(playlistUrl) {
  const script = [
    'import json',
    'from pytube import Playlist',
    `pl = Playlist(${JSON.stringify(playlistUrl)})`,
    'print(json.dumps(list(pl.video_urls)))'
  ].join('\n');

  const result = spawnSync('python', ['-c', script], { encoding: 'utf-8' });
  if (result.status !== 0) {
    throw new Error(`Failed to read playlist URLs: ${result.stderr || result.stdout}`);
  }

  try {
    const parsed = JSON.parse(result.stdout.trim());
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('No videos found in playlist');
    }
    return parsed;
  } catch (_err) {
    throw new Error(`Could not parse playlist data: ${result.stdout}`);
  }
}

async function fetchVideoMeta(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return {
      title: data.title || null,
      author: data.author_name || null,
      thumbnail: data.thumbnail_url || null
    };
  } catch (_err) {
    return null;
  }
}

async function ensureSubject() {
  const subject = await db('subjects').where({ slug: SUBJECT_SLUG }).first();
  if (!subject) {
    throw new Error(`Subject not found for slug: ${SUBJECT_SLUG}`);
  }
  return subject;
}

async function ensureSection(subjectId) {
  const existing = await db('sections')
    .where({ subject_id: subjectId, order_index: SECTION_ORDER })
    .first();
  if (existing) return existing;

  const [id] = await db('sections').insert({
    subject_id: subjectId,
    title: SECTION_TITLE,
    order_index: SECTION_ORDER,
    created_at: new Date(),
    updated_at: new Date()
  });
  return db('sections').where({ id }).first();
}

async function run() {
  const playlistId = extractPlaylistId(PLAYLIST_URL);
  if (!playlistId) {
    throw new Error('Invalid playlist URL');
  }

  const urls = fetchPlaylistUrlsWithPython(PLAYLIST_URL);
  const subject = await ensureSubject();
  const section = await ensureSection(subject.id);

  // Basic metadata from the first video.
  const firstVideoId = extractVideoId(urls[0]);
  const firstMeta = firstVideoId ? await fetchVideoMeta(firstVideoId) : null;

  await db('subjects').where({ id: subject.id }).update({
    title: 'Full Stack WEB Development Complete Course',
    description: subject.description || 'Complete full stack web development playlist course.',
    thumbnail_url: firstMeta?.thumbnail || subject.thumbnail_url,
    is_published: true,
    updated_at: new Date()
  });

  for (let i = 0; i < urls.length; i += 1) {
    const orderIndex = i + 1;
    const rawUrl = urls[i];
    const videoId = extractVideoId(rawUrl);
    const meta = videoId ? await fetchVideoMeta(videoId) : null;

    const existing = await db('videos')
      .where({ section_id: section.id, order_index: orderIndex })
      .first();

    const payload = {
      title: meta?.title || `Playlist Video ${orderIndex}`,
      description: meta?.author ? `Channel: ${meta.author}` : '',
      youtube_url: videoId
        ? `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`
        : rawUrl,
      duration_seconds: null,
      updated_at: new Date()
    };

    if (existing) {
      await db('videos').where({ id: existing.id }).update(payload);
    } else {
      await db('videos').insert({
        section_id: section.id,
        order_index: orderIndex,
        created_at: new Date(),
        ...payload
      });
    }
  }

  await db('videos')
    .where({ section_id: section.id })
    .andWhere('order_index', '>', urls.length)
    .del();

  console.log(`Imported ${urls.length} videos into subject "${SUBJECT_SLUG}".`);
}

run()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (err) => {
    console.error(err);
    await db.destroy();
    process.exit(1);
  });
