import { Link } from "react-router-dom";
import { ArrowLeft, LifeBuoy, Sprout, Building2, ArrowRight, Truck, CreditCard } from "lucide-react";

const Section = ({ icon: Icon, title, items }) => (
  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:border-[#22C55E]/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#22C55E]/50 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#22C55E] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#22C55E] mb-4">Documentation</span>
          <h1 className="text-5xl font-black tracking-tight mb-4">Help Center</h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
            Everything you need to get started and succeed on AgroBridge.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Section icon={LifeBuoy} title="Getting Started" items={[
            "Create your account and complete your profile",
            "Verify your email address",
            "Submit required identity and business documents",
            "Wait for admin verification (usually within 24 hours)",
          ]} />

          <Section icon={Sprout} title="For Farmers" items={[
            "Create listings for your paddy harvest with quantity and price",
            "Receive and review offers from mill owners",
            "Negotiate prices directly inside the platform",
            "Accept an offer to automatically create a transaction",
          ]} />

          <Section icon={Building2} title="For Mill Owners" items={[
            "Browse all available farmer listings",
            "Create buy requests for specific paddy types",
            "Negotiate directly with farmers",
            "Accept a deal to initiate a transaction",
          ]} />

          <Section icon={CreditCard} title="Transactions" items={[
            "A transaction is created automatically when a deal is accepted",
            "Track transaction status from your dashboard",
            "Payment status is managed within the platform",
          ]} />

          <Section icon={Truck} title="Transport" items={[
            "Request transport coordination through your transaction page",
            "Assign vehicles and schedule pickup times",
            "Track delivery status in real time",
          ]} />

          <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-2xl p-7 flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#22C55E] mb-2">Still need help?</p>
              <p className="text-sm text-white/50 leading-relaxed">
                Our support team is available Monday–Friday, 9 AM–6 PM. Reach out and we'll respond within one business day.
              </p>
            </div>
            <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#22C55E] hover:gap-3 transition-all">
              Contact Support <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
