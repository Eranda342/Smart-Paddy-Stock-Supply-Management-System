import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const clauses = [
  {
    title: "Data We Collect",
    body: "AgroBridge collects only necessary information including your name, email, phone number, NIC, and business/farm documents required to verify your identity and enable platform features.",
  },
  {
    title: "How We Use Your Data",
    body: "Your information is used solely to provide, improve, and personalize your experience on AgroBridge. This includes account verification, transaction processing, and communication about your listings and negotiations.",
  },
  {
    title: "Data Security",
    body: "We use industry-standard practices including encrypted storage and secure HTTPS communication to protect your information from unauthorized access, disclosure, or loss.",
  },
  {
    title: "No Third-Party Sales",
    body: "Your personal data is never sold to third parties. We may share anonymized, aggregate data for platform analytics, but no personally identifiable information is disclosed without your consent.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or request deletion of your personal data at any time by contacting our support team. We will process all valid requests within 14 business days.",
  },
  {
    title: "Policy Updates",
    body: "This Privacy Policy may be updated periodically. We will notify users of significant changes via email. Continued use of the platform after updates constitutes acceptance of the revised policy.",
  },
];

export default function PrivacyPageComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#22C55E] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#22C55E]">Data & Privacy</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-sm text-white/30">Last updated: April 2026</p>
        </div>

        <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-2xl p-6 mb-8 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
          <p className="text-sm text-white/60 leading-relaxed">
            We value your privacy and are committed to protecting your personal data. AgroBridge operates with full transparency about what data we collect and how it is used.
          </p>
        </div>

        <div className="space-y-5">
          {clauses.map(({ title, body }, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:border-white/15 transition-all">
              <h2 className="text-base font-bold mb-3 text-white">{i + 1}. {title}</h2>
              <p className="text-sm text-white/55 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm text-white/30">
          <Link to="/terms" className="hover:text-[#22C55E] transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link to="/contact" className="hover:text-[#22C55E] transition-colors">Contact Us</Link>
        </div>

      </div>
    </div>
  );
}
