const store = require("../store/dataStore");

async function listDestinations(_req, res) {
  try {
    return res.json({ data: await store.getDestinations() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function listProperties(req, res) {
  try {
    return res.json({ data: await store.getProperties(req.query.destinationId) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getProperty(req, res) {
  try {
    const item = await store.getProperty(req.params.id);
    if (!item) return res.status(404).json({ message: "Property not found" });
    return res.json({ data: item });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

function listBlogPosts(_req, res) {
  return res.json({ data: store.getBlogPosts() });
}

function getPageContent(req, res) {
  const data = store.getPageContent(req.params.slug);
  if (!data) return res.status(404).json({ message: "Page content not found" });
  return res.json({ data });
}

async function createPartnerEnquiry(req, res) {
  try {
    const data = await store.createPartnerEnquiry(req.body ?? {});
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  listDestinations,
  listProperties,
  getProperty,
  listBlogPosts,
  getPageContent,
  createPartnerEnquiry,
};
