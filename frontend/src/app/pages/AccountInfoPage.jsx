import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Sprout, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AccountInfoPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak' };
    if (password.length < 10) return { strength: 50, label: 'Fair' };
    if (password.length < 14) return { strength: 75, label: 'Good' };
    return { strength: 100, label: 'Strong' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/register/business');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-12 py-6 border-b border-border">
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

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto mt-8 px-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            ✓
          </div>
          <div className="w-20 h-1 bg-[#22C55E]"></div>
          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            2
          </div>
          <div className="w-20 h-1 bg-border"></div>
          <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-medium">
            3
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">Step 2 of 3</p>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-12 py-12">
        <div className="w-full max-w-[720px]">
          <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
            <h1 className="text-3xl font-semibold mb-2">Account Information</h1>
            <p className="text-muted-foreground mb-8">Enter your personal details</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2">Full Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">NIC Number</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                    placeholder="e.g., 123456789V"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Email Address</label>
                  <input 
                    type="email"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Mobile Number</label>
                  <input 
                    type="tel"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-[#161a20]"
                    placeholder="+94 XX XXX XXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-12 bg-[#161a20]"
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              strength.strength < 50 ? 'bg-red-500' : 
                              strength.strength < 75 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${strength.strength}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{strength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-12 bg-[#161a20]"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span className="text-muted-foreground">Your information is securely encrypted</span>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/register/role')}
                  className="px-8 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
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
