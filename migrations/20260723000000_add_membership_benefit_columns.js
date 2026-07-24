const columns = [
  ["booking_discount", "text", ""],
  ["reward_wallet", "string", ""],
  ["complimentary_breakfast", "string", ""],
  ["early_check_in_late_check_out", "string", ""],
  ["priority_booking", "string", "No"],
  ["member_only_deals", "string", "Yes"],
  ["travel_welcome_kit", "string", "No"],
  ["priority_customer_support", "string", "No"],
];

const jsonKeyByColumn = {
  booking_discount: "bookingDiscount",
  reward_wallet: "rewardWallet",
  complimentary_breakfast: "complimentaryBreakfast",
  early_check_in_late_check_out: "earlyCheckInLateCheckOut",
  priority_booking: "priorityBooking",
  member_only_deals: "memberOnlyDeals",
  travel_welcome_kit: "travelWelcomeKit",
  priority_customer_support: "priorityCustomerSupport",
};

exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("membership_packages");
  if (!exists) return;

  for (const [name, type, fallback] of columns) {
    const hasColumn = await knex.schema.hasColumn("membership_packages", name);
    if (hasColumn) continue;
    await knex.schema.alterTable("membership_packages", (table) => {
      if (type === "text") {
        table.text(name);
      } else {
        table.string(name, 120).notNullable().defaultTo(fallback);
      }
    });
  }

  const hasOldBenefits = await knex.schema.hasColumn("membership_packages", "benefits");
  if (hasOldBenefits) {
    const rows = await knex("membership_packages").select("id", "benefits");
    for (const row of rows) {
      if (!row.benefits) continue;
      let benefits = {};
      try {
        benefits = typeof row.benefits === "string" ? JSON.parse(row.benefits) : row.benefits;
      } catch {
        benefits = {};
      }
      const update = {};
      for (const [column, key] of Object.entries(jsonKeyByColumn)) {
        update[column] = typeof benefits[key] === "string" ? benefits[key].trim() : "";
      }
      await knex("membership_packages").where({ id: row.id }).update(update);
    }
    await knex.schema.alterTable("membership_packages", (table) => {
      table.dropColumn("benefits");
    });
  }
};

exports.down = async function down(knex) {
  const exists = await knex.schema.hasTable("membership_packages");
  if (!exists) return;

  for (const [name] of [...columns].reverse()) {
    const hasColumn = await knex.schema.hasColumn("membership_packages", name);
    if (!hasColumn) continue;
    await knex.schema.alterTable("membership_packages", (table) => {
      table.dropColumn(name);
    });
  }
};
