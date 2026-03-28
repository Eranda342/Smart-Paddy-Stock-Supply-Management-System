import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sprout, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../api/api";

export default function LoginPage() {

  const navigate = useNavigate();

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
    <div className="h-screen flex">

      {/* Left Panel */}
      <div className="w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.15), rgba(15,17,21,0.7)), url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?auto=format&fit=crop&w=1080&q=80')"
          }}
        />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-3xl font-semibold mb-3">
            Connecting Farmers and Rice Mill Owners Digitally
          </h2>
          <p className="text-lg text-white/90">
            Secure and Verified Paddy Marketplace
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-background flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-12 py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#0F1115]" />
            </div>
            <span className="text-2xl font-semibold">AgroBridge</span>
          </Link>

          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Back to Home
          </Link>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-12">
          <div className="w-full max-w-[520px]">

            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">

              <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground mb-8">
                Sign in to your account
              </p>

              <form onSubmit={handleLogin} className="space-y-6">

                {/* Email */}
                <div>
                  <label className="block mb-2">Email</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg bg-[#2a3038]"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block mb-2">Password</label>

                  <div className="relative">

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg pr-12 bg-[#2a3038]"
                      placeholder="Enter your password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>

                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm">Remember Me</span>
                  </label>

                  <span className="text-sm text-[#22C55E] cursor-pointer">
                    Forgot Password?
                  </span>

                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg font-medium"
                >
                  Login
                </button>

              </form>

              {/* Register link */}
              <div className="text-center mt-6">

                <Link
                  to="/register/role"
                  className="text-[#22C55E] hover:underline"
                >
                  Create Account
                </Link>

              </div>

            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-muted-foreground">

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                Secure Login
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                Verified Accounts
              </div>

              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#22C55E]" />
                Sri Lankan Platform
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}