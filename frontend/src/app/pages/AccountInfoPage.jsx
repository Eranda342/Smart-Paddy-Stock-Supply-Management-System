import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sprout, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AccountInfoPage() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // 🔐 Prevent skipping role selection
  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      navigate("/register/role");
    }
  }, [navigate]);

  const getPasswordStrength = () => {
    const pwd = formData.password;

    if (pwd.length === 0) return { strength: 0, label: "" };
    if (pwd.length < 6) return { strength: 25, label: "Weak" };
    if (pwd.length < 10) return { strength: 50, label: "Fair" };
    if (pwd.length < 14) return { strength: 75, label: "Good" };

    return { strength: 100, label: "Strong" };
  };

  const strength = getPasswordStrength();

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        style: { borderRadius: "8px", background: "#1f2937", color: "#fff" }
      });
      return;
    }

    const accountInfo = {
      fullName: formData.fullName,
      nic: formData.nic,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    };

    // Save step data
    localStorage.setItem("accountInfo", JSON.stringify(accountInfo));

    navigate("/register/business");

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
              Secure &amp; Transparent <span className="text-green-400">Transactions</span>
            </h2>
            <p className="text-lg text-white/70 font-medium">
              We verify all our partners to ensure the highest level of trust in the marketplace.
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
                {/* Step 1 Passed */}
                <div className="w-8 h-8 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="w-16 sm:w-24 h-1 bg-green-500 rounded-full relative overflow-hidden" />
                {/* Step 2 Active */}
                <div className="w-8 h-8 bg-green-500 text-[#020617] rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                  2
                </div>
                <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-0 h-full bg-green-500 transition-all duration-500" />
                </div>
                {/* Step 3 Pending */}
                <div className="w-8 h-8 bg-white/5 border border-white/10 text-white/40 rounded-full flex items-center justify-center font-medium">
                  3
                </div>
              </div>
              <p className="text-center text-sm text-white/40 font-medium tracking-wide uppercase">
                Step 2 of 3 <span className="mx-2">•</span> Account Information
              </p>
            </div>

            {/* CONTENT CARD */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">
                Account Information
              </h1>

              <p className="text-white/50 mb-8 font-medium">
                Enter your personal details to secure your profile.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* FULL NAME */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* NIC */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">
                      NIC Number
                    </label>
                    <input
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                      placeholder="e.g., 123456789V"
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-white/70">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  {/* PHONE */}
                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-white/70">
                      Mobile Number
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-white/30"
                      placeholder="+94 XX XXX XXXX"
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white pr-12 placeholder-white/30"
                        placeholder="Create password"
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

                    {formData.password && (
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
                                strength.strength < 50
                                  ? "text-red-400"
                                  : strength.strength < 75
                                  ? "text-yellow-400"
                                  : "text-green-400"
                              }`}>
                            {strength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-white/70">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        type={showConfirmPassword ? "text" : "password"}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-[#0A1120] border border-white/10 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white pr-12 placeholder-white/30"
                        placeholder="Confirm password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* SECURITY NOTICE */}
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-5 py-4">
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-white/60 text-sm font-medium tracking-wide">
                    Your personal information is securely encrypted and stored.
                  </span>
                </div>

                {/* BUTTONS */}
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
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] focus:ring-green-500"
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