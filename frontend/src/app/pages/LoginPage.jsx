import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Sprout, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Demo: redirect to farmer dashboard
    navigate('/farmer');
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Image */}
      <div className="w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.15), rgba(15, 17, 21, 0.7)), url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcmklMjBsYW5rYSUyMHJpY2UlMjBmaWVsZCUyMHBhZGR5fGVufDF8fHx8MTc3MjYyOTExNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
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

      {/* Right Panel - Form */}
      <div className="w-1/2 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-12 py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#0F1115]" />
            </div>
            <span className="text-2xl font-semibold">AgroBridge</span>
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-12">
          <div className="w-full max-w-[520px]">
            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
              <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground mb-8">Sign in to your account</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block mb-2">Email or Mobile Number</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#2a3038]"
                    placeholder="Enter your email or mobile"
                  />
                </div>

                <div>
                  <label className="block mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-12 bg-[#2a3038]"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm">Remember Me</span>
                  </label>
                  <a href="#" className="text-sm text-[#22C55E] hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
                >
                  Login
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              <Link 
                to="/register/role"
                className="block text-center text-[#22C55E] hover:underline"
              >
                Create Account
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>Verified Accounts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sprout className="w-4 h-4 text-[#22C55E]" />
                <span>Sri Lankan Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
