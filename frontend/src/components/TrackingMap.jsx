import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, User, CheckCircle2 } from "lucide-react";

export default function TrackingMap() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      style={{
        background: "rgba(2,6,23,0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Fake Map Background */}
      <div style={{ height: "400px", background: "linear-gradient(to right, #0f172a, #1e293b)", position: "relative" }}>
        {/* Abstract Map Lines representing roads */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
           <path d="M 50,350 Q 150,200 300,300 T 600,150 T 900,200" fill="transparent" stroke="#E5E7EB" strokeWidth="4" strokeDasharray="8 8" />
           {/* Moving Truck Path (Solid) */}
           <path id="route" d="M 50,350 Q 150,200 300,300 T 600,150" fill="transparent" stroke="#3B82F6" strokeWidth="4" />
        </svg>

        {/* Start Point */}
        <div style={{ position: "absolute", bottom: 30, left: 30, display: "flex", flexDirection: "column", alignItems: "center" }}>
           <MapPin fill="#10B981" color="#020617" size={32} />
           <span style={{ background: "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", marginTop: 4, fontWeight: 600 }}>Farm (Kurunegala)</span>
        </div>

        {/* End Point */}
        <div style={{ position: "absolute", top: 120, right: 100, display: "flex", flexDirection: "column", alignItems: "center" }}>
           <MapPin fill="#EF4444" color="#020617" size={32} />
           <span style={{ background: "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", marginTop: 4, fontWeight: 600 }}>Mill (Colombo)</span>
        </div>

        {/* Animated Truck Indicator */}
        <motion.div
           initial={{ left: 50, top: 320 }}
           animate={{ left: "55%", top: "45%" }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           style={{
             position: "absolute", width: 24, height: 24, borderRadius: "50%",
             background: "#3B82F6", border: "4px solid #fff",
             boxShadow: "0 0 20px #3B82F6",
             transform: "translate(-50%, -50%)"
           }}
        />

        {/* Tracking UI Overlay */}
        <div style={{
          position: "absolute", top: 20, left: 20, right: 20,
          background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px",
          padding: "20px", display: "flex", flexWrap: "wrap", gap: "24px",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tracking ID</span>
            <p style={{ margin: "4px 0 0", fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>TRK-9842A</p>
          </div>
          
          {/* Status Timeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 250, margin: "0 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>PICKED UP</span>
            </div>
            <div style={{ flex: 1, height: 2, background: "#10B981" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Navigation size={18} color="#3B82F6" className="animate-pulse" />
              <span style={{ fontSize: "0.7rem", color: "#3B82F6", fontWeight: 800 }}>IN PROGRESS</span>
            </div>
            <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
               <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)" }} />
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>DELIVERED</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <Clock size={18} color="#F59E0B" />
               <div style={{ display: "flex", flexDirection: "column" }}>
                 <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Est. Arrival</span>
                 <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F59E0B" }}>2h 30m</span>
               </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 <User size={16} color="#E5E7EB" />
               </div>
               <div style={{ display: "flex", flexDirection: "column" }}>
                 <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Driver</span>
                 <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#E5E7EB" }}>Kamal Transport</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
