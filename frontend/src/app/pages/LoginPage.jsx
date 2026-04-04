import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sprout, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { API } from "../../api/api";

export default function LoginPage() {

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | AgroBridge";
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(API.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user.role.toLowerCase();

        if (role === "farmer") {
          navigate("/farmer");
        } 
        else if (role === "mill_owner") {
          navigate("/mill-owner");
        } 
        else if (role === "admin") {
          navigate("/admin");
        }

      } else {
        toast.error(data.message || "Login failed");
      }

    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden relative">

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?auto=format&fit=crop&w=1080&q=80')",
          }}
        />
        {/* Soft Gradient Overlay matching dark theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#020617]/60 to-[#020617]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617]" />
        
        <div className="absolute bottom-16 left-12 right-12 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Connecting Farmers &amp; Mill Owners <span className="text-green-400">Digitally</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              Join the most secure, verified, and transparent paddy marketplace in Sri Lanka.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">


        {/* Login Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-[480px]"
          >
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Inner subtle glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              {/* Minimal Logo */}
              <div className="flex justify-center mb-6">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white/90">AgroBridge</span>
                </Link>
              </div>

              <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back</h1>
              <p className="text-white/50 mb-8 font-medium">Log in to manage your operations securely.</p>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white pr-12 placeholder-white/30"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-[#0A1120] checked:bg-green-500 checked:border-green-500 transition-colors cursor-pointer"
                      />
                      <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password"
                    className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold text-[15px] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] focus:ring-green-500"
                >
                  Sign In
                </button>
              </form>

              {/* Divider & Social (Visual Only) */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A1120]/80 text-white/40 backdrop-blur-md rounded-full">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button type="button" className="w-full py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>
              </div>

              {/* Create Account Link */}
              <div className="text-center mt-8 text-sm">
                <span className="text-white/60">Don't have an account? </span>
                <Link to="/register/role" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                  Create an account
                </Link>
              </div>

            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-white/40">
              <div className="flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="hidden leading-none sm:inline">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="hidden leading-none sm:inline">Verified Partners</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}