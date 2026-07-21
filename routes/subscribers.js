const express = require("express");
const subscriber = require("../controllers/subscriberController");

const router = express.Router();

router.post("/", subscriber.createSubscriber);

module.exports = router;
