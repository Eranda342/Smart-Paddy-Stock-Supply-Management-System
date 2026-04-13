import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Leaf, Wheat, Star, ChevronRight, ArrowRight,
  Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List
} from "lucide-react";
import { PADDY_TYPES_GROUPED } from "../../constants/paddyTypes";

import sambaImg from "../../assets/paddy/samba.jpg";
import naduImg from "../../assets/paddy/nadu.jpg";
import keeriSambaImg from "../../assets/paddy/keeri-samba.jpg";
import suwandelImg from "../../assets/paddy/suwandel.jpg";
import pachchaperumalImg from "../../assets/paddy/pachchaperumal.jpg";
import madathawaluImg from "../../assets/paddy/madathawalu.jpg";

import kuruluthudaImg from "../../assets/paddy/Kuruluthuda.png";
import kakuluImg from "../../assets/paddy/kekulu.jpg";
import bg352Img from "../../assets/paddy/bg 352.jpg";
import bg360Img from "../../assets/paddy/bg 360.jpg";
import bg358Img from "../../assets/paddy/Bg 358.jpg";
import bg366Img from "../../assets/paddy/Bg 366.jpg";
import bg941Img from "../../assets/paddy/Bg 94-1.jpg";
import bg3792Img from "../../assets/paddy/Bg 379-2.jpg";
import at362Img from "../../assets/paddy/At 362.jpg";
import at306Img from "../../assets/paddy/At 306.jpg";
import at405Img from "../../assets/paddy/At 405.jpg";
import ldImg from "../../assets/paddy/ld.jpg";
import bwImg from "../../assets/paddy/bw.jpg";
import h4Img from "../../assets/paddy/H4.jpg";
import redRiceImg from "../../assets/paddy/Red Rice.jpg";
import whiteRiceImg from "../../assets/paddy/kekulu.jpg";
/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CATEGORY_META = {
  "Traditional Varieties": {
    icon: Leaf,
    accent: "#22C55E",
    glow: "rgba(34,197,94,0.18)",
    badge: "Heritage",
    desc: "Ancient cultivars passed down through generations. Known for superior flavour, aroma, and cultural significance.",
  },
  "Improved Varieties (BG Series)": {
    icon: Wheat,
    accent: "#3B82F6",
    glow: "rgba(59,130,246,0.18)",
    badge: "High-Yield",
    desc: "Research-backed BG series developed by Sri Lanka's Rice Research Institute for maximum productivity.",
  },
  "Improved Varieties (AT Series)": {
    icon: Star,
    accent: "#A855F7",
    glow: "rgba(168,85,247,0.18)",
    badge: "Drought-Resistant",
    desc: "AT-series varieties engineered to thrive in water-scarce conditions without sacrificing grain quality.",
  },
  "Other Improved Varieties": {
    icon: Sprout,
    accent: "#F59E0B",
    glow: "rgba(245,158,11,0.18)",
    badge: "Versatile",
    desc: "A broad mix of improved lines offering farmers flexibility across soil types and agro-climatic zones.",
  },
  "Specialty Rice": {
    icon: Star,
    accent: "#EC4899",
    glow: "rgba(236,72,153,0.18)",
    badge: "Premium",
    desc: "Niche varieties commanding premium market prices, prized for colour, texture, and nutritional profiles.",
  },
};

const ALL_BADGES = [...new Set(Object.values(CATEGORY_META).map((m) => m.badge))];
const ALL_CATEGORIES = Object.keys(PADDY_TYPES_GROUPED);
const SORT_OPTIONS = [
  { value: "default", label: "Default order" },
  { value: "az",      label: "Name A → Z" },
  { value: "za",      label: "Name Z → A" },
  { value: "count",   label: "Most varieties" },
];

/* ─────────────────────────────────────────────
   FEATURED VARIETY CARDS — rich showcase data
───────────────────────────────────────────── */
const VARIETY_CARDS = [
  {
    name: "Samba",
    category: "Traditional Varieties",
    image: sambaImg,
    tagline: "Sri Lanka's iconic fragrant grain",
    description: "The soul of Sri Lankan cuisine. Small, plump grains with a distinctive nutty aroma.",
    duration: "4 - 4.5 months",
    region: "Widespread",
    fertilizer: "Organic / Low Chemical",
    tags: [
      { label: "Medium Yield",   color: "#F59E0B" },
      { label: "Premium Price",  color: "#22C55E" },
      { label: "Daily Cooking",  color: "#3B82F6" },
    ],
    accent: "#22C55E",
  },
  {
    name: "Nadu",
    category: "Traditional Varieties",
    image: naduImg,
    tagline: "The everyday workhorse variety",
    description: "Long-grain rice widely grown across all districts. Versatile, affordable, and perfectly suited for both home and commercial use.",
    duration: "4 - 4.5 months",
    region: "Widespread",
    fertilizer: "Organic / Low Chemical",
    tags: [
      { label: "High Yield",     color: "#22C55E" },
      { label: "Low Cost",       color: "#F59E0B" },
      { label: "Bulk Trade",     color: "#3B82F6" },
    ],
    accent: "#4ADE80",
  },
  {
    name: "Keeri Samba",
    category: "Traditional Varieties",
    image: keeriSambaImg,
    tagline: "Small grain, maximum aroma",
    description: "A refined sub-variety of Samba with smaller, rounder grains. Highly aromatic and commands the highest price per kilogram.",
    duration: "4 - 4.5 months",
    region: "Widespread",
    fertilizer: "Organic / Low Chemical",
    tags: [
      { label: "Low Yield",      color: "#EC4899" },
      { label: "Highest Price",  color: "#22C55E" },
      { label: "Special Events", color: "#A855F7" },
    ],
    accent: "#EC4899",
  },
  {
    name: "Suwandel",
    category: "Traditional Varieties",
    image: suwandelImg,
    tagline: "Heritage aromatic heirloom",
    description: "One of Sri Lanka's most revered heritage varieties. Known for its rich fragrance and sweet taste. It requires a steady, reliable water supply.",
    duration: "5 - 6 months",
    region: "Wet & Intermediate zones (Gampaha, Colombo, Kurunegala)",
    fertilizer: "Organic (Cow dung, Gliricidia)",
    tags: [
      { label: "Heritage",       color: "#F97316" },
      { label: "High Value",     color: "#22C55E" },
      { label: "Long-age",       color: "#3B82F6" },
    ],
    accent: "#F97316",
  },
  {
    name: "Pachchaperumal",
    category: "Traditional Varieties",
    image: pachchaperumalImg, 
    tagline: "Resilient Red Grain",
    description: "Highly resilient and can survive in less fertile soils with erratic rainfall. Avoids modern Nitrogen to prevent weakening or lodging.",
    duration: "3.5 - 4 months",
    region: "Dry Zone (Anuradhapura, Polonnaruwa, Hambantota)",
    fertilizer: "Organic",
    tags: [{ label: "Red Grain", color: "#EC4899" }, { label: "Drought-Hardy", color: "#A855F7" }],
    accent: "#EF4444",
  },
  {
    name: "Madathawalu",
    category: "Traditional Varieties",
    image: madathawaluImg,
    tagline: "Adaptable Red Grain",
    description: "A widely adaptable traditional red rice, prized for its nutritional value. Performs best in the Wet and Intermediate zones.",
    duration: "4 - 4.5 months",
    region: "Wet & Intermediate zones",
    fertilizer: "Organic",
    tags: [{ label: "Red Grain", color: "#EC4899" }, { label: "Adaptable", color: "#3B82F6" }],
    accent: "#EF4444",
  },
  {
    name: "Kuruluthuda",
    category: "Traditional Varieties",
    image: kuruluthudaImg,
    tagline: "Salinity-Tolerant Red Grain",
    description: "Has a natural tolerance to mild soil salinity, making it popular in low-lying coastal fields.",
    duration: "3.5 - 4 months",
    region: "Wet Zone & Coastal Areas",
    fertilizer: "Organic",
    tags: [{ label: "Red Grain", color: "#EC4899" }, { label: "Salinity Tolerant", color: "#14B8A6" }],
    accent: "#EF4444",
  },
  {
    name: "Kakulu",
    category: "Traditional Varieties",
    image: kakuluImg,
    tagline: "Bold grain with cultural roots",
    description: "A thick, bold-grained variety with deep cultural significance. Commonly used in traditional Sri Lankan rice and curry meals.",
    duration: "3.5 - 4.5 months",
    region: "Widespread",
    fertilizer: "Organic / Low Chemical",
    tags: [
      { label: "Traditional",    color: "#F59E0B" },
      { label: "Medium Price",   color: "#22C55E" },
      { label: "Local Market",   color: "#3B82F6" },
    ],
    accent: "#F59E0B",
  },
  {
    name: "Bg 352",
    category: "Improved Varieties (BG Series)",
    image: bg352Img,
    tagline: "White Nadu - The Commercial King",
    description: "The undisputed king of Sri Lankan commercial rice. Highly fertilizer-responsive and yields massive harvests.",
    duration: "3.5 months (105 days)",
    region: "Intermediate & Dry Zones",
    fertilizer: "Govt. recommended NPK blends",
    tags: [
      { label: "Very High Yield", color: "#22C55E" },
      { label: "Market Rate",     color: "#3B82F6" },
      { label: "Commercial",      color: "#F59E0B" },
    ],
    accent: "#3B82F6",
  },
  {
    name: "Bg 360",
    category: "Improved Varieties (BG Series)",
    image: bg360Img,
    tagline: "Keeri Samba - Quality meets yield",
    description: "Requires very precise fertilizer management. If a farmer applies too much Nitrogen, this specific plant is highly susceptible to fungal diseases.",
    duration: "3.5 months",
    region: "Intermediate & Dry Zones",
    fertilizer: "Precise NPK needed",
    tags: [
      { label: "High Yield",     color: "#22C55E" },
      { label: "Disease Risk",   color: "#EF4444" },
    ],
    accent: "#60A5FA",
  },
  {
    name: "Bg 358",
    category: "Improved Varieties (BG Series)",
    image: bg358Img,
    tagline: "White Samba Standard",
    description: "The standard, highly reliable Samba. Requires standard NPK applications for premium yields and consistent grain quality.",
    duration: "3.5 months",
    region: "Intermediate & Dry Zones",
    fertilizer: "Standard NPK",
    tags: [{ label: "White Samba", color: "#F59E0B" }, { label: "Reliable", color: "#22C55E" }],
    accent: "#3B82F6",
  },
  {
    name: "Bg 366",
    category: "Improved Varieties (BG Series)",
    image: bg366Img,
    tagline: "Pest-resistant White Nadu",
    description: "A slightly newer alternative to 352, offering strong pest resistance alongside standard NPK nutrient uptake.",
    duration: "3.5 months",
    region: "Intermediate & Dry Zones",
    fertilizer: "Standard NPK",
    tags: [{ label: "White Nadu", color: "#60A5FA" }, { label: "Pest Resistance", color: "#10B981" }],
    accent: "#3B82F6",
  },
  {
    name: "Bg 94-1",
    category: "Improved Varieties (BG Series)",
    image: bg941Img,
    tagline: "Resilient White Samba",
    description: "An older but incredibly resilient strain. It survives and produces decent yields even if farmers cannot afford optimal Phosphorus (TSP).",
    duration: "3.5 months",
    region: "Intermediate & Dry Zones",
    fertilizer: "Tolerates low TSP",
    tags: [{ label: "White Samba", color: "#F59E0B" }, { label: "Resilient", color: "#A855F7" }],
    accent: "#3B82F6",
  },
  {
    name: "Bg 379-2",
    category: "Improved Varieties (BG Series)",
    image: bg3792Img,
    tagline: "Long-age White Nadu",
    description: "An older, highly stable crop that requires a longer sustained fertilizer schedule due to its extended 4-month lifespan.",
    duration: "4 - 4.5 months (Long-age)",
    region: "Intermediate & Dry Zones",
    fertilizer: "Sustained NPK schedule",
    tags: [{ label: "White Nadu", color: "#60A5FA" }, { label: "Long-age", color: "#F59E0B" }],
    accent: "#3B82F6",
  },
  {
    name: "At 362",
    category: "Improved Varieties (AT Series)",
    image: at362Img,
    tagline: "Red Nadu - Coastal Powerhouse",
    description: "A massive commercial success engineered for the Southern coastal belts. High yields with standard chemical fertilizers while resisting soil salinity.",
    duration: "3.5 months",
    region: "Dry Zone & Southern Coastal Belts (Hambantota, Matara)",
    fertilizer: "Standard chemical NPK",
    tags: [
      { label: "Drought-Resistant", color: "#A855F7" },
      { label: "Dry Zone",          color: "#F59E0B" },
    ],
    accent: "#A855F7",
  },
  {
    name: "At 306",
    category: "Improved Varieties (AT Series)",
    image: at306Img,
    tagline: "White Long Grain - Emergency Crop",
    description: "Because it lives for only 90 days, farmers must apply fertilizers rapidly. Often planted as an emergency crop when monsoon rains are delayed.",
    duration: "3 months (Very short-age)",
    region: "Dry Zone & Southern Coastal Belts",
    fertilizer: "Rapid NPK application",
    tags: [{ label: "White Grain", color: "#60A5FA" }, { label: "Emergency Crop", color: "#F43F5E" }],
    accent: "#A855F7",
  },
  {
    name: "At 405",
    category: "Improved Varieties (AT Series)",
    image: at405Img,
    tagline: "White Nadu - Deep South Cultivar",
    description: "A longer-duration crop designed for the deep south regions, requiring a standard, stretched-out NPK schedule.",
    duration: "4 - 4.5 months",
    region: "Deep South Dry Zone",
    fertilizer: "Standard NPK",
    tags: [{ label: "White Nadu", color: "#60A5FA" }, { label: "Long-age", color: "#F59E0B" }],
    accent: "#A855F7",
  },
  {
    name: "Ld 365",
    category: "Other Improved Varieties",
    image: ldImg,
    tagline: "Wet Zone Specialists (Red Nadu/Samba)",
    description: "Bred in Labuduwa specifically to survive the highly acidic, iron-toxic 'iron-rust' soils and flash floods of Galle and Matara.",
    duration: "3.5 months",
    region: "Wet Zone (Galle, Matara)",
    fertilizer: "NPK + Zinc + Burnt paddy husk",
    tags: [{ label: "Wet Zone", color: "#10B981" }, { label: "Iron-toxicity Tolerant", color: "#F59E0B" }],
    accent: "#10B981",
  },
  {
    name: "Ld 368",
    category: "Other Improved Varieties",
    image: ldImg,
    tagline: "Wet Zone Specialists (Red Nadu/Samba)",
    description: "Bred in Labuduwa specifically to survive the highly acidic, iron-toxic 'iron-rust' soils and flash floods of Galle and Matara.",
    duration: "3.5 months",
    region: "Wet Zone (Galle, Matara)",
    fertilizer: "NPK + Zinc + Burnt paddy husk",
    tags: [{ label: "Wet Zone", color: "#10B981" }, { label: "Iron-toxicity Tolerant", color: "#F59E0B" }],
    accent: "#10B981",
  },
  {
    name: "Bw 367",
    category: "Other Improved Varieties",
    image: bwImg,
    tagline: "Deep Bog Specialists",
    description: "Engineered in Bombuwela to survive in deep, muddy, flood-prone bogs in the Kalutara district where standard plants would simply drown.",
    duration: "3.5 months",
    region: "Wet Zone (Kalutara)",
    fertilizer: "NPK + Acidity neutralizers",
    tags: [{ label: "Bog Tolerant", color: "#3B82F6" }, { label: "Flood Resistant", color: "#0EA5E9" }],
    accent: "#0EA5E9",
  },
  {
    name: "Bw 363",
    category: "Other Improved Varieties",
    image: bwImg,
    tagline: "Deep Bog Specialists",
    description: "Engineered in Bombuwela to survive in deep, muddy, flood-prone bogs in the Kalutara district where standard plants would simply drown.",
    duration: "3.5 months",
    region: "Wet Zone (Kalutara)",
    fertilizer: "NPK + Acidity neutralizers",
    tags: [{ label: "Bog Tolerant", color: "#3B82F6" }, { label: "Flood Resistant", color: "#0EA5E9" }],
    accent: "#0EA5E9",
  },
  {
    name: "H4",
    category: "Other Improved Varieties",
    image: h4Img,
    tagline: "The Vintage Hybrid",
    description: "One of the first 'green revolution' varieties released in Sri Lanka. Taller and more rugged than modern Bg types, it yields well even with very low fertilizer inputs.",
    duration: "4 - 4.5 months",
    region: "Dry & Intermediate zones",
    fertilizer: "Tolerates low chemical NPK",
    tags: [{ label: "White Grain", color: "#60A5FA" }, { label: "Vintage 1950s", color: "#F59E0B" }],
    accent: "#F97316",
  },
  {
    name: "Red Rice",
    category: "Specialty Rice",
    image: redRiceImg,
    tagline: "Nutritional powerhouse, premium price",
    description: "Rich in antioxidants and dietary fibre, red rice commands a strong premium in health food markets and export channels.",
    duration: "3.5 - 4.5 months",
    region: "Widespread",
    fertilizer: "Organic / Low Chemical",
    tags: [
      { label: "High Antioxidants", color: "#EC4899" },
      { label: "Export Premium",    color: "#22C55E" },
      { label: "Health Foods",      color: "#F97316" },
    ],
    accent: "#EC4899",
  },
  {
    name: "White Rice",
    category: "Specialty Rice",
    image: whiteRiceImg,
    tagline: "Everyday versatile grade",
    description: "A common unpolished or semi-polished white rice ideal for large-scale milling and daily consumption.",
    duration: "3.5 - 4 months",
    region: "Widespread",
    fertilizer: "Organic / Low Chemical",
    tags: [
      { label: "High Demand",       color: "#3B82F6" },
      { label: "Daily Consumption", color: "#22C55E" },
      { label: "Versatile",         color: "#F97316" },
    ],
    accent: "#3B82F6",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.10 } },
};

/* ─────────────────────────────────────────────
   CUSTOM DROPDOWN
───────────────────────────────────────────── */
function Dropdown({ label, value, onChange, options, accent = "#22C55E" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 16px",
          borderRadius: 9999,
          border: value !== "all" && value !== "default"
            ? `1px solid ${accent}50`
            : "1px solid rgba(255,255,255,0.10)",
          background: value !== "all" && value !== "default"
            ? `${accent}12`
            : "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          color: value !== "all" && value !== "default" ? accent : "rgba(255,255,255,0.70)",
          fontSize: "0.8rem",
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.18s",
        }}
      >
        {selected?.label || label}
        <ChevronDown
          style={{
            width: 13, height: 13,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            opacity: 0.6,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              minWidth: 190,
              zIndex: 100,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(10,14,26,0.97)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
              overflow: "hidden",
              padding: "6px",
            }}
          >
            {options.map((opt) => {
              const active = value === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 9,
                    border: "none",
                    background: active ? `${accent}15` : "transparent",
                    color: active ? accent : "rgba(255,255,255,0.75)",
                    fontSize: "0.82rem",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt.label}
                  {active && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: accent, flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPARISON TABLE
───────────────────────────────────────────── */
const TABLE_COLS = [
  { key: "name",     label: "Variety",         width: "25%" },
  { key: "category", label: "Category",        width: "25%" },
  { key: "yield",    label: "Yield",           width: "20%" },
  { key: "price",    label: "Avg. Price",      width: "20%" },
  { key: "action",   label: "",                width: "10%" },
];

const YIELD_COLOR  = { "Very High": "#22C55E", "High": "#4ADE80", "Medium": "#F59E0B", "Low": "#EC4899" };
const PRICE_COLOR  = { "Highest": "#EC4899",   "High": "#A855F7", "Medium": "#3B82F6", "Low": "#6B7280" };

const TABLE_DATA = [
  { name: "Samba",          category: "Traditional",  yield: "Medium",    price: "High",    season: "Maha & Yala",  zone: "Wet & Dry",   use: "Daily Cooking",     milling: "Good",      accent: "#22C55E" },
  { name: "Nadu",           category: "Traditional",  yield: "High",      price: "Low",     season: "Maha & Yala",  zone: "All Zones",   use: "Bulk / Export",     milling: "Good",      accent: "#4ADE80" },
  { name: "Keeri Samba",    category: "Traditional",  yield: "Low",       price: "Highest", season: "Maha",         zone: "Wet Zone",    use: "Special Events",    milling: "Excellent", accent: "#EC4899" },
  { name: "Suwandel",       category: "Traditional",  yield: "Low",       price: "High",    season: "Maha",         zone: "Wet Zone",    use: "Heritage / Export", milling: "Excellent", accent: "#F97316" },
  { name: "Pachchaperumal", category: "Traditional",  yield: "Medium",    price: "High",    season: "Maha & Yala",  zone: "Dry Zone",    use: "Health / Local",    milling: "Average",   accent: "#EF4444" },
  { name: "Madathawalu",    category: "Traditional",  yield: "Medium",    price: "Medium",  season: "Maha",         zone: "Wet & Int",   use: "Nutritional Health",milling: "Average",   accent: "#EF4444" },
  { name: "Kuruluthuda",    category: "Traditional",  yield: "Medium",    price: "High",    season: "Maha",         zone: "Wet / Coast", use: "Health / Local",    milling: "Good",      accent: "#EF4444" },
  { name: "Kakulu",         category: "Traditional",  yield: "Medium",    price: "Medium",  season: "Maha & Yala",  zone: "All Zones",   use: "Local Market",      milling: "Average",   accent: "#F59E0B" },
  { name: "Bg 352",         category: "BG Series",    yield: "Very High", price: "Low",     season: "Maha & Yala",  zone: "All Zones",   use: "Commercial",        milling: "Good",      accent: "#3B82F6" },
  { name: "Bg 360",         category: "BG Series",    yield: "Very High", price: "Medium",  season: "Maha & Yala",  zone: "All Zones",   use: "Commercial",        milling: "Very Good", accent: "#60A5FA" },
  { name: "Bg 358",         category: "BG Series",    yield: "Very High", price: "High",    season: "Maha & Yala",  zone: "All Zones",   use: "Commercial Samba",  milling: "Excellent", accent: "#3B82F6" },
  { name: "Bg 366",         category: "BG Series",    yield: "High",      price: "Low",     season: "Maha & Yala",  zone: "All Zones",   use: "Pest Res. Trade",   milling: "Good",      accent: "#3B82F6" },
  { name: "Bg 94-1",        category: "BG Series",    yield: "High",      price: "Medium",  season: "Maha & Yala",  zone: "Dry / Int",   use: "Resilient Samba",   milling: "Very Good", accent: "#3B82F6" },
  { name: "Bg 379-2",       category: "BG Series",    yield: "High",      price: "Low",     season: "Maha",         zone: "Dry / Int",   use: "Long-age Comml",    milling: "Good",      accent: "#3B82F6" },
  { name: "At 362",         category: "AT Series",    yield: "Very High", price: "Medium",  season: "Yala",         zone: "Dry / Coast", use: "Drought / Saline",  milling: "Good",      accent: "#A855F7" },
  { name: "At 306",         category: "AT Series",    yield: "Medium",    price: "Medium",  season: "Late Yala",    zone: "Dry / Coast", use: "Emergency Short",   milling: "Average",   accent: "#A855F7" },
  { name: "At 405",         category: "AT Series",    yield: "High",      price: "Low",     season: "Maha",         zone: "Deep South",  use: "Long-age Comml",    milling: "Good",      accent: "#A855F7" },
  { name: "Ld 365",         category: "Other Improved",yield: "Medium",   price: "Medium",  season: "Yala",         zone: "Wet Zone",    use: "Iron-toxic Areas",  milling: "Good",      accent: "#10B981" },
  { name: "Ld 368",         category: "Other Improved",yield: "Medium",   price: "Medium",  season: "Yala",         zone: "Wet Zone",    use: "Iron-toxic Areas",  milling: "Good",      accent: "#10B981" },
  { name: "Bw 367",         category: "Other Improved",yield: "Medium",   price: "Medium",  season: "Maha",         zone: "Wet Zone",    use: "Flood/Bog Areas",   milling: "Average",   accent: "#0EA5E9" },
  { name: "Bw 363",         category: "Other Improved",yield: "Medium",   price: "Medium",  season: "Maha",         zone: "Wet Zone",    use: "Flood/Bog Areas",   milling: "Average",   accent: "#0EA5E9" },
  { name: "H4",             category: "Other Improved",yield: "High",     price: "Low",     season: "Maha & Yala",  zone: "Dry / Int",   use: "Low Chemical Req",  milling: "Good",      accent: "#F97316" },
  { name: "Red Rice",       category: "Specialty",    yield: "Medium",    price: "Highest", season: "Maha",         zone: "Wet Zone",    use: "Health / Export",   milling: "Premium",   accent: "#EC4899" },
  { name: "White Rice",     category: "Specialty",    yield: "Medium",    price: "Medium",  season: "Maha & Yala",  zone: "All Zones",   use: "Local Market",      milling: "Very Good", accent: "#3B82F6" },
];

const MILLING_STAR = { "Excellent": 5, "Premium": 5, "Very Good": 4, "Good": 3, "Average": 2 };

function ComparisonTable({ searchLower, category, badge, sort, sortedCounts }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const filteredData = React.useMemo(() => {
    return TABLE_DATA.filter((row) => {
      const mappedCat = 
        row.category === "Traditional" ? "Traditional Varieties" :
        row.category === "BG Series" ? "Improved Varieties (BG Series)" :
        row.category === "AT Series" ? "Improved Varieties (AT Series)" :
        row.category === "Other Improved" ? "Other Improved Varieties" :
        row.category === "Specialty" ? "Specialty Rice" : row.category;

      if (category && category !== "all" && mappedCat !== category) return false;
      if (badge && badge !== "all" && CATEGORY_META[mappedCat]?.badge !== badge) return false;
      
      if (searchLower) {
        if (!row.name.toLowerCase().includes(searchLower) && 
            !row.category.toLowerCase().includes(searchLower) &&
            !row.use.toLowerCase().includes(searchLower) &&
            !row.zone.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      if (sort === "count" && sortedCounts) {
        const mappedA = a.category === "Traditional" ? "Traditional Varieties" :
          a.category === "BG Series" ? "Improved Varieties (BG Series)" :
          a.category === "AT Series" ? "Improved Varieties (AT Series)" :
          a.category === "Other Improved" ? "Other Improved Varieties" :
          a.category === "Specialty" ? "Specialty Rice" : a.category;
        const mappedB = b.category === "Traditional" ? "Traditional Varieties" :
          b.category === "BG Series" ? "Improved Varieties (BG Series)" :
          b.category === "AT Series" ? "Improved Varieties (AT Series)" :
          b.category === "Other Improved" ? "Other Improved Varieties" :
          b.category === "Specialty" ? "Specialty Rice" : b.category;
        const countA = sortedCounts.find(s => s[0] === mappedA)?.[1].length || 0;
        const countB = sortedCounts.find(s => s[0] === mappedB)?.[1].length || 0;
        if (countB !== countA) return countB - countA;
      }
      return 0;
    });
  }, [searchLower, category, badge, sort, sortedCounts]);

  if (filteredData.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      style={{ padding: "0 5% 80px", maxWidth: 1280, margin: "0 auto" }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.10em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.30)", marginBottom: 8,
        }}>
          Side-by-Side Analysis
        </p>
        <h2 style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 700, letterSpacing: "-0.03em",
          color: "#fff", margin: 0,
        }}>
          Variety Comparison Table
        </h2>
        <p style={{
          fontSize: "0.9rem", color: "rgba(255,255,255,0.45)",
          marginTop: 8, maxWidth: 560,
        }}>
          Compare yield capacity, market price, growing season, zone suitability, and milling quality across all major paddy varieties.
        </p>
      </div>

      {/* Scrollable table wrapper */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        overflowX: "auto",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 640,
          tableLayout: "auto",
        }}>
          {/* Sticky header */}
          <thead>
            <tr style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}>
              {TABLE_COLS.map((col, i) => (
                <th
                  key={col.key}
                  style={{
                    padding: i === 0 ? "14px 20px 14px 24px" : "14px 20px",
                    textAlign: "left",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.38)",
                    whiteSpace: "nowrap",
                    minWidth: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, idx) => {
              const isHovered = hoveredRow === idx;
              const isExpanded = expandedRow === idx;
              const isEven    = idx % 2 === 0;

              return (
                <React.Fragment key={row.name}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : idx)}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: (idx === filteredData.length - 1 && !isExpanded)
                        ? "none"
                        : "1px solid rgba(255,255,255,0.05)",
                      background: isExpanded
                        ? "rgba(255,255,255,0.04)"
                        : isHovered
                        ? `${row.accent}10`
                        : isEven
                        ? "transparent"
                        : "rgba(255,255,255,0.015)",
                      transition: "background 0.18s",
                      cursor: "pointer",
                    }}
                  >
                    {/* Variety name */}
                    <td style={{ padding: "14px 20px 14px 24px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: row.accent, flexShrink: 0,
                          boxShadow: isHovered || isExpanded ? `0 0 8px ${row.accent}` : "none",
                          transition: "box-shadow 0.2s",
                        }} />
                        <span style={{
                          fontSize: "0.875rem", fontWeight: 700,
                          color: isHovered || isExpanded ? "#fff" : "rgba(255,255,255,0.90)",
                          transition: "color 0.18s",
                        }}>
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 500,
                        color: "rgba(255,255,255,0.50)",
                        padding: "2px 10px", borderRadius: 9999,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}>
                        {row.category}
                      </span>
                    </td>

                    {/* Yield */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 600,
                        color: YIELD_COLOR[row.yield] || "#fff",
                        background: `${YIELD_COLOR[row.yield] || "#fff"}15`,
                        border: `1px solid ${YIELD_COLOR[row.yield] || "#fff"}30`,
                        padding: "3px 10px", borderRadius: 9999,
                      }}>
                        {row.yield}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 600,
                        color: PRICE_COLOR[row.price] || "#fff",
                        background: `${PRICE_COLOR[row.price] || "#fff"}15`,
                        border: `1px solid ${PRICE_COLOR[row.price] || "#fff"}30`,
                        padding: "3px 10px", borderRadius: 9999,
                      }}>
                        {row.price}
                      </span>
                    </td>

                    {/* Expand icon */}
                    <td style={{ padding: "14px 20px 14px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "50%",
                        width: 28, height: 28,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        color: isExpanded ? row.accent : "rgba(255,255,255,0.5)",
                        transition: "all 0.2s",
                      }}>
                        <ChevronDown style={{
                          width: 14, height: 14,
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                        }} />
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Details Row */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                        <td colSpan={5} style={{ padding: 0, borderBottom: idx === filteredData.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{
                              padding: "20px 24px 24px",
                              display: "flex", flexWrap: "wrap", gap: 32,
                            }}>
                              {/* Primary Use */}
                              <div style={{ flex: "1 1 180px" }}>
                                <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>Primary Market Use</p>
                                <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#fff" }}>{row.use}</span>
                              </div>

                              {/* Best Season */}
                              <div style={{ flex: "1 1 140px" }}>
                                <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>Growing Season</p>
                                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)" }}>{row.season}</span>
                              </div>

                              {/* Growing Zone */}
                              <div style={{ flex: "1 1 140px" }}>
                                <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>Agricultural Zone</p>
                                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)" }}>{row.zone}</span>
                              </div>

                              {/* Milling Quality */}
                              <div style={{ flex: "1 1 160px" }}>
                                <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>Milling Efficiency</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ display: "flex", gap: 4 }}>
                                    {Array.from({ length: 5 }).map((_, si) => {
                                      const filled = si < (MILLING_STAR[row.milling] || 3);
                                      return (
                                        <div key={si} style={{
                                          width: 8, height: 8, borderRadius: "50%",
                                          background: filled ? row.accent : "rgba(255,255,255,0.12)",
                                          boxShadow: filled ? `0 0 6px ${row.accent}` : "none",
                                        }} />
                                      );
                                    })}
                                  </div>
                                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{row.milling}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Table footer */}
        <div style={{
          padding: "12px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
            {filteredData.length} variet{filteredData.length === 1 ? 'y' : 'ies'} compared · Data sourced from Sri Lanka's Rice Research &amp; Development Institute
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { label: "Yield",   entries: Object.entries(YIELD_COLOR) },
              { label: "Price",   entries: Object.entries(PRICE_COLOR) },
            ].map(({ label, entries }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}:
                </span>
                {entries.map(([k, v]) => (
                  <span key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: "rgba(255,255,255,0.45)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: v, display: "inline-block" }} />
                    {k}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function PaddyTypesPage() {
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("all");
  const [badge,       setBadge]       = useState("all");
  const [sort,        setSort]        = useState("default");
  const [viewMode,    setViewMode]    = useState("grid"); // "grid" | "list"
  const [filterStuck, setFilterStuck] = useState(false);
  const filterRef = useRef(null);
  const sentinelRef = useRef(null);

  /* Sticky sentinel — fires when filter bar leaves its natural position */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFilterStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  /* ── Derived filtered + sorted data ── */
  const allTypes = Object.entries(PADDY_TYPES_GROUPED);
  const searchLower = search.trim().toLowerCase();

  const filtered = allTypes
    .map(([cat, types]) => {
      if (category !== "all" && cat !== category) return null;
      const meta = CATEGORY_META[cat];
      if (badge !== "all" && meta?.badge !== badge) return null;
      
      const matchedTypes = types.filter((t) => {
        if (!searchLower) return true;
        return t.toLowerCase().includes(searchLower) || cat.toLowerCase().includes(searchLower);
      });
      
      if (matchedTypes.length === 0) return null;
      return [cat, matchedTypes];
    })
    .filter(Boolean);

  /* Sort categories AND the varieties within them */
  const sorted = [...filtered].map(([cat, types]) => {
    const sortedTypes = [...types].sort((a, b) => {
      if (sort === "az") return a.localeCompare(b);
      if (sort === "za") return b.localeCompare(a);
      return 0; // maintain original relative order otherwise
    });
    return [cat, sortedTypes];
  }).sort(([catA, typesA], [catB, typesB]) => {
    if (sort === "az")    return catA.localeCompare(catB);
    if (sort === "za")    return catB.localeCompare(catA);
    if (sort === "count") return typesB.length - typesA.length;
    return 0;
  });

  const totalMatches = sorted.reduce((n, [, t]) => n + t.length, 0);

  /* Process Featured Cards explicitly through identical logic */
  const filteredVarietyCards = VARIETY_CARDS.filter(vc => {
    if (category !== "all" && vc.category !== category) return false;
    if (badge !== "all" && CATEGORY_META[vc.category]?.badge !== badge) return false;
    if (searchLower) {
      if (!vc.name.toLowerCase().includes(searchLower) && 
          !vc.category.toLowerCase().includes(searchLower) &&
          !(vc.tagline && vc.tagline.toLowerCase().includes(searchLower)) &&
          !(vc.description && vc.description.toLowerCase().includes(searchLower))) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "za") return b.name.localeCompare(a.name);
    if (sort === "count") {
      const countA = sorted.find(s => s[0] === a.category)?.[1].length || 0;
      const countB = sorted.find(s => s[0] === b.category)?.[1].length || 0;
      if (countB !== countA) return countB - countA;
    }
    return 0;
  });

  /* ── Active filter pills ── */
  const activeFilters = [
    category !== "all" && { key: "category", label: category.replace("Improved Varieties ", "").replace(/[()]/g,""), clear: () => setCategory("all") },
    badge !== "all"    && { key: "badge",    label: badge,                                                             clear: () => setBadge("all") },
    search.trim()      && { key: "search",   label: `"${search}"`,                                                    clear: () => setSearch("") },
    sort !== "default" && { key: "sort",     label: SORT_OPTIONS.find(s=>s.value===sort)?.label,                      clear: () => setSort("default") },
  ].filter(Boolean);

  const clearAll = () => { setSearch(""); setCategory("all"); setBadge("all"); setSort("default"); };

  /* ── Category dropdown options ── */
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];
  const badgeOptions = [
    { value: "all", label: "All Types" },
    ...ALL_BADGES.map((b) => ({ value: b, label: b })),
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#fff",
      fontFamily: "'Inter', 'Outfit', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      <div style={{ position: "absolute", top: "-10%", left: "10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", right: "-10%", width: "40vw", height: "40vh", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{
        position: "relative",
        width: "100%",
        padding: "128px 5% 80px",
        textAlign: "center",
        zIndex: 10,
      }}>
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ position: "relative", zIndex: 3, maxWidth: 780, margin: "0 auto" }}
        >
          <motion.div variants={fadeUp}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 9999,
              border: "1px solid rgba(34,197,94,0.30)", background: "rgba(34,197,94,0.08)",
              fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em",
              color: "#4ADE80", textTransform: "uppercase", marginBottom: 28,
            }}>
              <Sprout style={{ width: 13, height: 13 }} />
              Sri Lankan Paddy Varieties
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
            fontWeight: 700, lineHeight: 1.15,
            letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px",
          }}>
            Explore Every Grain of{" "}
            <span style={{
              background: "linear-gradient(90deg, #22C55E, #10B981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Sri Lankan Paddy
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: "1.125rem", color: "#9CA3AF",
            lineHeight: 1.7, maxWidth: 620, margin: "16px auto 0",
          }}>
            From heritage traditional varieties to high-yield BG series and premium specialty rice — browse the complete guide to paddy cultivated and traded on AgroBridge.
          </motion.p>

          {/* Stat pills */}
          <motion.div variants={fadeUp} style={{
            marginTop: 40, display: "flex",
            justifyContent: "center", gap: 12, flexWrap: "wrap",
          }}>
            {[
              { label: "Total Varieties", value: Object.values(PADDY_TYPES_GROUPED).flat().length },
              { label: "Categories",      value: Object.keys(PADDY_TYPES_GROUPED).length },
              { label: "Districts",       value: "25" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "8px 20px", borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                fontSize: "0.8rem", color: "rgba(255,255,255,0.60)",
              }}>
                <span style={{ color: "#fff", fontWeight: 700, marginRight: 6 }}>{s.value}</span>
                {s.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          CULTIVATION / FERTILIZER DIVIDE MODULE
      ══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto 60px", padding: "0 5%" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(145deg, rgba(34,197,94,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 24,
            padding: "40px 5%",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ADE80" }}>
              <Leaf style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#4ADE80", textTransform: "uppercase", margin: "0 0 4px" }}>
                Cultivation Guide
              </p>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                The Fertilizer Divide
              </h2>
            </div>
          </div>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", margin: 0, maxWidth: 900 }}>
            The biggest dividing line for paddy cultivation is the <strong>fertilizer requirement</strong>. Traditional & Heirloom varieties generally <u>reject heavy chemical fertilizers</u> (using high levels of Urea on these causes them to grow too tall, weaken, and fall over—a phenomenon known as "lodging"). Instead, they thrive on organic nutrients like cow dung, compost, and Gliricidia. In contrast, Improved DOA (Department of Agriculture) varieties are specifically genetically engineered to maximize yields using structured chemical NPK (Nitrogen, Phosphorus, Potassium) blends.
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          STICKY SENTINEL — invisible div that
          triggers the stuck state
      ══════════════════════════════════════ */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: -1 }} />

      {/* ══════════════════════════════════════
          FILTER BAR
      ══════════════════════════════════════ */}
      <div
        ref={filterRef}
        style={{
          position: "sticky",
          top: 64,           /* below the fixed Navbar */
          zIndex: 40,
          padding: filterStuck ? "10px 5%" : "0 5% 0",
          transition: "padding 0.25s ease, background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
          background: filterStuck ? "rgba(2,6,23,0.88)" : "transparent",
          backdropFilter: filterStuck ? "blur(20px)" : "none",
          WebkitBackdropFilter: filterStuck ? "blur(20px)" : "none",
          borderBottom: filterStuck ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          boxShadow: filterStuck ? "0 8px 32px rgba(0,0,0,0.45)" : "none",
        }}
      >
        <div style={{
          maxWidth: 1152,
          margin: "0 auto",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 9999,
          padding: "8px 8px 8px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)",
        }}>

          {/* ── Search input ── */}
          <div style={{
            flex: "1 1 200px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}>
            <Search style={{ width: 15, height: 15, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <input
              id="paddy-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a variety… e.g. Samba, Bg 352"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "0.83rem",
                minWidth: 0,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none", borderRadius: "50%",
                  width: 18, height: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: "0.75rem",
                  flexShrink: 0,
                }}
              >
                <X style={{ width: 10, height: 10 }} />
              </button>
            )}
          </div>

          {/* ── Vertical divider ── */}
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />

          {/* ── Dropdowns ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Dropdown
              label="All Categories"
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              accent="#22C55E"
            />
            <Dropdown
              label="All Types"
              value={badge}
              onChange={setBadge}
              options={badgeOptions}
              accent="#A855F7"
            />
            <Dropdown
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              accent="#3B82F6"
            />
          </div>

          {/* ── Divider ── */}
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />

          {/* ── View mode toggle ── */}
          <div style={{
            display: "flex", gap: 2, padding: "3px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}>
            {[
              { mode: "grid", Icon: LayoutGrid },
              { mode: "list", Icon: List },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                aria-label={`${mode} view`}
                style={{
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 9999, border: "none",
                  background: viewMode === mode ? "rgba(255,255,255,0.15)" : "transparent",
                  color: viewMode === mode ? "#fff" : "rgba(255,255,255,0.40)",
                  cursor: "pointer",
                  transition: "background 0.18s, color 0.18s",
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
              </button>
            ))}
          </div>

          {/* ── Active filter count badge (mobile) ── */}
          {activeFilters.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px",
              borderRadius: 9999,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              fontSize: "0.75rem", fontWeight: 600, color: "#4ADE80",
              flexShrink: 0, cursor: "pointer",
            }} onClick={clearAll}>
              <SlidersHorizontal style={{ width: 11, height: 11 }} />
              {activeFilters.length} active
              <X style={{ width: 10, height: 10, opacity: 0.7 }} />
            </div>
          )}
        </div>

        {/* ── Active filter pills row ── */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              key="pills"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                maxWidth: 1152, margin: "0 auto",
                display: "flex", alignItems: "center",
                gap: 8, flexWrap: "wrap",
                paddingLeft: 8,
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                Filters:
              </span>
              {activeFilters.map((f) => (
                <motion.button
                  key={f.key}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={f.clear}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.80)",
                    fontSize: "0.74rem", fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                >
                  {f.label}
                  <X style={{ width: 9, height: 9, opacity: 0.6 }} />
                </motion.button>
              ))}
              <button
                onClick={clearAll}
                style={{
                  fontSize: "0.72rem", fontWeight: 500,
                  color: "rgba(255,255,255,0.35)",
                  background: "none", border: "none",
                  cursor: "pointer", padding: "2px 4px",
                  textDecoration: "underline",
                }}
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════
          RESULTS META ROW
      ══════════════════════════════════════ */}
      <div style={{
        maxWidth: 1280, margin: "28px auto 0",
        padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: 0 }}>
          Showing{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>{totalMatches}</span>
          {" "}variet{totalMatches === 1 ? "y" : "ies"} across{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>{sorted.length}</span>
          {" "}categor{sorted.length === 1 ? "y" : "ies"}
        </p>
      </div>

      {/* ══════════════════════════════════════
          FEATURED VARIETY CARDS
      ══════════════════════════════════════ */}
      {filteredVarietyCards.length > 0 && (
        <section style={{ padding: "24px 5% 0", maxWidth: 1280, margin: "0 auto" }}>
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <AnimatePresence mode="popLayout">
            {filteredVarietyCards.map((vc) => (
              <motion.div
                key={vc.name}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -15 }}
                whileHover={{ scale: 1.04, y: -4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  overflow: "hidden",
                  cursor: "default",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.25s, box-shadow 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${vc.accent}50`;
                  e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${vc.accent}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
                }}
              >
                {/* Card image */}
                <div style={{ position: "relative", height: 180, overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={vc.image}
                    alt={vc.name}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.5s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Gradient overlay on image */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(to top, rgba(2,6,23,0.85) 0%, transparent 55%)`,
                    pointerEvents: "none",
                  }} />
                  {/* Category badge on image */}
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    padding: "3px 10px",
                    borderRadius: 9999,
                    fontSize: "0.68rem", fontWeight: 700,
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    color: vc.accent,
                    background: `rgba(2,6,23,0.75)`,
                    border: `1px solid ${vc.accent}40`,
                    backdropFilter: "blur(8px)",
                  }}>
                    {CATEGORY_META[vc.category]?.badge || "Variety"}
                  </span>
                </div>

                {/* Card body */}
                <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {/* Title + tagline */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: vc.accent, flexShrink: 0,
                        boxShadow: `0 0 8px ${vc.accent}`,
                      }} />
                      <h3 style={{
                        fontSize: "1.1rem", fontWeight: 700,
                        letterSpacing: "-0.02em", color: "#fff", margin: 0,
                      }}>
                        {vc.name}
                      </h3>
                    </div>
                    <p style={{
                      fontSize: "0.75rem", fontWeight: 500,
                      color: vc.accent, margin: 0, opacity: 0.85,
                    }}>
                      {vc.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.65,
                    margin: 0,
                    flex: 1,
                  }}>
                    {vc.description}
                  </p>

                  {/* Cultivation Data */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Duration</span>
                      <span style={{ fontSize: "0.8rem", color: "#E5E7EB", fontWeight: 500 }}>{vc.duration || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Fertilizer</span>
                      <span style={{ fontSize: "0.8rem", color: "#E5E7EB", fontWeight: 500 }}>{vc.fertilizer || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Region</span>
                      <span style={{ fontSize: "0.8rem", color: "#E5E7EB", fontWeight: 500 }}>{vc.region || "N/A"}</span>
                    </div>
                  </div>

                  {/* Tag badges */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {vc.tags.map((tag) => (
                      <span
                        key={tag.label}
                        style={{
                          padding: "3px 10px",
                          borderRadius: 9999,
                          fontSize: "0.7rem", fontWeight: 600,
                          color: tag.color,
                          background: `${tag.color}15`,
                          border: `1px solid ${tag.color}30`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {/* Divider between featured cards and full reference grid */}
      {filteredVarietyCards.length > 0 && sorted.length > 0 && (
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
          margin: "60px 8% 0",
        }} />
      )}

      {sorted.length > 0 && (
        <div style={{ maxWidth: 1280, margin: "20px auto 0", padding: "0 5%" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: 0 }}>
            Complete Reference — All Varieties
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════
          VARIETY GRID
      ══════════════════════════════════════ */}
      <section style={{ padding: "24px 5% 100px", maxWidth: 1280, margin: "0 auto" }}>
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)" }}
          >
            <Wheat style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>No varieties match your filters</p>
            <button
              onClick={clearAll}
              style={{
                marginTop: 16, padding: "8px 20px", borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.65)", fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-40px" }}
            style={{ display: "flex", flexDirection: "column", gap: 56 }}
          >
            {sorted.map(([category, types]) => {
              const meta = CATEGORY_META[category] || {
                icon: Sprout, accent: "#22C55E",
                glow: "rgba(34,197,94,0.18)", badge: "Variety", desc: "",
              };
              const Icon = meta.icon;

              return (
                <motion.div key={category} variants={fadeUp}>
                  {/* Category header */}
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    gap: 16, marginBottom: 24, flexWrap: "wrap",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `linear-gradient(135deg, ${meta.accent}22, ${meta.accent}10)`,
                      border: `1px solid ${meta.accent}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, boxShadow: `0 0 20px ${meta.glow}`,
                    }}>
                      <Icon style={{ width: 20, height: 20, color: meta.accent }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        gap: 10, marginBottom: 6, flexWrap: "wrap",
                      }}>
                        <h2 style={{
                          fontSize: "1.2rem", fontWeight: 700,
                          letterSpacing: "-0.02em", color: "#fff", margin: 0,
                        }}>
                          {category}
                        </h2>
                        <span style={{
                          padding: "2px 10px", borderRadius: 9999,
                          fontSize: "0.7rem", fontWeight: 600,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                          color: meta.accent, background: `${meta.accent}18`,
                          border: `1px solid ${meta.accent}33`,
                        }}>
                          {meta.badge}
                        </span>
                        <span style={{
                          fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontWeight: 500,
                        }}>
                          {types.length} {types.length === 1 ? "variety" : "varieties"}
                        </span>
                      </div>
                      {meta.desc && (
                        <p style={{
                          fontSize: "0.875rem", color: "rgba(255,255,255,0.50)",
                          margin: 0, lineHeight: 1.6,
                        }}>
                          {meta.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Variety cards */}
                  {viewMode === "grid" ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 12,
                    }}>
                      {types.map((type, idx) => {
                        // Find if we have a specific image in VARIETY_CARDS, otherwise use a high-quality default fallback
                        const featuredData = VARIETY_CARDS.find(vc => vc.name === type);
                        const cardImage = featuredData?.image || "https://images.unsplash.com/photo-1595185566373-19bd691655b3?auto=format&fit=crop&w=600&q=80"; // A nice default paddy field

                        return (
                          <motion.div
                            key={type}
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ duration: 0.18 }}
                            style={{
                              position: "relative",
                              height: 160,
                              borderRadius: 12,
                              overflow: "hidden",
                              cursor: "default",
                              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${meta.accent}40`;
                              const img = e.currentTarget.querySelector("img");
                              if (img) img.style.transform = "scale(1.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.08)";
                              const img = e.currentTarget.querySelector("img");
                              if (img) img.style.transform = "scale(1)";
                            }}
                          >
                            {/* Background Image */}
                            <img
                              src={cardImage}
                              alt={type}
                              style={{
                                width: "100%", height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition: "transform 0.4s ease",
                              }}
                            />

                            {/* Gradient Overlay (from bottom black/80 to transparent) */}
                            <div style={{
                              position: "absolute", inset: 0,
                              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)",
                              pointerEvents: "none",
                            }} />

                            {/* Accent line top left */}
                            <div aria-hidden style={{
                              position: "absolute", top: 0, left: 0,
                              width: 30, height: 3,
                              background: meta.accent,
                              borderBottomRightRadius: 4,
                            }} />

                            {/* Content positioned at bottom */}
                            <div style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              padding: "16px",
                              display: "flex", flexDirection: "column", gap: 2,
                            }}>
                              <span style={{ fontSize: "0.68rem", color: meta.accent, fontWeight: 700, letterSpacing: "0.05em" }}>
                                #{String(idx + 1).padStart(2, "0")}
                              </span>
                              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                                {type}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* List view */
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {types.map((type, idx) => (
                        <motion.div
                          key={type}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 16px", borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.07)",
                            background: "rgba(255,255,255,0.03)",
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${meta.accent}30`;
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          }}
                        >
                          <span style={{
                            fontSize: "0.7rem", fontWeight: 600, color: meta.accent,
                            background: `${meta.accent}15`, padding: "2px 8px",
                            borderRadius: 6, flexShrink: 0,
                          }}>
                            #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: meta.accent, flexShrink: 0,
                          }} />
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff", flex: 1 }}>
                            {type}
                          </span>
                          <span style={{
                            fontSize: "0.72rem", color: "rgba(255,255,255,0.30)",
                            fontWeight: 500, flexShrink: 0,
                          }}>
                            {meta.badge}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════════════
          COMPARISON TABLE
      ══════════════════════════════════════ */}
      <ComparisonTable 
        searchLower={searchLower} 
        category={category} 
        badge={badge} 
        sort={sort}
        sortedCounts={sorted}
      />

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        style={{
          padding: "0 5% 96px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 20,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "96px 5%",
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
          <p style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#4ADE80",
            marginBottom: 20,
          }}>
            Ready to start trading?
          </p>

          {/* Headline */}
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.75rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            color: "#fff",
            margin: "0 auto 16px",
            maxWidth: 560,
          }}>
            Find and trade every paddy variety on AgroBridge
          </h2>

          {/* Subtext */}
          <p style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
            maxWidth: 440,
            margin: "0 auto 40px",
          }}>
            Connect directly with verified farmers and mill owners across all 25 districts of Sri Lanka.
          </p>

          {/* Buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
            {/* Primary */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register/role"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: 9999,
                  background: "#22C55E",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  boxShadow: "0 0 20px rgba(34,197,94,0.35)",
                  transition: "background 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#16A34A";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(34,197,94,0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#22C55E";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.35)";
                }}
              >
                Get Started Free
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </motion.div>

            {/* Ghost secondary */}
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "13px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              Sign in to your account
            </Link>
          </div>

          {/* Trust note */}
          <p style={{
            marginTop: 28,
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.22)",
          }}>
            Free registration · No credit card required · Verified by AgroBridge
          </p>
        </div>
      </motion.section>
    </div>
  );
}
