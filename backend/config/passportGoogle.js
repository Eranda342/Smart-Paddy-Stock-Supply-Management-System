const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/User");
const { generateEmailToken, sendVerificationEmail } = require("../utils/authUtils");

// ================= GOOGLE OAUTH STRATEGY =================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email returned from Google"), null);
        }

        // ── Check if user already exists by email ──
        let user = await User.findOne({ email });

        if (!user) {
          // ── Create a minimal Google-authenticated user ──
          //
          // We intentionally do NOT set:
          //   - role         (schema has required:true; bypassed via validateBeforeSave:false)
          //   - phone / nic  (optional in schema)
          //   - farmDetails / businessDetails
          //
          // The absence of role causes resolveUserDestination to route the user to
          // /register/role, starting the clean multi-step onboarding flow:
          //   RoleSelectionPage → AccountInfoPage → BusinessDetailsPage → success
          //
          // Each step persists its data to the DB before the next guard fires,
          // ensuring the flow cannot be bypassed by direct URL access.
          const { token, hashedToken, expire } = generateEmailToken();

          const newUser = new User({
            fullName: profile.displayName || "Google User",
            email,
            googleId: profile.id,
            isVerified: false,
            emailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpire: expire,
          });

          await newUser.save({ validateBeforeSave: false });
          user = newUser;

          try {
            await sendVerificationEmail(newUser, token);
          } catch (err) {
            console.error("Failed to send verification email for Google User:", err);
          }

        } else if (!user.googleId) {
          // ── Existing email/password user — link their Google account ──
          user.googleId = profile.id;
          await user.save({ validateBeforeSave: false });
        }

        return done(null, user);
      } catch (err) {
        console.error("PASSPORT GOOGLE ERROR:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
