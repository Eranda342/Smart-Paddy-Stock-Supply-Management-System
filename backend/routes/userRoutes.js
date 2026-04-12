const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  setRole,
  getOwnProfile,
  updateBasicInfo,
  resubmit,
  verifyEmail,
  resendVerification,
} = require("../controllers/userController");

const { protect, checkApproved } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


// ================= REGISTER =================
router.post("/register", upload.single("document"), registerUser);


// ================= LOGIN =================
router.post("/login", loginUser);


// ================= EMAIL VERIFICATION =================
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerification);


// ================= PASSWORD RESET FLOW =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ================= GET PROFILE (approved users — dashboard etc.) =================
router.get("/me", protect, checkApproved, getMyProfile);


// ================= GET OWN PROFILE (any auth user — onboarding/pending/rejected) =================
router.get("/profile", protect, getOwnProfile);


// ================= UPDATE BASIC INFO (OAuth onboarding — phone+NIC to DB) =================
// No checkApproved: used by AccountInfoPage for OAuth users before BusinessDetailsPage.
router.put("/profile", protect, updateBasicInfo);


// ================= SET ROLE (Google OAuth onboarding only) =================
router.put("/set-role", protect, setRole);


// ================= RESUBMIT APPLICATION (REJECTED users — no checkApproved) =================
// Allows a REJECTED user to upload a new document and re-enter the PENDING queue.
router.put("/resubmit", protect, upload.single("document"), resubmit);


// ================= UPDATE PROFILE =================
router.put("/me", protect, checkApproved, updateProfile);


// ================= UPLOAD AVATAR =================
router.post("/me/avatar", protect, checkApproved, upload.single("avatar"), uploadAvatar);


module.exports = router;