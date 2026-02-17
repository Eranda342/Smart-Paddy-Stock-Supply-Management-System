const express = require("express");
const { createListing } = require("../controllers/listingController");

const router = express.Router();

router.post("/", createListing);

module.exports = router;
