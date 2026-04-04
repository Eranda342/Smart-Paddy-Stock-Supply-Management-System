import React from "react";
import { motion } from "framer-motion";

const COMPARISON_DATA = [
  { name: "Urea", type: "Chemical", nutrient: "Nitrogen (N)", stage: "Vegetative/Leaf", cost: "Medium", effect: "High Yield, Rapid Growth" },
  { name: "TSP", type: "Chemical", nutrient: "Phosphorus (P)", stage: "Basal/Rooting", cost: "High", effect: "Strong Root System" },
  { name: "MOP", type: "Chemical", nutrient: "Potassium (K)", stage: "Panicle/Grain", cost: "Medium", effect: "Heavier Grain Weight" },
  { name: "NPK 15-15-15", type: "Chemical", nutrient: "N-P-K Blend", stage: "Basal", cost: "High", effect: "Balanced Base Nutrient" },
  { name: "Compost", type: "Organic", nutrient: "Micro-nutrients", stage: "Pre-planting", cost: "Low", effect: "Improves Soil Structure" },
  { name: "Cow Dung", type: "Organic", nutrient: "N/Micro", stage: "Basal", cost: "Very Low", effect: "Long-term Fertility" },
  { name: "Poultry Manure", type: "Organic", nutrient: "High N/P", stage: "Pre-planting", cost: "Low", effect: "Rapid Organic Boost" },
  { name: "Green Manure", type: "Organic", nutrient: "Nitrogen Fixation", stage: "Fallow", cost: "Very Low", effect: "Natural Nitrogen Addition" },
];

export default function FertilizerComparison() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "32px",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
          Comprehensive Fertilizer Matrix
        </h3>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", margin: 0 }}>
          Compare performance attributes securely. Swipe horizontally to view full data on smaller devices.
        </p>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
        <table style={{ width: "100%", minWidth: "700px", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "16px 12px", fontWeight: 600 }}>Fertilizer</th>
              <th style={{ padding: "16px 12px", fontWeight: 600 }}>Type</th>
              <th style={{ padding: "16px 12px", fontWeight: 600 }}>Main Nutrient</th>
              <th style={{ padding: "16px 12px", fontWeight: 600 }}>Best Stage</th>
              <th style={{ padding: "16px 12px", fontWeight: 600 }}>Cost Profile</th>
              <th style={{ padding: "16px 12px", fontWeight: 600 }}>Core Effect</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, idx) => (
              <motion.tr
                key={row.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "16px 12px", fontWeight: 600, color: "#fff" }}>{row.name}</td>
                <td style={{ padding: "16px 12px" }}>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
                    padding: "4px 8px", borderRadius: 6,
                    color: row.type === "Organic" ? "#22C55E" : "#3B82F6",
                    background: row.type === "Organic" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)",
                  }}>
                    {row.type}
                  </span>
                </td>
                <td style={{ padding: "16px 12px", color: "rgba(255,255,255,0.7)" }}>{row.nutrient}</td>
                <td style={{ padding: "16px 12px", color: "rgba(255,255,255,0.7)" }}>{row.stage}</td>
                <td style={{ padding: "16px 12px", color: "rgba(255,255,255,0.7)" }}>{row.cost}</td>
                <td style={{ padding: "16px 12px", color: "#E5E7EB" }}>{row.effect}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
