const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/userController");
const upload = require("../middleware/upload");

// REGISTER USER (with document upload)
router.post("/register", upload.single("document"), registerUser);

// LOGIN USER
router.post("/login", loginUser);

module.exports = router;