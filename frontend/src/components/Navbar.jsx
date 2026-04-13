import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "../app/components/ui/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home",        href: "/" },
    { label: "Paddy Types", href: "/paddy-types" },
    { label: "Fertilizers", href: "/fertilizers" },
    { label: "Transport",   href: "/transport" },
    { label: "About",       href: "/about" },
  ];

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/60 backdrop-blur-lg border-b border-white/10 shadow-lg py-3" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-[5%] flex items-center justify-between">
          
          {/* LEFT: Logo */}
          <Link to="/" className="shrink-0">
            <Logo size="md" />
          </Link>

          {/* CENTER: Nav pill */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => 
                  `relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-200 ${
                    isActive 
                      ? "text-white bg-white/10 border border-white/10" 
                      : "text-white/60 border border-transparent hover:text-green-400 hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* RIGHT: Auth buttons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="px-4 py-1.5 text-[13px] font-medium text-white/65 hover:text-green-400 transition-colors duration-200 border border-transparent hover:border-white/10 rounded-full hover:bg-white/5"
            >
              Login
            </Link>

            <Link
              to="/register/role"
              className="inline-flex items-center gap-1.5 px-4.5 py-1.5 text-[13px] font-semibold text-white bg-[#22C55E] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-[#16A34A] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-200"
              style={{ paddingLeft: '18px', paddingRight: '18px', paddingTop: '7px', paddingBottom: '7px' }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* MOBILE: Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed top-[72px] left-3 right-3 z-40 rounded-[18px] border border-white/10 bg-[#020617]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden p-4"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => 
                  `block px-4 py-2.5 rounded-xl mb-0.5 text-[14px] font-medium transition-colors duration-150 ${
                    isActive 
                      ? "text-white bg-white/10 border border-white/10" 
                      : "text-white/60 border border-transparent hover:text-green-400 hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="h-px bg-white/10 my-2.5" />

            <Link
              to="/login"
              className="block px-4 py-2.5 rounded-xl text-[14px] font-medium text-white/60 hover:text-green-400 hover:bg-white/5 transition-colors mb-1.5"
            >
              Login
            </Link>
            <Link
              to="/register/role"
              className="block px-4 py-2.5 rounded-xl text-[14px] font-semibold text-center text-white bg-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:bg-[#16A34A] transition-colors"
            >
              Get Started →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
