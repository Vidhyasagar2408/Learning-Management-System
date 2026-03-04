exports.up = async function up(knex) {
  const hasSubjects = await knex.schema.hasTable('subjects');
  if (!hasSubjects) return;

  const hasThumbnail = await knex.schema.hasColumn('subjects', 'thumbnail_url');
  if (!hasThumbnail) {
    await knex.schema.alterTable('subjects', (table) => {
      table.string('thumbnail_url', 1024).nullable();
    });
  }
};

exports.down = async function down(knex) {
  const hasSubjects = await knex.schema.hasTable('subjects');
  if (!hasSubjects) return;

  const hasThumbnail = await knex.schema.hasColumn('subjects', 'thumbnail_url');
  if (hasThumbnail) {
    await knex.schema.alterTable('subjects', (table) => {
      table.dropColumn('thumbnail_url');
    });
  }
};
