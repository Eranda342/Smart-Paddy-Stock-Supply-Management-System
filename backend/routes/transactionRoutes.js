const express = require("express");

const {
  getMyTransactions,
  getTransactionById,
  markAsPaid,
  requestTransport,
  startTransport,
  markDelivered,
  setTransportDecision,
  markAsDeliveredByFarmer,
  confirmDeliveryByMillOwner,
  assignTransport,
  markPickedUp,
  markTransportDelivered
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
router.put("/:id/transport", protect, requestTransport);
router.put("/:id/assign-transport", protect, assignTransport);
router.put("/:id/picked-up", protect, markPickedUp);
router.put("/:id/transport-delivered", protect, markTransportDelivered);
router.put("/:id/start", protect, startTransport);


// ================= DELIVERY =================
router.put("/:id/deliver", protect, markDelivered);
router.put("/:id/farmer-delivered", protect, markAsDeliveredByFarmer);
router.put("/:id/confirm-delivery", protect, confirmDeliveryByMillOwner);


module.exports = router;