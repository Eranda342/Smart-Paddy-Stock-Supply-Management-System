import { Link } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import Logo from "../components/ui/Logo";

export default function RegistrationSuccessPage() {

  useEffect(() => {
    // Clear any leftover registration data
    localStorage.removeItem("accountInfo");
    localStorage.removeItem("role");
  }, []);

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
          <div className="opacity-100 translate-y-0 transition-all duration-700">
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Welcome to the <span className="text-green-400">Community</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              We'll notify you as soon as your account has been reviewed by our admin team.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">

        {/* Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 w-full">
          
          <div className="w-full max-w-2xl text-center">
            {/* Minimal Logo */}
            <div className="flex justify-center mb-10">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="md" />
              </Link>
            </div>

            {/* CONTENT CARD */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-10 shadow-2xl relative overflow-hidden w-full text-center group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                <CheckCircle2 className="w-12 h-12 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white">
                Registration Submitted
              </h1>

              <p className="text-lg text-white/50 mb-10">
                Your account is currently under administrative review.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10 inline-block text-center w-full sm:mx-auto relative overflow-hidden group-hover:border-green-500/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-medium text-white/90">
                    Estimated Approval Time
                  </h3>
                </div>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  24-48 Hours
                </p>
                <p className="text-sm text-white/50 mt-4 leading-relaxed">
                  You'll receive full access to track, trade, and manage operations once your account has been verified.
                </p>
              </div>

              <div className="space-y-5 text-left mb-10 px-0 sm:px-8">
                <div className="flex gap-4">
                  <div className="w-7 h-7 bg-green-500/10 rounded-full flex flex-col items-center justify-center flex-shrink-0 mt-0.5 border border-green-500/20 shadow-inner">
                    <div className="w-2.5 h-2.5 bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.8)] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1 text-base">
                      Document Verification
                    </h4>
                    <p className="text-sm text-white/50">
                      Administrators will review your submitted personal and business documents.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 bg-green-500/10 rounded-full flex flex-col items-center justify-center flex-shrink-0 mt-0.5 border border-green-500/20 shadow-inner">
                    <div className="w-2.5 h-2.5 bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.8)] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1 text-base">
                      Account Activation
                    </h4>
                    <p className="text-sm text-white/50">
                      Once verified and approved, you'll receive full system access instantly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 bg-green-500/10 rounded-full flex flex-col items-center justify-center flex-shrink-0 mt-0.5 border border-green-500/20 shadow-inner">
                    <div className="w-2.5 h-2.5 bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.8)] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1 text-base">
                      Start Trading
                    </h4>
                    <p className="text-sm text-white/50">
                      Begin listing harvests, negotiating, or purchasing directly upon login.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="inline-block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all text-base tracking-wide"
              >
                Return to Login
              </Link>

            </div>

            <p className="mt-8 text-sm font-medium text-white/40">
              Need help? Contact us at{" "}
              <a
                href="mailto:support@agrobridge.lk"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                support@agrobridge.lk
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}