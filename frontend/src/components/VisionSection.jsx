import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, UserCheck, Lock, Radar } from "lucide-react";

export default function VisionSection() {
  return (
    <>
      {/* WHO IT'S FOR */}
      <section style={{ padding: "60px 5%", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>Empowering All Stakeholders</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", maxWidth: "900px", margin: "0 auto" }}>
          {/* Farmers */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px" }}>
            <h3 style={{ fontSize: "1.8rem", color: "#F59E0B", margin: "0 0 16px", fontWeight: 700 }}>👨‍🌾 For Farmers</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "rgba(255,255,255,0.7)", fontSize: "1.05rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 6, height: 6, background: "#F59E0B", borderRadius: "50%" }} /> Secure better, transparent prices</li>
              <li style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 6, height: 6, background: "#F59E0B", borderRadius: "50%" }} /> Direct access to verified buyers</li>
              <li style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 6, height: 6, background: "#F59E0B", borderRadius: "50%" }} /> Effortless post-sale logistics handling</li>
            </ul>
          </motion.div>
          {/* Mill Owners */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px" }}>
            <h3 style={{ fontSize: "1.8rem", color: "#3B82F6", margin: "0 0 16px", fontWeight: 700 }}>🏭 For Mill Owners</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "rgba(255,255,255,0.7)", fontSize: "1.05rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 6, height: 6, background: "#3B82F6", borderRadius: "50%" }} /> Guarantee a reliable inbound supply</li>
              <li style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 6, height: 6, background: "#3B82F6", borderRadius: "50%" }} /> Source entirely in bulk nationwide</li>
              <li style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 6, height: 6, background: "#3B82F6", borderRadius: "50%" }} /> Only trade with fully verified sellers</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* TRUST & TRANSPARENCY */}
      <section style={{ padding: "40px 5%", maxWidth: "1280px", margin: "0 auto" }}>
         <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px", display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "32px" }}>
            {[
              { icon: UserCheck, text: "Verified Users", color: "#10B981" },
              { icon: Lock, text: "Secure Transactions", color: "#3B82F6" },
              { icon: Radar, text: "Real-Time Updates", color: "#F59E0B" },
              { icon: ShieldCheck, text: "Transparent Pricing", color: "#A855F7" },
            ].map((prop, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                 <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${prop.color}15`, color: prop.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <prop.icon size={28} />
                 </div>
                 <span style={{ color: "#E5E7EB", fontWeight: 600, fontSize: "1rem" }}>{prop.text}</span>
              </div>
            ))}
         </div>
      </section>

      {/* VISION & CTA */}
      <section style={{ padding: "60px 5% 120px", maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ background: "linear-gradient(145deg, rgba(34,197,94,0.1), rgba(0,0,0,0.5))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "32px", padding: "80px 20px" }}
        >
           <h2 style={{ fontSize: "2rem", color: "#10B981", fontWeight: 700, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Our Vision</h2>
           <p style={{ color: "#fff", fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 300, margin: "0 auto 48px", maxWidth: "800px", lineHeight: 1.5 }}>
             "To modernize Sri Lanka’s agricultural supply chain through technology, creating a fair, transparent, and efficient ecosystem for all stakeholders."
           </p>

           <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "24px" }}>Join the future of agriculture.</h3>
           <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
             <Link to="/register/role" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#10B981", color: "#020617", padding: "16px 32px", borderRadius: 9999, fontWeight: 700, textDecoration: "none", fontSize: "1.1rem", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
               Get Started
             </Link>
             <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", padding: "16px 32px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, textDecoration: "none", fontSize: "1.1rem", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
               Login to Account <ArrowRight size={20} />
             </Link>
           </div>
        </motion.div>
      </section>
    </>
  );
}
