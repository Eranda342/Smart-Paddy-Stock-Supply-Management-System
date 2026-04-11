import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import Logo from "../components/ui/Logo";
import toast from "react-hot-toast";
import { API } from "../../api/api";
import { DISTRICTS as SRI_LANKAN_DISTRICTS } from "../../constants/paddyTypes";

/**
 * OAuthCompletePage  (/oauth-complete)
 *
 * Shown to Google OAuth users whose profile is still incomplete (phone === "N/A").
 * Lets them pick a role and fill in role-specific details before admin review.
 *
 * Guards:
 *  - Redirects to /login if no token in localStorage
 *  - Redirects away if profile is already complete (checked on mount)
 */
export default function OAuthCompletePage() {
  const navigate = useNavigate();

  // ── Step management: 1 = role select, 2 = details form ──
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    nic: "",
    operatingDistrict: "",
    landSize: "",
    estimatedMonthlyStock: "",
    businessName: "",
    businessRegistrationNumber: "",
    millLocation: "",
  });

  // ── Guard: must have a token ──
  useEffect(() => {
    document.title = "Complete Your Profile | AgroBridge";
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Basic validation ──
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!form.nic.trim()) {
      toast.error("Please enter your NIC number.");
      return;
    }
    if (selectedRole === "FARMER" && !form.operatingDistrict) {
      toast.error("Please select your operating district.");
      return;
    }
    if (selectedRole === "MILL_OWNER" && !form.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        role: selectedRole,
        phone: form.phone.trim(),
        nic: form.nic.trim(),
      };

      if (selectedRole === "FARMER") {
        payload.operatingDistrict = form.operatingDistrict;
        payload.landSize = form.landSize;
        payload.estimatedMonthlyStock = form.estimatedMonthlyStock;
        payload.paddyTypesCultivated = [];
      } else {
        payload.businessName = form.businessName.trim();
        payload.businessRegistrationNumber = form.businessRegistrationNumber.trim();
        payload.millLocation = form.millLocation;
      }

      const res = await fetch(API.completeProfile, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to complete profile");
      }

      // ── Update stored user so ProtectedRoute sees the updated state ──
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Profile submitted! Awaiting admin review.");
      navigate("/register/success", { replace: true });
    } catch (err) {
      console.error("COMPLETE PROFILE ERROR:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input class ──
  const inputCls = (invalid = false) =>
    `w-full px-4 py-3.5 bg-[#0A1120] border rounded-xl focus:outline-none focus:ring-1 transition-all text-white placeholder-white/30 ${
      invalid
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-white/10 focus:border-green-500 focus:ring-green-500"
    }`;

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?auto=format&fit=crop&w=1080&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#020617]/60 to-[#020617]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617]" />
        <div className="absolute bottom-16 left-12 right-12 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Complete Your <span className="text-green-400">Profile</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              Tell us a bit about yourself so our admin team can verify and approve your account.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 w-full">
          <div className="w-full max-w-2xl">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="md" />
              </Link>
            </div>

            {/* Progress */}
            <div className="mb-10 w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? "bg-green-500 text-[#020617] shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/5 border border-white/10 text-white/40"}`}>
                  {step > 1 ? "✓" : "1"}
                </div>
                <div className={`w-16 sm:w-24 h-1 rounded-full transition-all ${step > 1 ? "bg-green-500" : "bg-white/10"}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? "bg-green-500 text-[#020617] shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/5 border border-white/10 text-white/40"}`}>
                  2
                </div>
              </div>
              <p className="text-center text-sm text-white/40 font-medium tracking-wide uppercase">
                {step === 1 ? "Step 1 of 2 • Select Your Role" : "Step 2 of 2 • Your Details"}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              <AnimatePresence mode="wait">

                {/* ── STEP 1: Role Selection ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">How will you use AgroBridge?</h1>
                    <p className="text-white/50 mb-8 font-medium">Select your role to continue.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      {/* FARMER */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("FARMER")}
                        className={`bg-white/5 border rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden ${
                          selectedRole === "FARMER"
                            ? "border-green-500/60 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                            : "border-white/10 hover:border-green-500/40 hover:shadow-[0_8px_30px_rgba(34,197,94,0.08)]"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 border transition-all ${selectedRole === "FARMER" ? "bg-green-500/20 border-green-500/40" : "bg-green-500/10 border-green-500/20"}`}>
                          <User className="w-7 h-7 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-white">Farmer</h2>
                        <p className="text-white/50 text-sm leading-relaxed">List harvests and negotiate with rice mills.</p>
                        {selectedRole === "FARMER" && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-[#020617] text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>

                      {/* MILL OWNER */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("MILL_OWNER")}
                        className={`bg-white/5 border rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden ${
                          selectedRole === "MILL_OWNER"
                            ? "border-blue-500/60 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                            : "border-white/10 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)]"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 border transition-all ${selectedRole === "MILL_OWNER" ? "bg-blue-500/20 border-blue-500/40" : "bg-blue-500/10 border-blue-500/20"}`}>
                          <Building2 className="w-7 h-7 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-white">Rice Mill Owner</h2>
                        <p className="text-white/50 text-sm leading-relaxed">Browse listings and manage procurement.</p>
                        {selectedRole === "MILL_OWNER" && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedRole}
                      onClick={() => setStep(2)}
                      className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Continue <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 2: Profile Details ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Your Details</h1>
                    <p className="text-white/50 mb-8 font-medium">
                      {selectedRole === "FARMER" ? "Tell us about your farming operation." : "Tell us about your rice mill."}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                      {/* Phone + NIC (both roles) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Mobile Number</label>
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+94 XX XXX XXXX"
                            className={inputCls()}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">NIC Number</label>
                          <input
                            name="nic"
                            value={form.nic}
                            onChange={handleChange}
                            placeholder="e.g., 123456789V"
                            className={inputCls()}
                            required
                          />
                        </div>
                      </div>

                      {/* ── FARMER-SPECIFIC ── */}
                      {selectedRole === "FARMER" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Operating District</label>
                            <select
                              name="operatingDistrict"
                              value={form.operatingDistrict}
                              onChange={handleChange}
                              className={inputCls()}
                              required
                            >
                              <option value="">Select district</option>
                              {SRI_LANKAN_DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">Land Size (Acres)</label>
                              <input
                                type="number"
                                name="landSize"
                                value={form.landSize}
                                onChange={handleChange}
                                placeholder="e.g., 10"
                                className={inputCls()}
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">Est. Monthly Stock (kg)</label>
                              <input
                                type="number"
                                name="estimatedMonthlyStock"
                                value={form.estimatedMonthlyStock}
                                onChange={handleChange}
                                placeholder="e.g., 5000"
                                className={inputCls()}
                                min="0"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* ── MILL OWNER-SPECIFIC ── */}
                      {selectedRole === "MILL_OWNER" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Business Name</label>
                            <input
                              name="businessName"
                              value={form.businessName}
                              onChange={handleChange}
                              placeholder="Enter your rice mill name"
                              className={inputCls()}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">Business Reg. Number</label>
                              <input
                                name="businessRegistrationNumber"
                                value={form.businessRegistrationNumber}
                                onChange={handleChange}
                                placeholder="e.g., BRN123456"
                                className={inputCls()}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">Mill Location (District)</label>
                              <select
                                name="millLocation"
                                value={form.millLocation}
                                onChange={handleChange}
                                className={inputCls()}
                                required
                              >
                                <option value="">Select district</option>
                                {SRI_LANKAN_DISTRICTS.map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Security notice */}
                      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-5 py-4">
                        <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="text-white/60 text-sm font-medium">
                          Your information is securely stored and reviewed by our admin team.
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            "Submit for Review"
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
