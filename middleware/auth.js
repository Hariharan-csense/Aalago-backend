const jwt = require("jsonwebtoken");
const store = require("../store/dataStore");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = header.slice(7);
    const admin = jwt.verify(token, process.env.JWT_SECRET || "aalago-dev-secret");
    if (admin.email !== store.getAdmin().email) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
