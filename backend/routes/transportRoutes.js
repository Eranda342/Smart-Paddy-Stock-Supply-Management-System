const express = require("express");
const { createTransport } = require("../controllers/transportController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Only MILL_OWNER can create transport
router.post(
  "/",
  protect,
  authorizeRoles("MILL_OWNER"),
  createTransport
);

module.exports = router;
