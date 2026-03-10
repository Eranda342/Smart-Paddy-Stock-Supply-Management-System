const express = require("express");
const {
  verifyUser,
  getUnverifiedUsers
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Only ADMIN can access these
router.get(
  "/unverified-users",
  protect,
  authorizeRoles("ADMIN"),
  getUnverifiedUsers
);

router.post(
  "/verify-user",
  protect,
  authorizeRoles("ADMIN"),
  verifyUser
);

module.exports = router;
