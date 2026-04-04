import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function ProblemSolution() {
  return (
    <section style={{ padding: "60px 5%", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>The Crisis vs The Platform</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", position: "relative" }}>
        {/* Problem Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          style={{ background: "linear-gradient(180deg, rgba(239,68,68,0.08), rgba(0,0,0,0.3))", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "24px", padding: "40px", backdropFilter: "blur(12px)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <AlertTriangle color="#EF4444" size={28} />
            <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#EF4444" }}>The Problem</h3>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px", color: "rgba(255,255,255,0.7)" }}>
            <li style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#EF4444", fontWeight: 700 }}>×</span> Farmers struggle to find fair prices
            </li>
            <li style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#EF4444", fontWeight: 700 }}>×</span> Mill owners lack a verified, reliable supply
            </li>
            <li style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#EF4444", fontWeight: 700 }}>×</span> Zero transparency in pricing and grading
            </li>
            <li style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#EF4444", fontWeight: 700 }}>×</span> Logistics are highly inefficient
            </li>
          </ul>
        </motion.div>

        {/* Arrow between (hidden on mobile gracefully due to grid flow) */}
        
        {/* Solution Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.08), rgba(0,0,0,0.3))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "24px", padding: "40px", backdropFilter: "blur(12px)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <CheckCircle2 color="#10B981" size={28} />
            <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#10B981" }}>AgroBridge Solution</h3>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px", color: "#E5E7EB" }}>
            <li style={{ display: "flex", gap: "12px" }}>
              <CheckCircle2 color="#10B981" size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Direct farmer ↔ mill owner algorithmic connection</span>
            </li>
            <li style={{ display: "flex", gap: "12px" }}>
              <CheckCircle2 color="#10B981" size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Real-time, documented negotiation system</span>
            </li>
            <li style={{ display: "flex", gap: "12px" }}>
              <CheckCircle2 color="#10B981" size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Secure, enforced transaction flow</span>
            </li>
            <li style={{ display: "flex", gap: "12px" }}>
              <CheckCircle2 color="#10B981" size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Integrated, SMS-driven transport coordination</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
