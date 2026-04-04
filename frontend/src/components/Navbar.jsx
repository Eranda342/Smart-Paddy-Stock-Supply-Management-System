import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home",        href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Paddy Types", href: "/paddy-types" },
    { label: "Fertilizers", href: "/fertilizers" },
    { label: "Transport",   href: "/transport" },
    { label: "About",       href: "/about" },
  ];

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <motion.header
        className="sticky top-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          transition: "padding 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
          padding: scrolled ? "8px 0" : "16px 0",
          background: scrolled
            ? "rgba(2, 6, 23, 0.85)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 5%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* LEFT: Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #22C55E, #10B981)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(34,197,94,0.35)",
              }}
            >
              <Sprout style={{ width: 18, height: 18, color: "#020617" }} />
            </div>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#fff",
              }}
            >
              AgroBridge
            </span>
          </Link>

          {/* CENTER: Nav pill */}
          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "5px 10px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => (isActive ? "active-nav-link" : "inactive-nav-link")}
                style={({ isActive }) => ({
                  position: "relative",
                  padding: "6px 14px",
                  fontSize: "0.80rem",
                  fontWeight: 500,
                  borderRadius: 9999,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.58)",
                  background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  transition: "color 0.18s, background 0.18s",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: Auth buttons */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
            className="hidden-mobile"
          >
            <Link
              to="/login"
              style={{
                padding: "7px 16px",
                fontSize: "0.80rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                borderRadius: 9999,
                border: "1px solid transparent",
                transition: "color 0.2s, border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Login
            </Link>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/register/role"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 18px",
                  fontSize: "0.80rem",
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 9999,
                  background: "#22C55E",
                  boxShadow: "0 0 18px rgba(34,197,94,0.45)",
                  transition: "background 0.25s, box-shadow 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#16A34A";
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(34,197,94,0.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#22C55E";
                  e.currentTarget.style.boxShadow = "0 0 18px rgba(34,197,94,0.45)";
                }}
              >
                Get Started
                <ArrowRight style={{ width: 13, height: 13 }} />
              </Link>
            </motion.div>
          </div>

          {/* MOBILE: Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="show-mobile"
            style={{
              width: 36,
              height: 36,
              display: "none", // Reset via CSS media query below
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.75)",
              cursor: "pointer",
            }}
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </motion.header>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: 68,
              left: 12,
              right: 12,
              zIndex: 49,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(2, 6, 23, 0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
              overflow: "hidden",
              padding: 16,
            }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "11px 16px",
                  borderRadius: 12,
                  marginBottom: 2,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  background: isActive ? "rgba(255,255,255,0.09)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
                  transition: "color 0.15s, background 0.15s",
                })}
              >
                {link.label}
              </NavLink>
            ))}

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0" }} />

            <Link
              to="/login"
              style={{
                display: "block",
                padding: "11px 16px",
                borderRadius: 12,
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 6,
              }}
            >
              Login
            </Link>
            <Link
              to="/register/role"
              style={{
                display: "block",
                padding: "11px 16px",
                borderRadius: 12,
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                color: "#fff",
                background: "#22C55E",
                boxShadow: "0 0 18px rgba(34,197,94,0.35)",
              }}
            >
              Get Started →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        .inactive-nav-link:hover {
          color: #fff !important;
          background: rgba(255,255,255,0.07) !important;
        }
      `}</style>
    </>
  );
}
