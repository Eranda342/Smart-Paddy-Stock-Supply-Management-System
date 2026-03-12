const express = require("express");

const {
  createListing,
  getMyListings,
  updateListing,
  deleteListing
} = require("../controllers/listingController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE LISTING
router.post(
  "/",
  protect,
  authorizeRoles("FARMER", "MILL_OWNER"),
  createListing
);


// GET FARMER LISTINGS
router.get(
  "/my",
  protect,
  authorizeRoles("FARMER"),
  getMyListings
);


// UPDATE LISTING
router.put(
  "/:id",
  protect,
  authorizeRoles("FARMER"),
  updateListing
);


// DELETE LISTING
router.delete(
  "/:id",
  protect,
  authorizeRoles("FARMER"),
  deleteListing
);

module.exports = router;