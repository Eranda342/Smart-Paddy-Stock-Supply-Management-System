import React from "react";
import { motion } from "framer-motion";
import { Leaf, FlaskConical, CheckCircle2 } from "lucide-react";

export default function FertilizerCard({ data }) {
  const isOrganic = data.type === "Organic";
  const accent = isOrganic ? "#22C55E" : "#3B82F6";
  const Icon = isOrganic ? Leaf : FlaskConical;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(10px)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${accent}15`, color: accent,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
            {data.name}
          </h3>
        </div>
        <span style={{
          fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 9999,
          color: accent, background: `${accent}15`, border: `1px solid ${accent}30`
        }}>
          {data.type}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Nutrient</span>
          <span style={{ color: "#E5E7EB", fontWeight: 500 }}>{data.nutrient}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Best For</span>
          <span style={{ color: "#E5E7EB", fontWeight: 500 }}>{data.bestFor}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Usage Stage</span>
          <span style={{ color: "#E5E7EB", fontWeight: 500 }}>{data.stage}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Effect</span>
          <span style={{ color: accent, fontWeight: 500 }}>{data.effect}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto", paddingTop: "8px" }}>
        {data.tags.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontSize: "0.7rem", color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6
          }}>
            <CheckCircle2 size={12} color={accent} /> {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
