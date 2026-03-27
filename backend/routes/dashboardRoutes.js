const express = require("express");
const router = express.Router();
const { getFarmerDashboard, getMillOwnerDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/farmer", protect, getFarmerDashboard);
router.get("/millOwner", protect, getMillOwnerDashboard);

module.exports = router;
