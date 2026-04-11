import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { XCircle, CheckCircle2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../components/ui/Logo";
import { API } from "../../api/api";

/**
 * RejectedPage  (/rejected)
 *
 * Shown when verificationStatus === "REJECTED".
 * Displays the rejection reason from the DB (fetched live so it's always current).
 * Provides a "Resubmit Application" button that navigates to /register/business
 * which detects the REJECTED context and calls PUT /api/users/resubmit.
 */
export default function RejectedPage() {
  const navigate = useNavigate();

  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [resubmitting, setResubmitting] = useState(false);

  // ── Fetch fresh user from DB so rejectionReason is always current ──────────
  useEffect(() => {
    document.title = "Application Rejected | AgroBridge";

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(API.profile, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ user: fetchedUser }) => {
        const role   = fetchedUser?.role?.toUpperCase();
        const status = role === "FARMER"
          ? fetchedUser?.farmDetails?.verificationStatus
          : fetchedUser?.businessDetails?.verificationStatus;

        // Even though resolveUserDestination now routes REJECTED to /register/business natively,
        // we keep this page functional just in case users manually navigate here.
        if (status !== "REJECTED") {
          navigate("/login", { replace: true });
          return;
        }

        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
      })
      .catch(() => navigate("/login", { replace: true }))
      .finally(() => setLoading(false));

  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const rejectionReason =
    user?.farmDetails?.rejectionReason ||
    user?.businessDetails?.rejectionReason || null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleResubmit = () => {
    setResubmitting(true);
    // Navigate to AccountInfoPage (Step 1 of correction flow)
    navigate("/register/account");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-red-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?auto=format&fit=crop&w=1080&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#020617]/60 to-[#020617]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617]" />
        <div className="absolute bottom-16 left-12 right-12 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Let's Fix Your <span className="text-red-400">Application</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              We need a bit more clarity to verify your identity and protect our community.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 w-full">
          <div className="w-full max-w-2xl text-center">

            {/* Logo */}
            <div className="flex justify-center mb-10">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="md" />
              </Link>
            </div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden w-full text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

              {/* SECTION 1: HEADER */}
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping opacity-20" />
                <XCircle className="w-10 h-10 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-white">
                Application Rejected
              </h1>
              <p className="text-white/60 mb-8 font-medium">
                Your submission needs some corrections before approval.
              </p>

              {/* SECTION 2: REASON BOX */}
              {rejectionReason ? (
                <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-amber-500" />
                  <div className="flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-2">
                        Reason for rejection:
                      </p>
                      <p className="text-white text-base leading-relaxed font-medium">
                        "{rejectionReason}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                  <p className="text-sm text-white/50 leading-relaxed text-center">
                    No specific reason was provided. Please ensure all documents are clear and accurate.
                  </p>
                </div>
              )}

              {/* SECTION 3: WHAT TO FIX */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-white/90 text-sm uppercase tracking-wider mb-4 text-center">What to Fix</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-white/80">Upload a clear, readable document</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-white/80">Ensure all information is entirely visible</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-white/80">Match your name and NIC precisely with documents</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-white/80">Avoid blurry, obscured, or cropped images</span>
                  </li>
                </ul>
              </div>

              {/* SECTION 5: OPTIONAL NOTE */}
              <p className="text-sm text-white/50 mb-6 font-medium">
                You can update your details and resubmit for review.
              </p>

              {/* SECTION 4: ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleLogout}
                  className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
                >
                  Sign Out
                </button>

                <button
                  onClick={handleResubmit}
                  disabled={resubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {resubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Resubmit Application
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </button>
              </div>

            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
