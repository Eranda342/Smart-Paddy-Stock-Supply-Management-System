const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const { protect, checkApproved } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, checkApproved, getNotifications);
router.patch("/:id/read", protect, checkApproved, markAsRead);

module.exports = router;