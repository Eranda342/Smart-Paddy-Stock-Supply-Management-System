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

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// ================= GET ALL USER TRANSACTIONS =================
router.get("/", protect, getMyTransactions);


// ================= GET SINGLE TRANSACTION =================
router.get("/:id", protect, getTransactionById);


// ================= PAYMENT =================
router.put("/:id/pay", protect, markAsPaid);


// ================= TRANSPORT =================
router.put("/:id/transport-decision", protect, setTransportDecision);
router.put("/:id/assign-vehicle", protect, assignTransport);
router.put("/:id/pickup", protect, confirmPickup);
router.put("/:id/deliver", protect, markDelivered);


// ================= DELIVERY (FARMER SELF-DELIVERY) =================
router.put("/:id/farmer-delivered", protect, markAsDeliveredByFarmer);
router.put("/:id/confirm-delivery", protect, confirmDeliveryByMillOwner);


module.exports = router;