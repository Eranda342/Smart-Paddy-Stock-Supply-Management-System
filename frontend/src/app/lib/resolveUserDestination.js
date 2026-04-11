/**
 * resolveUserDestination
 *
 * Single source of truth for ALL post-authentication routing decisions.
 * Uses ONLY real database fields — no googleId checks, no localStorage shortcuts,
 * no placeholder string comparisons.
 *
 * ─── Decision tree (strictly sequential) ─────────────────────────────────────
 *
 *  ADMIN  → /admin  (bypasses all remaining checks)
 *
 *  1. role missing             → /register/role
 *  2. phone OR nic missing     → /register/account
 *  3. document not uploaded    → /register/business
 *  4. verificationStatus
 *       PENDING                → /register/success
 *       REJECTED               → /rejected
 *       APPROVED               → /farmer  |  /mill-owner
 *
 * @param {object|null} user  Full user object returned from the DB
 * @returns {string}          Path to navigate / redirect to
 */
export function resolveUserDestination(user, currentPath = window.location?.pathname) {
  if (!user) return "/login";

  // Admin bypass
  if (user.role === "ADMIN") return "/admin";

  if (!user.role) return "/register/role";

  const isFarmer = user.role === "FARMER";
  const details = isFarmer ? user.farmDetails : user.businessDetails;

  const isProfileCompleted = isFarmer
    ? Boolean(details?.landDocument && user.phone && user.nic)
    : Boolean(details?.businessDocument && user.phone && user.nic);

  // Both REJECTED and INCOMPLETE profiles follow the exact same correction/onboarding wizard
  if (details?.verificationStatus === "REJECTED" || !isProfileCompleted) {
    if (currentPath === "/register/business") return "/register/business";
    return "/register/account";
  }

  if (details?.verificationStatus === "PENDING") return "/register/success";

  if (details?.verificationStatus === "APPROVED") {
    return isFarmer ? "/farmer" : "/mill-owner";
  }

  return "/login";
}
