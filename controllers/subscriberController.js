const store = require("../store/dataStore");

async function createSubscriber(req, res) {
  try {
    const data = await store.createSubscriber(req.body ?? {});
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function listSubscribers(_req, res) {
  try {
    return res.json({ data: await store.getSubscribers() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createSubscriber,
  listSubscribers,
};
