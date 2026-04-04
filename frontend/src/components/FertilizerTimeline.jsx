import React from "react";
import { motion } from "framer-motion";
import { Clock, Beaker, Sprout, Wheat } from "lucide-react";

const TIMELINE_STEPS = [
  {
    day: "Day 0",
    stage: "Basal Application",
    fertilizer: "TSP + Organic Base",
    icon: Sprout,
    desc: "Applied right before or during sowing/transplanting to ensure roots have immediate access to Phosphorus for strong establishment.",
    color: "#F59E0B",
  },
  {
    day: "Day 14 - 21",
    stage: "First Top Dressing",
    fertilizer: "Urea (Nitrogen)",
    icon: Beaker,
    desc: "Triggers rapid leaf growth and tillering (creation of new stalks). Essential for ensuring a dense, highly productive field.",
    color: "#3B82F6",
  },
  {
    day: "Day 45 - 55",
    stage: "Panicle Initiation",
    fertilizer: "MOP + Urea",
    icon: Wheat,
    desc: "Critical stage. Applied right before the plant starts forming flowers/grains. Potassium (MOP) ensures heavier, healthier grain filling.",
    color: "#8B5CF6",
  },
];

export default function FertilizerTimeline() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      style={{ padding: "40px 0" }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 8px", color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
          <Clock color="#4ADE80" /> Standard Application Timeline
        </h3>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", margin: 0, maxWidth: "600px" }}>
          Chemical fertilizer yields depend heavily on precise timing. Here is the standard DOA timeline for a typical 3.5-month (105 Day) BG series crop.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
        {/* Vertical connecting line */}
        <div style={{
          position: "absolute", top: 20, bottom: 20, left: 24, width: 2,
          background: "linear-gradient(to bottom, #F59E0B, #3B82F6, #8B5CF6)",
          opacity: 0.3, zIndex: 0
        }} />

        {TIMELINE_STEPS.map((step, idx) => (
          <motion.div
            key={step.day}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.4 }}
            style={{
              display: "flex", gap: "24px", position: "relative", zIndex: 1
            }}
          >
            {/* Timeline node */}
            <div style={{
              width: 50, height: 50, flexShrink: 0, borderRadius: "50%",
              background: `rgba(2,6,23, 1)`, border: `2px solid ${step.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 15px ${step.color}40`,
            }}>
              <step.icon color={step.color} size={22} />
            </div>

            {/* Content card */}
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: step.color, background: `${step.color}15`, padding: "4px 10px", borderRadius: 9999 }}>{step.day}</span>
                  <h4 style={{ margin: 0, fontSize: "1.1rem", color: "#fff" }}>{step.stage}</h4>
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#E5E7EB", borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: "12px" }}>
                  {step.fertilizer}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
