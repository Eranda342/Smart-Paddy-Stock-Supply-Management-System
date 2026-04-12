import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const verifyToken = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/verify-email/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Verification failed.");
        }

        if (mounted) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          
          // If user is currently logged in, update their local token/state so they don't get blocked
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              user.emailVerified = true;
              localStorage.setItem("user", JSON.stringify(user));
            } catch (e) {
              // Ignore parse error
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setStatus("error");
          setMessage(err.message || "Verification failed. The link might be invalid or expired.");
        }
      }
    };

    verifyToken();

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-10 text-center relative overflow-hidden">
          
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Verifying Email</h2>
              <p className="text-slate-500">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col flex-1 duration-500"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Verified successfully!</h2>
              <p className="text-slate-600 mb-2 leading-relaxed">
                {message}
              </p>
              <p className="text-sm text-slate-400">
                Redirecting to login shortly...
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <div className="flex flex-col flex-1 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Verification Failed</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {message}
              </p>
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
              >
                Back to Login
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
