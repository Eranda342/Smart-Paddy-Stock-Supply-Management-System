import React from "react";
import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section style={{ padding: "120px 5% 60px", maxWidth: "1280px", margin: "0 auto", textAlign: "center", position: "relative" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 800, color: "#fff", margin: "0 0 24px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
          Transforming Sri Lanka’s <br/>
          <span style={{ color: "#10B981", background: "linear-gradient(to right, #10B981, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Paddy Supply Chain</span>
        </h1>
        <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.6)", maxWidth: 700, margin: "0 auto 32px", lineHeight: 1.6 }}>
          AgroBridge connects farmers, mill owners, and logistics into one seamless digital ecosystem.
        </p>
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", borderRadius: 9999 }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Built for transparency. Designed for growth.
          </span>
        </div>
      </motion.div>
    </section>
  );
}
