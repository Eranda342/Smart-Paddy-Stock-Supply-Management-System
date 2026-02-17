const express = require("express");
const { createNegotiation, addMessage } = require("../controllers/negotiationController");

const router = express.Router();

router.post("/", createNegotiation);
router.post("/:id/message", addMessage);

module.exports = router;
