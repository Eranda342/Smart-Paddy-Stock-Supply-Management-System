const express = require("express");

const {
  getMyTransactions,
  getTransactionById,
  markAsPaid,
  requestTransport,
  startTransport,
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
router.put("/:id/transport", protect, requestTransport);
router.put("/:id/start", protect, startTransport);


// ================= DELIVERY =================
router.put("/:id/deliver", protect, markDelivered);


module.exports = router;