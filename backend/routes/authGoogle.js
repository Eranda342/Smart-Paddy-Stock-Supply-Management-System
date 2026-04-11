const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const { completeProfile } = require("../controllers/oauthOnboardingController");
const upload = require("../middleware/upload");

// ================= INITIATE GOOGLE LOGIN =================
// GET /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ================= GOOGLE CALLBACK =================
// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login?error=oauth_failed",
  }),
  (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.redirect("http://localhost:5173/login?error=oauth_no_user");
      }

      // ── Generate JWT using same payload shape as existing loginUser ──
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // ── Redirect to frontend with token ──
      return res.redirect(
        `http://localhost:5173/oauth-success?token=${token}`
      );
    } catch (err) {
      console.error("GOOGLE CALLBACK ERROR:", err);
      return res.redirect("http://localhost:5173/login?error=oauth_server_error");
    }
  }
);

// ================= COMPLETE OAUTH PROFILE =================
// PUT /api/auth/complete-profile
// Called by new Google users to set role + personal details before admin review.
// Requires a valid JWT (protect) but NOT checkApproved (still PENDING at this point).
router.put("/complete-profile", protect, upload.single("document"), completeProfile);

module.exports = router;

