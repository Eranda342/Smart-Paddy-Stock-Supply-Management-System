const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const { protect, checkApproved } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, checkApproved, getNotifications);
router.put("/:id/read", protect, checkApproved, markAsRead);

module.exports = router;