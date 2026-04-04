import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sprout, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { API } from "../../api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = "Forgot Password | AgroBridge";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(API.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Reset link sent to your email");
      } else {
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Focus Area */}
      <div className="w-full flex flex-col relative z-10 min-h-screen justify-center items-center p-6">

        {/* Back to Login */}
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
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
              </Link>
            </div>

            <h1 className="text-3xl font-bold mb-3 tracking-tight text-center">Reset Password</h1>
            
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                  <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-white/70 font-medium mb-6">
                  We've sent a password reset link to <br/>
                  <span className="text-white font-semibold">{email}</span>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                      placeholder="Enter your registered email"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1120] focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending Link..." : "Send Reset Link"}
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
