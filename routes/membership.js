const express = require("express");
const membership = require("../controllers/membershipController");

const router = express.Router();

router.get("/", membership.listPackages);

module.exports = router;
