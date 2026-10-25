"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";

interface MarketingHeaderProps {
  onOpenTour?: () => void;
}

export default function MarketingHeader({ onOpenTour }: MarketingHeaderProps) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { loginAs, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLaunchDemo = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login?redirect=/dashboard");
    }
  };

  return (
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
        padding: "0 28px",
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
        {/* Left: Logo + Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link
            href="/home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
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
          </Link>

          {/* Navigation Links with Mega-Menu Trigger */}
          <nav style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "8px" }}>
            {/* Product Mega Menu Trigger */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                aria-expanded={isMegaMenuOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: isMegaMenuOpen ? "var(--brand)" : "var(--ink)",
                  background: isMegaMenuOpen ? "var(--surface2)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Product
                <svg
                  style={{
                    width: "12px",
                    height: "12px",
                    transition: "transform 150ms ease",
                    transform: isMegaMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Product Mega-Menu (Opens on hover/focus, closes on Esc) */}
              {isMegaMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: "8px",
                    width: "680px",
                    zIndex: 200,
                    animation: "fadeIn 120ms ease-out",
                  }}
                >
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: "12px",
                      boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr",
                      overflow: "hidden",
                    }}
                  >
                    {/* Left: 6 Destinations */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "6px", paddingLeft: "8px" }}>
                        Verification Platform
                      </div>

                      {/* 1. Cockpit tour */}
                      <Link
                        href="/cockpit/TASK9142"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <div style={{ color: "var(--brand)", marginTop: "2px" }}>
                          <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--ink)" }}>Cockpit tour</div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)" }}>Every investigation, live in action</div>
                        </div>
                      </Link>

                      {/* 2. Investigation workspace */}
                      <Link
                        href="/studio"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <div style={{ color: "var(--brand)", marginTop: "2px" }}>
                          <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--ink)" }}>Investigation workspace</div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)" }}>Hypotheses, diffs, gates</div>
                        </div>
                      </Link>

                      {/* 3. Evidence ledger */}
                      <Link
                        href="/ledger"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <div style={{ color: "var(--brand)", marginTop: "2px" }}>
                          <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--ink)" }}>Evidence ledger</div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)" }}>Hash-chained proof you can verify</div>
                        </div>
                      </Link>

                      {/* 4. Detector library */}
                      <Link
                        href="/catalog"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <div style={{ color: "var(--brand)", marginTop: "2px" }}>
                          <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--ink)" }}>Detector library</div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)" }}>19 problem classes &amp; invariants</div>
                        </div>
                      </Link>

                      {/* 5. CLI & CI */}
                      <a
                        href="#cli-ci"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <div style={{ color: "var(--brand)", marginTop: "2px" }}>
                          <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="4 17 10 11 4 5" />
                            <line x1="12" y1="19" x2="20" y2="19" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--ink)" }}>CLI &amp; CI</div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)" }}>proofstack scan | verify | report</div>
                        </div>
                      </a>

                      {/* 6. Security model */}
                      <a
                        href="#security"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <div style={{ color: "var(--brand)", marginTop: "2px" }}>
                          <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--ink)" }}>Security model</div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)" }}>Sandboxes, policies, audit</div>
                        </div>
                      </a>
                    </div>

                    {/* Right: Preview Card inside Mega Menu */}
                    <div
                      style={{
                        background: "color-mix(in srgb, var(--brand) 4%, var(--surface2))",
                        borderLeft: "1px solid var(--line)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span className="chip brand" style={{ fontSize: "10px", marginBottom: "8px" }}>
                          Interactive Preview
                        </span>
                        <div
                          style={{
                            fontFamily: "var(--f-display)",
                            fontSize: "15px",
                            fontWeight: 600,
                            lineHeight: 1.35,
                            marginTop: "8px",
                            color: "var(--ink)",
                          }}
                        >
                          Watch the 2-min tour — See an IDOR caught before it ships.
                        </div>
                        <p style={{ fontSize: "11.5px", color: "var(--ink2)", margin: "8px 0 0", lineHeight: 1.5 }}>
                          Watch Nemotron synthesize a fix and the Gauntlet reject it for tenant isolation violation in real-time.
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => {
                            setIsMegaMenuOpen(false);
                            if (onOpenTour) onOpenTour();
                          }}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          <svg style={{ width: "13px", height: "13px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Watch Tour (2 min)
                        </button>

                        <button
                          type="button"
                          className="btn sm sec"
                          onClick={() => {
                            setIsMegaMenuOpen(false);
                            handleLaunchDemo();
                          }}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Open live demo →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Ledger */}
            <a
              href="#ledger"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink2)",
                textDecoration: "none",
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink2)")}
            >
              Evidence ledger
            </a>

            {/* Detectors */}
            <a
              href="#detectors"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink2)",
                textDecoration: "none",
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink2)")}
            >
              Detectors
            </a>

            {/* Security */}
            <a
              href="#security"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink2)",
                textDecoration: "none",
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink2)")}
            >
              Security
            </a>

            {/* Docs */}
            <a
              href="#cli-ci"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink2)",
                textDecoration: "none",
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink2)")}
            >
              Docs
            </a>
          </nav>
        </div>

        {/* Right CTA Area: Sign In (Quiet Link) + Open live demo (Filled Primary Button) + Theme Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            type="button"
            className="iconbtn"
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
            aria-label="Toggle theme"
            style={{ width: "32px", height: "32px" }}
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

          {isAuthenticated ? (
            <button
              type="button"
              className="btn"
              onClick={() => router.push("/dashboard")}
              style={{ height: "34px", padding: "0 16px", cursor: "pointer", fontSize: "13px" }}
            >
              Dashboard →
            </button>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--ink)",
                  textDecoration: "none",
                  padding: "6px 8px",
                }}
              >
                Sign in
              </Link>

              <button
                type="button"
                className="btn"
                onClick={handleLaunchDemo}
                style={{ height: "34px", padding: "0 16px", cursor: "pointer", fontSize: "13px" }}
              >
                Open live demo
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
