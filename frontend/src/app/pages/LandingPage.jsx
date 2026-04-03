import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  FileText
} from "lucide-react";

export default function LandingPage() {
  const [stats, setStats] = useState({
    users: 12500, // Fallback defaults
    listings: 4200,
    transactions: 850,
    districts: 25
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Attempt to fetch real data
        // Using sample endpoints, gracefully falling back on errors
        const listingsRes = await axios.get("http://localhost:5000/api/listings").catch(() => null);
        
        // Update state where data was retrieved successfully
        setStats(prev => ({
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
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white selection:bg-[#22C55E]/30 overflow-hidden relative font-sans">
      
      {/* STATIC AMBIENT LIGHT */}
      <div className="absolute top-0 inset-x-0 h-[1000px] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.15),transparent_70%)] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between py-4 px-[5%] lg:px-[10%] bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#22C55E] to-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#22C55E]/20">
            <Sprout className="w-6 h-6 text-[#0A0D14]" />
          </div>
          <span className="text-2xl font-bold tracking-tight">AgroBridge</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/register/role"
              className="px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:scale-105 inline-block"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative flex flex-col justify-center px-[5%] lg:px-[10%] py-40">
        <div className="absolute inset-0 z-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')" }} />
        
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-gray-300 text-sm font-medium mb-8">
              <Activity className="w-4 h-4 text-[#22C55E]" />
              <span>Sri Lanka's Premium Digital Grain Market</span>
            </div>
            
            <motion.h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] text-white">
              Trade Smarter with<br/>
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Verified Agriculture
              </span>
            </motion.h1>

            <motion.p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              A secure, high-performance platform empowering <strong>Farmers</strong> to sell directly and <strong>Mill Owners</strong> to source efficiently, backed by real-time data.
            </motion.p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <motion.div whileHover={{ y: -2 }} variants={fadeUp}>
              <Link
                to="/register/role"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-lg transition-all duration-300 group shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} variants={fadeUp}>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-transparent hover:bg-white/5 border border-white/20 text-white font-semibold rounded-lg backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:scale-105 group"
              >
                Explore Marketplace
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-32 mx-[10%]" />

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
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-10 rounded-lg ${i === 1 ? 'bg-gradient-to-r from-green-500/20 to-transparent border-l-2 border-green-500' : 'bg-white/5 hover:bg-white/10'} w-full transition-colors`}></div>
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
                {/* Fake Chart bars */}
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
            { icon: Users, label: "Active Users", value: stats.users, prefix: "", suffix: "+" },
            { icon: BarChart2, label: "Transactions", value: stats.transactions, prefix: "LKR ", suffix: "M+ traded" },
            { icon: FileText, label: "Live Listings", value: stats.listings, prefix: "", suffix: "" },
            { icon: ShieldCheck, label: "Verified Districts", value: stats.districts, prefix: "", suffix: "/25" },
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
                transition={{ delay: 0.6 + (i * 0.15), duration: 0.5 }}
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
            { icon: ShieldCheck, title: "100% Verified Network", desc: "Every single farmer and mill owner is manually vetted by our administration team. Zero bots, zero scammers." },
            { icon: BarChart2, title: "Market Analytics", desc: "Make informed decisions with real-time analytics, historical pricing trends, and supply metrics directly in your dashboard." },
            { icon: Truck, title: "Secure Transport", desc: "Integrated end-to-end logistics tracking means your paddy is monitored from the farm gate to the mill silo." }
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
              "End-to-end logistics tracking"
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

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 bg-black/40">
        <div className="max-w-[1320px] mx-auto px-[5%] lg:px-[10%] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <Sprout className="w-5 h-5 text-[#22C55E]" />
            <span className="font-bold text-white">AgroBridge SaaS</span>
          </div>
          <div className="text-sm text-white/40">
            © 2026 AgroBridge. Modernizing Sri Lanka's Paddy Supply Chain.
          </div>
        </div>
      </footer>
    </div>
  );
}