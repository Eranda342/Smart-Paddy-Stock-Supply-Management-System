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

        if (user && (user.isDeleted || user.isBlocked)) {
          return done(null, false, { message: "User not allowed" });
        }

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
          // ── Existing local account — do NOT auto-link ──
          //
          // A user registered with email + password under this address.
          // Silently linking their account to any Google profile that shares
          // the email would be a full account takeover vector: an attacker who
          // controls a Google account with the victim's email gains access
          // without ever knowing the victim's password.
          //
          // Safe behavior: reject the OAuth flow. The failureRedirect in the
          // callback route sends the user to /login?error=oauth_failed.
          // They can log in with their existing email + password instead.
          console.warn(
            "[OAuth] Rejected auto-link: local account exists for email:",
            email
          );
          return done(null, false, {
            message: "An account with this email already exists. Please sign in with your password."
          });
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
