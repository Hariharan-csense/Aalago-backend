const express = require("express");
const admin = require("../controllers/adminController");
const { requireAuth } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

const router = express.Router();

router.post("/login", admin.login);

router.use(requireAuth);

router.post("/uploads", uploadImage.single("image"), admin.uploadImage);

router.get("/destinations", admin.listDestinations);
router.post("/destinations", admin.createDestination);
router.put("/destinations/:id", admin.updateDestination);
router.delete("/destinations/:id", admin.deleteDestination);

router.get("/properties", admin.listProperties);
router.post("/properties", admin.createProperty);
router.put("/properties/:id", admin.updateProperty);
router.delete("/properties/:id", admin.deleteProperty);

router.get("/blog-posts", admin.listBlogPosts);
router.post("/blog-posts", admin.createBlogPost);
router.put("/blog-posts/:id", admin.updateBlogPost);
router.delete("/blog-posts/:id", admin.deleteBlogPost);

router.get("/page-content/:slug", admin.getPageContent);
router.put("/page-content/:slug", admin.updatePageContent);

module.exports = router;
