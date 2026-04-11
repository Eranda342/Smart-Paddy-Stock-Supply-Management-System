import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, AlertCircle } from "lucide-react";
import { API } from "../../api/api";
import { resolveUserDestination } from "../lib/resolveUserDestination";

/**
 * OAuthSuccessPage
 *
 * Landing page after the backend Google OAuth callback issues a JWT:
 *   http://localhost:5173/oauth-success?token=<JWT>
 *
 * Flow:
 *   1. Read token from URL query params
 *   2. Persist token to localStorage
 *   3. Fetch /api/users/profile (no checkApproved — works for PENDING users)
 *   4. Persist user to localStorage
 *   5. Delegate routing to resolveUserDestination():
 *      no role          → /register/role
 *      profile incomplete → /register/account
 *      pending review   → /register/success
 *      rejected         → /rejected
 *      approved farmer  → /farmer
 *      approved mill    → /mill-owner
 *      admin            → /admin
 */
export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Signing In… | AgroBridge";

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login?error=oauth_no_token", { replace: true });
      return;
    }

    localStorage.setItem("token", token);

    // Fetch full profile using the unguarded endpoint so PENDING/new users
    // don't get a 403. API.me uses checkApproved; API.profile does not.
    fetch(API.profile, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || "Failed to fetch user profile");
        }
        return res.json();
      })
      .then(({ user }) => {
        localStorage.setItem("user", JSON.stringify(user));

        // Let the shared resolver decide where to send the user
        const destination = resolveUserDestination(user);
        navigate(destination, { replace: true });
      })
      .catch((err) => {
        console.error("OAUTH SUCCESS ERROR:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError(err.message || "Authentication failed. Redirecting…");

        setTimeout(() => {
          navigate("/login?error=oauth_profile_fetch_failed", { replace: true });
        }, 2500);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center gap-6 p-10 bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent rounded-t-3xl" />

        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-2 text-red-400">Sign-in Failed</h1>
              <p className="text-white/50 text-sm leading-relaxed">{error}</p>
            </div>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20"
            >
              <Sprout className="w-8 h-8 text-green-400" />
            </motion.div>

            <div>
              <h1 className="text-xl font-bold mb-2">Logging you in…</h1>
              <p className="text-white/50 text-sm">
                Please wait while we verify your Google account.
              </p>
            </div>

            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "90%" }}
                transition={{ duration: 3, ease: "easeOut" }}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
