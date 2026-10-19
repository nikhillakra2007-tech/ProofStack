"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface MarketingHeroProps {
  onOpenTour: () => void;
}

export default function MarketingHero({ onOpenTour }: MarketingHeroProps) {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(6);
  const [replayToast, setReplayToast] = useState<string | null>(null);

  const handleOpenLiveDemo = () => {
    loginAs("developer");
    router.push("/cockpit/TASK9142");
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
    const md = `# Evidence Ledger Export: INV-4821 / checkout pricing cache
**Verdict**: ACCEPTED
**Runtime**: Nebius Token Factory · NVIDIA Nemotron 3
**Timestamp**: 2026-10-18T18:01:09Z

## Baseline Profile
- Endpoint: \`/checkout/pricing\`
- Latency (p95): 412 ms
- SQL Queries: 14 iterative queries
- Tau Noise Ceiling: 5.0%

## Hypotheses Tested
1. Naive redis caching by cart_id (Rejected - IDOR)
2. In-process cache with LRU eviction (Rejected - Memory leak)
3. Tenant-isolated salted cache (Accepted - 3/3 gates)

## Candidate Comparison
| Candidate | Speedup | Correctness | Perf | Security | Verdict |
|---|---|---|---|---|---|
| Candidate A (naive) | 15.0x p95 | PASS | PASS | FAIL (IDOR) | REJECTED |
| Candidate B (isolated) | 4.8x p95 | PASS | PASS | PASS | ACCEPTED |

## Cryptographic Hash Chain
- Block 0: \`a91f48c3\` (baseline)
- Block 1: \`77be10fa\` (hypotheses)
- Block 2: \`1c0d9e4b\` (experiment)
- Block 3: \`be52aa01\` (patch A)
- Block 4: \`3f9a071c\` (gate G3)
- Block 5: \`d4e1529a\` (verdict)

**Chain Status**: VALID · 0 tamper anomalies detected.
`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "evidence-ledger-INV-4821.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      style={{
        position: "relative",
        padding: "48px 28px 24px",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* 2-Column Hero Grid */}
      <div
        style={{
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
              color: "var(--ink)",
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
              color: "var(--ink2)",
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
              className="btn lg"
              onClick={handleOpenLiveDemo}
              style={{
                cursor: "pointer",
                padding: "0 22px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Open live demo
            </button>

            <button
              type="button"
              className="btn lg sec"
              onClick={onOpenTour}
              style={{
                cursor: "pointer",
                padding: "0 18px",
                fontSize: "14px",
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
                  className="btn sm sec"
                  onClick={handleExportEvidence}
                  style={{ fontSize: "11.5px" }}
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
                  className="btn sm sec"
                  onClick={handleReplay}
                  disabled={isReplaying}
                  style={{ fontSize: "11.5px" }}
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
