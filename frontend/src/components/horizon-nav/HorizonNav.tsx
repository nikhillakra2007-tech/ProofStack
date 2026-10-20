"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ROLES, UserRole } from "@/lib/auth";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";
import { 
  Sun, Moon, LogIn, ChevronDown, Check, Shield, 
  Terminal, FileCode, Users, Layers, ExternalLink 
} from "lucide-react";

export function HorizonNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, loginAs, logout, isAuthenticated } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const roleDef = ROLES[role] || ROLES.developer;

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [rolesNavOpen, setRolesNavOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const rolesNavRef = useRef<HTMLDivElement>(null);

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
      if (rolesNavRef.current && !rolesNavRef.current.contains(e.target as Node)) {
        setRolesNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const navItems = [
    { label: "Overview", href: "/", pageName: "Dashboard Overview" },
    { label: "Cockpit", href: "/cockpit", pageName: "Remediation Cockpit" },
    { label: "AST Studio", href: "/studio", pageName: "AST Studio" },
    { label: "Findings", href: "/findings", pageName: "Security Findings" },
    { label: "DAST", href: "/dast", pageName: "DAST Scanner" },
    { label: "Ledger", href: "/ledger", pageName: "Merkle Ledger" },
    { label: "Settings", href: "/settings", pageName: "Model Settings" },
  ];

  const rolePortals = [
    {
      role: "developer" as UserRole,
      title: "Lead Developer",
      path: "/developer",
      desc: "AST invariants, Tree-Sitter grammar, compiler-level diffs",
      badgeColor: "var(--azure)",
    },
    {
      role: "auditor" as UserRole,
      title: "Security Auditor",
      path: "/auditor",
      desc: "SHA-256 Merkle chain, zero-day adversary simulation",
      badgeColor: "var(--gold)",
    },
    {
      role: "admin" as UserRole,
      title: "Operations Admin",
      path: "/admin",
      desc: "gVisor microVM sandboxes, H100 GPU cluster quotas",
      badgeColor: "var(--emerald)",
    },
    {
      role: "ciso" as UserRole,
      title: "SuperAdmin (CISO)",
      path: "/ciso",
      desc: "SOC2/FedRAMP posture, dual-key emergency override",
      badgeColor: "var(--violet)",
    },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, label: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setRolesNavOpen(false);
    if (pathname === href) return;
    navigateWithCurtain(href, label);
  };

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors duration-200"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--line)",
      }}
    >
      {/* Top Cyber Constellation Scroll Progress Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: "2px",
          background: "linear-gradient(90deg, var(--azure) 0%, var(--emerald) 50%, var(--violet) 100%)",
          transition: "width 0.1s linear",
          zIndex: 60,
        }}
      />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Brand Identity */}
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

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden lg:flex"
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
                  color: active ? "var(--primary)" : "var(--ink-muted)",
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
                      background: "var(--primary)",
                    }}
                  />
                )}
                <span>{item.label}</span>
              </a>
            );
          })}

          {/* Dedicated Roles Mega-Menu Dropdown */}
          <div style={{ position: "relative" }} ref={rolesNavRef}>
            <button
              type="button"
              onClick={() => setRolesNavOpen(!rolesNavOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
                color: ["/developer", "/auditor", "/admin", "/ciso"].includes(pathname)
                  ? "var(--primary)"
                  : "var(--ink-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>Role Portals</span>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  transform: rolesNavOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            <AnimatePresence>
              {rolesNavOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "calc(100% + 8px)",
                    width: "320px",
                    borderRadius: "12px",
                    background: "var(--surface)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--line-strong)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                    padding: "10px",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "4px 8px 8px", borderBottom: "1px solid var(--line)", marginBottom: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      4 Dedicated Role Workspaces
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ink-muted)", marginTop: "2px" }}>
                      Each operator role has isolated security primitives
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {rolePortals.map((rp) => (
                      <a
                        key={rp.path}
                        href={rp.path}
                        onClick={(e) => handleNavClick(e, rp.path, `${rp.title} Workspace`)}
                        style={{
                          display: "block",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          background: pathname === rp.path ? "var(--line)" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        className="hover:bg-[var(--line)]"
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>
                            {rp.title}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "monospace",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: rp.badgeColor,
                              border: `1px solid ${rp.badgeColor}40`,
                              background: `${rp.badgeColor}15`,
                            }}
                          >
                            {rp.path}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "2px", lineHeight: "1.3" }}>
                          {rp.desc}
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right Controls: Theme Toggle + Role Switcher / Sign In */}
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
              borderRadius: "8px",
              background: "var(--line)",
              border: "1px solid var(--line)",
              color: "var(--primary)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun style={{ width: "16px", height: "16px" }} />
            ) : (
              <Moon style={{ width: "16px", height: "16px" }} />
            )}
          </button>

          {/* Active Operator Badge / Role Switcher */}
          {isAuthenticated ? (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px 6px 8px",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  border: "1px solid var(--line-strong)",
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
                    background: "var(--primary)",
                    color: "#030712",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {role.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-mono">{roleDef.label}</span>
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
                      width: "250px",
                      borderRadius: "12px",
                      background: "var(--surface)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--line-strong)",
                      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.25)",
                      padding: "8px",
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: "6px 8px 8px", borderBottom: "1px solid var(--line)", marginBottom: "6px" }}>
                      <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Active Operator
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginTop: "2px" }}>
                        {roleDef.roleTitle}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "1px", fontFamily: "monospace" }}>
                        {session?.email || "developer@sentinel.internal"}
                      </div>
                    </div>

                    <div style={{ fontSize: "10px", color: "var(--ink-muted)", padding: "4px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Switch Active Persona
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
                            // Also navigate to their dedicated role page
                            navigateWithCurtain(rDef.defaultPath, `${rDef.roleTitle} Portal`);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "7px 8px",
                            borderRadius: "7px",
                            background: active ? "var(--line)" : "transparent",
                            border: "none",
                            color: active ? "var(--primary)" : "var(--ink)",
                            fontSize: "12px",
                            fontWeight: active ? 600 : 500,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{rDef.roleTitle}</span>
                          {active && <Check style={{ width: "12px", height: "12px", color: "var(--primary)" }} />}
                        </button>
                      );
                    })}

                    <div style={{ borderTop: "1px solid var(--line)", marginTop: "6px", paddingTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setRoleMenuOpen(false);
                          navigateWithCurtain("/", "Overview");
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          background: "transparent",
                          border: "none",
                          color: "var(--rose)",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Explicit Sign In Button for unauthenticated visitors */
            <a
              href="/login"
              onClick={(e) => handleNavClick(e, "/login", "Authentication")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                background: "var(--primary)",
                color: "#030712",
                textDecoration: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease, transform 0.15s ease",
              }}
              className="hover:scale-105 active:scale-95"
            >
              <LogIn style={{ width: "13px", height: "13px" }} />
              <span>Sign In</span>
            </a>
          )}

          {/* Quick Launch Cockpit Button */}
          {isAuthenticated && (
            <button
              onClick={(e) => handleNavClick(e, "/cockpit", "Remediation Cockpit")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                background: "var(--primary)",
                color: "#030712",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              <span>Cockpit</span>
              <ChevronDown style={{ width: "12px", height: "12px", transform: "rotate(-90deg)" }} />
            </button>
          )}

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
            className="lg:hidden"
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
              background: "var(--surface)",
              borderBottom: "1px solid var(--line)",
              padding: "16px 24px",
            }}
            className="lg:hidden"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, item.pageName)}
                  style={{
                    padding: "8px 10px",
                    color: isNavActive(item.href) ? "var(--primary)" : "var(--ink)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {item.label}
                </a>
              ))}

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "8px", marginTop: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Dedicated Role Workspaces
                </div>
                {rolePortals.map((rp) => (
                  <a
                    key={rp.path}
                    href={rp.path}
                    onClick={(e) => handleNavClick(e, rp.path, `${rp.title} Workspace`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontSize: "13px",
                    }}
                  >
                    <span>{rp.title}</span>
                    <span style={{ fontSize: "10px", fontFamily: "monospace", color: rp.badgeColor }}>
                      {rp.path}
                    </span>
                  </a>
                ))}
              </div>

              {!isAuthenticated && (
                <a
                  href="/login"
                  onClick={(e) => handleNavClick(e, "/login", "Authentication")}
                  style={{
                    marginTop: "8px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--primary)",
                    color: "#030712",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  Sign In to Sentinel Gate
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default HorizonNav;
