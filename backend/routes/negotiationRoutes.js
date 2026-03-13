const express = require("express");

const {
  createNegotiation,
  getNegotiations,
  getNegotiationById,
  addMessage,
  updateNegotiationStatus
} = require("../controllers/negotiationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE NEGOTIATION
router.post("/", protect, createNegotiation);


// GET USER NEGOTIATIONS (conversation list)
router.get("/", protect, getNegotiations);


// GET SINGLE NEGOTIATION (open chat)
router.get("/:id", protect, getNegotiationById);


// ADD MESSAGE TO NEGOTIATION
router.post("/:id/message", protect, addMessage);


// UPDATE NEGOTIATION STATUS (ACCEPT / REJECT)
router.put("/:id/status", protect, updateNegotiationStatus);


module.exports = router;