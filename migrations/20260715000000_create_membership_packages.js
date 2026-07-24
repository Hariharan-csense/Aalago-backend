exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("membership_packages");
  if (exists) return;

  await knex.schema.createTable("membership_packages", (table) => {
    table.increments("id").primary();
    table.string("name", 191).notNullable();
    table.decimal("price", 10, 2).notNullable().defaultTo(0);
    table.string("period", 80).notNullable().defaultTo("Year");
    table.text("booking_discount");
    table.string("reward_wallet", 80).notNullable().defaultTo("");
    table.string("complimentary_breakfast", 80).notNullable().defaultTo("");
    table.string("early_check_in_late_check_out", 80).notNullable().defaultTo("");
    table.string("priority_booking", 40).notNullable().defaultTo("No");
    table.string("member_only_deals", 40).notNullable().defaultTo("Yes");
    table.string("travel_welcome_kit", 120).notNullable().defaultTo("No");
    table.string("priority_customer_support", 120).notNullable().defaultTo("No");
    table.boolean("popular").notNullable().defaultTo(false);
    table.integer("sort_order").unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("membership_package_features", (table) => {
    table.increments("id").primary();
    table.integer("membership_package_id").unsigned().notNullable();
    table.text("text").notNullable();
    table.integer("sort_order").unsigned().notNullable().defaultTo(0);
    table
      .foreign("membership_package_id")
      .references("id")
      .inTable("membership_packages")
      .onDelete("CASCADE");
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("membership_package_features");
  await knex.schema.dropTableIfExists("membership_packages");
};
