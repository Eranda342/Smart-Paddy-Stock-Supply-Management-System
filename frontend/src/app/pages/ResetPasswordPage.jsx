import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { API } from "../../api/api";
import { resetPasswordSchema } from "../lib/schemas";


export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset Password | AgroBridge";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API.resetPassword}/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Password updated successfully");
        navigate("/login");
      } else {
        toast.error(json.message || "Invalid or expired token");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-3.5 bg-[#0A1120] border rounded-xl focus:outline-none focus:ring-1 transition-all text-white placeholder-white/30 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-white/10 focus:border-green-500 focus:ring-green-500"
    }`;

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full flex flex-col relative z-10 min-h-screen justify-center items-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

            <div className="flex justify-center mb-8">
              <Link to="/" className="hover:opacity-80 transition-opacity outline-none">
                <img src="/logo.png" alt="AgroBridge" className="h-12 w-auto mx-auto" />
              </Link>
            </div>

            <h1 className="text-3xl font-bold mb-3 tracking-tight text-center">Set New Password</h1>
            <p className="text-white/50 mb-8 text-center text-sm">
              Please enter your new password below. Make sure it's at least 6 characters long.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className={`${inputCls(!!errors.password)} pr-12`}
                    placeholder="Enter new password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Confirm New Password</label>
                <input
                  {...register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  className={inputCls(!!errors.confirmPassword)}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full py-3.5 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1120] focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
