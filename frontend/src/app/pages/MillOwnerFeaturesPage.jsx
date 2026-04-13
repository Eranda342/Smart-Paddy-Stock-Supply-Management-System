import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, ClipboardList, CheckCircle2, Truck } from "lucide-react";

export default function MillOwnerFeaturesPage() {
  const sections = [
    {
      title: "Browse Listings",
      desc: "Explore available paddy from verified farmers.",
      icon: ClipboardList
    },
    {
      title: "Create Buy Requests",
      desc: "Post your demand and attract sellers.",
      icon: Building2
    },
    {
      title: "Negotiate Deals",
      desc: "Negotiate pricing and quantity directly with farmers.",
      icon: CheckCircle2
    },
    {
      title: "Manage Supply",
      desc: "Track orders, deliveries, and transactions.",
      icon: Truck
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#22C55E] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tight mb-6">For Mill Owners</h1>
          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            Find reliable paddy suppliers and manage procurement efficiently.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {sections.map((sec, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 hover:border-[#22C55E]/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] shrink-0">
                <sec.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">{sec.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{sec.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/register/role"
            className="px-8 py-4 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center gap-2 group"
          >
            Get Started as Buyer
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
