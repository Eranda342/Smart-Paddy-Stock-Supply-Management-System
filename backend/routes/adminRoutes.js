const express = require("express");
const {
  createAdmin,
  verifyUser,
  getUnverifiedUsers,
  getAllUsers,
  deleteUser,
  getAllListings,
  adminDeleteListing,
  getAllNegotiations,
  getAllTransactions,
  getAllTransport,
  getPlatformStats,
  getDashboardStats,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  blockUser,
  unblockUser
} = require("../controllers/adminController");

const { protect, authorizeRoles, checkApproved } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require ADMIN role
const adminOnly = [protect, checkApproved, authorizeRoles("ADMIN")];

const checkAdminCreationAccess = (req, res, next) => {
  if (req.body.adminSecret && req.body.adminSecret === process.env.ADMIN_SECRET) {
    return next();
  }
  protect(req, res, (err) => {
    if (err) return next(err);
    if (req.user && req.user.role === "ADMIN") {
      next();
    } else {
      res.status(403).json({ message: "Not authorized to create admin" });
    }
  });
};

router.post("/create-admin", checkAdminCreationAccess, createAdmin);

// ================= PLATFORM STATS =================
router.get("/stats", ...adminOnly, getPlatformStats);

// ================= USER MANAGEMENT =================
router.get("/users", ...adminOnly, getAllUsers);
router.delete("/users/:id", ...adminOnly, deleteUser);
router.get("/unverified-users", ...adminOnly, getUnverifiedUsers);
router.post("/verify-user", ...adminOnly, verifyUser);

// User granular actions
router.put("/users/:id/block", ...adminOnly, blockUser);
router.put("/users/:id/unblock", ...adminOnly, unblockUser);
router.put("/users/:id/approve", ...adminOnly, approveVerification);
router.put("/users/:id/reject", ...adminOnly, rejectVerification);

// ================= LISTINGS =================
router.get("/listings", ...adminOnly, getAllListings);
router.delete("/listings/:id", ...adminOnly, adminDeleteListing);

// ================= NEGOTIATIONS =================
router.get("/negotiations", ...adminOnly, getAllNegotiations);

// ================= TRANSACTIONS =================
router.get("/transactions", ...adminOnly, getAllTransactions);

// ================= TRANSPORT =================
router.get("/transport", ...adminOnly, getAllTransport);

// ================= DASHBOARD =================
router.get("/dashboard", ...adminOnly, getDashboardStats);

// ================= VERIFICATIONS =================
router.get("/verifications", ...adminOnly, getPendingVerifications);
router.put("/verifications/:id/approve", ...adminOnly, approveVerification);
router.put("/verifications/:id/reject", ...adminOnly, rejectVerification);

module.exports = router;
