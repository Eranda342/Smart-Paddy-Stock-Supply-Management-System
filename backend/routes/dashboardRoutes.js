const express = require("express");
const router = express.Router();
const { getFarmerDashboard, getMillOwnerDashboard } = require("../controllers/dashboardController");
const { protect, checkApproved } = require("../middleware/authMiddleware");

router.get("/farmer", protect, checkApproved, getFarmerDashboard);
router.get("/millOwner", protect, checkApproved, getMillOwnerDashboard);

module.exports = router;
