import { Link } from 'react-router';
import { Sprout, CheckCircle2, Clock } from 'lucide-react';

export default function RegistrationSuccessPage() {
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
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-12 py-20">
        <div className="w-full max-w-[600px] text-center">
          <div className="bg-card border border-border rounded-2xl p-12 shadow-sm">
            <div className="w-24 h-24 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />
            </div>
            
            <h1 className="text-4xl font-semibold mb-4">Registration Submitted Successfully</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your account is currently under administrative review.
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#22C55E]" />
                <h3 className="font-semibold">Estimated Approval Time</h3>
              </div>
              <p className="text-2xl font-semibold text-[#22C55E]">24-48 Hours</p>
              <p className="text-sm text-muted-foreground mt-2">
                We'll send you an email notification once your account has been verified
              </p>
            </div>

            <div className="space-y-3 text-left mb-8">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#22C55E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Document Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your submitted documents
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#22C55E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Account Activation</h4>
                  <p className="text-sm text-muted-foreground">
                    Once verified, you'll receive full access to the platform
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#22C55E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Start Trading</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin listing or browsing paddy harvests immediately
                  </p>
                </div>
              </div>
            </div>

            <Link 
              to="/login"
              className="inline-block w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 font-medium"
            >
              Return to Login
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:support@agrobridge.lk" className="text-[#22C55E] hover:underline">
              support@agrobridge.lk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
