const express = require("express");

const {
  getMyTransactions,
  getTransactionById
} = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// ================= GET ALL USER TRANSACTIONS =================
router.get("/", protect, getMyTransactions);


// ================= GET SINGLE TRANSACTION =================
router.get("/:id", protect, getTransactionById);


module.exports = router;