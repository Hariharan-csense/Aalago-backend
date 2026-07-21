const store = require("../store/dataStore");

async function listPackages(_req, res) {
  try {
    return res.json({ data: await store.getMembershipPackages() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function createPackage(req, res) {
  try {
    const data = await store.createMembershipPackage(req.body ?? {});
    return res.status(201).json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function updatePackage(req, res) {
  try {
    const data = await store.updateMembershipPackage(req.params.id, req.body ?? {});
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function deletePackage(req, res) {
  try {
    await store.deleteMembershipPackage(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
