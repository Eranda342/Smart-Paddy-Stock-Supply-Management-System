import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";

import FertilizerCard from "../../components/FertilizerCard";
import FertilizerComparison from "../../components/FertilizerComparison";
import FertilizerTimeline from "../../components/FertilizerTimeline";
import SmartRecommendation from "../../components/SmartRecommendation";

const FERTILIZER_DATA = [
  { name: "Urea", type: "Chemical", nutrient: "Nitrogen (N)", bestFor: "BG/AT Varieties", stage: "Early Growth", effect: "Leaf growth boost", tags: ["High Yield", "Fast Acting", "Widely Used"] },
  { name: "TSP", type: "Chemical", nutrient: "Phosphorus (P)", bestFor: "All Commercial", stage: "Basal", effect: "Strong Root System", tags: ["Critical Base", "Root Growth"] },
  { name: "MOP", type: "Chemical", nutrient: "Potassium (K)", bestFor: "Grain Forming", stage: "Panicle Initiation", effect: "Heavier Grain Weight", tags: ["Weight Boost", "Late Stage"] },
  { name: "NPK 15-15-15", type: "Chemical", nutrient: "N-P-K Blend", bestFor: "General", stage: "Basal", effect: "Balanced Base Nutrient", tags: ["All-in-one", "Convenient"] },
  { name: "Compost", type: "Organic", nutrient: "Micro-nutrients", bestFor: "Traditional", stage: "Pre-planting", effect: "Improves Soil Structure", tags: ["Soil Health", "Heritage Safe"] },
  { name: "Cow Dung", type: "Organic", nutrient: "N/P", bestFor: "Organic Fields", stage: "Basal", effect: "Long-term Fertility", tags: ["Natural", "Low Cost"] },
  { name: "Poultry Manure", type: "Organic", nutrient: "High N/P", bestFor: "Vegetative", stage: "Pre-planting", effect: "Rapid Organic Boost", tags: ["Potent", "Fast Organic"] },
  { name: "Green Manure", type: "Organic", nutrient: "Nitrogen", bestFor: "Fallow Prep", stage: "Fallow", effect: "Natural Nitrogen Addition", tags: ["Gliricidia", "Sustainable"] },
];

export default function FertilizersPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Glows (Subtle, No Blobs) */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* 1. HERO SECTION */}
      <section style={{ padding: "120px 5% 60px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, color: "#fff", margin: "0 0 20px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Optimize Yield with <br/>
            <span style={{ color: "#4ADE80", textShadow: "0 0 30px rgba(74,222,128,0.3)" }}>Smart Fertilizer</span> Selection
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.6)", maxWidth: 700, margin: "0 auto 40px", lineHeight: 1.6 }}>
            From organic compost to NPK precision blends — discover the exact nutritional sciences needed to aggressively scale any specific paddy variety.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", fontWeight: 600 }}>12+ Fertilizer Types</div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", fontWeight: 600 }}>Organic + Chemical Systems</div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", fontWeight: 600 }}>Region-based Recommendations</div>
          </div>
        </motion.div>
      </section>

      {/* 2. ORGANIC vs CHEMICAL BATTLE */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", marginBottom: "32px" }}>
          {/* Organic Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ padding: "40px", borderRadius: "24px", background: "linear-gradient(180deg, rgba(34,197,94,0.05), transparent)", border: "1px solid rgba(34,197,94,0.2)", backdropFilter: "blur(12px)" }}
          >
            <h2 style={{ fontSize: "2rem", color: "#4ADE80", margin: "0 0 16px", fontWeight: 700 }}>🌱 Organic Nutrition</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "24px" }}>Perfect for Traditional and Heirloom varieties ensuring premium quality and deep flavor without risking plant lodging.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0", display: "flex", flexDirection: "column", gap: "12px", color: "#E5E7EB" }}>
              <li>🌿 Compost</li><li>🐄 Cow Dung</li><li>🍃 Green Manure</li><li>🪱 Vermicompost</li>
            </ul>
          </motion.div>
          {/* Chemical Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ padding: "40px", borderRadius: "24px", background: "linear-gradient(180deg, rgba(59,130,246,0.05), transparent)", border: "1px solid rgba(59,130,246,0.2)", backdropFilter: "blur(12px)" }}
          >
            <h2 style={{ fontSize: "2rem", color: "#60A5FA", margin: "0 0 16px", fontWeight: 700 }}>⚗️ Chemical (DOA)</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "24px" }}>Necessary for genetically optimized DOA BG/AT varieties to hit aggressive yield targets rapidly in short spans.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0", display: "flex", flexDirection: "column", gap: "12px", color: "#E5E7EB" }}>
              <li>💧 Urea (Nitrogen)</li><li>🦴 TSP (Phosphorus)</li><li>⚖️ MOP (Potassium)</li><li>🧪 NPK Custom Blends</li>
            </ul>
          </motion.div>
        </div>
        {/* Core Differences Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
             <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
               <thead>
                 <tr style={{ background: "rgba(0,0,0,0.4)" }}>
                   <th style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>Factor</th>
                   <th style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#4ADE80" }}>Organic</th>
                   <th style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#60A5FA" }}>Chemical</th>
                 </tr>
               </thead>
               <tbody style={{ color: "#E5E7EB", fontSize: "0.95rem" }}>
                 <tr><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Yield</td><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Medium</td><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700 }}>High</td></tr>
                 <tr><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Soil Health</td><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700 }}>Excellent</td><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Moderate</td></tr>
                 <tr><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Cost</td><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700 }}>Low</td><td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Medium</td></tr>
                 <tr><td style={{ padding: "16px" }}>Action Speed</td><td style={{ padding: "16px" }}>Slow</td><td style={{ padding: "16px", fontWeight: 700 }}>Fast</td></tr>
               </tbody>
             </table>
          </div>
        </motion.div>
      </section>

      {/* 4. SMART MATCH SYSTEM */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
         <SmartRecommendation />
      </section>

      {/* 3. FERTILIZER CARDS GRID */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "32px", textAlign: "center" }}>Available Fertilizer Directory</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {FERTILIZER_DATA.map((fert, idx) => (
             <motion.div key={fert.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
               <FertilizerCard data={fert} />
             </motion.div>
          ))}
        </div>
      </section>

      {/* 5. APPLICATION TIMELINE */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5%" }}>
        <FertilizerTimeline />
      </div>

      {/* 6. COMPARISON TABLE */}
      <section style={{ padding: "40px 5%", maxWidth: 1280, margin: "0 auto" }}>
        <FertilizerComparison />
      </section>

      {/* 7. CTA SECTION */}
      <section style={{ padding: "80px 5% 120px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ background: "linear-gradient(145deg, rgba(34,197,94,0.1), rgba(0,0,0,0.5))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "32px", padding: "80px 20px" }}
        >
           <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>Improve Your Yield Today</h2>
           <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", margin: "0 auto 32px", maxWidth: "600px" }}>Start using smart fertilizer strategies precisely formulated for your exact paddy strains with AgroBridge.</p>
           <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#4ADE80", color: "#020617", padding: "16px 32px", borderRadius: 9999, fontWeight: 700, textDecoration: "none", fontSize: "1.1rem", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
             Login to Platform <ArrowRight size={20} />
           </Link>
        </motion.div>
      </section>

    </div>
  );
}
