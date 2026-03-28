const express = require("express");
const {
  verifyUser,
  getUnverifiedUsers,
  getAllUsers,
  deleteUser,
  getAllListings,
  adminDeleteListing,
  getAllNegotiations,
  getAllTransactions,
  getAllTransport,
  getPlatformStats
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require ADMIN role
const adminOnly = [protect, authorizeRoles("ADMIN")];

// ================= PLATFORM STATS =================
router.get("/stats", ...adminOnly, getPlatformStats);

// ================= USER MANAGEMENT =================
router.get("/users", ...adminOnly, getAllUsers);
router.delete("/users/:id", ...adminOnly, deleteUser);
router.get("/unverified-users", ...adminOnly, getUnverifiedUsers);
router.post("/verify-user", ...adminOnly, verifyUser);

// ================= LISTINGS =================
router.get("/listings", ...adminOnly, getAllListings);
router.delete("/listings/:id", ...adminOnly, adminDeleteListing);

// ================= NEGOTIATIONS =================
router.get("/negotiations", ...adminOnly, getAllNegotiations);

// ================= TRANSACTIONS =================
router.get("/transactions", ...adminOnly, getAllTransactions);

// ================= TRANSPORT =================
router.get("/transport", ...adminOnly, getAllTransport);

module.exports = router;
