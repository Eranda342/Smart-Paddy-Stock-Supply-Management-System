import React from "react";
import { motion } from "framer-motion";
import { Store, MessageSquareQuote, Truck, Beaker } from "lucide-react";

const FEATURES = [
  { icon: Store, title: "Marketplace", desc: "Buy & sell paddy directly without middlemen.", color: "#3B82F6" },
  { icon: MessageSquareQuote, title: "Negotiation System", desc: "Real-time, documented price negotiation.", color: "#F59E0B" },
  { icon: Truck, title: "Transport Management", desc: "End-to-end delivery tracking & SMS dispatch.", color: "#10B981" },
  { icon: Beaker, title: "Smart Agri Insights", desc: "Advanced paddy type & fertilizer guidance.", color: "#A855F7" },
];

export default function FeaturesGrid() {
  return (
    <section style={{ padding: "60px 5%", maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>Core Platform Features</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "20px", padding: "32px", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: "16px", background: `${feat.color}15`, color: feat.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <feat.icon size={32} />
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{feat.title}</h3>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
