exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("membership_packages");
  if (exists) return;

  await knex.schema.createTable("membership_packages", (table) => {
    table.increments("id").primary();
    table.string("name", 191).notNullable();
    table.decimal("price", 10, 2).notNullable().defaultTo(0);
    table.string("period", 80).notNullable().defaultTo("Year");
    table.json("features").notNullable();
    table.boolean("popular").notNullable().defaultTo(false);
    table.integer("sort_order").unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("membership_packages");
};
