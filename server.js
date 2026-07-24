require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { UPLOAD_DIR } = require("./middleware/upload");
const { initStore } = require("./store/dataStore");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const membershipRoutes = require("./routes/membership");
const adminMembershipRoutes = require("./routes/adminMembership");
const subscriberRoutes = require("./routes/subscribers");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
if (process.env.REQUEST_LOGS === "true") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "2mb" }));
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  next();
});
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_DIR),
);

app.get("/", (_req, res) => {
  res.json({ message: "aalaGO API is running" });
});

app.use("/api", publicRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/admin/memberships", adminMembershipRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

initStore().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});
