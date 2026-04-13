import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../lib/schemas";
import { API } from "../../api/api";
import { resolveUserDestination } from "../lib/resolveUserDestination";

export default function AccountInfoPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  // ── Guard: prevent landing here at the wrong onboarding step ──────────────
  // OAuth users: DB-driven check using resolveUserDestination.
  //   /register/account is correct when role is set but phone/NIC are missing.
  // Normal users: localStorage role must be present.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // OAuth context — validate against DB
      fetch(API.profile, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : Promise.reject(new Error("profile fetch failed")))
        .then(({ user }) => {
          const currentPath = window.location.pathname;
          const destination = resolveUserDestination(user, currentPath);
          if (destination !== currentPath) {
            navigate(destination, { replace: true });
          } else {
            const isFarmer = user.role === "FARMER";
            const details = isFarmer ? user.farmDetails : user.businessDetails;
            if (details?.verificationStatus === "REJECTED") {
              setIsRejected(true);
            }
          }
        })
        .catch(() => navigate("/login", { replace: true }));
    }
    // Normal registration skips fetch when no token present
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Password strength meter — driven by real-time watch
  const passwordVal = watch("password", "");
  const getPasswordStrength = (pwd = "") => {
    if (!pwd) return { strength: 0, label: "" };
    if (pwd.length < 6) return { strength: 25, label: "Weak" };
    if (pwd.length < 10) return { strength: 50, label: "Fair" };
    if (pwd.length < 14) return { strength: 75, label: "Good" };
    return { strength: 100, label: "Strong" };
  };
  const strength = getPasswordStrength(passwordVal);

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");

    // We ALWAYS stage the data to pass forward for final submission
    localStorage.setItem("accountInfo", JSON.stringify({
      fullName: data.fullName,
      nic:      data.nic,
      email:    data.email,
      phone:    data.phone,
      password: data.password,
    }));

    if (token && !isRejected) {
      // ── OAuth user FIRST TIME: persist phone + NIC to DB immediately ──
      try {
        const res = await fetch(API.updateBasicInfo, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: data.fullName,
            phone:    data.phone,
            nic:      data.nic,
            password: data.password,
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to save info");

        if (result.user) localStorage.setItem("user", JSON.stringify(result.user));

        navigate("/register/business");
      } catch (err) {
        console.error("ACCOUNT INFO SAVE ERROR:", err);
        toast.error(err.message || "Could not save your info. Please try again.", {
          style: { borderRadius: "8px", background: "#1f2937", color: "#fff" },
        });
      }
    } else {
      // Rejected users OR normal unauthenticated users just proceed to final step
      navigate("/register/business");
    }
  };

  // Auth-page dark input styles
  const inputCls = (hasError) =>
    `w-full px-4 py-3.5 bg-[#0A1120] border rounded-xl focus:outline-none focus:ring-1 transition-all text-white placeholder-white/30 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-white/10 focus:border-green-500 focus:ring-green-500"
    }`;

  const FieldError = ({ error }) =>
    error ? <p className="mt-1.5 text-xs text-red-400">{error.message}</p> : null;

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">

      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?auto=format&fit=crop&w=1080&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#020617]/60 to-[#020617]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617]" />
        <div className="absolute bottom-16 left-12 right-12 z-10">
          <div className="opacity-100 translate-y-0 transition-all duration-700">
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Secure &amp; Transparent <span className="text-green-400">Transactions</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              We verify all our partners to ensure the highest level of trust in the marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 w-full">
          <div className="w-full max-w-2xl">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="AgroBridge" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Progress */}
            <div className="mb-10 w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-full flex items-center justify-center font-bold">✓</div>
                <div className="w-16 sm:w-24 h-1 bg-green-500 rounded-full relative overflow-hidden" />
                <div className="w-8 h-8 bg-green-500 text-[#020617] rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]">2</div>
                <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-0 h-full bg-green-500 transition-all duration-500" />
                </div>
                <div className="w-8 h-8 bg-white/5 border border-white/10 text-white/40 rounded-full flex items-center justify-center font-medium">3</div>
              </div>
              <p className="text-center text-sm text-white/40 font-medium tracking-wide uppercase">
                Step 2 of 3 <span className="mx-2">•</span> Account Information
              </p>
            </div>

            {/* Card */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden w-full">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isRejected ? "via-red-500/50" : "via-green-500/50"} to-transparent`} />

              {/* Rejection UI banner */}
              {isRejected && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex gap-3 items-start">
                  <span className="text-red-400 text-lg leading-none mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-500 mb-0.5">Your previous submission was rejected</p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Please correct your personal details if required and continue to the next step.
                    </p>
                  </div>
                </div>
              )}

              <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">Account Information</h1>
              <p className="text-white/50 mb-8 font-medium">Enter your personal details to secure your profile.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Full Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">Full Name</label>
                    <input {...register("fullName")} className={inputCls(!!errors.fullName)} placeholder="Enter your full name" />
                    <FieldError error={errors.fullName} />
                  </div>

                  {/* NIC */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">NIC Number</label>
                    <input {...register("nic")} className={inputCls(!!errors.nic)} placeholder="e.g., 123456789V" />
                    <FieldError error={errors.nic} />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-white/70">Email Address</label>
                    <input {...register("email")} type="email" className={inputCls(!!errors.email)} placeholder="your@email.com" />
                    <FieldError error={errors.email} />
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-white/70">Mobile Number</label>
                    <input {...register("phone")} className={inputCls(!!errors.phone)} placeholder="+94 XX XXX XXXX" />
                    <FieldError error={errors.phone} />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">Password</label>
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className={`${inputCls(!!errors.password)} pr-12`}
                        placeholder="Create password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <FieldError error={errors.password} />
                    {/* Strength meter */}
                    {passwordVal && (
                      <div className="mt-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                strength.strength < 50
                                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                  : strength.strength < 75
                                  ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                  : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                              }`}
                              style={{ width: `${strength.strength}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold tracking-wider uppercase ${
                            strength.strength < 50 ? "text-red-400" : strength.strength < 75 ? "text-yellow-400" : "text-green-400"
                          }`}>
                            {strength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">Confirm Password</label>
                    <div className="relative">
                      <input
                        {...register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        className={`${inputCls(!!errors.confirmPassword)} pr-12`}
                        placeholder="Confirm password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <FieldError error={errors.confirmPassword} />
                  </div>

                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-5 py-4">
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-white/60 text-sm font-medium tracking-wide">
                    Your personal information is securely encrypted and stored.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/10 mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/register/role")}
                    className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    Continue to Next Step
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}