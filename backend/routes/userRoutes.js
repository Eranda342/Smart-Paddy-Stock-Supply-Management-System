const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword
} = require("../controllers/userController");

const { protect, checkApproved } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


// ================= REGISTER =================
router.post("/register", upload.single("document"), registerUser);


// ================= LOGIN =================
router.post("/login", loginUser);


// ================= PASSWORD RESET FLOW =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ================= GET PROFILE =================
router.get("/me", protect, checkApproved, getMyProfile);


// ================= UPDATE PROFILE =================
router.put("/me", protect, checkApproved, updateProfile);


// ================= UPLOAD AVATAR =================
router.post("/me/avatar", protect, checkApproved, upload.single("avatar"), uploadAvatar);


module.exports = router;