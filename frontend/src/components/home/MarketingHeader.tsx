"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

interface MarketingHeaderProps {
  onOpenTour?: () => void;
  activeView?: string;
  onSelectView?: (view: string) => void;
}

export default function MarketingHeader({
  onOpenTour,
  activeView = "overview",
  onSelectView,
}: MarketingHeaderProps) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGoToLogin = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("proofstack_auth_active");
        localStorage.removeItem("proofstack_session");
        localStorage.removeItem("proofstack_role");
        localStorage.removeItem("proofstack_user");
        document.cookie = "ps_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "proofstack_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ps_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}
    }
    router.push("/login");
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "gates", label: "Three Gates", icon: "🛡️" },
    { id: "detectors", label: "19 Detectors", icon: "🔍" },
    { id: "ledger", label: "Evidence Ledger", icon: "🔗" },
    { id: "architecture", label: "Architecture & FAQ", icon: "⚡" },
  ];

  const handleNavClick = (viewId: string) => {
    if (onSelectView) {
      onSelectView(viewId);
    } else {
      router.push(`/home?view=${viewId}`);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          height: isScrolled ? "56px" : "64px",
          transition: "all 180ms ease-in-out",
          background: "color-mix(in srgb, var(--surface) 92%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Brand Logo + Desktop 5 Navigation Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              type="button"
              onClick={() => handleNavClick("overview")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                  display: "grid",
                  placeItems: "center",
                  flex: "none",
                }}
              >
                <svg
                  style={{ width: "18px", height: "18px", stroke: "currentColor", fill: "none", strokeWidth: 2 }}
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--f-display)",
                  fontWeight: 700,
                  fontSize: "19px",
                  letterSpacing: "-.02em",
                  color: "var(--ink)",
                }}
              >
                ProofStack
              </span>
            </button>

            {/* Desktop 5 Dedicated Sub-Site Tabs */}
            <nav className="desktop-public-nav" style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "12px" }}>
              {navItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--brand)" : "var(--ink2)",
                      background: isActive ? "var(--surface2)" : "transparent",
                      border: isActive ? "1px solid var(--line)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 120ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = "var(--ink)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = "var(--ink2)";
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Area: Theme Toggle + Sign In + Open live demo + Mobile Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Theme Toggle */}
            <button
              type="button"
              className="iconbtn"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
              aria-label="Toggle theme"
              style={{ width: "32px", height: "32px", cursor: "pointer" }}
            >
              {resolvedTheme === "light" ? (
                <svg style={{ width: "15px", height: "15px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg style={{ width: "15px", height: "15px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
                  <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
                  <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
                </svg>
              )}
            </button>

            {/* Sign in button (always routes to /login) */}
            <Link
              href="/login"
              onClick={handleGoToLogin}
              className="desktop-auth-btn"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink)",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Sign in
            </Link>

            {/* Open Live Demo CTA */}
            <button
              type="button"
              className="btn btn-primary desktop-auth-btn"
              onClick={handleGoToLogin}
              style={{
                height: "36px",
                padding: "0 18px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "#1D4ED8",
                color: "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(29, 78, 216, 0.25)",
              }}
            >
              Open live demo →
            </button>

            {/* Mobile Hamburger Menu Toggle Button (Visible on screens <= 960px) */}
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              style={{
                display: "none",
                background: "var(--surface2)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--ink)",
              }}
            >
              {isMobileMenuOpen ? (
                <span style={{ fontSize: "18px", fontWeight: 700 }}>✕</span>
              ) : (
                <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "56px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "color-mix(in srgb, var(--surface) 98%, transparent)",
            backdropFilter: "blur(16px)",
            zIndex: 99,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="eyebrow" style={{ fontSize: "11px", marginBottom: "6px", color: "var(--ink2)" }}>
              PUBLIC SUB-SITES
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    fontSize: "14.5px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--brand)" : "var(--ink)",
                    background: isActive ? "var(--surface2)" : "transparent",
                    border: isActive ? "1px solid var(--line)" : "1px solid transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGoToLogin}
              style={{ width: "100%", justifyContent: "center", height: "42px", fontSize: "14px" }}
            >
              Open live demo →
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGoToLogin}
              style={{ width: "100%", justifyContent: "center", height: "42px", fontSize: "14px" }}
            >
              Sign In to Private Workspace
            </button>
          </div>
        </div>
      )}

      {/* Responsive media query stylesheet */}
      <style>{`
        @media (max-width: 960px) {
          .desktop-public-nav {
            display: none !important;
          }
          .desktop-auth-btn {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
