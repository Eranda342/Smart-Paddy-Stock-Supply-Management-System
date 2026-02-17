const express = require("express");
const { confirmTransaction } = require("../controllers/transactionController");

const router = express.Router();

router.post("/confirm", confirmTransaction);

module.exports = router;
