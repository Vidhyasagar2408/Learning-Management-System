exports.up = async function up(knex) {
  const hasSubjects = await knex.schema.hasTable('subjects');
  if (!hasSubjects) return;

  const hasInstructor = await knex.schema.hasColumn('subjects', 'instructor_name');
  if (!hasInstructor) {
    await knex.schema.alterTable('subjects', (table) => {
      table.string('instructor_name', 255).nullable();
    });
  }
};

exports.down = async function down(knex) {
  const hasSubjects = await knex.schema.hasTable('subjects');
  if (!hasSubjects) return;

  const hasInstructor = await knex.schema.hasColumn('subjects', 'instructor_name');
  if (hasInstructor) {
    await knex.schema.alterTable('subjects', (table) => {
      table.dropColumn('instructor_name');
    });
  }
};
