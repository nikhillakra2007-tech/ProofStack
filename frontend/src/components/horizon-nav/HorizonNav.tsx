"use client";
import Link from "next/link";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";
import { 
  Sun, Moon, LogIn, ChevronDown, Check, Shield, 
  Terminal, FileCode, Users, Layers, ExternalLink, LogOut
} from "lucide-react";

export function HorizonNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, activeMember, logout, isAuthenticated } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const roleDef = ROLES[role] || ROLES.developer;

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
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
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string, label?: string) => {
    e.preventDefault();
    if (pathname === href) return;
    router.push(href);
  };

  const handleSignOut = () => {
    setRoleMenuOpen(false);
    if (typeof logout === "function") {
      logout();
    }
    router.push("/");
  };

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Determine navigation items based on landing page vs authenticated role
  const isLanding = pathname === "/";

  const getRoleNavItems = (currentRole: UserRole) => {
    switch (currentRole) {
      case "developer":
        return [
          { label: "Developer Hub", href: "/developer", pageName: "Developer Hub" },
          { label: "Remediation Cockpit", href: "/cockpit", pageName: "Remediation Cockpit" },
          { label: "AST Studio", href: "/studio", pageName: "AST Studio" },
          { label: "Findings", href: "/findings", pageName: "Security Findings" },
          { label: "DAST Sandbox", href: "/dast", pageName: "DAST Scanner" },
        ];
      case "auditor":
        return [
          { label: "Auditor Hub", href: "/auditor", pageName: "Auditor Hub" },
          { label: "Evidence Ledger", href: "/ledger", pageName: "Merkle Ledger" },
          { label: "Findings", href: "/findings", pageName: "Security Findings" },
          { label: "Settings", href: "/settings", pageName: "Model Settings" },
        ];
      case "admin":
        return [
          { label: "Admin Hub", href: "/admin", pageName: "Admin Hub" },
          { label: "DAST Sandbox", href: "/dast", pageName: "DAST Scanner" },
          { label: "Findings", href: "/findings", pageName: "Security Findings" },
          { label: "Remediation Cockpit", href: "/cockpit", pageName: "Remediation Cockpit" },
          { label: "Settings", href: "/settings", pageName: "Model Settings" },
        ];
      case "super_admin":
      default:
        return [
          { label: "CISO Control Plane", href: "/ciso", pageName: "CISO Control Plane" },
          { label: "Remediation Cockpit", href: "/cockpit", pageName: "Remediation Cockpit" },
          { label: "Evidence Ledger", href: "/ledger", pageName: "Merkle Ledger" },
          { label: "Findings", href: "/findings", pageName: "Security Findings" },
          { label: "Settings", href: "/settings", pageName: "Model Settings" },
        ];
    }
  };

  const activeNavItems = isLanding
    ? [
        { label: "Verification Demo", href: "#preview", pageName: "Verification Demo", isAnchor: true },
        { label: "Core Pillars", href: "#pillars", pageName: "Core Pillars", isAnchor: true },
      ]
    : getRoleNavItems(role);

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
        <Link
          href="/"
          prefetch={true}
          className="cursor-pointer active:scale-98 transition-transform"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <BrandLogo size="md" showWordmark={true} />
        </Link>

        {/* Desktop Navigation Links (Context-Aware) */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden lg:flex"
        >
          {activeNavItems.map((item) => {
            const active = isNavActive(item.href);
            if ((item as any).isAnchor) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    position: "relative",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "var(--ink-muted)",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                  className="hover:text-[var(--ink)]"
                >
                  <span>{item.label}</span>
                </a>
              );
            }

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
        </nav>

        {/* Right Controls: Theme Toggle + Role Profile / Sign In */}
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

          {/* Authenticated User Status vs Sign In */}
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
                    background: "var(--surface2)",
                    fontSize: "13px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {activeMember ? activeMember.avatar : role.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-mono">{activeMember ? activeMember.name : roleDef.label}</span>
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
                        {roleDef.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "1px", fontFamily: "monospace" }}>
                        {session?.email || "developer@sentinel.internal"}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <button
                        onClick={(e) => {
                          setRoleMenuOpen(false);
                          handleNavClick(e, roleDef.primaryRoute || "/dashboard", `${roleDef.label} Hub`);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "7px 8px",
                          borderRadius: "6px",
                          background: "var(--line)",
                          border: "none",
                          color: "var(--ink)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          marginBottom: "4px",
                        }}
                      >
                        Enter {roleDef.label} Hub
                      </button>

                      <button
                        onClick={handleSignOut}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "7px 8px",
                          borderRadius: "6px",
                          background: "transparent",
                          border: "none",
                          color: "var(--rose)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <LogOut style={{ width: "13px", height: "13px" }} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Explicit Sign In Button for unauthenticated visitors */
            <Link
              href="/login"
              prefetch={true}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
                background: "var(--primary)",
                color: "#030712",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.25)",
              }}
              className="hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LogIn style={{ width: "14px", height: "14px" }} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default HorizonNav;
