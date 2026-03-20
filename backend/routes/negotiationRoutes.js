const express = require("express");

const {
  createNegotiation,
  getNegotiations,
  getNegotiationById,
  addMessage,
  updateNegotiationStatus,
  deleteMessage,
  markMessagesRead,
  editMessage
} = require("../controllers/negotiationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


/*
=========================================
CREATE NEGOTIATION
Mill owner → send offer to farmer listing
=========================================
*/
router.post("/", protect, createNegotiation);


/*
=========================================
GET USER NEGOTIATIONS
List negotiations for logged in user
=========================================
*/
router.get("/", protect, getNegotiations);


/*
=========================================
GET SINGLE NEGOTIATION
Open negotiation chat
=========================================
*/
router.get("/:id", protect, getNegotiationById);


/*
=========================================
ADD MESSAGE TO NEGOTIATION
Used for negotiation chat
=========================================
*/
router.post("/:id/message", protect, addMessage);


/*
=========================================
ACCEPT NEGOTIATION
Creates transaction
=========================================
*/
router.put("/:id/accept", protect, (req, res, next) => {
  req.body.status = "ACCEPTED";
  updateNegotiationStatus(req, res, next);
});


/*
=========================================
REJECT NEGOTIATION
=========================================
*/
router.put("/:id/reject", protect, (req, res, next) => {
  req.body.status = "REJECTED";
  updateNegotiationStatus(req, res, next);
});


/*
=========================================
GENERIC STATUS UPDATE (fallback)
=========================================
*/
router.put("/:id/status", protect, updateNegotiationStatus);


/*
=========================================
MARK MESSAGES AS READ
=========================================
*/
router.put("/:id/read", protect, markMessagesRead);


/*
=========================================
DELETE MESSAGE
=========================================
*/
router.delete("/:id/message/:messageId", protect, deleteMessage);


/*
=========================================
EDIT MESSAGE
=========================================
*/
router.put("/:id/message/:messageId", protect, editMessage);


module.exports = router;