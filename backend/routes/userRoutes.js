const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  uploadAvatar
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


// ================= REGISTER =================
router.post("/register", upload.single("document"), registerUser);


// ================= LOGIN =================
router.post("/login", loginUser);


// ================= GET PROFILE =================
router.get("/me", protect, getMyProfile);


// ================= UPDATE PROFILE =================
router.put("/me", protect, updateProfile);


// ================= UPLOAD AVATAR =================
router.post("/me/avatar", protect, upload.single("avatar"), uploadAvatar);


module.exports = router;