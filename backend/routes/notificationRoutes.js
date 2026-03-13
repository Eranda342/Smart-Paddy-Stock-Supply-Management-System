const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead
} = require("../controllers/NotificationController");

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;