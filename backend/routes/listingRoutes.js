const express = require("express");

const {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  getListingById,
  getAllListings,
  getBuyListings
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


// GET ALL SELL LISTINGS (Mill Owner marketplace)
router.get(
  "/marketplace",
  protect,
  authorizeRoles("MILL_OWNER"),
  getAllListings
);


// GET BUY LISTINGS (Farmers browse mill owner requests)
router.get(
  "/buy-listings",
  protect,
  authorizeRoles("FARMER"),
  getBuyListings
);


// GET SINGLE LISTING
router.get(
  "/:id",
  protect,
  getListingById
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