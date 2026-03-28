const express = require("express");

const {
  getMyTransactions,
  getTransactionById,
  markAsPaid,
  requestTransport,
  startTransport,
  setTransportDecision,
  markAsDeliveredByFarmer,
  confirmDeliveryByMillOwner,
  assignTransport,
  confirmPickup,
  markDelivered
} = require("../controllers/transactionController");

const { protect, checkApproved } = require("../middleware/authMiddleware");

const router = express.Router();


// ================= GET ALL USER TRANSACTIONS =================
router.get("/", protect, checkApproved, getMyTransactions);


// ================= GET SINGLE TRANSACTION =================
router.get("/:id", protect, checkApproved, getTransactionById);


// ================= PAYMENT =================
router.put("/:id/pay", protect, checkApproved, markAsPaid);


// ================= TRANSPORT =================
router.put("/:id/transport-decision", protect, checkApproved, setTransportDecision);
router.put("/:id/assign-vehicle", protect, checkApproved, assignTransport);
router.put("/:id/pickup", protect, checkApproved, confirmPickup);
router.put("/:id/deliver", protect, checkApproved, markDelivered);


// ================= DELIVERY (FARMER SELF-DELIVERY) =================
router.put("/:id/farmer-delivered", protect, checkApproved, markAsDeliveredByFarmer);
router.put("/:id/confirm-delivery", protect, checkApproved, confirmDeliveryByMillOwner);


module.exports = router;