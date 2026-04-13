import { Link } from "react-router-dom";
import { Mail, Phone, Clock, MessageSquare, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

      {/* Ambient */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#22C55E] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#22C55E] mb-4">Support</span>
          <h1 className="text-5xl font-black tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Have questions or need assistance? Our support team is here to help.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {[
            { icon: Mail,          label: "Email",          value: "support@agrobridge.lk",     href: "mailto:support@agrobridge.lk" },
            { icon: Phone,         label: "Phone",          value: "+94 77 000 0000",            href: "tel:+94770000000" },
            { icon: Clock,         label: "Support Hours",  value: "Mon–Fri, 9 AM – 6 PM",      href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#22C55E]/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">{label}</p>
                {href
                  ? <a href={href} className="text-white font-medium hover:text-[#22C55E] transition-colors">{value}</a>
                  : <p className="text-white font-medium">{value}</p>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-2xl p-6 flex items-start gap-4">
          <MessageSquare className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
          <p className="text-sm text-white/60 leading-relaxed">
            You can also reach us through the platform once logged in for faster support regarding transactions, transport coordination, or account issues.
          </p>
        </div>

      </div>
    </div>
  );
}
