const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const DATA_PATH = path.join(__dirname, "../data/store.json");

const defaultPageContent = {
  home: {
    heroTitle: "Discover",
    heroHighlight: "Peaceful Stays",
    heroSubtitle:
      "Find reliable temple-town hospitality for pilgrims, families, and spiritual travellers across India.",
    heroImage:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
    aboutTitle: "Temple-Town Hospitality You Can Trust",
    aboutText: [
      "aalaGo connects travellers with curated stays near India's most sacred destinations.",
      "We partner with property owners to raise hospitality standards across temple towns.",
    ],
    aboutImage:
      "https://images.unsplash.com/photo-1561361513-2d2a92c751f6?auto=format&fit=crop&w=800&q=80",
    newsletterTitle: "Begin Your Spiritual Journey Today",
    newsletterText:
      "Get temple-town openings, stay standards, and route ideas in your inbox.",
    whyChooseUs: [
      {
        title: "Curated Properties",
        copy: "Handpicked stays near sacred destinations with verified quality standards.",
      },
      {
        title: "Spiritual Destinations",
        copy: "Explore India's most revered temple towns with local guidance.",
      },
      {
        title: "Easy Discovery",
        copy: "Search by temple, route, family needs, and arrival timing.",
      },
      {
        title: "Trusted Hospitality",
        copy: "Reliable stays built for pilgrims, families, and spiritual travellers.",
      },
    ],
    testimonials: [
      {
        name: "Priya Sharma",
        location: "Chennai",
        text: "Our Rameswaram stay was perfectly located near the temple. Early check-in made our pilgrimage so much easier.",
        rating: 5,
      },
      {
        name: "Rajesh Kumar",
        location: "Bangalore",
        text: "aalaGo helped us find a family-friendly stay in Tirupati with great cleanliness and local hospitality.",
        rating: 5,
      },
      {
        name: "Anitha Menon",
        location: "Kochi",
        text: "The Madurai property exceeded expectations. Trusted standards and helpful staff throughout our trip.",
        rating: 5,
      },
    ],
  },
  about: {
    title: "Built for Movement, Safe Arrival, and Temple-Town Shelter",
    subtitle: "About Aala Go",
    paragraphs: [
      "aalaGo is a temple-town hospitality brand that helps travellers find reliable stays near sacred destinations.",
      "Our wing mark represents movement and safe arrival, while the inner arch suggests shelter and temple-town relevance.",
    ],
    mission:
      "To make sacred travel easier by connecting pilgrims with trusted temple-town stays.",
    vision: "To become India's most trusted temple-town hospitality network.",
    stats: [
      { value: "500+", label: "Curated Properties" },
      { value: "50+", label: "Destinations" },
      { value: "10K+", label: "Happy Travelers" },
      { value: "100%", label: "Trusted Stays" },
    ],
    galleryImages: [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1609137144818-7fd85d3f3f3e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1561361513-2d2a92c751f6?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80",
    ],
  },
  banners: {
    destinations:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80",
    properties:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    about:
      "https://images.unsplash.com/photo-1561361513-2d2a92c751f6?auto=format&fit=crop&w=1600&q=80",
    blog:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
    contact:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80",
    legal:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
  },
};

const membershipBenefitKeys = [
  "bookingDiscount",
  "rewardWallet",
  "complimentaryBreakfast",
  "earlyCheckInLateCheckOut",
  "priorityBooking",
  "memberOnlyDeals",
  "travelWelcomeKit",
  "priorityCustomerSupport",
];

const membershipBenefitColumns = {
  bookingDiscount: "booking_discount",
  rewardWallet: "reward_wallet",
  complimentaryBreakfast: "complimentary_breakfast",
  earlyCheckInLateCheckOut: "early_check_in_late_check_out",
  priorityBooking: "priority_booking",
  memberOnlyDeals: "member_only_deals",
  travelWelcomeKit: "travel_welcome_kit",
  priorityCustomerSupport: "priority_customer_support",
};

const defaultMembershipPackages = [
  {
    name: "AalaGO Explorer",
    price: 499,
    period: "Year",
    popular: false,
    sortOrder: 1,
    benefits: {
      bookingDiscount: "10% OFF (Up to Rs.500/year)",
      rewardWallet: "Rs.250",
      complimentaryBreakfast: "1 Stay",
      earlyCheckInLateCheckOut: "",
      priorityBooking: "No",
      memberOnlyDeals: "Yes",
      travelWelcomeKit: "No",
      priorityCustomerSupport: "No",
    },
  },
  {
    name: "AalaGO Premium",
    price: 999,
    period: "Year",
    popular: true,
    sortOrder: 2,
    benefits: {
      bookingDiscount: "15% OFF (Up to Rs.2,000/year)",
      rewardWallet: "Rs.600",
      complimentaryBreakfast: "2 Stays",
      earlyCheckInLateCheckOut: "1 Time",
      priorityBooking: "Yes",
      memberOnlyDeals: "Yes",
      travelWelcomeKit: "Yes",
      priorityCustomerSupport: "Yes",
    },
  },
  {
    name: "AalaGO Legend",
    price: 1499,
    period: "Year",
    popular: false,
    sortOrder: 3,
    benefits: {
      bookingDiscount: "20% OFF (Up to Rs.3,000/year)",
      rewardWallet: "Rs.1,000",
      complimentaryBreakfast: "3 Stays",
      earlyCheckInLateCheckOut: "3 Times",
      priorityBooking: "Yes",
      memberOnlyDeals: "Yes",
      travelWelcomeKit: "Premium Kit",
      priorityCustomerSupport: "Premium Support",
    },
  },
];

function membershipFeaturesFromBenefits(benefits) {
  return [
    benefits.bookingDiscount,
    benefits.rewardWallet ? `${benefits.rewardWallet} Reward Wallet` : "",
    benefits.complimentaryBreakfast ? `${benefits.complimentaryBreakfast} Complimentary Breakfast` : "",
    benefits.earlyCheckInLateCheckOut ? `${benefits.earlyCheckInLateCheckOut} Early Check-in / Late Check-out` : "",
    truthyBenefit(benefits.priorityBooking) ? "Priority Booking" : "",
    truthyBenefit(benefits.memberOnlyDeals) ? "Member-Only Deals" : "",
    benefits.travelWelcomeKit && benefits.travelWelcomeKit !== "No" ? `Travel Welcome Kit: ${benefits.travelWelcomeKit}` : "",
    benefits.priorityCustomerSupport && benefits.priorityCustomerSupport !== "No"
      ? `Priority Customer Support: ${benefits.priorityCustomerSupport}`
      : "",
  ].filter(Boolean);
}

function membershipBenefitDbValues(benefits) {
  return Object.entries(membershipBenefitColumns).reduce((row, [key, column]) => {
    row[column] = benefits[key] ?? "";
    return row;
  }, {});
}

function readStore() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function writeStore(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function requiredString(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw Object.assign(new Error(`${name} is required`), { status: 400 });
  }
  return value.trim();
}

function optionalString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function emailString(value, name = "Email") {
  const email = requiredString(value, name).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error(`${name} must be valid`), { status: 400 });
  }
  return email;
}

function phoneString(value, name = "Phone number") {
  const phone = requiredString(value, name);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw Object.assign(new Error(`${name} must be 10 digits and start with 6, 7, 8, or 9`), { status: 400 });
  }
  return phone;
}

function stringList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

function numberValue(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeBookingUrl(value, fallback = "") {
  const raw = optionalString(value, fallback);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (!["aalastays.com", "www.aalastays.com", "book.aalabnb.com"].includes(host)) {
      throw Object.assign(new Error("Booking link must be an AalaStays booking URL"), { status: 400 });
    }
    return url.toString();
  } catch (err) {
    if (err.status) throw err;
    throw Object.assign(new Error("Booking link must be a valid URL"), { status: 400 });
  }
}

function safeBookingUrl(value) {
  try {
    return normalizeBookingUrl(value, "");
  } catch {
    return "";
  }
}

function toProperty(row, amenities = [], images = [], highlights = []) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    destinationId: row.destination_id,
    type: row.type,
    price: Number(row.price),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    popular: Boolean(row.popular),
    amenities,
    image: row.image,
    images: images.length ? images : [row.image],
    description: row.description,
    highlights,
    bookingUrl: safeBookingUrl(row.booking_url),
  };
}

async function ensureSchema() {
  const hasBookingUrl = await db.schema.hasColumn("properties", "booking_url");
  if (!hasBookingUrl) {
    await db.schema.alterTable("properties", (table) => {
      table.text("booking_url");
    });
  }
  const hasPartnerEnquiries = await db.schema.hasTable("partner_enquiries");
  if (!hasPartnerEnquiries) {
    await db.schema.createTable("partner_enquiries", (table) => {
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
  }
  const hasSubscribers = await db.schema.hasTable("subscribers");
  if (!hasSubscribers) {
    await db.schema.createTable("subscribers", (table) => {
      table.increments("id").primary();
      table.string("email", 191).notNullable().unique();
      table.string("source", 120).notNullable().defaultTo("Newsletter Banner");
      table.timestamps(true, true);
    });
  }
  const hasMembershipPackages = await db.schema.hasTable("membership_packages");
  if (!hasMembershipPackages) {
    await db.schema.createTable("membership_packages", (table) => {
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
  }
  const hasMembershipPackageFeatures = await db.schema.hasTable("membership_package_features");
  if (!hasMembershipPackageFeatures) {
    await db.schema.createTable("membership_package_features", (table) => {
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
  for (const [key, column] of Object.entries(membershipBenefitColumns)) {
    const hasColumn = await db.schema.hasColumn("membership_packages", column);
    if (hasColumn) continue;
    await db.schema.alterTable("membership_packages", (table) => {
      if (column === "booking_discount") {
        table.text(column);
      } else if (["priorityBooking", "memberOnlyDeals"].includes(key)) {
        table.string(column, 40).notNullable().defaultTo(key === "memberOnlyDeals" ? "Yes" : "No");
      } else {
        table.string(column, 120).notNullable().defaultTo("");
      }
    });
  }
}

async function getPropertyRelations(propertyIds) {
  if (!propertyIds.length) {
    return { amenities: new Map(), images: new Map(), highlights: new Map() };
  }
  const [amenityRows, imageRows, highlightRows] = await Promise.all([
    db("property_amenities").whereIn("property_id", propertyIds).orderBy(["property_id", "sort_order", "id"]),
    db("property_images").whereIn("property_id", propertyIds).orderBy(["property_id", "sort_order", "id"]),
    db("property_highlights").whereIn("property_id", propertyIds).orderBy(["property_id", "sort_order", "id"]),
  ]);

  const group = (rows, valueKey) => {
    const values = new Map();
    rows.forEach((row) => {
      const current = values.get(row.property_id) ?? [];
      current.push(row[valueKey]);
      values.set(row.property_id, current);
    });
    return values;
  };

  return {
    amenities: group(amenityRows, "name"),
    images: group(imageRows, "image"),
    highlights: group(highlightRows, "text"),
  };
}

async function replacePropertyList(tableName, propertyId, columnName, values, trx = db) {
  await trx(tableName).where({ property_id: propertyId }).del();
  const rows = values.map((value, index) => ({
    property_id: propertyId,
    [columnName]: value,
    sort_order: index,
  }));
  if (rows.length) {
    await trx(tableName).insert(rows);
  }
}

function normalizePropertyPayload(payload, existing = null) {
  const rawImages = Array.isArray(payload.images)
    ? payload.images
    : typeof payload.images === "string"
      ? payload.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : existing?.images ?? [];
  const images = stringList(rawImages, existing?.images ?? []);
  const imageCandidate =
    typeof payload.image === "string" && payload.image.trim()
      ? payload.image.trim()
      : images.length > 0
        ? images[0]
        : existing?.image;

  return {
    id: existing?.id ?? requiredString(payload.id, "Property id"),
    name: existing ? optionalString(payload.name, existing.name) : requiredString(payload.name, "Property name"),
    location: existing ? optionalString(payload.location, existing.location) : requiredString(payload.location, "Property location"),
    destinationId: existing
      ? optionalString(payload.destinationId, existing.destinationId)
      : requiredString(payload.destinationId, "Property destination"),
    type: existing ? optionalString(payload.type, existing.type) : requiredString(payload.type, "Property type"),
    price: payload.price === undefined ? existing?.price ?? 0 : numberValue(payload.price),
    rating: payload.rating === undefined ? existing?.rating ?? 0 : numberValue(payload.rating, 0),
    reviews: payload.reviews === undefined ? existing?.reviews ?? 0 : numberValue(payload.reviews, 0),
    popular: payload.popular === undefined ? Boolean(existing?.popular) : Boolean(payload.popular),
    amenities: payload.amenities === undefined ? existing?.amenities ?? [] : stringList(payload.amenities),
    image: existing ? requiredString(imageCandidate, "Property main image") : requiredString(imageCandidate, "Property main image"),
    images: images.length ? images : imageCandidate ? [imageCandidate] : [],
    description: existing
      ? optionalString(payload.description, existing.description)
      : requiredString(payload.description, "Property description"),
    highlights: payload.highlights === undefined ? existing?.highlights ?? [] : stringList(payload.highlights),
    bookingUrl: normalizeBookingUrl(payload.bookingUrl, existing?.bookingUrl ?? ""),
  };
}

async function initStore() {
  const store = readStore();
  await ensureSchema();
  await seedMembershipPackages();
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;
  let changed = false;

  if (envEmail && store.admin.email !== envEmail) {
    store.admin.email = envEmail;
    changed = true;
  }

  if (envPassword) {
    const passwordMatches = store.admin.passwordHash
      ? await bcrypt.compare(envPassword, store.admin.passwordHash)
      : false;
    if (!passwordMatches) {
      store.admin.passwordHash = await bcrypt.hash(envPassword, 10);
      changed = true;
    }
  }

  if (!store.admin.passwordHash) {
    const password = envPassword || "admin123";
    store.admin.passwordHash = await bcrypt.hash(password, 10);
    store.admin.email = envEmail || store.admin.email;
    changed = true;
  }

  if (changed) {
    writeStore(store);
  }

  // console.log(`Admin ready: ${store.admin.email}`);
}

async function seedMembershipPackages() {
  const [{ count }] = await db("membership_packages").count({ count: "id" });
  if (Number(count) === 0) {
    await db.transaction(async (trx) => {
      for (const plan of defaultMembershipPackages) {
        const [id] = await trx("membership_packages").insert({
          name: plan.name,
          price: plan.price,
          period: plan.period,
          ...membershipBenefitDbValues(plan.benefits),
          popular: plan.popular,
          sort_order: plan.sortOrder,
        });
        await replaceMembershipFeatures(id, membershipFeaturesFromBenefits(plan.benefits), trx);
      }
    });
    return;
  }

  const rows = await db("membership_packages")
    .orderBy([{ column: "sort_order", order: "asc" }, { column: "id", order: "asc" }])
    .limit(defaultMembershipPackages.length);

  await Promise.all(rows.map((row, index) => {
    const plan = defaultMembershipPackages[index];
    if (!plan) return null;
    const hasBenefitValues = Object.values(membershipBenefitColumns).some((column) => row[column]);
    if (hasBenefitValues) return null;
    return db.transaction(async (trx) => {
      await trx("membership_packages").where({ id: row.id }).update({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        ...membershipBenefitDbValues(plan.benefits),
        popular: plan.popular,
        sort_order: plan.sortOrder,
        updated_at: new Date(),
      });
      await replaceMembershipFeatures(row.id, membershipFeaturesFromBenefits(plan.benefits), trx);
    });
  }));
}

async function getDestinations() {
  const rows = await db("destinations")
    .leftJoin("properties", "destinations.id", "properties.destination_id")
    .select(
      "destinations.id",
      "destinations.name",
      "destinations.state",
      "destinations.image",
      "destinations.description",
    )
    .count({ properties: "properties.id" })
    .groupBy(
      "destinations.id",
      "destinations.name",
      "destinations.state",
      "destinations.image",
      "destinations.description",
    )
    .orderBy("destinations.created_at", "asc");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    state: row.state,
    image: row.image,
    description: row.description,
    properties: Number(row.properties),
  }));
}

async function getDestination(id) {
  const row = await db("destinations").where({ id }).first();
  if (!row) return null;
  const [{ count }] = await db("properties").where({ destination_id: id }).count({ count: "id" });
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    image: row.image,
    description: row.description,
    properties: Number(count),
  };
}

async function createDestination(payload) {
  const destination = {
    id: requiredString(payload.id, "Destination id"),
    name: requiredString(payload.name, "Destination name"),
    state: requiredString(payload.state, "Destination state"),
    image: requiredString(payload.image, "Destination image"),
    description: requiredString(payload.description, "Destination description"),
  };
  const exists = await db("destinations").where({ id: destination.id }).first();
  if (exists) {
    throw Object.assign(new Error("Destination id already exists"), {
      status: 409,
    });
  }
  await db("destinations").insert(destination);
  return getDestination(destination.id);
}

async function updateDestination(id, payload) {
  const existing = await db("destinations").where({ id }).first();
  if (!existing) {
    throw Object.assign(new Error("Destination not found"), { status: 404 });
  }
  await db("destinations").where({ id }).update({
    name: payload.name ?? existing.name,
    state: payload.state ?? existing.state,
    image: payload.image ?? existing.image,
    description: payload.description ?? existing.description,
    updated_at: new Date(),
  });
  return getDestination(id);
}

async function deleteDestination(id) {
  await db.transaction(async (trx) => {
    const existing = await trx("destinations").where({ id }).first();
    if (!existing) {
      throw Object.assign(new Error("Destination not found"), { status: 404 });
    }
    const propertyRows = await trx("properties").where({ destination_id: id }).select("id");
    const propertyIds = propertyRows.map((property) => property.id);
    if (propertyIds.length) {
      await trx("property_images").whereIn("property_id", propertyIds).del();
      await trx("property_amenities").whereIn("property_id", propertyIds).del();
      await trx("property_highlights").whereIn("property_id", propertyIds).del();
      await trx("properties").whereIn("id", propertyIds).del();
    }
    await trx("destinations").where({ id }).del();
  });
}

async function getProperties(destinationId) {
  const query = db("properties").orderBy("created_at", "asc");
  if (destinationId) {
    query.where({ destination_id: destinationId });
  }
  const rows = await query;
  const propertyIds = rows.map((row) => row.id);
  const relations = await getPropertyRelations(propertyIds);
  return rows.map((row) => toProperty(
    row,
    relations.amenities.get(row.id) ?? [],
    relations.images.get(row.id) ?? [],
    relations.highlights.get(row.id) ?? [],
  ));
}

async function getProperty(id) {
  const row = await db("properties").where({ id }).first();
  if (!row) return null;
  const relations = await getPropertyRelations([id]);
  return toProperty(
    row,
    relations.amenities.get(id) ?? [],
    relations.images.get(id) ?? [],
    relations.highlights.get(id) ?? [],
  );
}

async function createProperty(payload) {
  const property = normalizePropertyPayload(payload);
  const destination = await db("destinations").where({ id: property.destinationId }).first();
  if (!destination) {
    throw Object.assign(new Error("Destination not found"), { status: 400 });
  }
  const exists = await db("properties").where({ id: property.id }).first();
  if (exists) {
    throw Object.assign(new Error("Property id already exists"), {
      status: 409,
    });
  }
  await db.transaction(async (trx) => {
    await trx("properties").insert({
      id: property.id,
      destination_id: property.destinationId,
      name: property.name,
      location: property.location,
      type: property.type,
      price: property.price,
      rating: property.rating,
      reviews: property.reviews,
      popular: property.popular,
      image: property.image,
      description: property.description,
      booking_url: property.bookingUrl,
    });
    await replacePropertyList("property_images", property.id, "image", property.images, trx);
    await replacePropertyList("property_amenities", property.id, "name", property.amenities, trx);
    await replacePropertyList("property_highlights", property.id, "text", property.highlights, trx);
  });
  return getProperty(property.id);
}

async function updateProperty(id, payload) {
  const existing = await getProperty(id);
  if (!existing) {
    throw Object.assign(new Error("Property not found"), { status: 404 });
  }
  const property = normalizePropertyPayload(payload, existing);
  const destination = await db("destinations").where({ id: property.destinationId }).first();
  if (!destination) {
    throw Object.assign(new Error("Destination not found"), { status: 400 });
  }
  await db.transaction(async (trx) => {
    await trx("properties").where({ id }).update({
      destination_id: property.destinationId,
      name: property.name,
      location: property.location,
      type: property.type,
      price: property.price,
      rating: property.rating,
      reviews: property.reviews,
      popular: property.popular,
      image: property.image,
      description: property.description,
      booking_url: property.bookingUrl,
      updated_at: new Date(),
    });
    await replacePropertyList("property_images", id, "image", property.images, trx);
    await replacePropertyList("property_amenities", id, "name", property.amenities, trx);
    await replacePropertyList("property_highlights", id, "text", property.highlights, trx);
  });
  return getProperty(id);
}

async function deleteProperty(id) {
  await db.transaction(async (trx) => {
    const existing = await trx("properties").where({ id }).first();
    if (!existing) {
      throw Object.assign(new Error("Property not found"), { status: 404 });
    }
    await trx("property_images").where({ property_id: id }).del();
    await trx("property_amenities").where({ property_id: id }).del();
    await trx("property_highlights").where({ property_id: id }).del();
    await trx("properties").where({ id }).del();
  });
}

function getBlogPosts() {
  return readStore().blogPosts ?? [];
}

function getBlogPost(id) {
  return getBlogPosts().find((post) => post.id === id) ?? null;
}

function createBlogPost(payload) {
  const store = readStore();
  const post = {
    id: requiredString(payload.id, "Blog id"),
    title: requiredString(payload.title, "Blog title"),
    excerpt: requiredString(payload.excerpt, "Blog excerpt"),
    author: requiredString(payload.author, "Blog author"),
    readTime: requiredString(payload.readTime, "Blog read time"),
    category: requiredString(payload.category, "Blog category"),
    date: requiredString(payload.date, "Blog date"),
    image: optionalString(payload.image),
  };
  store.blogPosts = store.blogPosts ?? [];
  if (store.blogPosts.some((item) => item.id === post.id)) {
    throw Object.assign(new Error("Blog id already exists"), { status: 409 });
  }
  store.blogPosts.push(post);
  writeStore(store);
  return getBlogPost(post.id);
}

function updateBlogPost(id, payload) {
  const store = readStore();
  store.blogPosts = store.blogPosts ?? [];
  const index = store.blogPosts.findIndex((post) => post.id === id);
  if (index === -1) {
    throw Object.assign(new Error("Blog post not found"), { status: 404 });
  }
  store.blogPosts[index] = {
    ...store.blogPosts[index],
    title: payload.title ?? store.blogPosts[index].title,
    excerpt: payload.excerpt ?? store.blogPosts[index].excerpt,
    author: payload.author ?? store.blogPosts[index].author,
    readTime: payload.readTime ?? store.blogPosts[index].readTime,
    category: payload.category ?? store.blogPosts[index].category,
    date: payload.date ?? store.blogPosts[index].date,
    image: payload.image ?? store.blogPosts[index].image,
  };
  writeStore(store);
  return getBlogPost(id);
}

function deleteBlogPost(id) {
  const store = readStore();
  store.blogPosts = store.blogPosts ?? [];
  const index = store.blogPosts.findIndex((post) => post.id === id);
  if (index === -1) {
    throw Object.assign(new Error("Blog post not found"), { status: 404 });
  }
  store.blogPosts.splice(index, 1);
  writeStore(store);
}

function getPageContent(slug) {
  const store = readStore();
  if (!["home", "about", "banners"].includes(slug)) return null;
  return {
    ...defaultPageContent[slug],
    ...(store.pageContent?.[slug] ?? {}),
  };
}

function updatePageContent(slug, payload) {
  const store = readStore();
  store.pageContent = store.pageContent ?? {};
  if (!["home", "about", "banners"].includes(slug)) {
    throw Object.assign(new Error("Page content not found"), { status: 404 });
  }
  const hasPayload =
    payload && typeof payload === "object" && Object.keys(payload).length > 0;
  if (!hasPayload) {
    return getPageContent(slug);
  }
  store.pageContent[slug] = {
    ...defaultPageContent[slug],
    ...(store.pageContent[slug] ?? {}),
    ...payload,
  };
  writeStore(store);
  return getPageContent(slug);
}

function getAdmin() {
  return readStore().admin;
}

function toPartnerEnquiry(row) {
  return {
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number,
    email: row.email,
    city: row.city,
    hotelName: row.hotel_name,
    locationWithinCity: row.location_within_city,
    locationPinCode: row.location_pin_code,
    propertyAge: row.property_age,
    numberOfRooms: row.number_of_rooms,
    createdAt: row.created_at,
  };
}

function toSubscriber(row) {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    createdAt: row.created_at,
  };
}

function parseJsonList(value) {
  if (Array.isArray(value)) return stringList(value);
  if (typeof value !== "string") return [];
  try {
    return stringList(JSON.parse(value));
  } catch {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parseJsonObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeMembershipBenefits(value, fallback = {}) {
  const raw = parseJsonObject(value);
  return membershipBenefitKeys.reduce((benefits, key) => {
    benefits[key] = optionalString(raw[key], fallback[key] ?? "");
    return benefits;
  }, {});
}

function truthyBenefit(value) {
  return typeof value === "string" && ["yes", "true", "included"].includes(value.trim().toLowerCase());
}

function membershipBenefitsFromRow(row) {
  return membershipBenefitKeys.reduce((benefits, key) => {
    const column = membershipBenefitColumns[key];
    benefits[key] = optionalString(row[column], "");
    return benefits;
  }, {});
}

function toMembershipPackage(row, features = []) {
  const benefits = membershipBenefitsFromRow(row);
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    period: row.period,
    features,
    benefits,
    popular: Boolean(row.popular),
    sortOrder: Number(row.sort_order),
  };
}

async function getMembershipFeatureMap(packageIds) {
  if (!packageIds.length) return new Map();
  const rows = await db("membership_package_features")
    .whereIn("membership_package_id", packageIds)
    .orderBy(["membership_package_id", "sort_order", "id"]);
  return rows.reduce((values, row) => {
    const current = values.get(row.membership_package_id) ?? [];
    current.push(row.text);
    values.set(row.membership_package_id, current);
    return values;
  }, new Map());
}

async function replaceMembershipFeatures(packageId, features, trx = db) {
  await trx("membership_package_features").where({ membership_package_id: packageId }).del();
  if (!features.length) return;
  await trx("membership_package_features").insert(features.map((text, index) => ({
    membership_package_id: packageId,
    text,
    sort_order: index,
  })));
}

function normalizeMembershipPackage(payload, existing = null) {
  const benefits = payload.benefits === undefined
    ? existing?.benefits ?? normalizeMembershipBenefits({})
    : normalizeMembershipBenefits(payload.benefits, existing?.benefits ?? {});
  const features = payload.features === undefined
    ? existing?.features ?? membershipFeaturesFromBenefits(benefits)
    : stringList(payload.features);
  return {
    name: existing ? optionalString(payload.name, existing.name) : requiredString(payload.name, "Package name"),
    price: payload.price === undefined ? existing?.price ?? 0 : numberValue(payload.price, 0),
    period: existing ? optionalString(payload.period, existing.period) : requiredString(payload.period, "Package period"),
    features: features.length ? features : membershipFeaturesFromBenefits(benefits),
    benefits,
    popular: payload.popular === undefined ? Boolean(existing?.popular) : Boolean(payload.popular),
    sortOrder: payload.sortOrder === undefined ? existing?.sortOrder ?? 0 : numberValue(payload.sortOrder, 0),
  };
}

async function getMembershipPackages() {
  const rows = await db("membership_packages").orderBy([
    { column: "sort_order", order: "asc" },
    { column: "id", order: "asc" },
  ]);
  const features = await getMembershipFeatureMap(rows.map((row) => row.id));
  return rows.map((row) => toMembershipPackage(row, features.get(row.id) ?? []));
}

async function createMembershipPackage(payload) {
  const item = normalizeMembershipPackage(payload);
  let id;
  await db.transaction(async (trx) => {
    [id] = await trx("membership_packages").insert({
      name: item.name,
      price: item.price,
      period: item.period,
      ...membershipBenefitDbValues(item.benefits),
      popular: item.popular,
      sort_order: item.sortOrder,
    });
    await replaceMembershipFeatures(id, item.features, trx);
  });
  const row = await db("membership_packages").where({ id }).first();
  return toMembershipPackage(row, item.features);
}

async function updateMembershipPackage(id, payload) {
  const row = await db("membership_packages").where({ id }).first();
  if (!row) {
    throw Object.assign(new Error("Membership package not found"), { status: 404 });
  }
  const featureMap = await getMembershipFeatureMap([Number(id)]);
  const existing = toMembershipPackage(row, featureMap.get(Number(id)) ?? []);
  const item = normalizeMembershipPackage(payload, existing);
  await db.transaction(async (trx) => {
    await trx("membership_packages").where({ id }).update({
      name: item.name,
      price: item.price,
      period: item.period,
      ...membershipBenefitDbValues(item.benefits),
      popular: item.popular,
      sort_order: item.sortOrder,
      updated_at: new Date(),
    });
    await replaceMembershipFeatures(id, item.features, trx);
  });
  const updated = await db("membership_packages").where({ id }).first();
  return toMembershipPackage(updated, item.features);
}

async function deleteMembershipPackage(id) {
  await db.transaction(async (trx) => {
    await trx("membership_package_features").where({ membership_package_id: id }).del();
    const deleted = await trx("membership_packages").where({ id }).del();
    if (!deleted) {
      throw Object.assign(new Error("Membership package not found"), { status: 404 });
    }
  });
}

async function createPartnerEnquiry(payload) {
  const enquiry = {
    name: requiredString(payload.name, "Name"),
    phone_number: phoneString(payload.phoneNumber),
    email: emailString(payload.email),
    city: requiredString(payload.city, "City"),
    hotel_name: requiredString(payload.hotelName, "Hotel name"),
    location_within_city: optionalString(payload.locationWithinCity, ""),
    location_pin_code: requiredString(payload.locationPinCode, "Location pin code"),
    property_age: requiredString(payload.propertyAge, "Age of the property"),
    number_of_rooms: requiredString(payload.numberOfRooms, "Number of rooms"),
    crm_payload: payload.crmPayload ? JSON.stringify(payload.crmPayload) : null,
  };
  const [id] = await db("partner_enquiries").insert(enquiry);
  const row = await db("partner_enquiries").where({ id }).first();
  return toPartnerEnquiry(row);
}

async function getPartnerEnquiries() {
  const rows = await db("partner_enquiries").orderBy("created_at", "desc");
  return rows.map(toPartnerEnquiry);
}

async function createSubscriber(payload) {
  const subscriber = {
    email: emailString(payload.email),
    source: optionalString(payload.source, "Newsletter Banner") || "Newsletter Banner",
  };
  const existing = await db("subscribers").where({ email: subscriber.email }).first();
  if (existing) return toSubscriber(existing);

  const [id] = await db("subscribers").insert(subscriber);
  const row = await db("subscribers").where({ id }).first();
  return toSubscriber(row);
}

async function getSubscribers() {
  const rows = await db("subscribers").orderBy("created_at", "desc");
  return rows.map(toSubscriber);
}

module.exports = {
  initStore,
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getPageContent,
  updatePageContent,
  getAdmin,
  createPartnerEnquiry,
  getPartnerEnquiries,
  createSubscriber,
  getSubscribers,
  getMembershipPackages,
  createMembershipPackage,
  updateMembershipPackage,
  deleteMembershipPackage,
};
