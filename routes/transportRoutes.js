const express = require("express");
const { createTransport } = require("../controllers/transportController");

const router = express.Router();

router.post("/", createTransport);

module.exports = router;
