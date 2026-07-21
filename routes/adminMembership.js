const express = require("express");
const membership = require("../controllers/membershipController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", membership.listPackages);
router.post("/", membership.createPackage);
router.put("/:id", membership.updatePackage);
router.delete("/:id", membership.deletePackage);

module.exports = router;
