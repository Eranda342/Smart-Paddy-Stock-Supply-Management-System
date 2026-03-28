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

const { protect, checkApproved } = require("../middleware/authMiddleware");

const router = express.Router();


/*
=========================================
CREATE NEGOTIATION
Mill owner → send offer to farmer listing
=========================================
*/
router.post("/", protect, checkApproved, createNegotiation);


/*
=========================================
GET USER NEGOTIATIONS
List negotiations for logged in user
=========================================
*/
router.get("/", protect, checkApproved, getNegotiations);


/*
=========================================
GET SINGLE NEGOTIATION
Open negotiation chat
=========================================
*/
router.get("/:id", protect, checkApproved, getNegotiationById);


/*
=========================================
ADD MESSAGE TO NEGOTIATION
Used for negotiation chat
=========================================
*/
router.post("/:id/message", protect, checkApproved, addMessage);


/*
=========================================
ACCEPT NEGOTIATION
Creates transaction
=========================================
*/
router.put("/:id/accept", protect, checkApproved, (req, res, next) => {
  req.body.status = "ACCEPTED";
  updateNegotiationStatus(req, res, next);
});


/*
=========================================
REJECT NEGOTIATION
=========================================
*/
router.put("/:id/reject", protect, checkApproved, (req, res, next) => {
  req.body.status = "REJECTED";
  updateNegotiationStatus(req, res, next);
});


/*
=========================================
GENERIC STATUS UPDATE (fallback)
=========================================
*/
router.put("/:id/status", protect, checkApproved, updateNegotiationStatus);


/*
=========================================
MARK MESSAGES AS READ
=========================================
*/
router.put("/:id/read", protect, checkApproved, markMessagesRead);


/*
=========================================
DELETE MESSAGE
=========================================
*/
router.delete("/:id/message/:messageId", protect, checkApproved, deleteMessage);


/*
=========================================
EDIT MESSAGE
=========================================
*/
router.put("/:id/message/:messageId", protect, checkApproved, editMessage);


module.exports = router;