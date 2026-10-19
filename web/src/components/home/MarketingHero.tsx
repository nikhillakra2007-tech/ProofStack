"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

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
        padding: "80px 28px 60px",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Animated mesh gradient background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 20% 40%, color-mix(in srgb, var(--brand) 18%, transparent) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 40% at 85% 60%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 50%)," +
            "radial-gradient(ellipse 40% 30% at 50% 90%, color-mix(in srgb, var(--pass) 8%, transparent) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--brand) 4%, transparent) 1px, transparent 1px)," +
            "linear-gradient(90deg, color-mix(in srgb, var(--brand) 4%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1.05fr 1.15fr",
          gap: "60px",
          alignItems: "center",
        }}
      >
        {/* Left Column: Headlines & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div style={{ marginBottom: "20px" }}>
            <motion.span
              className="chip brand"
              style={{
                fontSize: "11px",
                padding: "5px 14px",
                height: "auto",
                fontWeight: 600,
                textTransform: "none",
                letterSpacing: ".02em",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg style={{ width: "13px", height: "13px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Runs on Nebius Token Factory · NVIDIA Nemotron 3
            </motion.span>
          </div>

          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "64px",
              lineHeight: 1.05,
              letterSpacing: "-.03em",
              fontWeight: 600,
              color: "var(--ink)",
              margin: "0 0 24px 0",
            }}
          >
            Make it faster.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Prove it&apos;s still safe.
            </span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.6,
              color: "var(--ink2)",
              maxWidth: "520px",
              margin: "0 0 32px 0",
            }}
          >
            ProofStack investigates a slow endpoint, tests competing fixes in isolated
            sandboxes, and accepts a patch only when correctness, performance and
            security gates all pass. Every step is sealed into a hash-chained evidence ledger.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px", flexWrap: "wrap" }}>
            <motion.button
              type="button"
              className="btn lg"
              onClick={handleOpenLiveDemo}
              style={{
                cursor: "pointer",
                padding: "0 28px",
                fontSize: "14px",
                fontWeight: 600,
                background: "linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 80%, var(--accent)))",
                border: "none",
                color: "#fff",
                borderRadius: "12px",
                height: "48px",
                boxShadow: "0 4px 24px color-mix(in srgb, var(--brand) 30%, transparent)",
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 32px color-mix(in srgb, var(--brand) 40%, transparent)" }}
              whileTap={{ scale: 0.98 }}
            >
              Open live demo
            </motion.button>

            <motion.button
              type="button"
              className="btn lg sec"
              onClick={onOpenTour}
              style={{
                cursor: "pointer",
                padding: "0 20px",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                height: "48px",
                border: "1px solid var(--line)",
                background: "var(--surface)",
              }}
              whileHover={{ scale: 1.02, borderColor: "var(--brand)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch the 2-min tour
            </motion.button>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--ink3)",
              marginBottom: "32px",
              letterSpacing: ".01em",
            }}
          >
            No sign-up · seeded demo repos · live runs on Nebius Token Factory
          </div>

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
        </motion.div>

        {/* Right Column: Live Verdict Card (INV-4821) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className="card"
            style={{
              padding: "24px 26px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px color-mix(in srgb, var(--brand) 15%, transparent)",
              border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)",
              background: "color-mix(in srgb, var(--surface) 80%, transparent)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow accent */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-40%",
                right: "-20%",
                width: "300px",
                height: "300px",
                background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 15%, transparent) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                position: "relative",
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

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px", position: "relative" }}>
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "18px",
                position: "relative",
              }}
            >
              <div
                style={{
                  border: "1px solid color-mix(in srgb, var(--fail) 30%, transparent)",
                  borderRadius: "12px",
                  padding: "14px",
                  background: "color-mix(in srgb, var(--fail) 5%, var(--surface))",
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
                    fontSize: "28px",
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

              <div
                style={{
                  border: "1px solid color-mix(in srgb, var(--pass) 40%, transparent)",
                  borderRadius: "12px",
                  padding: "14px",
                  background: "color-mix(in srgb, var(--pass) 5%, var(--surface))",
                  boxShadow: "0 4px 20px color-mix(in srgb, var(--pass) 10%, transparent)",
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
                    fontSize: "28px",
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

            <div
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: "14px",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "4px",
                  marginBottom: "14px",
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
                        padding: "8px 4px",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
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
                    marginTop: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "color-mix(in srgb, var(--brand) 10%, var(--surface))",
                    fontSize: "11.5px",
                    color: "var(--brand)",
                    fontFamily: "var(--f-mono)",
                    textAlign: "center",
                    border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)",
                  }}
                >
                  {replayToast}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Hero Bar: Gate Pipeline */}
      <motion.div
        style={{
          marginTop: "48px",
          padding: "20px 24px",
          border: "1px solid color-mix(in srgb, var(--brand) 15%, transparent)",
          borderRadius: "14px",
          background: "color-mix(in srgb, var(--surface) 60%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          position: "relative",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>
            Zero-compromise acceptance: a patch ships only if all three gates pass.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
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
      </motion.div>
    </section>
  );
}
