exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("partner_enquiries");
  if (exists) return;

  await knex.schema.createTable("partner_enquiries", (table) => {
    table.increments("id").primary();
    table.string("name", 191).notNullable();
    table.string("phone_number", 40).notNullable();
    table.string("email", 191).notNullable();
    table.string("city", 120).notNullable();
    table.string("hotel_name", 191).notNullable();
    table.string("location_within_city", 191).notNullable();
    table.string("location_pin_code", 20).notNullable();
    table.string("property_age", 40).notNullable();
    table.string("number_of_rooms", 40).notNullable();
    table.text("crm_payload");
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("partner_enquiries");
};
