/**
 * Initial aalaGO schema.
 *
 * Current app still reads/writes backend/data/store.json, but these tables make
 * the backend ready to move the same admin-managed data into MySQL.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable("admins", (table) => {
    table.increments("id").primary();
    table.string("email", 191).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("destinations", (table) => {
    table.string("id", 120).primary();
    table.string("name", 191).notNullable();
    table.string("state", 191).notNullable();
    table.text("image").notNullable();
    table.text("description").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("properties", (table) => {
    table.string("id", 120).primary();
    table.string("destination_id", 120).notNullable();
    table.string("name", 191).notNullable();
    table.string("location", 191).notNullable();
    table.string("type", 80).notNullable();
    table.decimal("price", 10, 2).notNullable().defaultTo(0);
    table.decimal("rating", 3, 2).notNullable().defaultTo(0);
    table.integer("reviews").unsigned().notNullable().defaultTo(0);
    table.boolean("popular").notNullable().defaultTo(false);
    table.text("image").notNullable();
    table.text("description").notNullable();
    table.text("booking_url");
    table.timestamps(true, true);

    table
      .foreign("destination_id")
      .references("destinations.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("property_images", (table) => {
    table.increments("id").primary();
    table.string("property_id", 120).notNullable();
    table.text("image").notNullable();
    table.integer("sort_order").unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);

    table
      .foreign("property_id")
      .references("properties.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("property_amenities", (table) => {
    table.increments("id").primary();
    table.string("property_id", 120).notNullable();
    table.string("name", 120).notNullable();
    table.integer("sort_order").unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);

    table
      .foreign("property_id")
      .references("properties.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("property_highlights", (table) => {
    table.increments("id").primary();
    table.string("property_id", 120).notNullable();
    table.string("text", 255).notNullable();
    table.integer("sort_order").unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);

    table
      .foreign("property_id")
      .references("properties.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("blog_posts", (table) => {
    table.string("id", 120).primary();
    table.string("title", 255).notNullable();
    table.text("excerpt").notNullable();
    table.string("author", 191).notNullable();
    table.string("read_time", 80).notNullable();
    table.string("category", 120).notNullable();
    table.string("date", 80).notNullable();
    table.text("image");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("page_contents", (table) => {
    table.string("slug", 80).primary();
    table.json("content").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("uploaded_files", (table) => {
    table.increments("id").primary();
    table.string("filename", 255).notNullable().unique();
    table.text("url").notNullable();
    table.string("mimetype", 120).notNullable();
    table.integer("size").unsigned().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("uploaded_files");
  await knex.schema.dropTableIfExists("page_contents");
  await knex.schema.dropTableIfExists("blog_posts");
  await knex.schema.dropTableIfExists("property_highlights");
  await knex.schema.dropTableIfExists("property_amenities");
  await knex.schema.dropTableIfExists("property_images");
  await knex.schema.dropTableIfExists("properties");
  await knex.schema.dropTableIfExists("destinations");
  await knex.schema.dropTableIfExists("admins");
};
