const express = require("express");
const { createListing } = require("../controllers/listingController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Only FARMER and MILL_OWNER can create listings
router.post(
  "/",
  protect,
  authorizeRoles("FARMER", "MILL_OWNER"),
  createListing
);

module.exports = router;