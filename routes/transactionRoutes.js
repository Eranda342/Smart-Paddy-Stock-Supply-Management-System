const express = require("express");
const { confirmTransaction } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Only logged-in users can confirm transaction
router.post("/confirm", protect, confirmTransaction);

module.exports = router;
