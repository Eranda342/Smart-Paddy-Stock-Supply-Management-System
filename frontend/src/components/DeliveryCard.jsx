import React from "react";
import { motion } from "framer-motion";
import { Package, ArrowRight, Truck } from "lucide-react";

export default function DeliveryCard({ paddyType, weight, from, to, status, accent }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={20} color="#E5E7EB" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{paddyType}</h4>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>{weight}</span>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `${accent}15`, border: `1px solid ${accent}30`,
          padding: "4px 10px", borderRadius: 9999,
          color: accent, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase"
        }}>
          <Truck size={12} />
          {status}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 2 }}>Origin</span>
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#E5E7EB" }}>{from}</span>
        </div>
        <ArrowRight size={20} color="rgba(255,255,255,0.2)" />
        <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 2 }}>Destination</span>
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#E5E7EB" }}>{to}</span>
        </div>
      </div>
    </motion.div>
  );
}
