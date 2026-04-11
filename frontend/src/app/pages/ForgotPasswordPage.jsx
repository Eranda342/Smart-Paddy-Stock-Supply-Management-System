import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { API } from "../../api/api";
import { forgotPasswordSchema } from "../lib/schemas";
import Logo from "../components/ui/Logo";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  useEffect(() => {
    document.title = "Forgot Password | AgroBridge";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(API.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (res.ok) {
        setSubmittedEmail(data.email);
        setIsSuccess(true);
        toast.success("Reset link sent to your email");
      } else {
        toast.error(json.message || "Failed to send reset link");
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
        <div className="absolute top-8 left-8 sm:left-12">
          <Link to="/login" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Login</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

            <div className="flex justify-center mb-8">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="lg" showText={false} />
              </Link>
            </div>

            <h1 className="text-3xl font-bold mb-3 tracking-tight text-center">Reset Password</h1>

            {isSuccess ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                  <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-white/70 font-medium mb-6">
                  We've sent a password reset link to <br />
                  <span className="text-white font-semibold">{submittedEmail}</span>
                </p>
                <p className="text-sm text-white/40 mb-8">
                  Check your inbox and spam folder. The link will expire in 15 minutes.
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-white/50 mb-8 text-center text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                    <input
                      {...register("email")}
                      type="email"
                      className={inputCls(!!errors.email)}
                      placeholder="Enter your registered email"
                      autoFocus
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !isValid}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1120] focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending Link…" : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
