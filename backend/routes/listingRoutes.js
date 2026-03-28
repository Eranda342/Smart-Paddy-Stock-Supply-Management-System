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

const { protect, authorizeRoles, checkApproved } = require("../middleware/authMiddleware");

const router = express.Router();


/*
============================================
CREATE LISTING
Farmers -> SELL listings
Mill Owners -> BUY listings
============================================
*/
router.post(
  "/",
  protect, checkApproved,
  authorizeRoles("FARMER", "MILL_OWNER"),
  createListing
);


/*
============================================
GET MY LISTINGS
Farmer -> their SELL listings
Mill Owner -> their BUY listings
============================================
*/
router.get(
  "/my",
  protect, checkApproved,
  authorizeRoles("FARMER", "MILL_OWNER"),
  getMyListings
);


/*
============================================
MARKETPLACE
Mill owners browse farmer SELL listings
============================================
*/
router.get(
  "/marketplace",
  protect, checkApproved,
  authorizeRoles("MILL_OWNER"),
  getAllListings
);


/*
============================================
BUY LISTINGS
Farmers browse mill owner BUY listings
============================================
*/
router.get(
  "/buy-listings",
  protect, checkApproved,
  authorizeRoles("FARMER"),
  getBuyListings
);


/*
============================================
GET SINGLE LISTING
============================================
*/
router.get(
  "/:id",
  protect, checkApproved,
  getListingById
);


/*
============================================
UPDATE LISTING
Only owner farmer can update SELL listings
============================================
*/
router.put(
  "/:id",
  protect, checkApproved,
  authorizeRoles("FARMER"),
  updateListing
);


/*
============================================
DELETE LISTING
Only owner farmer can delete
============================================
*/
router.delete(
  "/:id",
  protect, checkApproved,
  authorizeRoles("FARMER"),
  deleteListing
);


module.exports = router;