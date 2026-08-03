const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const store = require("../store/dataStore");

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
  if (typeof value === "string") {
    return value
      .split(",")
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

async function getDestinationFromDb(id, trx = db) {
  const row = await trx("destinations").where({ id }).first();
  if (!row) return null;
  const [{ count }] = await trx("properties").where({ destination_id: id }).count({ count: "id" });
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    image: row.image,
    description: row.description,
    properties: Number(count),
  };
}

async function getPropertyRelations(propertyIds, trx = db) {
  if (!propertyIds.length) {
    return { amenities: new Map(), images: new Map(), highlights: new Map() };
  }
  const [amenityRows, imageRows, highlightRows] = await Promise.all([
    trx("property_amenities").whereIn("property_id", propertyIds).orderBy(["property_id", "sort_order", "id"]),
    trx("property_images").whereIn("property_id", propertyIds).orderBy(["property_id", "sort_order", "id"]),
    trx("property_highlights").whereIn("property_id", propertyIds).orderBy(["property_id", "sort_order", "id"]),
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

async function getPropertyFromDb(id, trx = db) {
  const row = await trx("properties").where({ id }).first();
  if (!row) return null;
  const relations = await getPropertyRelations([id], trx);
  return toProperty(
    row,
    relations.amenities.get(id) ?? [],
    relations.images.get(id) ?? [],
    relations.highlights.get(id) ?? [],
  );
}

async function replacePropertyList(trx, tableName, propertyId, columnName, values) {
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

async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  const admin = store.getAdmin();
  if (email !== admin.email) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign(
    { email: admin.email },
    process.env.JWT_SECRET || "aalago-dev-secret",
    { expiresIn: "7d" },
  );
  return res.json({ token, user: { email: admin.email } });
}

async function listDestinations(_req, res) {
  try {
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

    return res.json({
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        state: row.state,
        image: row.image,
        description: row.description,
        properties: Number(row.properties),
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function createDestination(req, res) {
  try {
    const { id, name, state, image, description } = req.body ?? {};
    const destination = {
      id: requiredString(id, "Destination id"),
      name: requiredString(name, "Destination name"),
      state: requiredString(state, "Destination state"),
      image: requiredString(image, "Destination image"),
      description: requiredString(description, "Destination description"),
    };

    const data = await db.transaction(async (trx) => {
      const existing = await trx("destinations").where({ id: destination.id }).first();
      if (existing) {
        throw Object.assign(new Error("Destination id already exists"), { status: 409 });
      }
      await trx("destinations").insert(destination);
      return getDestinationFromDb(destination.id, trx);
    });
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateDestination(req, res) {
  try {
    const { name, state, image, description } = req.body ?? {};
    const data = await db.transaction(async (trx) => {
      const existing = await trx("destinations").where({ id: req.params.id }).first();
      if (!existing) {
        throw Object.assign(new Error("Destination not found"), { status: 404 });
      }
      await trx("destinations").where({ id: req.params.id }).update({
        name: name ?? existing.name,
        state: state ?? existing.state,
        image: image ?? existing.image,
        description: description ?? existing.description,
        updated_at: new Date(),
      });
      return getDestinationFromDb(req.params.id, trx);
    });
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteDestination(req, res) {
  try {
    await db.transaction(async (trx) => {
      const existing = await trx("destinations").where({ id: req.params.id }).first();
      if (!existing) {
        throw Object.assign(new Error("Destination not found"), { status: 404 });
      }
      await trx("destinations").where({ id: req.params.id }).del();
    });
    return res.status(204).send();
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function listProperties(req, res) {
  try {
    const query = db("properties").orderBy("created_at", "asc");
    if (req.query.destinationId) {
      query.where({ destination_id: req.query.destinationId });
    }
    const rows = await query;
    const propertyIds = rows.map((row) => row.id);
    const relations = await getPropertyRelations(propertyIds);
    return res.json({
      data: rows.map((row) => toProperty(
        row,
        relations.amenities.get(row.id) ?? [],
        relations.images.get(row.id) ?? [],
        relations.highlights.get(row.id) ?? [],
      )),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function createProperty(req, res) {
  try {
    const {
      id,
      name,
      location,
      destinationId,
      type,
      price,
      rating,
      reviews,
      popular,
      amenities,
      image,
      images,
      description,
      highlights,
      bookingUrl,
    } = req.body ?? {};
    const property = normalizePropertyPayload({
      id,
      name,
      location,
      destinationId,
      type,
      price,
      rating,
      reviews,
      popular,
      amenities,
      image,
      images,
      description,
      highlights,
      bookingUrl,
    });
    const data = await db.transaction(async (trx) => {
      const destination = await trx("destinations").where({ id: property.destinationId }).first();
      if (!destination) {
        throw Object.assign(new Error("Destination not found"), { status: 400 });
      }
      const existing = await trx("properties").where({ id: property.id }).first();
      if (existing) {
        throw Object.assign(new Error("Property id already exists"), { status: 409 });
      }
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
      await replacePropertyList(trx, "property_images", property.id, "image", property.images);
      await replacePropertyList(trx, "property_amenities", property.id, "name", property.amenities);
      await replacePropertyList(trx, "property_highlights", property.id, "text", property.highlights);
      return getPropertyFromDb(property.id, trx);
    });
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateProperty(req, res) {
  try {
    const {
      name,
      location,
      destinationId,
      type,
      price,
      rating,
      reviews,
      popular,
      amenities,
      image,
      images,
      description,
      highlights,
      bookingUrl,
    } = req.body ?? {};
    const data = await db.transaction(async (trx) => {
      const existing = await getPropertyFromDb(req.params.id, trx);
      if (!existing) {
        throw Object.assign(new Error("Property not found"), { status: 404 });
      }
      const property = normalizePropertyPayload({
        name,
        location,
        destinationId,
        type,
        price,
        rating,
        reviews,
        popular,
        amenities,
        image,
        images,
        description,
        highlights,
        bookingUrl,
      }, existing);
      const destination = await trx("destinations").where({ id: property.destinationId }).first();
      if (!destination) {
        throw Object.assign(new Error("Destination not found"), { status: 400 });
      }
      await trx("properties").where({ id: req.params.id }).update({
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
      await replacePropertyList(trx, "property_images", req.params.id, "image", property.images);
      await replacePropertyList(trx, "property_amenities", req.params.id, "name", property.amenities);
      await replacePropertyList(trx, "property_highlights", req.params.id, "text", property.highlights);
      return getPropertyFromDb(req.params.id, trx);
    });
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteProperty(req, res) {
  try {
    await db.transaction(async (trx) => {
      const existing = await trx("properties").where({ id: req.params.id }).first();
      if (!existing) {
        throw Object.assign(new Error("Property not found"), { status: 404 });
      }
      await trx("properties").where({ id: req.params.id }).del();
    });
    return res.status(204).send();
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return res.status(201).json({
    data: {
      filename: req.file.filename,
      url: `${baseUrl}/uploads/${req.file.filename}`,
    },
  });
}

function listBlogPosts(_req, res) {
  return res.json({ data: store.getBlogPosts() });
}

function createBlogPost(req, res) {
  try {
    const { id, title, excerpt, author, readTime, category, date, image } =
      req.body ?? {};
    const data = store.createBlogPost({
      id,
      title,
      excerpt,
      author,
      readTime,
      category,
      date,
      image,
    });
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

function updateBlogPost(req, res) {
  try {
    const { title, excerpt, author, readTime, category, date, image } =
      req.body ?? {};
    const data = store.updateBlogPost(req.params.id, {
      title,
      excerpt,
      author,
      readTime,
      category,
      date,
      image,
    });
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

function deleteBlogPost(req, res) {
  try {
    store.deleteBlogPost(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

function getPageContent(req, res) {
  const data = store.getPageContent(req.params.slug);
  if (!data) return res.status(404).json({ message: "Page content not found" });
  return res.json({ data });
}

async function listPartnerEnquiries(_req, res) {
  try {
    return res.json({ data: await store.getPartnerEnquiries() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

function updatePageContent(req, res) {
  try {
    const data = store.updatePageContent(req.params.slug, req.body ?? {});
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  login,
  listDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  listProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImage,
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getPageContent,
  updatePageContent,
  listPartnerEnquiries,
};
