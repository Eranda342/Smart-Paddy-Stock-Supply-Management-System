import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";

// Base templates to avoid bloat
const ORGANIC_PLAN = {
  type: "Strictly Organic Plan",
  plan: [
    { step: "Pre-planting", agent: "Compost / Cow Dung", desc: "Heavy organic base (10 Tons/Ha) worked into the soil weeks prior." },
    { step: "Early Stage", agent: "Gliricidia / Green Manure", desc: "Natural nitrogen fixing to support slow, 5-month growth." },
    { step: "Warning", agent: "NO UREA", desc: "Applying synthetic Urea will cause the tall plant to lodge (fall over)." },
  ]
};

const CHEMICAL_PLAN = {
  type: "Chemical DOA Plan",
  plan: [
    { step: "Basal", agent: "TSP (Phosphorus)", desc: "100kg/Ha at Mudding" },
    { step: "Early Stage (14 Days)", agent: "Urea (Nitrogen)", desc: "60kg/Ha for Tillering" },
    { step: "Grain Filling (45+ Days)", agent: "MOP (Potassium) + Urea", desc: "40kg/Ha MOP + Urea finish to maximize grain weight." },
  ]
};

const SHORT_AGE_PLAN = {
  type: "Accelerated Chemical Plan",
  plan: [
    { step: "Basal", agent: "TSP + NPK Blend", desc: "High base rate to support a massive rapid root sprint." },
    { step: "Early Stage (10 Days)", agent: "Urea Heavy", desc: "Aggressive nitrogen to trigger leafing before the short cycle ends." },
    { step: "Grain Filling (30 Days)", agent: "MOP Spray", desc: "Rapid foliage absorption for immediate panicle support." },
  ]
};

const BOG_PLAN = {
  type: "Wet Zone Modified Plan",
  plan: [
    { step: "Basal", agent: "TSP + Acidity Neutralizer", desc: "Zinc or burnt husk added to counter iron-toxicity & acidic bogs." },
    { step: "Early Stage", agent: "Urea (Split Doses)", desc: "Apply in small splits since heavy rains will wash it away." },
    { step: "Grain Filling", agent: "MOP Spray", desc: "Foliar application since root uptake may be inhibited by flooding." },
  ]
};

const VINTAGE_PLAN = {
  type: "Low Input Hybrid Plan",
  plan: [
    { step: "Basal", agent: "Compost + Light TSP", desc: "Can survive on traditional organic inputs mixed with low-dose P." },
    { step: "Early Stage", agent: "Light Urea", desc: "Very modest N application. Too much will cause excessive height." },
    { step: "Grain Filling", agent: "Organic / Natural", desc: "Does not rigidly require synthetic Potassium finish." },
  ]
};

const RECOMMENDATIONS = {
  // Traditional
  "Suwandel (Traditional)": ORGANIC_PLAN,
  "Madathawalu (Traditional)": ORGANIC_PLAN,
  "Samba (Traditional)": ORGANIC_PLAN,
  "Nadu (Traditional)": ORGANIC_PLAN,
  "Keeri Samba (Traditional)": ORGANIC_PLAN,
  "Pachchaperumal (Traditional)": ORGANIC_PLAN,
  "Kuruluthuda (Traditional)": ORGANIC_PLAN,
  "Kakulu (Traditional)": ORGANIC_PLAN,

  // BG Series (DOA Optimized)
  "Bg 352": CHEMICAL_PLAN,
  "Bg 360": CHEMICAL_PLAN,
  "Bg 358": CHEMICAL_PLAN,
  "Bg 366": CHEMICAL_PLAN,
  "Bg 94-1": CHEMICAL_PLAN,
  "Bg 379-2": CHEMICAL_PLAN,

  // AT Series
  "At 362": CHEMICAL_PLAN,
  "At 306": SHORT_AGE_PLAN,
  "At 405": CHEMICAL_PLAN,

  // Other Improved / Regions
  "Ld 365 & Ld 368": BOG_PLAN,
  "Bw 367 & Bw 363": BOG_PLAN,
  "H4": VINTAGE_PLAN,

  // Specialty
  "Red Rice": ORGANIC_PLAN,
};

const OPTIONS = Object.keys(RECOMMENDATIONS);

export default function SmartRecommendation() {
  const [selected, setSelected] = useState(OPTIONS[0]);
  const [open, setOpen] = useState(false);

  const activeRec = RECOMMENDATIONS[selected];

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      style={{
        background: "linear-gradient(145deg, rgba(59,130,246,0.08), rgba(2,6,23,0.8))",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: "24px",
        padding: "40px",
        position: "relative",
        overflow: "visible",
      }}
    >
      <div style={{ position: "absolute", top: -15, right: 40, background: "#3B82F6", padding: "6px 14px", borderRadius: 9999, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
        <Sparkles size={16} color="#fff" />
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Smart Match System</span>
      </div>

      <div style={{ marginBottom: "32px", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>
          Dynamic Recommendation Engine
        </h3>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", margin: 0, lineHeight: 1.6 }}>
          Different paddy types have drastically different biological needs. Select a variety below to view its optimal, expert-vetted fertilization strategy securely mapping exactly to its genetic timeline.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "340px", zIndex: 10 }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Select Paddy Variety</label>
          <div
            onClick={() => setOpen(!open)}
            style={{
              padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", cursor: "pointer", color: "#fff", fontWeight: 500,
            }}
          >
            {selected}
            <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                  background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                  overflowY: "auto", maxHeight: "300px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                }}
              >
                {OPTIONS.map(opt => (
                  <div
                    key={opt}
                    onClick={() => { setSelected(opt); setOpen(false); }}
                    style={{
                      padding: "14px 20px", cursor: "pointer", fontSize: "0.95rem",
                      color: selected === opt ? "#3B82F6" : "rgba(255,255,255,0.7)",
                      background: selected === opt ? "rgba(59,130,246,0.1)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          key={selected}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: "rgba(0,0,0,0.2)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Targeted {activeRec.type}</h4>
          </div>
          <div style={{ display: "grid", gap: "16px" }}>
            {activeRec.plan.map((step, idx) => (
              <div key={idx} style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "120px", flexShrink: 0, color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 600 }}>{step.step}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ color: step.agent === "NO UREA" ? "#EF4444" : "#4ADE80", fontWeight: 700, fontSize: "1rem" }}>{step.agent}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: 1.5 }}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
