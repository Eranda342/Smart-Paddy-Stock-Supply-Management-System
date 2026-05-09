const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

/**
 * authLimiter — strict rate limit for authentication endpoints.
 *
 * Applies to:
 *   POST /api/users/login
 *   POST /api/users/register
 *   POST /api/users/forgot-password
 *   POST /api/users/resend-verification
 *
 * Limits:
 *   10 requests per 15 minutes per IP address.
 *
 * Rationale:
 *   - 10 attempts / 15 min is generous for legitimate users (forgot password,
 *     account creation, login retries) but makes credential brute-force and
 *     email-bombing attacks infeasible without triggering the limiter quickly.
 *   - Window of 15 minutes matches the password-reset token TTL, so an attacker
 *     cannot exhaust reset tokens faster than they expire.
 *   - ipKeyGenerator mirrors the existing apiLimiter for IPv4/IPv6 safety on Azure.
 *   - skipSuccessfulRequests is intentionally NOT set — every request counts,
 *     including successful logins, to prevent per-IP account enumeration via
 *     timing analysis on success/fail splits.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per IP per window
  standardHeaders: true,      // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,       // Disable X-RateLimit-* legacy headers
  keyGenerator: (req) => ipKeyGenerator(req), // IPv4 + IPv6 safe (matches apiLimiter)
  message: {
    message: "Too many requests from this IP. Please try again in 15 minutes."
  },
});

module.exports = authLimiter;
