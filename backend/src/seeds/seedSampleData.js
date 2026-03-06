const { db } = require('../config/db');

async function createSubject({ title, slug, description, thumbnail_url, price_amount, instructor_name, sections }) {
  const existing = await db('subjects').where({ slug }).first();
  let subjectId = existing?.id;

  if (!subjectId) {
    const [id] = await db('subjects').insert({
      title,
      slug,
      description,
      thumbnail_url,
      price_amount: Number(price_amount || 0),
      instructor_name: instructor_name || null,
      is_published: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    subjectId = id;
  } else {
    await db('subjects').where({ id: subjectId }).update({
      title,
      description,
      thumbnail_url,
      price_amount: Number(price_amount || 0),
      instructor_name: instructor_name || null,
      is_published: true,
      updated_at: new Date()
    });
  }

  for (const section of sections) {
    let sectionId;
    const existingSection = await db('sections')
      .where({ subject_id: subjectId, order_index: section.order_index })
      .first();

    if (existingSection) {
      sectionId = existingSection.id;
      await db('sections').where({ id: sectionId }).update({
        title: section.title,
        updated_at: new Date()
      });
    } else {
      const [sid] = await db('sections').insert({
        subject_id: subjectId,
        title: section.title,
        order_index: section.order_index,
        created_at: new Date(),
        updated_at: new Date()
      });
      sectionId = sid;
    }

    for (const video of section.videos) {
      const existingVideo = await db('videos')
        .where({ section_id: sectionId, order_index: video.order_index })
        .first();

      if (existingVideo) {
        await db('videos').where({ id: existingVideo.id }).update({
          title: video.title,
          description: video.description,
          youtube_url: video.youtube_url,
          duration_seconds: video.duration_seconds,
          updated_at: new Date()
        });
      } else {
        await db('videos').insert({
          section_id: sectionId,
          title: video.title,
          description: video.description,
          youtube_url: video.youtube_url,
          order_index: video.order_index,
          duration_seconds: video.duration_seconds,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
  }
}

async function run() {
  await createSubject({
    title: 'JavaScript Fundamentals',
    slug: 'javascript-fundamentals',
    description: 'Core JavaScript concepts for web development.',
    thumbnail_url: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
    price_amount: 1499,
    instructor_name: 'Hitesh Choudhary',
    sections: [
      {
        order_index: 1,
        title: 'Introduction',
        videos: [
          {
            order_index: 1,
            title: 'What is JavaScript?',
            description: 'Overview of JavaScript and where it runs.',
            youtube_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            duration_seconds: 3600
          },
          {
            order_index: 2,
            title: 'Variables and Data Types',
            description: 'Learn var, let, const and basic data types.',
            youtube_url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
            duration_seconds: 3600
          }
        ]
      },
      {
        order_index: 2,
        title: 'Functions and Arrays',
        videos: [
          {
            order_index: 1,
            title: 'Functions in JavaScript',
            description: 'How to define and use functions effectively.',
            youtube_url: 'https://www.youtube.com/watch?v=N8ap4k_1QEQ',
            duration_seconds: 2200
          },
          {
            order_index: 2,
            title: 'Array Methods',
            description: 'map, filter, reduce and common array workflows.',
            youtube_url: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c',
            duration_seconds: 2400
          }
        ]
      }
    ]
  });

  await createSubject({
    title: 'React Basics',
    slug: 'react-basics',
    description: 'Start building modern UI with React.',
    thumbnail_url: 'https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg',
    price_amount: 1299,
    instructor_name: 'Sheryians Coding School',
    sections: [
      {
        order_index: 1,
        title: 'Getting Started',
        videos: [
          {
            order_index: 1,
            title: 'React in 100 Seconds',
            description: 'Quick React overview.',
            youtube_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
            duration_seconds: 100
          },
          {
            order_index: 2,
            title: 'React Components and Props',
            description: 'Understand reusable components and props.',
            youtube_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
            duration_seconds: 5400
          }
        ]
      }
    ]
  });

  await createSubject({
    title: 'Full Stack WEB Development Complete Course',
    slug: 'full-stack-web-development-complete-course',
    description: 'Complete full stack web development playlist course.',
    thumbnail_url: 'https://img.youtube.com/vi/4dprtEzunIk/hqdefault.jpg',
    price_amount: 2499,
    instructor_name: 'Sheryians Coding School',
    sections: [
      {
        order_index: 1,
        title: 'Complete Course',
        videos: [
          {
            order_index: 1,
            title: 'Full Stack WEB Development Complete Course',
            description: 'YouTube playlist-based complete full stack course.',
            youtube_url: 'https://www.youtube.com/playlist?list=PLbtI3_MArDOkxh7XzixN2G4NAGIVqTFon',
            duration_seconds: 3600
          }
        ]
      }
    ]
  });

  console.log('Seed completed: sample published subjects/videos created.');
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
