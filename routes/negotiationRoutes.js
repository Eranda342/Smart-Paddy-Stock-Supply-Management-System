const express = require("express");
const {
  createNegotiation,
  addMessage
} = require("../controllers/negotiationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all negotiation routes
router.post("/", protect, createNegotiation);
router.post("/:id/message", protect, addMessage);

module.exports = router;
