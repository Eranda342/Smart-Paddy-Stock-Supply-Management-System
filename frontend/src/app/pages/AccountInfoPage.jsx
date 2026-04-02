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
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <div className="flex items-center justify-between px-12 py-6 border-b border-border">

        <Link to="/" className="flex items-center gap-3">

          <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
            <Sprout className="w-6 h-6 text-[#0F1115]" />
          </div>

          <span className="text-2xl font-semibold">
            AgroBridge
          </span>

        </Link>

        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Home
        </Link>

      </div>

      {/* PROGRESS */}
      <div className="max-w-2xl mx-auto mt-8 px-8">

        <div className="flex items-center justify-center gap-2 mb-2">

          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            ✓
          </div>

          <div className="w-20 h-1 bg-[#22C55E]" />

          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            2
          </div>

          <div className="w-20 h-1 bg-border" />

          <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-medium">
            3
          </div>

        </div>

        <p className="text-center text-sm text-muted-foreground">
          Step 2 of 3
        </p>

      </div>

      {/* FORM */}
      <div className="flex items-center justify-center px-12 py-12">

        <div className="w-full max-w-[720px]">

          <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">

            <h1 className="text-3xl font-semibold mb-2">
              Account Information
            </h1>

            <p className="text-muted-foreground mb-8">
              Enter your personal details
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-2 gap-6">

                {/* FULL NAME */}
                <div>

                  <label className="block mb-2">
                    Full Name
                  </label>

                  <input
                    name="fullName"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg bg-[#161a20]"
                    placeholder="Enter your full name"
                    required
                  />

                </div>

                {/* NIC */}
                <div>

                  <label className="block mb-2">
                    NIC Number
                  </label>

                  <input
                    name="nic"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg bg-[#161a20]"
                    placeholder="e.g., 123456789V"
                    required
                  />

                </div>

                {/* EMAIL */}
                <div>

                  <label className="block mb-2">
                    Email Address
                  </label>

                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg bg-[#161a20]"
                    placeholder="your@email.com"
                    required
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label className="block mb-2">
                    Mobile Number
                  </label>

                  <input
                    name="phone"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg bg-[#161a20]"
                    placeholder="+94 XX XXX XXXX"
                    required
                  />

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="block mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-input rounded-lg pr-12 bg-[#161a20]"
                      placeholder="Create password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>

                  </div>

                  {formData.password && (

                    <div className="mt-2">

                      <div className="flex items-center gap-2">

                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">

                          <div
                            className={`h-full ${
                              strength.strength < 50
                                ? "bg-red-500"
                                : strength.strength < 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${strength.strength}%` }}
                          />

                        </div>

                        <span className="text-xs text-muted-foreground">
                          {strength.label}
                        </span>

                      </div>

                    </div>

                  )}

                </div>

                {/* CONFIRM PASSWORD */}
                <div>

                  <label className="block mb-2">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-input rounded-lg pr-12 bg-[#161a20]"
                      placeholder="Confirm password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>

                  </div>

                </div>

              </div>

              {/* SECURITY NOTICE */}
              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm">

                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />

                <span className="text-muted-foreground">
                  Your information is securely encrypted
                </span>

              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 pt-4">

                <button
                  type="button"
                  onClick={() => navigate("/register/role")}
                  className="px-8 py-3 bg-muted rounded-lg"
                >
                  Previous
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg font-medium"
                >
                  Continue
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}