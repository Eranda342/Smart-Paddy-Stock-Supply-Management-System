import { Link, useNavigate } from "react-router-dom";
import { Sprout, User, Building2 } from "lucide-react";

export default function RoleSelectionPage() {

  const navigate = useNavigate();

  const handleRoleSelect = (role) => {

    // Clear previous registration data
    localStorage.removeItem("accountInfo");

    // Save selected role for registration steps
    localStorage.setItem("role", role);

    // Navigate to account information page
    navigate("/register/account");
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
          <div className="opacity-100 translate-y-0 transition-all duration-700">
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white/95">
              Connecting Farmers &amp; Mill Owners <span className="text-green-400">Digitally</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              Join the most secure, verified, and transparent paddy marketplace in Sri Lanka.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex flex-col relative z-10 min-h-screen overflow-y-auto">

        {/* Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 w-full">
          
          <div className="w-full max-w-2xl">
            {/* Minimal Logo */}
            <div className="flex justify-center mb-8">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white/90">AgroBridge</span>
              </Link>
            </div>

            {/* PROGRESS BAR */}
            <div className="mb-10 w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-500 text-[#020617] rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                  1
                </div>
                <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-0 h-full bg-green-500 transition-all duration-500" />
                </div>
                <div className="w-8 h-8 bg-white/5 border border-white/10 text-white/40 rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full"></div>
                <div className="w-8 h-8 bg-white/5 border border-white/10 text-white/40 rounded-full flex items-center justify-center font-medium">
                  3
                </div>
              </div>
              <p className="text-center text-sm text-white/40 font-medium tracking-wide uppercase">
                Step 1 of 3 <span className="mx-2">•</span> Role Selection
              </p>
            </div>

            {/* CONTENT CARD */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">
                  How will you use AgroBridge?
                </h1>
                <p className="text-white/50 font-medium">
                  Select your role to get started with the platform
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* FARMER CARD */}
                <button
                  onClick={() => handleRoleSelect("FARMER")}
                  className="bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-white/[0.08] rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)] group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-14 h-14 bg-green-500/10 group-hover:bg-green-500/20 border border-green-500/20 rounded-xl flex items-center justify-center mb-6 transition-all shadow-inner relative z-10">
                    <User className="w-7 h-7 text-green-400 group-hover:scale-110 transition-transform" />
                  </div>

                  <h2 className="text-xl font-bold mb-3 text-white tracking-tight relative z-10">
                    Farmer
                  </h2>

                  <p className="text-white/50 mb-6 text-sm leading-relaxed relative z-10 min-h-[60px]">
                    List your paddy harvests, negotiate with rice mill owners,
                    and manage your sales directly.
                  </p>

                  <ul className="space-y-3 text-sm text-white/60 relative z-10">
                    <li className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Create & manage listings
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Negotiate prices directly
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Track transport logistics
                    </li>
                  </ul>
                </button>

                {/* MILL OWNER CARD */}
                <button
                  onClick={() => handleRoleSelect("MILL_OWNER")}
                  className="bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.08] rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-14 h-14 bg-blue-500/10 group-hover:bg-blue-500/20 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 transition-all shadow-inner relative z-10">
                    <Building2 className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>

                  <h2 className="text-xl font-bold mb-3 text-white tracking-tight relative z-10">
                    Rice Mill Owner
                  </h2>

                  <p className="text-white/50 mb-6 text-sm leading-relaxed relative z-10 min-h-[60px]">
                    Browse paddy listings, negotiate with farmers,
                    and manage procurement logistics.
                  </p>

                  <ul className="space-y-3 text-sm text-white/60 relative z-10">
                    <li className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Browse verified listings
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Manage procurement
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Coordinate transport
                    </li>
                  </ul>
                </button>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors">
                  Already have an account? <span className="text-green-400 font-semibold">Sign in</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}