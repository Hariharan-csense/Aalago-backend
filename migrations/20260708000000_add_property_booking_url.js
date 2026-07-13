exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn("properties", "booking_url");
  if (!hasColumn) {
    await knex.schema.alterTable("properties", (table) => {
      table.text("booking_url");
    });
  }
};

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn("properties", "booking_url");
  if (hasColumn) {
    await knex.schema.alterTable("properties", (table) => {
      table.dropColumn("booking_url");
    });
  }
};
