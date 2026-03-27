const express = require("express");
const { createTransport, getTransport } = require("../controllers/transportController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET transport data (active + history) — both roles
router.get("/", protect, getTransport);

// Only MILL_OWNER can create transport
router.post(
  "/",
  protect,
  authorizeRoles("MILL_OWNER"),
  createTransport
);

module.exports = router;
