import { Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";

const clauses = [
  {
    title: "Acceptance of Terms",
    body: "By using AgroBridge, you agree to use the platform responsibly, provide accurate information about yourself and your listings, and comply with all applicable Sri Lankan laws and regulations.",
  },
  {
    title: "User Responsibilities",
    body: "Users are solely responsible for the accuracy of their listings, negotiations, and transactions. AgroBridge does not verify the physical quality of goods but does verify user identity and business documents before granting platform access.",
  },
  {
    title: "Platform Role",
    body: "AgroBridge acts as a facilitation platform and does not directly participate in, guarantee, or insure any transaction between farmers and mill owners. All financial arrangements are between the parties involved.",
  },
  {
    title: "Account Suspension",
    body: "We reserve the right to suspend or permanently remove accounts that violate platform policies, engage in fraudulent activity, or abuse the negotiation and transaction systems.",
  },
  {
    title: "Changes to Terms",
    body: "AgroBridge reserves the right to update these Terms of Service at any time. Continued use of the platform constitutes acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#22C55E] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-[#22C55E]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#22C55E]">Legal</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
          <p className="text-sm text-white/30">Last updated: April 2026</p>
        </div>

        <div className="space-y-6">
          {clauses.map(({ title, body }, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:border-white/15 transition-all">
              <h2 className="text-base font-bold mb-3 text-white">{i + 1}. {title}</h2>
              <p className="text-sm text-white/55 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm text-white/30">
          <Link to="/privacy" className="hover:text-[#22C55E] transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/contact" className="hover:text-[#22C55E] transition-colors">Contact Us</Link>
        </div>

      </div>
    </div>
  );
}
