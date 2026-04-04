import React from "react";
import { motion } from "framer-motion";

const STATS = [
  { value: "12,500+", label: "Verified Users" },
  { value: "LKR 850M+", label: "Capital Traded" },
  { value: "4,200+", label: "Active Listings" },
  { value: "25", label: "Districts Covered" },
];

export default function ImpactStats() {
  return (
    <section style={{ padding: "60px 5%", maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ background: "rgba(34,197,94,0.02)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: "24px", padding: "40px", display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "32px", backdropFilter: "blur(10px)" }}>
        {STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
            style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#10B981" }}>{stat.value}</span>
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
