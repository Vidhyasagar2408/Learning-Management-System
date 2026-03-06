exports.up = async function up(knex) {
  const hasSubjects = await knex.schema.hasTable('subjects');
  if (!hasSubjects) return;

  const hasPrice = await knex.schema.hasColumn('subjects', 'price_amount');
  if (!hasPrice) {
    await knex.schema.alterTable('subjects', (table) => {
      table.decimal('price_amount', 10, 2).notNullable().defaultTo(0);
    });
  }
};

exports.down = async function down(knex) {
  const hasSubjects = await knex.schema.hasTable('subjects');
  if (!hasSubjects) return;

  const hasPrice = await knex.schema.hasColumn('subjects', 'price_amount');
  if (hasPrice) {
    await knex.schema.alterTable('subjects', (table) => {
      table.dropColumn('price_amount');
    });
  }
};
