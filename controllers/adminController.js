const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const store = require("../store/dataStore");

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
    return res.json({ data: await store.getDestinations() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function createDestination(req, res) {
  try {
    const { id, name, state, image, description } = req.body ?? {};
    const data = await store.createDestination({
      id,
      name,
      state,
      image,
      description,
    });
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateDestination(req, res) {
  try {
    const { name, state, image, description } = req.body ?? {};
    const data = await store.updateDestination(req.params.id, {
      name,
      state,
      image,
      description,
    });
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteDestination(req, res) {
  try {
    await store.deleteDestination(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function listProperties(req, res) {
  try {
    return res.json({ data: await store.getProperties(req.query.destinationId) });
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
    const data = await store.createProperty({
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
    const data = await store.updateProperty(req.params.id, {
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
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteProperty(req, res) {
  try {
    await store.deleteProperty(req.params.id);
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
};
