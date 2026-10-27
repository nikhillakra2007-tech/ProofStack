"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MarketingHeader from "@/components/home/MarketingHeader";
import MarketingHero from "@/components/home/MarketingHero";
import HomeGatesView from "@/components/home/HomeGatesView";
import HomeDetectorsView from "@/components/home/HomeDetectorsView";
import HomeLedgerView from "@/components/home/HomeLedgerView";
import HomeArchitectureView from "@/components/home/HomeArchitectureView";
import TourModal from "@/components/home/TourModal";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view") || "overview";

  const [activeView, setActiveView] = useState<string>(viewParam);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  useEffect(() => {
    if (viewParam && ["overview", "gates", "detectors", "ledger", "architecture"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  // Listen for browser forward/back navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view") || "overview";
      if (["overview", "gates", "detectors", "ledger", "architecture"].includes(v)) {
        setActiveView(v);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectView = (viewId: string) => {
    setActiveView(viewId);
    if (typeof window !== "undefined") {
      const isRoot = window.location.pathname === "/";
      const basePath = isRoot ? "" : "/home";
      const targetUrl = viewId === "overview" ? (isRoot ? "/" : "/home") : `${basePath}?view=${viewId}`;
      window.history.pushState({ view: viewId }, "", targetUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-canvas)",
        color: "var(--ink)",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticky Marketing Header with 5 Dedicated Sub-Site Tabs + Mobile Drawer */}
      <MarketingHeader
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenTour={() => setIsTourModalOpen(true)}
      />

      {/* Main View Area with Smooth Fade Transition */}
      <main style={{ flex: 1, animation: "fadeIn 220ms ease-in-out" }}>
        {activeView === "overview" && (
          <>
            <MarketingHero onOpenTour={() => setIsTourModalOpen(true)} />

            {/* Quick Sub-Site Navigation Cards */}
            <div style={{ maxWidth: "1320px", margin: "0 auto 60px", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                  DEEP-DIVE SUB-SITES
                </span>
                <h2 style={{ fontFamily: "var(--f-display)", fontSize: "28px", fontWeight: 700, margin: "6px 0 0" }}>
                  Explore the Zero-Compromise Verification Architecture
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
                {[
                  {
                    id: "gates",
                    icon: "🛡️",
                    title: "The Three Gates Policy",
                    desc: "Interactive gauges for Correctness (100%), Performance (+74.2%), and Security (0 IDOR).",
                    badge: "Live Simulator",
                  },
                  {
                    id: "detectors",
                    icon: "🔍",
                    title: "19 Invariant Detectors",
                    desc: "Catalog of 19 industrial problem classes with outage case studies and AST ban rules.",
                    badge: "Public Catalog",
                  },
                  {
                    id: "ledger",
                    icon: "🔗",
                    title: "Cryptographic Evidence Ledger",
                    desc: "Test SHA-256 Merkle chain integrity. Simulate tampering live in your browser.",
                    badge: "SHA-256 Proof",
                  },
                  {
                    id: "architecture",
                    icon: "⚡",
                    title: "Architecture & FAQ",
                    desc: "5-Step pipeline coupling NVIDIA Nemotron 3 on Nebius with rootless MicroVMs.",
                    badge: "Nebius Token Factory",
                  },
                ].map((card) => (
                  <div
                    key={card.id}
                    className="card"
                    onClick={() => handleSelectView(card.id)}
                    style={{
                      padding: "22px 20px",
                      borderRadius: "12px",
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "var(--brand)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "var(--line)";
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ fontSize: "24px" }}>{card.icon}</span>
                        <span className="chip brand" style={{ fontSize: "10px", fontWeight: 700 }}>
                          {card.badge}
                        </span>
                      </div>
                      <b style={{ fontSize: "16px", color: "var(--ink)", display: "block", marginBottom: "6px" }}>
                        {card.title}
                      </b>
                      <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: 0 }}>
                        {card.desc}
                      </p>
                    </div>

                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)" }}>
                        Explore Sub-Site →
                      </span>
                      <span className="mono" style={{ fontSize: "11px", color: "var(--ink2)" }}>
                        ?view={card.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeView === "gates" && <HomeGatesView onOpenTour={() => setIsTourModalOpen(true)} />}
        {activeView === "detectors" && <HomeDetectorsView onOpenTour={() => setIsTourModalOpen(true)} />}
        {activeView === "ledger" && <HomeLedgerView onOpenTour={() => setIsTourModalOpen(true)} />}
        {activeView === "architecture" && <HomeArchitectureView onOpenTour={() => setIsTourModalOpen(true)} />}
      </main>

      {/* Polished 4-Column Enterprise Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--surface)",
          padding: "54px 28px 32px",
          fontSize: "13px",
          color: "var(--ink2)",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
              gap: "36px",
              marginBottom: "44px",
            }}
          >
            {/* Brand Column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: "var(--brand)",
                    color: "var(--brand-ink, #FFFFFF)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <b style={{ fontFamily: "var(--f-display)", fontSize: "19px", color: "var(--ink)" }}>ProofStack</b>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.55, margin: "0 0 16px", maxWidth: "280px" }}>
                Autonomous verification for AI-written fixes: make it faster, with cryptographic proof it is still safe.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="chip" style={{ fontSize: "10px" }}>Open source · Apache-2.0</span>
              </div>
            </div>

            {/* Column 1: Platform */}
            <div>
              <div className="eyebrow" style={{ fontSize: "11px", marginBottom: "14px", color: "var(--ink)", fontWeight: 700 }}>
                Platform Sub-Sites
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "12.5px" }}>
                <button
                  type="button"
                  onClick={() => handleSelectView("overview")}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: activeView === "overview" ? "var(--brand)" : "var(--ink2)", fontWeight: activeView === "overview" ? 700 : 500 }}
                >
                  Overview Sub-Site
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectView("gates")}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: activeView === "gates" ? "var(--brand)" : "var(--ink2)", fontWeight: activeView === "gates" ? 700 : 500 }}
                >
                  Three Gates Policy
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectView("detectors")}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: activeView === "detectors" ? "var(--brand)" : "var(--ink2)", fontWeight: activeView === "detectors" ? 700 : 500 }}
                >
                  19 Invariant Detectors
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectView("ledger")}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: activeView === "ledger" ? "var(--brand)" : "var(--ink2)", fontWeight: activeView === "ledger" ? 700 : 500 }}
                >
                  Evidence Ledger (SHA-256)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectView("architecture")}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: activeView === "architecture" ? "var(--brand)" : "var(--ink2)", fontWeight: activeView === "architecture" ? 700 : 500 }}
                >
                  Architecture &amp; FAQ
                </button>
              </div>
            </div>

            {/* Column 2: Verifiers */}
            <div>
              <div className="eyebrow" style={{ fontSize: "11px", marginBottom: "14px", color: "var(--ink)", fontWeight: 700 }}>
                Verifiers &amp; Gates
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <span>Correctness Gate (G1)</span>
                <span>Security Exploit Oracle (G2)</span>
                <span>AST Identity Lock (G3)</span>
                <span>Performance Gate (G5)</span>
                <span>Statistical Noise Floor (τ=5%)</span>
              </div>
            </div>

            {/* Column 3: Architecture */}
            <div>
              <div className="eyebrow" style={{ fontSize: "11px", marginBottom: "14px", color: "var(--ink)", fontWeight: 700 }}>
                Architecture
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <span>NVIDIA Nemotron 3 (120B)</span>
                <span>Nebius Token Factory</span>
                <span>Ephemeral Linux MicroVMs</span>
                <span>SHA-256 Merkle Ledger</span>
                <span>Role-Based Multi-Persona</span>
              </div>
            </div>

            {/* Column 4: Access */}
            <div>
              <div className="eyebrow" style={{ fontSize: "11px", marginBottom: "14px", color: "var(--ink)", fontWeight: 700 }}>
                Access &amp; Tools
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "var(--brand)", fontWeight: 600 }}
                >
                  Sign In / Judge Demo →
                </button>
                <button
                  type="button"
                  onClick={() => setIsTourModalOpen(true)}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "var(--ink2)" }}
                >
                  Interactive 2-Min Tour
                </button>
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "var(--ink2)" }}
                >
                  Admin Control Plane
                </button>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--ink2)", textDecoration: "none" }}
                >
                  GitHub Repository ↗
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--ink3)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>© 2026 ProofStack Engine. Autonomous DevSecOps &amp; Cryptographic Verification.</div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span>Privacy Policy</span>
              <span>Security Invariants</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--pass)", fontWeight: 600 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--pass)", boxShadow: "0 0 6px var(--pass)" }} />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive 2-Minute Tour Modal */}
      <TourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
      />
    </div>
  );
}

export default function PublicHomePage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading ProofStack Public Portal...</div>}>
      <HomeContent />
    </Suspense>
  );
}
