"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { downloadEvidenceReport } from "@/lib/evidenceExport";

interface MarketingHeroProps {
  onOpenTour: () => void;
}

export default function MarketingHero({ onOpenTour }: MarketingHeroProps) {
  const router = useRouter();
  const { loginAs, isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(6);
  const [replayToast, setReplayToast] = useState<string | null>(null);

  const handleOpenLiveDemo = () => {
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

  const handleReplay = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    setReplayStep(1);
    setReplayToast("Replaying investigation run INV-4821...");

    const intervals = [
      setTimeout(() => setReplayStep(2), 600),
      setTimeout(() => setReplayStep(3), 1200),
      setTimeout(() => setReplayStep(4), 1800),
      setTimeout(() => setReplayStep(5), 2400),
      setTimeout(() => {
        setReplayStep(6);
        setIsReplaying(false);
        setReplayToast("Replay complete: Candidate B accepted · Chain intact ✓");
        setTimeout(() => setReplayToast(null), 3000);
      }, 3000),
    ];
  };

  const handleExportEvidence = () => {
    downloadEvidenceReport({
      problemId: "INV-4821",
      problemTitle: "Checkout Pricing Cache & IDOR Security Boundary",
      filename: "orders.py",
    });
  };

  return (
    <section
      style={{
        position: "relative",
        padding: "48px 28px 24px",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Subtle Industry-Grade Architectural Background Visual (Cyber-Mesh & Sage-Ivory Glow) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-30px",
          left: "-30px",
          right: "-30px",
          bottom: "-30px",
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {/* SVG Architectural Cyber-Mesh Grid */}
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.65,
            animation: "heroMeshFloat 22s ease-in-out infinite alternate",
          }}
        >
          <defs>
            <pattern id="hero-cyber-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path
                d="M 44 0 L 0 0 0 44"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.08"
                style={{ color: "var(--brand)" }}
              />
              <circle cx="0" cy="0" r="1.5" fill="currentColor" fillOpacity="0.22" style={{ color: "var(--brand)" }} />
              <circle cx="44" cy="44" r="1.5" fill="currentColor" fillOpacity="0.22" style={{ color: "var(--brand)" }} />
            </pattern>
            <pattern id="hero-circuits" width="176" height="176" patternUnits="userSpaceOnUse">
              <path
                d="M 22 0 L 22 44 L 66 44 M 132 88 L 132 132 L 88 132 M 0 154 L 44 154"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                strokeOpacity="0.14"
                style={{ color: "var(--brand)" }}
              />
              <circle cx="66" cy="44" r="2.5" fill="currentColor" fillOpacity="0.3" style={{ color: "var(--brand)" }} />
              <circle cx="88" cy="132" r="2.5" fill="currentColor" fillOpacity="0.3" style={{ color: "var(--brand)" }} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-cyber-grid)" />
          <rect width="100%" height="100%" fill="url(#hero-circuits)" />
        </svg>

        {/* Soft Sage-Green Radial Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "20%",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 16%, transparent) 0%, rgba(74, 106, 79, 0.06) 50%, transparent 72%)",
            filter: "blur(60px)",
            animation: "heroGlowPulse 10s ease-in-out infinite alternate",
          }}
        />

        {/* Soft Warm Ivory Radial Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "8%",
            width: "620px",
            height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, color-mix(in srgb, var(--surface2) 85%, transparent) 0%, rgba(246, 241, 230, 0.45) 50%, transparent 75%)",
            filter: "blur(50px)",
            animation: "heroGlowPulse 14s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* Ambient Floating Scanning Ray (Autonomous Verification Engine feel) */}
        <div
          style={{
            position: "absolute",
            left: "0",
            right: "0",
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--brand) 35%, transparent) 50%, transparent 100%)",
            animation: "heroScanRay 8s ease-in-out infinite",
          }}
        />

        <style>{`
          @keyframes heroMeshFloat {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-7px) rotate(0.2deg) scale(1.008); }
            100% { transform: translateY(5px) rotate(-0.2deg) scale(0.995); }
          }
          @keyframes heroGlowPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            100% { opacity: 0.92; transform: scale(1.06); }
          }
          @keyframes heroScanRay {
            0% { top: 0%; opacity: 0; }
            20% { opacity: 0.6; }
            80% { opacity: 0.6; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>

      {/* 2-Column Hero Grid */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1.05fr 1.15fr",
          gap: "40px",
          alignItems: "center",
        }}
      >
        {/* Left Column: Headlines & CTA */}
        <div>
          {/* Sponsor Proof Chip */}
          <div style={{ marginBottom: "16px" }}>
            <span
              className="chip brand"
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                height: "auto",
                fontWeight: 600,
                textTransform: "none",
                letterSpacing: ".02em",
                borderRadius: "20px",
              }}
            >
              <svg style={{ width: "13px", height: "13px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Runs on Nebius Token Factory · NVIDIA Nemotron 3
            </span>
          </div>

          {/* Headline (Lora Serif, 2 lines, no gradient text) */}
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "56px",
              lineHeight: 1.08,
              letterSpacing: "-.02em",
              fontWeight: 600,
              color: resolvedTheme === "dark" ? "#F8FAFC" : "#111827",
              margin: "0 0 20px 0",
            }}
          >
            Make it faster.
            <br />
            Prove it&apos;s still safe.
          </h1>

          {/* Sub-headline */}
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.55,
              color: resolvedTheme === "dark" ? "#CBD5E1" : "#374151",
              maxWidth: "540px",
              margin: "0 0 28px 0",
            }}
          >
            ProofStack investigates a slow endpoint, tests competing fixes in isolated
            sandboxes, and accepts a patch only when correctness, performance and
            security gates all pass. Every step is sealed into a hash-chained evidence ledger.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn lg btn-primary"
              onClick={handleOpenLiveDemo}
              style={{
                cursor: "pointer",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#1D4ED8",
                color: "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(29, 78, 216, 0.25)",
              }}
            >
              Open live demo
            </button>

            <button
              type="button"
              className="btn lg sec btn-secondary"
              onClick={onOpenTour}
              style={{
                cursor: "pointer",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#EFECE6",
                border: "1px solid #D8D3C8",
                color: "#141413",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch the 2-min tour
            </button>
          </div>

          {/* Micro-copy */}
          <div
            style={{
              fontSize: "12px",
              color: "var(--ink3)",
              marginBottom: "28px",
              letterSpacing: ".01em",
            }}
          >
            No sign-up · seeded demo repos · live runs on Nebius Token Factory
          </div>

          {/* Toolchain Chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--ink2)", marginRight: "4px" }}>
              Verifies
            </span>
            <span className="chip">Python 3.11/3.12</span>
            <span className="chip">pytest</span>
            <span className="chip">pyperf</span>
            <span className="chip">cProfile</span>
            <span className="chip">tracemalloc</span>
          </div>
        </div>

        {/* Right Column: Live Verdict Card (INV-4821) */}
        <div>
          <div
            className="card"
            style={{
              padding: "20px 22px",
              boxShadow: "0 14px 34px rgba(0,0,0,0.08)",
              border: "1px solid var(--line)",
              background: "var(--surface)",
              borderRadius: "12px",
            }}
          >
            {/* Header: INV-4821 & Verified badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <b className="mono" style={{ fontSize: "14px", color: "var(--ink)" }}>
                  INV-4821
                </b>
                <span className="mono" style={{ fontSize: "12px", color: "var(--ink2)" }}>
                  /checkout pricing cache
                </span>
              </div>
              <span className="chip pass" style={{ fontWeight: 700 }}>
                <svg style={{ width: "12px", height: "12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified
              </span>
            </div>

            {/* Steps summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--ink)" }}>
                <span style={{ color: "var(--pass)" }}>✓</span>
                <span>Baseline profiled — p95 412 ms</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--ink)" }}>
                <span style={{ color: "var(--pass)" }}>✓</span>
                <span>3 hypotheses tested in sandbox branches</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--ink)" }}>
                <span style={{ color: "var(--pass)" }}>✓</span>
                <span>2 candidate patches drafted (Nemotron 3 Ultra → Lightning)</span>
              </div>
            </div>

            {/* Candidate Comparison (Side-by-Side) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {/* Candidate A · naive cache (REJECTED) */}
              <div
                style={{
                  border: "1px solid color-mix(in srgb, var(--fail) 35%, var(--line))",
                  borderRadius: "8px",
                  padding: "12px",
                  background: "color-mix(in srgb, var(--fail) 3%, var(--surface))",
                  opacity: replayStep < 4 ? 0.6 : 1,
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--ink2)", marginBottom: "4px" }}>
                  Candidate A · naive cache
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: "2px 0 6px",
                  }}
                >
                  15.0× <small style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink2)" }}>faster · p95</small>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--pass)" }}>✓ Tests</span>
                  <span style={{ color: "var(--pass)" }}>✓ Perf</span>
                  <span style={{ color: "var(--fail)", fontWeight: 600 }}>✗ Security</span>
                </div>

                <span className="chip fail" style={{ fontWeight: 700, marginBottom: "6px" }}>
                  REJECTED
                </span>

                <div style={{ fontSize: "11px", color: "var(--fail)", lineHeight: 1.35 }}>
                  Security regression: IDOR across tenants
                </div>
              </div>

              {/* Candidate B · tenant-isolated (ACCEPTED) */}
              <div
                style={{
                  border: "1px solid color-mix(in srgb, var(--pass) 45%, var(--line))",
                  borderRadius: "8px",
                  padding: "12px",
                  background: "color-mix(in srgb, var(--pass) 5%, var(--surface))",
                  boxShadow: "0 2px 8px color-mix(in srgb, var(--pass) 12%, transparent)",
                  opacity: replayStep < 5 ? 0.6 : 1,
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--ink2)", marginBottom: "4px" }}>
                  Candidate B · tenant-isolated
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "var(--pass)",
                    margin: "2px 0 6px",
                  }}
                >
                  4.8× <small style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink2)" }}>faster · p95</small>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--pass)" }}>✓ Tests</span>
                  <span style={{ color: "var(--pass)" }}>✓ Perf</span>
                  <span style={{ color: "var(--pass)" }}>✓ Security</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 600 }}>
                    3/3 gates passed
                  </span>
                  <span className="stamp" style={{ fontSize: "11px", padding: "2px 8px" }}>
                    ACCEPTED
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Ledger Strip */}
            <div
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "11px",
                }}
              >
                <span className="mono" style={{ color: "var(--ink2)" }}>
                  Evidence ledger · hash-chained
                </span>
                <span className="mono" style={{ color: "var(--pass)", fontWeight: 600 }}>
                  Chain intact ✓
                </span>
              </div>

              {/* 6 chained blocks with short hashes */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "4px",
                  marginBottom: "12px",
                }}
              >
                {[
                  { name: "baseline", hash: "a91f…c3", step: 1 },
                  { name: "hypotheses", hash: "77be…10", step: 2 },
                  { name: "experiment", hash: "1c0d…9e", step: 3 },
                  { name: "patch A", hash: "be52…aa", step: 4 },
                  { name: "gate 3", hash: "3f9a…07", step: 5 },
                  { name: "verdict", hash: "d4e1…52", step: 6 },
                ].map((b, i) => {
                  const isActive = replayStep >= b.step;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "6px 4px",
                        border: "1px solid var(--line)",
                        borderRadius: "5px",
                        background: isActive ? "var(--surface2)" : "transparent",
                        textAlign: "center",
                        opacity: isActive ? 1 : 0.4,
                        transition: "all 150ms ease",
                      }}
                    >
                      <div style={{ fontSize: "9.5px", color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.name}
                      </div>
                      <div className="mono" style={{ fontSize: "10px", fontWeight: 600, color: "var(--ink)" }}>
                        {b.hash}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions row: Export evidence (Markdown) & Replay this run */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <button
                  type="button"
                  className="btn sm sec btn-secondary"
                  onClick={handleExportEvidence}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    backgroundColor: "#EFECE6",
                    border: "1px solid #D8D3C8",
                    color: "#141413",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg style={{ width: "12px", height: "12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export evidence (Markdown)
                </button>

                <button
                  type="button"
                  className="btn sm sec btn-secondary"
                  onClick={handleReplay}
                  disabled={isReplaying}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    backgroundColor: "#EFECE6",
                    border: "1px solid #D8D3C8",
                    color: "#141413",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: isReplaying ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg style={{ width: "12px", height: "12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {isReplaying ? "Replaying..." : "▶ Replay this run"}
                </button>
              </div>

              {replayToast && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    borderRadius: "5px",
                    background: "var(--surface2)",
                    fontSize: "11.5px",
                    color: "var(--brand)",
                    fontFamily: "var(--f-mono)",
                    textAlign: "center",
                  }}
                >
                  {replayToast}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hero Bar: Gate Pipeline */}
      <div
        style={{
          marginTop: "42px",
          padding: "16px 20px",
          border: "1px solid var(--line)",
          borderRadius: "10px",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>
            Zero-compromise acceptance: a patch ships only if all three gates pass.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
            <span style={{ color: "var(--pass)", fontWeight: 700 }}>✓</span>
            <b>Gate 1 Correctness</b>
          </div>
          <span style={{ color: "var(--ink3)" }}>—</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
            <span style={{ color: "var(--pass)", fontWeight: 700 }}>✓</span>
            <b>Gate 2 Performance</b>
          </div>
          <span style={{ color: "var(--ink3)" }}>—</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
            <span style={{ color: "var(--pass)", fontWeight: 700 }}>✓</span>
            <b>Gate 3 Security</b>
          </div>
          <a
            href="#three-gates"
            style={{
              fontSize: "12.5px",
              fontWeight: 600,
              color: "var(--brand)",
              textDecoration: "none",
              marginLeft: "10px",
            }}
          >
            How it works ↓
          </a>
        </div>
      </div>
    </section>
  );
}
