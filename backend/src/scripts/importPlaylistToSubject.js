const { spawnSync } = require('node:child_process');
const { db } = require('../config/db');

const PLAYLIST_URLS = [
  'https://youtube.com/playlist?list=PLbtI3_MArDOmSKABu09sEs0SxCibd1wgr&si=dbriULO-62iKt4ZX',
  'https://youtube.com/playlist?list=PLbtI3_MArDOnIIJxB6xFtpnhM0wTwz0x6&si=_HQSVmPoml8WMxCb',
  'https://youtube.com/playlist?list=PLbtI3_MArDOlJ4036mWiUKaQToUS8MZVu&si=JUtrQVe1fTKMKsrE',
  'https://youtube.com/playlist?list=PLbtI3_MArDOkXRLxdMt1NOMtCS-84ibHH&si=0CsneztAYLO1mOip'
];

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

function slugify(input) {
  const base = String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return base || 'course';
}

function fetchPlaylistsWithPython(urls) {
  const script = [
    'import json',
    'from pytube import Playlist',
    `urls = ${JSON.stringify(urls)}`,
    'out = []',
    'for u in urls:',
    '    p = Playlist(u)',
    '    out.append({',
    "        'url': u,",
    "        'title': p.title,",
    "        'video_urls': list(p.video_urls)",
    '    })',
    'print(json.dumps(out))'
  ].join('\n');

  const result = spawnSync('python', ['-c', script], { encoding: 'utf-8' });
  if (result.status !== 0) {
    throw new Error(`Failed to read playlists: ${result.stderr || result.stdout}`);
  }

  try {
    const parsed = JSON.parse(result.stdout.trim());
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('No playlists found');
    }
    return parsed;
  } catch (_err) {
    throw new Error(`Could not parse playlists: ${result.stdout}`);
  }
}

async function fetchVideoMeta(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
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

async function ensureSubject({ title, playlistId, thumbnailUrl, priceAmount, instructorName }) {
  const slug = `${slugify(title)}-${playlistId.toLowerCase()}`;
  const existing = await db('subjects').where({ slug }).first();
  if (existing) {
    await db('subjects').where({ id: existing.id }).update({
      title,
      description: `Imported from YouTube playlist ${playlistId}`,
      thumbnail_url: thumbnailUrl || existing.thumbnail_url,
      price_amount: Number(priceAmount || 0),
      instructor_name: instructorName || existing.instructor_name || null,
      is_published: true,
      updated_at: new Date()
    });
    return db('subjects').where({ id: existing.id }).first();
  }

  const [id] = await db('subjects').insert({
    title,
    slug,
    description: `Imported from YouTube playlist ${playlistId}`,
    thumbnail_url: thumbnailUrl || null,
    price_amount: Number(priceAmount || 0),
    instructor_name: instructorName || null,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  });
  return db('subjects').where({ id }).first();
}

async function ensureSection(subjectId) {
  const existing = await db('sections')
    .where({ subject_id: subjectId, order_index: SECTION_ORDER })
    .first();
  if (existing) {
    await db('sections').where({ id: existing.id }).update({
      title: SECTION_TITLE,
      updated_at: new Date()
    });
    return existing;
  }

  const [id] = await db('sections').insert({
    subject_id: subjectId,
    title: SECTION_TITLE,
    order_index: SECTION_ORDER,
    created_at: new Date(),
    updated_at: new Date()
  });
  return db('sections').where({ id }).first();
}

async function importOnePlaylist(playlist) {
  const playlistId = extractPlaylistId(playlist.url);
  if (!playlistId) throw new Error(`Invalid playlist URL: ${playlist.url}`);
  if (!playlist.video_urls || playlist.video_urls.length === 0) {
    throw new Error(`Playlist has no videos: ${playlist.url}`);
  }

  const firstVideoId = extractVideoId(playlist.video_urls[0]);
  const firstMeta = firstVideoId ? await fetchVideoMeta(firstVideoId) : null;
  const subjectTitle = playlist.title || `Playlist ${playlistId}`;
  const priceAmount = Math.max(999, playlist.video_urls.length * 120);

  const subject = await ensureSubject({
    title: subjectTitle,
    playlistId,
    thumbnailUrl: firstMeta?.thumbnail || null,
    priceAmount,
    instructorName: firstMeta?.author || null
  });
  const section = await ensureSection(subject.id);

  for (let i = 0; i < playlist.video_urls.length; i += 1) {
    const orderIndex = i + 1;
    const rawUrl = playlist.video_urls[i];
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
    .andWhere('order_index', '>', playlist.video_urls.length)
    .del();

  return { subjectTitle, playlistId, count: playlist.video_urls.length };
}

async function run() {
  const playlists = fetchPlaylistsWithPython(PLAYLIST_URLS);
  const results = [];

  for (const playlist of playlists) {
    const one = await importOnePlaylist(playlist);
    results.push(one);
    console.log(`Imported ${one.count} videos for "${one.subjectTitle}" (${one.playlistId}).`);
  }

  console.log(`Completed import of ${results.length} playlists.`);
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
