const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createDispute, getMyDisputes, getDisputeById, sendDisputeMessage } = require("../controllers/disputeController");
const { uploadAttachment } = require("../middleware/upload");

const router = express.Router();

// Base PATH: /api/disputes
router.post("/",             protect, uploadAttachment.array("attachments", 5), createDispute);
router.get("/my",            protect, getMyDisputes);
router.get("/:id",           protect, getDisputeById);
router.post("/:id/messages", protect, sendDisputeMessage);

module.exports = router;
