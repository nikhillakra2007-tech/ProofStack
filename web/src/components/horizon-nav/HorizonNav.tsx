"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import { useCurtain } from "@/components/layout/CurtainTransition";
import BootSequence from "@/components/boot-sequence/BootSequence";

interface HorizonNavProps {
  onOpenCommandPalette?: () => void;
  onOpenNewTaskModal?: () => void;
  onToggleCopilot?: () => void;
}

export default function HorizonNav({
  onOpenCommandPalette,
  onOpenNewTaskModal,
  onToggleCopilot,
}: HorizonNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, loginAs, logout, isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { navigateWithCurtain } = useCurtain();
  const roleDef = ROLES[role] || ROLES.developer;

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBootSequence, setShowBootSequence] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic Scroll Progress listener
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

  // Close role menu on outside click
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
    { label: "Dashboard", href: "/", pageName: "Dashboard" },
    { label: "Cockpit", href: "/cockpit/TASK9142", pageName: "Remediation Cockpit", tag: "TASK9142" },
    { label: "Studio", href: "/studio", pageName: "AST Studio" },
    { label: "Findings", href: "/findings", pageName: "Security Findings", badge: "6" },
    { label: "DAST", href: "/dast", pageName: "DAST Testing" },
    { label: "Ledger", href: "/ledger", pageName: "Cryptographic Ledger" },
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
    <>
      <BootSequence forceOpen={showBootSequence} onComplete={() => setShowBootSequence(false)} />

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          background: "rgba(7, 9, 14, 0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(56, 189, 248, 0.12)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Glowing Scroll Progress Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${scrollProgress}%`,
            height: "2.5px",
            background: "linear-gradient(90deg, #00F0FF 0%, #818CF8 50%, #10B981 100%)",
            boxShadow: "0 0 10px rgba(0, 240, 255, 0.9)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <a
              href="/"
              onClick={(e) => handleNavClick(e, "/", "ProofStack")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                color: "#F8FAFC",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #00F0FF 0%, #6366F1 100%)",
                  display: "grid",
                  placeItems: "center",
                  color: "#07090E",
                  boxShadow: "0 0 18px rgba(0, 240, 255, 0.4)",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <b style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", display: "block", lineHeight: 1.1 }}>
                  ProofStack
                </b>
                <span style={{ fontSize: "10px", color: "rgba(148, 163, 184, 0.8)", fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.06em" }}>
                  Autonomous VeriFix
                </span>
              </div>
            </a>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                color: "#10B981",
              }}
              className="hidden lg:inline-flex"
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
              8/8 Gates Enforced
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
              borderRadius: "30px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(56, 189, 248, 0.15)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
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
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12.5px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#F8FAFC" : "#94A3B8",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="horizonActivePill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "20px",
                        background: "rgba(56, 189, 248, 0.18)",
                        border: "1px solid rgba(56, 189, 248, 0.35)",
                        boxShadow: "0 0 12px rgba(56, 189, 248, 0.2)",
                        zIndex: -1,
                      }}
                    />
                  )}
                  <span>{item.label}</span>
                  {item.tag && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "9px",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#38BDF8",
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                  {item.badge && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "9px",
                        padding: "1px 5px",
                        borderRadius: "10px",
                        background: "rgba(244, 63, 94, 0.18)",
                        color: "#F43F5E",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Cinematic Boot Re-trigger */}
            <button
              type="button"
              onClick={() => setShowBootSequence(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 500,
                background: "rgba(56, 189, 248, 0.08)",
                color: "#38BDF8",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              title="Re-run telemetry boot simulation"
              className="hidden sm:inline-flex"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Boot Telemetry</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 10px 5px 6px",
                  borderRadius: "20px",
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  cursor: "pointer",
                  color: "#F8FAFC",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
                    color: "#07090E",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {role.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: "11.5px", fontWeight: 500 }}>
                  {roleDef.label}
                </span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {roleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "250px",
                      borderRadius: "14px",
                      background: "rgba(15, 23, 42, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
                      padding: "10px",
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: "6px 8px 10px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "8px" }}>
                      <div style={{ fontSize: "10px", color: "#38BDF8", fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.08em" }}>
                        CURRENT OPERATOR
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF", marginTop: "2px" }}>
                        {roleDef.roleTitle}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "1px" }}>
                        {session?.email || "architect@proofstack.internal"}
                      </div>
                    </div>

                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono, monospace)", color: "#64748B", padding: "4px 8px" }}>
                      SWITCH OPERATIONAL ROLE
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: active ? "#38BDF8" : "#E2E8F0",
                            background: active ? "rgba(56, 189, 248, 0.12)" : "transparent",
                            cursor: "pointer",
                            border: "none",
                            marginBottom: "2px",
                          }}
                        >
                          <span style={{ fontWeight: active ? 600 : 400 }}>{rDef.label}</span>
                          {active && <span style={{ color: "#10B981", fontSize: "12px" }}>✓</span>}
                        </button>
                      );
                    })}

                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "8px", paddingTop: "8px" }}>
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleMenuOpen(false);
                            logout();
                            navigateWithCurtain("/login", "Sign In");
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "7px 10px",
                            fontSize: "12px",
                            color: "#F43F5E",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                            borderRadius: "6px",
                          }}
                        >
                          Sign Out
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleMenuOpen(false);
                            navigateWithCurtain("/login", "Sign In");
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "7px 10px",
                            fontSize: "12px",
                            color: "#38BDF8",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                            borderRadius: "6px",
                          }}
                        >
                          Sign In / Enter
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                color: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              className="md:hidden"
              aria-label="Toggle navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                background: "rgba(7, 9, 14, 0.95)",
                borderTop: "1px solid rgba(56, 189, 248, 0.15)",
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
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: isNavActive(item.href) ? "#38BDF8" : "#E2E8F0",
                      background: isNavActive(item.href) ? "rgba(56, 189, 248, 0.12)" : "transparent",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          background: "rgba(244, 63, 94, 0.2)",
                          color: "#F43F5E",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
