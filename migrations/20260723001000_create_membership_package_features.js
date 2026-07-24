exports.up = async function up(knex) {
  const hasPackages = await knex.schema.hasTable("membership_packages");
  if (!hasPackages) return;

  const hasFeaturesTable = await knex.schema.hasTable("membership_package_features");
  if (!hasFeaturesTable) {
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
  }

  const hasFeaturesColumn = await knex.schema.hasColumn("membership_packages", "features");
  if (hasFeaturesColumn) {
    const rows = await knex("membership_packages").select("id", "features");
    for (const row of rows) {
      let features = [];
      try {
        features = typeof row.features === "string" ? JSON.parse(row.features) : row.features;
      } catch {
        features = String(row.features ?? "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      const values = Array.isArray(features) ? features.filter((item) => typeof item === "string" && item.trim()) : [];
      if (values.length) {
        await knex("membership_package_features").insert(values.map((text, index) => ({
          membership_package_id: row.id,
          text: text.trim(),
          sort_order: index,
        })));
      }
    }
    await knex.schema.alterTable("membership_packages", (table) => {
      table.dropColumn("features");
    });
  }
};

exports.down = async function down(knex) {
  const hasPackages = await knex.schema.hasTable("membership_packages");
  if (!hasPackages) return;

  const hasFeaturesColumn = await knex.schema.hasColumn("membership_packages", "features");
  if (!hasFeaturesColumn) {
    await knex.schema.alterTable("membership_packages", (table) => {
      table.text("features");
    });
  }

  await knex.schema.dropTableIfExists("membership_package_features");
};
