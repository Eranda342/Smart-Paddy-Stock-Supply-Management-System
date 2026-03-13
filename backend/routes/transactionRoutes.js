const express = require("express");

const {
  confirmTransaction,
  getMyTransactions,
  getTransactionById
} = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// GET all transactions for logged user
router.get("/", protect, getMyTransactions);


// GET single transaction details
router.get("/:id", protect, getTransactionById);


// Confirm transaction (create order)
router.post("/confirm", protect, confirmTransaction);


module.exports = router;