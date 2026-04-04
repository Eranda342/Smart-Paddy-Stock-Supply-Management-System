import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Smartphone, CheckCircle2, Lock, Navigation, AlertCircle } from "lucide-react";

import TrackingMap from "../../components/TrackingMap";
import DeliveryCard from "../../components/DeliveryCard";

const ACTIVE_DELIVERIES = [
  { paddyType: "Nadu", weight: "1,200kg", from: "Kurunegala", to: "Colombo", status: "In Progress", accent: "#3B82F6" },
  { paddyType: "Suwandel", weight: "250kg", from: "Gampaha", to: "Galle", status: "Picked Up", accent: "#F59E0B" },
  { paddyType: "Bg 352", weight: "5,000kg", from: "Anuradhapura", to: "Kandy", status: "Delivered", accent: "#10B981" },
];

export default function TransportPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Gradients */}
      <div style={{ position: "absolute", top: "-10%", left: "20%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* 1. HERO SECTION */}
      <section style={{ padding: "120px 5% 60px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", padding: "8px 16px", borderRadius: 9999, marginBottom: 24 }}>
             <AlertCircle size={16} color="#60A5FA" />
             <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#60A5FA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Post-Transaction Logistics</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, color: "#fff", margin: "0 0 20px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Secure End-to-End <br/>
            <span style={{ color: "#3B82F6", textShadow: "0 0 30px rgba(59,130,246,0.3)" }}>Harvest Transport</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.6)", maxWidth: 700, margin: "0 auto 40px", lineHeight: 1.6 }}>
            A rigorous, role-based supply chain system automatically triggered after a successful transaction. Controlled by Mill Owners, driven by real-world SMS dispatch.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", fontWeight: 600 }}>Farmer Initiated</div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", fontWeight: 600 }}>Mill Owner Assigned</div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", fontWeight: 600, color: "#4ADE80" }}>Dual-Party Confirmation</div>
          </div>
        </motion.div>
      </section>

      {/* 2. THE REAL-WORLD FLOW */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
           <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>The AgroBridge Supply Chain Flow</h2>
           <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 12 }}>Transport is strictly locked behind a confirmed, PAID negotiation.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", position: "relative", maxWidth: "800px", margin: "0 auto" }}>
           {/* Steps */}
           {[
             { num: "01", title: "Farmer Requests", desc: "Post-payment, the Farmer explicitly decides if they require logistics support. Status shifts from NOT DECIDED → PENDING.", accent: "#F59E0B" },
             { num: "02", title: "Mill Owner Assigns", desc: "The Mill Owner selects a vehicle from their pre-registered fleet and assigns a driver. Status shifts → ASSIGNED.", accent: "#3B82F6" },
             { num: "03", title: "SMS Dispatch", desc: "The Driver (Not an app user) automatically receives an SMS with pickup details. The Farmer receives the Driver's contact.", accent: "#8B5CF6" },
             { num: "04", title: "Dual Confirmation", desc: "Farmer confirms PICKED UP on-site. The driver transports the load, and the Mill Owner confirms DELIVERED.", accent: "#10B981" }
           ].map((step, idx) => (
             <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", position: "relative", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: "3rem", fontWeight: 900, color: `${step.accent}20`, position: "absolute", top: 20, right: 24, lineHeight: 1 }}>{step.num}</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: "0 0 12px", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: step.accent }} />
                  {step.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0, position: "relative", zIndex: 1 }}>{step.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 3. STRICT STATE TRACKING OVERVIEW */}
      <section style={{ padding: "60px 5%", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "40px", overflow: "hidden" }}>
           <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "32px", textAlign: "center" }}>State-Driven Enforcement</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { state: "NOT DECIDED", who: "System", detail: "Transaction paid, awaiting Farmer's decision." },
                { state: "PENDING", who: "Farmer", detail: "Farmer clicked 'Yes, I need transport'." },
                { state: "ASSIGNED", who: "Mill Owner", detail: "Vehicle (e.g. NG-4566) and Driver designated." },
                { state: "PICKED UP", who: "Farmer", detail: "Farmer clicks 'Confirm Driver Collected Paddy'." },
                { state: "IN PROGRESS", who: "System", detail: "Driver is physically moving the cargo." },
                { state: "DELIVERED", who: "Mill Owner", detail: "Mill Owner clicks 'Confirm Paddy Received'." },
              ].map((row, i) => (
                 <div key={row.state} style={{ display: "flex", alignItems: "center", gap: "20px", background: "rgba(255,255,255,0.02)", padding: "16px 24px", borderRadius: "12px", borderLeft: `4px solid ${i === 5 ? "#10B981" : "#3B82F6"}` }}>
                    <div style={{ minWidth: "140px", fontSize: "0.85rem", fontWeight: 800, color: "#fff", textTransform: "uppercase" }}>{row.state}</div>
                    <div style={{ minWidth: "100px", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>By: {row.who}</div>
                    <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{row.detail}</div>
                 </div>
              ))}
           </div>
        </motion.div>
      </section>

      {/* 4. LIVE TELEMETRY (MOCK) */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "32px", textAlign: "center" }}>Live Active Telemetry</h2>
        <TrackingMap />
      </section>

      {/* 5. ACTIVE DELIVERY CARDS */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
         <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "24px" }}>Recent Public Logistics</h3>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {ACTIVE_DELIVERIES.map((del, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <DeliveryCard {...del} />
              </motion.div>
            ))}
         </div>
      </section>

      {/* 6. TRUST & SAFETY */}
      <section style={{ padding: "20px 5% 60px", maxWidth: 1280, margin: "0 auto" }}>
         <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px", display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "32px" }}>
            {[
              { icon: ShieldCheck, text: "Role-Based Security", color: "#10B981", d: "Strict permissions for Farmer & Mill Owner." },
              { icon: Smartphone, text: "Off-Platform SMS", color: "#3B82F6", d: "Drivers do not need system accounts." },
              { icon: CheckCircle2, text: "Dual Confirmations", color: "#F59E0B", d: "Digital signatures required at origin & edge." },
              { icon: Lock, text: "Locked Logic", color: "#A855F7", d: "Transport is impossible without paid transaction." },
            ].map((prop, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", maxWidth: "200px" }}>
                 <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${prop.color}15`, color: prop.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <prop.icon size={28} />
                 </div>
                 <span style={{ color: "#E5E7EB", fontWeight: 600, fontSize: "0.95rem" }}>{prop.text}</span>
                 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", lineHeight: 1.4 }}>{prop.d}</span>
              </div>
            ))}
         </div>
      </section>

      {/* 8. CTA SECTION */}
      <section style={{ padding: "40px 5% 120px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ background: "linear-gradient(145deg, rgba(59,130,246,0.1), rgba(0,0,0,0.5))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "32px", padding: "80px 20px" }}
        >
           <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>Experience Real Supply Chain Logistics</h2>
           <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", margin: "0 auto 32px", maxWidth: "600px" }}>Discover how AgroBridge seamlessly coordinates Farmers, Mill Owners, and real-world offline drivers.</p>
           <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#3B82F6", color: "#fff", padding: "16px 32px", borderRadius: 9999, fontWeight: 700, textDecoration: "none", fontSize: "1.1rem", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
             Login to Account <ArrowRight size={20} />
           </Link>
        </motion.div>
      </section>

    </div>
  );
}
