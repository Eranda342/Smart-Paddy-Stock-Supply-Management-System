import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import CountUp from "react-countup";
import {
  Sprout,
  Users,
  Truck,
  BarChart2,
  ShieldCheck,
  ArrowRight,
  Activity,
  CheckCircle,
  Building2,
  FileText,
  Menu,
  X,
} from "lucide-react";
import Logo from "../components/ui/Logo";



/* ══════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════ */
export default function LandingPage() {
  const [stats, setStats] = useState({
    users: 12500,
    listings: 4200,
    transactions: 850,
    districts: 25,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const listingsRes = await axios
          .get("http://localhost:5000/api/listings")
          .catch(() => null);
        setStats((prev) => ({
          ...prev,
          listings: listingsRes?.data?.length || prev.listings,
        }));
      } catch (err) {
        console.error("Failed to fetch live stats, using fallbacks:", err);
      }
    };
    fetchStats();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white selection:bg-[#22C55E]/30 overflow-hidden relative font-sans">

      {/* STATIC AMBIENT LIGHT */}
      <div className="absolute top-0 inset-x-0 h-[1000px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.15),transparent_70%)] pointer-events-none" />

      {/* HERO SECTION 2-COLUMN LAYER */}
      <div className="pt-24 lg:pt-32">
        <div className="relative pb-20 lg:pb-32 px-[5%] lg:px-[10%]">
          <div className="absolute inset-0 z-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')" }} />

          <div className="relative z-10 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
              
              {/* LEFT COLUMN - CONTENT */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="text-center lg:text-left flex flex-col items-center lg:items-start"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-gray-300 text-sm font-medium mb-8">
                <Activity className="w-4 h-4 text-[#22C55E]" />
                <span>Sri Lanka's Premium Digital Grain Market</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter mb-6 leading-[1.05] text-white">
                Connect Farmers & <br className="hidden lg:block text-transparent" />
                <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">Mill Owners </span>
                Seamlessly
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
                AgroBridge is Sri Lanka's digital paddy marketplace — buy, sell, negotiate, and manage transport all in one platform.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
                <Link
                  to="/register/role"
                  className="w-full sm:w-auto px-8 py-4 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 group hover:scale-[1.02]"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/features/farmer"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center hover:scale-[1.02]"
                >
                  Explore Platform
                </Link>
              </motion.div>

              {/* QUICK ACTIONS */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full lg:w-auto">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">I am a:</span>
                <div className="flex items-center gap-3">
                  <Link to="/features/farmer" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-[#22C55E]/50 hover:bg-[#22C55E]/10 text-white transition-all text-sm font-medium group">
                    <Sprout className="w-4 h-4 text-[#22C55E]" /> Farmer
                  </Link>
                  <Link to="/features/mill-owner" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-[#22C55E]/50 hover:bg-[#22C55E]/10 text-white transition-all text-sm font-medium group">
                    <Building2 className="w-4 h-4 text-blue-400" /> Mill Owner
                  </Link>
                </div>
              </motion.div>

              {/* TRUST INDICATORS */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 pt-6 border-t border-white/5 w-full">
                {[
                  "Verified Users", 
                  "Secure Transactions", 
                  "Real-Time Negotiation"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400 font-medium tracking-wide">
                    <CheckCircle className="w-4 h-4 text-[#22C55E]" /> {text}
                  </div>
                ))}
              </motion.div>

            </motion.div>

            {/* RIGHT COLUMN - VISUAL GRAPHIC */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block h-[500px] w-full"
            >
              {/* Abstract decorative circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#22C55E]/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#22C55E]/20 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

              {/* Floating UI Elements */}
              <div className="absolute right-10 top-10 w-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl animate-[translate-y_6s_ease-in-out_infinite] hover:border-[#22C55E]/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">MO</div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none">New Offer Received</p>
                      <p className="text-xs text-white/50 mt-1">Araliya Mills</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E]" />
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center border border-white/5">
                  <span className="text-xs text-white/50">LKR 115 / Kg</span>
                  <span className="text-xs font-bold text-[#22C55E]">Accept</span>
                </div>
              </div>

              <div className="absolute left-0 bottom-20 w-80 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl animate-[translate-y_8s_ease-in-out_infinite_reverse] hover:border-[#22C55E]/40 transition-colors" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] border border-[#22C55E]/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none mb-1">Transport Assigned</p>
                    <p className="text-xs text-white/50">Driver: WP-1234</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-[#22C55E]" />
                </div>
                <p className="text-[10px] text-right text-white/40 mt-2 font-medium uppercase tracking-wider">In Transit</p>
              </div>

              {/* Center Main floating element */}
              <div className="absolute left-1/2 top-1/2 -translate-x-[40%] -translate-y-1/2 w-64 bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 hover:scale-105 transition-transform duration-500">
                 <div className="flex justify-between items-center mb-6">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><BarChart2 className="w-4 h-4 text-white" /></div>
                    <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded">Live</span>
                 </div>
                 <p className="text-xs text-white/50 font-medium uppercase tracking-widest mb-1">Total Trading Volume</p>
                 <h3 className="text-3xl font-black text-white mb-4">840<span className="text-lg text-white/50 font-medium">.5 MT</span></h3>
                 
                 {/* Mini graph */}
                 <div className="flex items-end gap-1.5 h-16 mt-4">
                    {[30, 45, 25, 60, 50, 75, 40, 90].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm ${i === 7 ? 'bg-[#22C55E]' : 'bg-white/10'}`} style={{ height: `${h}%` }} />
                    ))}
                 </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Decorative separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-32 mx-[5%] lg:mx-[10%]" />

      {/* PRODUCT PREVIEW SECTION */}
      <motion.div
        className="px-[5%] lg:px-[10%] relative z-20 mb-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight mb-6">Powerful Dashboard for Real-Time Decisions</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-300 max-w-2xl mx-auto">Track listings, transactions, and market trends in one place.</motion.p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          viewport={{ once: true }}
          className="relative max-w-[1100px] mx-auto rounded-2xl glass-card bg-[#0B0E14]/80 backdrop-blur-2xl border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] hover:shadow-[0_0_80px_rgba(34,197,94,0.15)] transition-all duration-700 ease-out hover:scale-[1.01] overflow-hidden"
        >
          {/* OS Header */}
          <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-5 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>

          {/* Mock Dashboard Body */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar mock */}
            <div className="hidden md:flex flex-col gap-4">
              <div className="h-10 bg-white/5 rounded-lg w-full mb-4"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-10 rounded-lg ${i === 1 ? "bg-gradient-to-r from-green-500/20 to-transparent border-l-2 border-green-500" : "bg-white/5 hover:bg-white/10"} w-full transition-colors`}></div>
              ))}
            </div>

            {/* Main content mock */}
            <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="h-28 bg-gradient-to-br from-green-500/10 to-transparent border border-white/5 rounded-2xl p-4 flex flex-col justify-end">
                  <div className="w-1/2 h-3 bg-white/20 rounded mb-2"></div>
                  <div className="w-3/4 h-6 bg-white/40 rounded"></div>
                </div>
                <div className="h-28 bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5 rounded-2xl p-4 flex flex-col justify-end">
                  <div className="w-1/2 h-3 bg-white/20 rounded mb-2"></div>
                  <div className="w-2/3 h-6 bg-white/40 rounded"></div>
                </div>
                <div className="hidden md:flex h-28 bg-gradient-to-br from-purple-500/10 to-transparent border border-white/5 rounded-2xl p-4 flex-col justify-end">
                  <div className="w-1/2 h-3 bg-white/20 rounded mb-2"></div>
                  <div className="w-4/5 h-6 bg-white/40 rounded"></div>
                </div>
              </div>

              <div className="flex-1 h-64 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden flex items-end px-6 gap-4 pb-0 pt-8 mt-2">
                {[40, 70, 45, 90, 65, 80, 50, 100, 75, 40].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#22C55E]/10 to-[#22C55E]/30 rounded-t-md hover:to-[#22C55E]/60 transition-colors border-t border-[#22C55E]/50"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="px-[5%] lg:px-[10%] relative z-20 mt-20 mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <p className="text-sm font-semibold text-white/40 mb-8 tracking-wide">Trusted by farmers and mill owners across 25 districts</p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {[
            { name: "Araliya Mills" },
            { name: "Nipuna Rice" },
            { name: "Rajarata Farms" },
            { name: "New Ratna" },
            { name: "Hiru Traders" },
          ].map((brand, i) => (
            <div
              key={i}
              className="text-xl md:text-2xl font-extrabold tracking-tight text-white/20 grayscale hover:grayscale-0 hover:text-[#22C55E] transition-all duration-300 cursor-default select-none flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center -ml-2">
                <div className="w-2 h-2 rounded-full bg-current opacity-50" />
              </div>
              {brand.name}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-32 mx-[10%]" />

      {/* STATS SECTION (DYNAMIC) */}
      <motion.div
        className="relative z-20 px-[5%] lg:px-[10%] mb-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Users,       label: "Active Users",       value: stats.users,        prefix: "",      suffix: "+" },
            { icon: BarChart2,   label: "Transactions",       value: stats.transactions, prefix: "LKR ",  suffix: "M+ traded" },
            { icon: FileText,    label: "Live Listings",      value: stats.listings,     prefix: "",      suffix: "" },
            { icon: ShieldCheck, label: "Verified Districts", value: stats.districts,    prefix: "",      suffix: "/25" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="glass-card bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:border-green-400/50 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#10B981]/10 flex items-center justify-center mb-5 text-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-shadow">
                <stat.icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-2 text-white flex items-center justify-center">
                {stat.prefix}
                <CountUp end={stat.value} duration={2.5} separator="," useEasing={true} />
                {stat.suffix}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-sm font-medium text-gray-300"
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          className="text-center text-white/30 mt-8 text-xs md:text-sm uppercase tracking-[0.2em] font-semibold"
        >
          ACROSS SRI LANKA
        </motion.p>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 mx-[10%]" />

      {/* TRUST / FEATURES SECTION */}
      <motion.div
        className="px-[5%] lg:px-[10%] relative mb-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div
          className="text-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight mb-6">Why Choose AgroBridge?</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-300 max-w-2xl mx-auto">We've built the most reliable, high-performance supply chain network for Sri Lankan agriculture.</motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {[
            { icon: ShieldCheck, title: "100% Verified Network",  desc: "Every single farmer and mill owner is manually vetted by our administration team. Zero bots, zero scammers." },
            { icon: BarChart2,   title: "Market Analytics",       desc: "Make informed decisions with real-time analytics, historical pricing trends, and supply metrics directly in your dashboard." },
            { icon: Truck,       title: "Secure Transport",       desc: "Integrated end-to-end logistics tracking means your paddy is monitored from the farm gate to the mill silo." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="glass-card bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-green-400/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] group cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22C55E]/20 to-blue-500/20 flex items-center justify-center mb-6 text-[#22C55E] group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <feature.icon className="w-7 h-7" />
              </div>
              <motion.h3 variants={fadeUp} className="text-xl font-bold mb-4">{feature.title}</motion.h3>
              <motion.p variants={fadeUp} className="text-gray-300 leading-relaxed">{feature.desc}</motion.p>
              <div className="mt-6 flex items-center gap-2 text-[#22C55E] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* HIGHLIGHT SECTION */}
      <motion.div
        className="px-[5%] lg:px-[10%] mt-24 relative z-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="relative max-w-4xl mx-auto glass-card bg-gradient-to-br from-[#0B0E14] to-[#151A23] border border-white/5 p-10 md:p-16 rounded-3xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(34,197,94,0.15)] hover:border-[#22C55E]/30 transition-all duration-500 group">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-10 text-white relative z-10 tracking-tight">
            Built for the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#10B981]">Agriculture</span>
          </h2>

          <ul className="space-y-6 text-lg md:text-xl text-white/70 relative z-10">
            {[
              "Real-time pricing intelligence",
              "Secure verified trading system",
              "End-to-end logistics tracking",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] shrink-0 border border-[#22C55E]/20 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-32 mx-[10%]" />

      {/* FINAL CTA SECTION */}
      <motion.div
        className="px-[5%] lg:px-[10%] py-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div
          variants={fadeUp}
          className="relative bg-white/5 backdrop-blur-md border border-white/10 py-24 px-12 rounded-3xl text-center overflow-hidden transition-all duration-500"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10">Start Trading Smarter Today</h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto relative z-10">
            Join the digital revolution in agriculture. Register today to access premium tools, verified contacts, and secure transactions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <motion.div whileHover={{ y: -2 }}>
              <Link
                to="/register/role"
                className="w-full sm:w-auto px-12 py-6 bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold text-xl rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:scale-105 flex items-center justify-center gap-3 group"
              >
                <CheckCircle className="w-6 h-6" /> Free Registration
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ══ NEED HELP SECTION ══ */}
      <motion.div
        className="px-[5%] lg:px-[10%] py-24 relative z-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Need Help?</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Buying or selling paddy can be complex. We're here to guide you through every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1 — Contact Support */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col gap-5 hover:border-[#22C55E]/40 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-300 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#10B981]/10 flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Contact Support</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Get help with transactions, transport, or your account from our dedicated support team.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-[#22C55E] font-semibold text-sm hover:gap-3 transition-all duration-200 group/link"
            >
              Contact Us
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 2 — User Guide */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col gap-5 hover:border-[#22C55E]/40 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-300 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#10B981]/10 flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">User Guide</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Learn how to use AgroBridge effectively with step-by-step guides on listings, negotiations, and more.
              </p>
            </div>
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 text-[#22C55E] font-semibold text-sm hover:gap-3 transition-all duration-200 group/link"
            >
              Learn More
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/5 bg-black/50 backdrop-blur-md">

        {/* 4-column link grid */}
        <div className="max-w-[1320px] mx-auto px-[5%] lg:px-[10%] py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">

            {/* Col 1 — Brand + tagline */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
              <div className="opacity-90 hover:opacity-100 transition-opacity">
                <Logo size="sm" subtitle="SaaS" />
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">
                Sri Lanka's premium digital grain market, connecting farmers and mill owners.
              </p>
            </div>

            {/* Col 2 — Farmers */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Farmers</h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Create Listing",  to: "/features/farmer" },
                  { label: "My Listings",     to: "/features/farmer" },
                  { label: "Negotiations",    to: "/features/farmer" },
                  { label: "Transactions",    to: "/features/farmer" },
                ].map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/40 hover:text-[#22C55E] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Mill Owners */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Mill Owners</h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Browse Listings", to: "/features/mill-owner" },
                  { label: "Buy Requests",    to: "/features/mill-owner" },
                  { label: "Negotiations",    to: "/features/mill-owner" },
                  { label: "Transport",       to: "/features/mill-owner" },
                ].map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/40 hover:text-[#22C55E] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Company</h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "About AgroBridge", to: "/about" },
                  { label: "Contact",          to: "/contact" },
                  { label: "Terms of Service", to: "/terms" },
                  { label: "Privacy Policy",   to: "/privacy" },
                ].map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/40 hover:text-[#22C55E] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="max-w-[1320px] mx-auto px-[5%] lg:px-[10%] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              © 2026 AgroBridge. All rights reserved. Modernizing Sri Lanka's Paddy Supply Chain.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms"   className="text-xs text-white/30 hover:text-[#22C55E] transition-colors">Terms</Link>
              <Link to="/privacy" className="text-xs text-white/30 hover:text-[#22C55E] transition-colors">Privacy</Link>
              <Link to="/about"   className="text-xs text-white/30 hover:text-[#22C55E] transition-colors">About</Link>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}