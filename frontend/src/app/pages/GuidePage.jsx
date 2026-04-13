import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sprout, Building2, CheckCircle2 } from "lucide-react";

const Step = ({ n, text }) => (
  <li className="flex items-start gap-4">
    <span className="w-8 h-8 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-sm font-bold shrink-0">{n}</span>
    <span className="text-white/70 leading-relaxed pt-1">{text}</span>
  </li>
);

export default function GuidePage() {
  const farmerSteps = [
    "Create a listing with paddy type, quantity, and asking price per kg",
    "Receive counter-offers from mill owners directly in the chat",
    "Negotiate and accept the best offer — a transaction is created instantly",
    "Arrange transport or coordinate pickup with the mill owner",
  ];

  const millSteps = [
    "Browse all available farmer listings, filtered by district, type, or price",
    "Create a buy request if you need a specific paddy type",
    "Negotiate price and quantity directly with the farmer",
    "Accept a deal to lock in the transaction and arrange transport",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#22C55E] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#22C55E] mb-4">Getting Started</span>
          <h1 className="text-5xl font-black tracking-tight mb-4">User Guide</h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Step-by-step guides for using AgroBridge as a farmer or mill owner.
          </p>
        </div>

        <div className="space-y-10">

          {/* Farmer */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 hover:border-[#22C55E]/30 transition-all">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Sprout className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">How to Sell Paddy (Farmers)</h2>
            </div>
            <ol className="space-y-5">
              {farmerSteps.map((s, i) => <Step key={i} n={i+1} text={s} />)}
            </ol>
          </div>

          {/* Mill Owner */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 hover:border-[#22C55E]/30 transition-all">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">How to Buy Paddy (Mill Owners)</h2>
            </div>
            <ol className="space-y-5">
              {millSteps.map((s, i) => <Step key={i} n={i+1} text={s} />)}
            </ol>
          </div>

          {/* Promise */}
          <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-2xl p-7 flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
            <p className="text-sm text-white/60 leading-relaxed">
              AgroBridge ensures a smooth and transparent process from listing to delivery — every step is tracked, verified, and secured within the platform.
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Link to="/help" className="inline-flex items-center gap-2 text-sm font-semibold text-[#22C55E] hover:gap-3 transition-all">
              Visit Help Center <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-[#22C55E] transition-all">
              Contact Support <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
