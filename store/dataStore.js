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
  };
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
  };
}

async function migrateJsonDestinationsAndProperties() {
  const store = readStore();
  await db.transaction(async (trx) => {
    for (const destination of store.destinations ?? []) {
      const exists = await trx("destinations").where({ id: destination.id }).first();
      if (!exists) {
        await trx("destinations").insert({
          id: destination.id,
          name: destination.name,
          state: destination.state,
          image: destination.image,
          description: destination.description,
        });
      }
    }

    for (const item of store.properties ?? []) {
      const exists = await trx("properties").where({ id: item.id }).first();
      if (!exists) {
        const property = normalizePropertyPayload(item);
        const destination = await trx("destinations").where({ id: property.destinationId }).first();
        if (!destination) continue;
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
        });
        await replacePropertyList("property_images", property.id, "image", property.images, trx);
        await replacePropertyList("property_amenities", property.id, "name", property.amenities, trx);
        await replacePropertyList("property_highlights", property.id, "text", property.highlights, trx);
      }
    }
  });
}

async function initStore() {
  const store = readStore();
  if (!store.admin.passwordHash) {
    const password = process.env.ADMIN_PASSWORD || "admin123";
    store.admin.passwordHash = await bcrypt.hash(password, 10);
    store.admin.email = process.env.ADMIN_EMAIL || store.admin.email;
    writeStore(store);
    console.log(`Admin ready: ${store.admin.email} / ${password}`);
  }
  await migrateJsonDestinationsAndProperties();
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
  const deleted = await db("destinations").where({ id }).del();
  if (!deleted) {
    throw Object.assign(new Error("Destination not found"), { status: 404 });
  }
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
      updated_at: new Date(),
    });
    await replacePropertyList("property_images", id, "image", property.images, trx);
    await replacePropertyList("property_amenities", id, "name", property.amenities, trx);
    await replacePropertyList("property_highlights", id, "text", property.highlights, trx);
  });
  return getProperty(id);
}

async function deleteProperty(id) {
  const deleted = await db("properties").where({ id }).del();
  if (!deleted) {
    throw Object.assign(new Error("Property not found"), { status: 404 });
  }
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
};
