export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const API = {
  login: `${API_BASE_URL}/users/login`,
  register: `${API_BASE_URL}/users/register`,

  // ── Profile endpoints ─────────────────────────────────────────────────────
  // /me       → checkApproved guard (approved dashboard users only)
  me: `${API_BASE_URL}/users/me`,
  // /profile  → JWT only, no approval check
  //   GET  → fetch own profile (onboarding/pending/rejected users)
  //   PUT  → persist phone+NIC to DB (OAuth AccountInfoPage step)
  profile: `${API_BASE_URL}/users/profile`,
  updateBasicInfo: `${API_BASE_URL}/users/profile`,   // PUT

  listings: `${API_BASE_URL}/listings`,
  negotiations: `${API_BASE_URL}/negotiations`,
  transactions: `${API_BASE_URL}/transactions`,
  transports: `${API_BASE_URL}/transports`,
  forgotPassword: `${API_BASE_URL}/users/forgot-password`,
  resetPassword: `${API_BASE_URL}/users/reset-password`,

  // ── Google OAuth ──────────────────────────────────────────────────────────
  // Browser redirect URL (not a fetch endpoint)
  googleAuth: `${SOCKET_URL}/api/auth/google`,
  // Sets role in DB for new Google OAuth users during onboarding
  setRole: `${API_BASE_URL}/users/set-role`,
  // Allows REJECTED users to upload a new document and re-enter PENDING queue
  resubmit: `${API_BASE_URL}/users/resubmit`,
  // Finalises profile for new Google OAuth users (sends document, role details etc.)
  completeProfile: `${API_BASE_URL}/auth/complete-profile`,
};