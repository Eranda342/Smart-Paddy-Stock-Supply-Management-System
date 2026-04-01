const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { createDispute, getMyDisputes, getDisputeById } = require("../controllers/disputeController");
const upload = require("../middleware/upload");

const router = express.Router();

// Base PATH: /api/disputes
router.post("/", verifyToken, upload.array("attachments", 5), createDispute);
router.get("/my", verifyToken, getMyDisputes);
router.get("/:id", verifyToken, getDisputeById);

module.exports = router;
