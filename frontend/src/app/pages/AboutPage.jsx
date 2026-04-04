import React from "react";

import AboutHero from "../../components/AboutHero";
import ProblemSolution from "../../components/ProblemSolution";
import FeaturesGrid from "../../components/FeaturesGrid";
import ImpactStats from "../../components/ImpactStats";
import VisionSection from "../../components/VisionSection";

export default function AboutPage() {
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
      <div style={{ position: "absolute", top: "-10%", left: "10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", right: "-10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />

      <AboutHero />
      <ProblemSolution />

      {/* HOW AGROBRIDGE WORKS (Simple Flow) */}
      <section style={{ padding: "40px 5%", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>How AgroBridge Works</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "24px", position: "relative" }}>
          {[
            { num: "1", title: "Farmer Lists Paddy" },
            { num: "2", title: "Mill Owner Negotiates" },
            { num: "3", title: "Payment Completed" },
            { num: "4", title: "Transport Managed" },
          ].map((step, idx) => (
            <div key={idx} style={{ flex: "1 1 200px", maxWidth: "260px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "24px", textAlign: "center", position: "relative" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#10B981", color: "#020617", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, margin: "0 auto 16px" }}>
                {step.num}
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{step.title}</h4>
            </div>
          ))}
        </div>
      </section>

      <ImpactStats />
      <FeaturesGrid />
      <VisionSection />

    </div>
  );
}
