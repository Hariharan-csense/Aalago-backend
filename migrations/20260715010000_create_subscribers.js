exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("subscribers");
  if (exists) return;

  await knex.schema.createTable("subscribers", (table) => {
    table.increments("id").primary();
    table.string("email", 191).notNullable().unique();
    table.string("source", 120).notNullable().defaultTo("Newsletter Banner");
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscribers");
};
