const express = require("express");
const router = express.Router();
const DisputeChat = require("../models/DisputeChat");
const Dispute = require("../models/Dispute");
const { verifyToken } = require("../middleware/authMiddleware");

// Get chat history for a dispute
router.get("/:disputeId", verifyToken, async (req, res) => {
  try {
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
      // We can also emit disputeUpdated to refresh list
    }

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
