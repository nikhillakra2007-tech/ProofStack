"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ROLES, UserRole } from "@/lib/auth";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";
import { Sun, Moon, LogIn, ChevronDown, Check } from "lucide-react";

export function HorizonNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, loginAs, logout, isAuthenticated } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const roleDef = ROLES[role] || ROLES.developer;

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize theme from storage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("sentinel_theme") as "dark" | "light" | null) : null;
    if (saved) {
      setTheme(saved);
      if (saved === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_theme", next);
      if (next === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    if (roleMenuOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [roleMenuOpen]);

  const navItems = [
    { label: "Overview", href: "/", pageName: "Dashboard Overview" },
    { label: "Cockpit", href: "/cockpit", pageName: "Remediation Cockpit" },
    { label: "AST Studio", href: "/studio", pageName: "AST Studio" },
    { label: "Findings", href: "/findings", pageName: "Security Findings" },
    { label: "DAST", href: "/dast", pageName: "DAST Scanner" },
    { label: "Ledger", href: "/ledger", pageName: "Merkle Ledger" },
    { label: "Settings", href: "/settings", pageName: "Model Settings" },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, label: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (pathname === href) return;
    navigateWithCurtain(href, label);
  };

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: theme === "light" ? "rgba(250, 248, 245, 0.92)" : "rgba(14, 18, 13, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: theme === "light" ? "1px solid rgba(81, 90, 71, 0.15)" : "1px solid rgba(81, 90, 71, 0.35)",
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* Subtle Top Scroll Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: "2px",
          background: "linear-gradient(90deg, #7A4419 0%, #D7BE82 50%, #515A47 100%)",
          transition: "width 0.1s linear",
          zIndex: 60,
        }}
      />

      <div
        style={{
          maxWidth: "1350px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Brand Identity - Natural, Uncluttered with High-End Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, "/", "Sentinel Gate")}
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <BrandLogo size="md" showWordmark={true} />
        </a>

        {/* Desktop Navigation Links - Clean, Natural, No Heavy Pills */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          className="hidden md:flex"
        >
          {navItems.map((item) => {
            const active = isNavActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.pageName)}
                style={{
                  position: "relative",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--fawn)" : "var(--ink-muted)",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="horizonIndicator"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "12px",
                      right: "12px",
                      height: "2px",
                      borderRadius: "2px",
                      background: "var(--fawn)",
                    }}
                  />
                )}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle + Role Switcher (App Only) + Sign In */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              background: theme === "light" ? "rgba(81, 90, 71, 0.08)" : "rgba(215, 190, 130, 0.12)",
              border: theme === "light" ? "1px solid rgba(81, 90, 71, 0.2)" : "1px solid rgba(215, 190, 130, 0.3)",
              color: "var(--fawn)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun style={{ width: "16px", height: "16px" }} /> : <Moon style={{ width: "16px", height: "16px" }} />}
          </button>

          {/* Role Switcher Dropdown - ONLY shown on application views, NEVER on public landing page! */}
          {pathname !== "/" && (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px 6px 8px",
                  borderRadius: "9px",
                  background: theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(21, 27, 19, 0.9)",
                  border: theme === "light" ? "1px solid rgba(81, 90, 71, 0.2)" : "1px solid rgba(81, 90, 71, 0.4)",
                  cursor: "pointer",
                  color: "var(--ink)",
                  fontSize: "12.5px",
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: "#D7BE82",
                    color: "#0E120D",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {role.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{roleDef.label}</span>
                <ChevronDown style={{ width: "12px", height: "12px", opacity: 0.6 }} />
              </button>

            <AnimatePresence>
              {roleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: "240px",
                    borderRadius: "12px",
                    background: theme === "light" ? "#FFFFFF" : "rgba(21, 27, 19, 0.98)",
                    backdropFilter: "blur(20px)",
                    border: theme === "light" ? "1px solid rgba(81, 90, 71, 0.2)" : "1px solid rgba(215, 190, 130, 0.3)",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.18)",
                    padding: "8px",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "6px 8px 8px", borderBottom: "1px solid var(--line)", marginBottom: "6px" }}>
                    <div style={{ fontSize: "10px", color: "var(--fawn)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Active Operator
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginTop: "2px" }}>
                      {roleDef.roleTitle}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "1px" }}>
                      {session?.email || "developer@sentinel.internal"}
                    </div>
                  </div>

                  <div style={{ fontSize: "10px", color: "var(--ink-muted)", padding: "4px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Switch Role
                  </div>

                  {(Object.keys(ROLES) as UserRole[]).map((r) => {
                    const rDef = ROLES[r];
                    const active = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          loginAs(r);
                          setRoleMenuOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "7px 8px",
                          borderRadius: "7px",
                          background: active ? "rgba(215, 190, 130, 0.15)" : "transparent",
                          border: "none",
                          color: active ? "var(--fawn)" : "var(--ink)",
                          fontSize: "12px",
                          fontWeight: active ? 600 : 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{rDef.roleTitle}</span>
                        {active && <Check style={{ width: "12px", height: "12px", color: "var(--fawn)" }} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

          {/* Sign In / Launch Cockpit Action */}
          <a
            href={isAuthenticated ? "/cockpit" : "/login"}
            onClick={(e) => handleNavClick(e, isAuthenticated ? "/cockpit" : "/login", isAuthenticated ? "Remediation Cockpit" : "Authentication")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              background: "var(--fawn)",
              color: "#0E120D",
              textDecoration: "none",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
          >
            {isAuthenticated ? (
              <>
                <span>Cockpit</span>
                <ChevronDown style={{ width: "12px", height: "12px", transform: "rotate(-90deg)" }} />
              </>
            ) : (
              <>
                <LogIn style={{ width: "13px", height: "13px" }} />
                <span>Sign In</span>
              </>
            )}
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            className="md:hidden"
            aria-label="Toggle navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: theme === "light" ? "#FFFFFF" : "#151B13",
              borderBottom: "1px solid var(--line)",
              padding: "16px 24px",
            }}
            className="md:hidden"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, item.pageName)}
                  style={{
                    padding: "10px",
                    color: isNavActive(item.href) ? "var(--fawn)" : "var(--ink)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default HorizonNav;
