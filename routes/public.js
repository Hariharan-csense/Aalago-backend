const express = require("express");
const publicController = require("../controllers/publicController");

const router = express.Router();

router.get("/destinations", publicController.listDestinations);
router.get("/properties", publicController.listProperties);
router.get("/properties/:id", publicController.getProperty);
router.get("/blog-posts", publicController.listBlogPosts);
router.get("/page-content/:slug", publicController.getPageContent);
router.post("/partner-enquiries", publicController.createPartnerEnquiry);

module.exports = router;
