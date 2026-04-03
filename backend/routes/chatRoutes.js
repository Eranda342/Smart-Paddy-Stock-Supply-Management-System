const express = require("express");
const router = express.Router();
const DisputeChat = require("../models/DisputeChat");
const Dispute = require("../models/Dispute");
const { verifyToken } = require("../middleware/authMiddleware");

// Get chat history for a dispute
router.get("/:disputeId", verifyToken, async (req, res) => {
  try {
    // Only the dispute's reporter OR an admin may read chat history
    const dispute = await Dispute.findById(req.params.disputeId);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    const isAdmin = req.user.role === "ADMIN";
    const isReporter = dispute.reporter?.toString() === (req.user.id || req.user._id).toString();

    if (!isAdmin && !isReporter) {
      return res.status(403).json({ message: "Access denied" });
    }

    const chats = await DisputeChat.find({ disputeId: req.params.disputeId })
      .populate("senderId", "fullName role")
      .sort({ createdAt: 1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a new message
router.post("/:disputeId", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const dispute = await Dispute.findById(req.params.disputeId);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    // Only the dispute's reporter OR an admin may post messages
    const isAdmin = req.user.role === "ADMIN";
    const isReporter = dispute.reporter?.toString() === (req.user.id || req.user._id).toString();

    if (!isAdmin && !isReporter) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (dispute.status === "CLOSED") {
      return res.status(400).json({ message: "This dispute is closed and no longer accepts messages" });
    }

    const newChat = new DisputeChat({
      disputeId: req.params.disputeId,
      senderId: req.user.id || req.user._id,
      senderRole: req.user.role,
      message,
    });

    await newChat.save();
    await newChat.populate("senderId", "fullName role");

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.disputeId).emit("newMessage", newChat);
    }

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
