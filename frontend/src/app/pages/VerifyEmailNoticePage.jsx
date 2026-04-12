import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyEmailNoticePage() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (cooldown === 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification email.");
      }
      
      toast.success("Verification email sent!");
      setCooldown(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  // If already verified, move them along
  if (user.emailVerified) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-10 text-center relative overflow-hidden">
          
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            Check your email
          </h1>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            We've sent a verification link to <br/>
            <span className="font-semibold text-slate-900">{user.email}</span>. <br/>
            Please click the link to verify your account and continue.
          </p>

          <div className="space-y-4">
            <button
              disabled={!canResend || loading}
              onClick={handleResend}
              className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-semibold transition-all ${
                canResend
                  ? "bg-green-600 hover:bg-green-700 text-white border border-transparent"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : canResend ? (
                "Resend Email"
              ) : (
                `Resend in ${cooldown}s`
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-slate-200 shadow-sm rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout and return later
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
