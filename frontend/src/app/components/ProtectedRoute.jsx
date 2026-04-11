import { Navigate, useLocation } from "react-router-dom";
import { resolveUserDestination } from "../lib/resolveUserDestination";

/**
 * ProtectedRoute
 *
 * Guards role-based dashboard layouts.
 *
 * Check sequence (matches resolveUserDestination decision tree):
 *   1. No user → /login
 *   2. Wrong role for this route → /login
 *   3. resolveUserDestination(user) → if result ≠ dashboard root → redirect
 *      (catches: no role, missing phone/NIC, missing document, PENDING, REJECTED)
 *   4. All checks pass → render children
 *
 * NOTE: ProtectedRoute wraps entire layout sections (/farmer/*, /mill-owner/*, /admin/*).
 * We compare resolveUserDestination against the dashboard ROOT path (e.g. /farmer),
 * NOT against location.pathname (which would be a sub-route like /farmer/listings).
 * Using startsWith handles all nested sub-routes correctly.
 */
export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // 1. No cached user → send to login
  if (!user) return <Navigate to="/login" replace />;

  // 2. ADMIN bypasses verification — just check role match
  if (user.role === "ADMIN") {
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // 3. Enforce role match (prevents a FARMER from accessing /mill-owner/*)
  if (role && (!user.role || user.role.toLowerCase() !== role.toLowerCase())) {
    return <Navigate to="/login" replace />;
  }

  // 4. Run the full resolver — resolveUserDestination uses DB-sourced fields
  const destination = resolveUserDestination(user);

  // The dashboard root for this user's role
  const dashboardRoot =
    user.role === "FARMER"     ? "/farmer" :
    user.role === "MILL_OWNER" ? "/mill-owner" :
    "/admin";

  // If the resolver returns anything other than the expected dashboard root,
  // the user hasn't completed onboarding or isn't approved — redirect them.
  if (destination !== dashboardRoot) {
    return <Navigate to={destination} replace />;
  }

  // 5. Current path must be under the dashboard root (extra sanity check)
  if (!location.pathname.startsWith(dashboardRoot)) {
    return <Navigate to={dashboardRoot} replace />;
  }

  // All checks passed ✓
  return children;
}