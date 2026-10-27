"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Runtimes & Compatibility",
    question: "What languages and frameworks are supported in ProofStack v0.1?",
    answer:
      "v0.1 focuses deeply on production Python 3.11/3.12 services (FastAPI, SQLAlchemy, asyncio, Pydantic). It runs full pyperf regression benchmarks and exploit replay suites. Node.js (TypeScript) and Go detectors are scheduled for upcoming 2026 releases.",
  },
  {
    category: "Safety & Governance",
    question: "Does ProofStack ever auto-merge patches to production without human review?",
    answer:
      "Never without explicit engineer sign-off. A patch must pass all eight gates (G0 through G7) with zero regressions, and an authorized developer or admin must review the unified diff before accepting it.",
  },
  {
    category: "MicroVM Sandboxing",
    question: "How are candidate patches isolated during execution?",
    answer:
      "Every candidate patch is evaluated inside an isolated rootless microVM with network egress completely disabled (network=none), hard seccomp syscall filters, a 60-second execution deadline, and a 1 GB RAM quota.",
  },
  {
    category: "Cryptographic Audit",
    question: "Can the evidence ledger or verification chain be forged?",
    answer:
      "No. Every single run event—from baseline telemetry to gate verdicts—is sealed with SHA-256 in a Merkle-linked chain (entry_hash = SHA256(prev_hash + body)). Any modification to any past record immediately breaks downstream integrity.",
  },
  {
    category: "AI Architecture",
    question: "How does the Nebius Token Factory and NVIDIA Nemotron 3 integration work?",
    answer:
      "ProofStack splits optimization into specialized tasks: Nemotron-3-Super (120B) synthesizes competing architectural hypotheses, while Nemotron-3.5-Lightning generates precise defensive patches on Nebius Token Factory with sub-150ms token latency.",
  },
  {
    category: "Statistical Rigor",
    question: "How does ProofStack eliminate false positives in performance gains?",
    answer:
      "We enforce a statistical noise floor (τ_noise = 5.0%) using pyperf with multiple warmups and repetitions. If a candidate's speedup does not exceed the 99% confidence interval above baseline variance, it is rejected by Gate 5.",
  },
];

export default function ScrollStorySections() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleLaunchDemo = () => {
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
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", width: "100%" }}>
      {/* =========================================================================
          SECTION 1: THREE GATES (WITH HOVER LIFT MOTION & CLEAN ICONS)
          ========================================================================= */}
      <section id="three-gates" style={{ padding: "72px 0 64px", borderTop: "1px solid var(--line)" }}>
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 44px" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "8px", fontWeight: 600 }}>
            The Zero-Compromise Policy
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "38px", fontWeight: 600, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
            Three gates. One verdict in 5 seconds.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
            Standard AI copilot fixes make code fast by silently stripping auth checks or introducing race conditions.
            ProofStack evaluates candidate patches simultaneously across three strict gates.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "22px" }}>
          {/* Gate 1: Correctness */}
          <div
            className="card interactive-gate-card"
            style={{
              padding: "26px",
              position: "relative",
              overflow: "hidden",
              transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, border-color 220ms ease",
              cursor: "default",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--pass)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "color-mix(in srgb, var(--pass) 12%, var(--surface))",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--pass)",
                  }}
                >
                  <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700 }}>Gate 1</span>
              </div>
              <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>
                PASS 28/28
              </span>
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 600, margin: "0 0 10px", color: "var(--ink)" }}>
              Correctness Gate
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--ink2)", lineHeight: 1.55, margin: "0 0 18px", minHeight: "44px" }}>
              Re-executes original unit and integration test suites inside an ephemeral rootless microVM. Zero behavioral drift permitted.
            </p>
            <div className="mono" style={{ fontSize: "11px", padding: "10px 12px", background: "var(--surface2)", borderRadius: "6px", color: "var(--ink)" }}>
              pytest · coverage ≥ baseline · 0 regressions
            </div>
          </div>

          {/* Gate 2: Performance */}
          <div
            className="card interactive-gate-card"
            style={{
              padding: "26px",
              position: "relative",
              overflow: "hidden",
              transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, border-color 220ms ease",
              cursor: "default",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--pass)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "color-mix(in srgb, var(--brand) 12%, var(--surface))",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--brand)",
                  }}
                >
                  <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700 }}>Gate 2</span>
              </div>
              <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>
                PASS +74.2%
              </span>
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 600, margin: "0 0 10px", color: "var(--ink)" }}>
              Performance Gate
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--ink2)", lineHeight: 1.55, margin: "0 0 18px", minHeight: "44px" }}>
              Statistically isolates wall-clock and CPU time above measurement noise floor (τ_noise = 5.0%). Proves mathematical speedup.
            </p>
            <div className="mono" style={{ fontSize: "11px", padding: "10px 12px", background: "var(--surface2)", borderRadius: "6px", color: "var(--ink)" }}>
              pyperf · cProfile · tracemalloc &lt; 20 MB
            </div>
          </div>

          {/* Gate 3: Security */}
          <div
            className="card interactive-gate-card"
            style={{
              padding: "26px",
              position: "relative",
              overflow: "hidden",
              transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, border-color 220ms ease",
              cursor: "default",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--pass)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "color-mix(in srgb, var(--accent) 15%, var(--surface))",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--accent)",
                  }}
                >
                  <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700 }}>Gate 3</span>
              </div>
              <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>
                PASS 0 LEAKS
              </span>
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 600, margin: "0 0 10px", color: "var(--ink)" }}>
              Security Gate
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--ink2)", lineHeight: 1.55, margin: "0 0 18px", minHeight: "44px" }}>
              Replays exploit oracles for IDOR, SQL injection, ReDoS, and auth bypass. If speed breaks safety, the patch is killed immediately.
            </p>
            <div className="mono" style={{ fontSize: "11px", padding: "10px 12px", background: "var(--surface2)", borderRadius: "6px", color: "var(--ink)" }}>
              Exploit oracles · tenant isolation · AST bans
            </div>
          </div>
        </div>

        {/* Hover Lift Style */}
        <style>{`
          .interactive-gate-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
            border-color: color-mix(in srgb, var(--brand) 40%, var(--line));
          }
        `}</style>
      </section>

      {/* =========================================================================
          SECTION 2: THE 5-STEP PIPELINE & RUNS ON NEBIUS TOKEN FACTORY / NEMOTRON 3
          ========================================================================= */}
      <section id="pipeline" style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 40px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "8px", fontWeight: 600 }}>
            Autonomous Engine Pipeline
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
            The 5-Step Pipeline &amp; Runs on Nebius Token Factory
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
            From baseline runtime profiling to cryptographic evidence sealing, every step is orchestrated with NVIDIA Nemotron 3 in isolated microVMs.
          </p>
        </div>

        {/* 5-Step Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "32px" }}>
          {[
            {
              step: "01",
              title: "Baseline Profile",
              desc: "cProfile & pyperf run against slow target to isolate p95 latency and query count.",
              model: "Runtime Harness",
              tag: "Deterministic",
              badgeColor: "var(--ink2)",
            },
            {
              step: "02",
              title: "Hypotheses",
              desc: "Nemotron-3-Super synthesizes 3 competing architectural hypotheses.",
              model: "Nemotron-3-Super 120B",
              tag: "Token Factory",
              badgeColor: "var(--brand)",
            },
            {
              step: "03",
              title: "Sandbox Probing",
              desc: "Discriminator spins up isolated sandbox worktrees with network disabled.",
              model: "Rootless MicroVM",
              tag: "Isolated",
              badgeColor: "var(--pass)",
            },
            {
              step: "04",
              title: "Patch Synthesis",
              desc: "Nemotron-3.5-Lightning writes the candidate defensive code patch.",
              model: "Nemotron-3.5-Lightning",
              tag: "Fast & Exact",
              badgeColor: "var(--brand)",
            },
            {
              step: "05",
              title: "Gates & Ledger",
              desc: "Gauntlet executes G0–G7. Verdict is sealed into SHA-256 evidence chain.",
              model: "Gauntlet Engine",
              tag: "Cryptographic",
              badgeColor: "var(--accent)",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="card interactive-gate-card"
              style={{
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "10px",
                transition: "transform 200ms ease, box-shadow 200ms ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span className="mono" style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 700 }}>
                    STEP {item.step}
                  </span>
                  <span className="chip" style={{ fontSize: "9.5px", padding: "2px 7px", height: "auto" }}>
                    {item.tag}
                  </span>
                </div>
                <b style={{ fontSize: "14.5px", display: "block", marginBottom: "8px", color: "var(--ink)" }}>
                  {item.title}
                </b>
                <p style={{ fontSize: "12px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  {item.desc}
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
                <span
                  className="chip"
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: item.badgeColor,
                    borderColor: `color-mix(in srgb, ${item.badgeColor} 25%, var(--line))`,
                  }}
                >
                  {item.model}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Unified Infrastructure Diagram Banner */}
        <div
          className="card"
          style={{
            padding: "24px 28px",
            background: "color-mix(in srgb, var(--brand) 3%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--brand) 25%, var(--line))",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
              gap: "12px",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>Frontend Client</div>
              <b style={{ fontSize: "13.5px" }}>Next.js 14 Console</b>
              <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}>&lt; 50ms Edge Render</div>
            </div>

            <div style={{ color: "var(--brand)", fontWeight: 700, fontSize: "16px" }}>→</div>

            <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>Verification Core</div>
              <b style={{ fontSize: "13.5px" }}>FastAPI Engine</b>
              <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}>Gauntlet Orchestrator</div>
            </div>

            <div style={{ color: "var(--brand)", fontWeight: 700, fontSize: "16px" }}>→</div>

            <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>Nebius Token Factory</div>
              <b style={{ fontSize: "13.5px" }}>NVIDIA Nemotron 3</b>
              <div style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600, marginTop: "3px" }}>
                142ms Latency · $0.0018 / patch
              </div>
            </div>

            <div style={{ color: "var(--brand)", fontWeight: 700, fontSize: "16px" }}>→</div>

            <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>MicroVM Sandboxes</div>
              <b style={{ fontSize: "13.5px" }}>Rootless Linux</b>
              <div style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 600, marginTop: "3px" }}>
                network=none · 60s cap
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INTERACTIVE ACCORDION FAQ (COMPACT SCOPE)
          ========================================================================= */}
      <section id="faq" style={{ padding: "48px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto 28px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px", fontWeight: 600, fontSize: "11px" }}>
            Transparent Scope
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "28px", fontWeight: 600, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
            FAQ &amp; Honest Limits
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "13.5px", lineHeight: 1.5, margin: 0 }}>
            No exaggerated claims or opaque AI hand-waving. Here is exactly how ProofStack operates and verifies code today.
          </p>
        </div>

        {/* Collapsible Accordion Container */}
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndices.includes(idx);
            return (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: `1px solid ${isOpen ? "color-mix(in srgb, var(--brand) 40%, var(--line))" : "var(--line)"}`,
                  background: isOpen ? "color-mix(in srgb, var(--brand) 2%, var(--surface))" : "var(--surface)",
                  transition: "border-color 180ms ease, background 180ms ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                    gap: "14px",
                  }}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className="chip brand"
                      style={{ fontSize: "9.5px", padding: "1px 7px", height: "auto", flexShrink: 0 }}
                    >
                      {faq.category}
                    </span>
                    <b style={{ fontSize: "13.5px", color: "var(--ink)", fontWeight: 600 }}>
                      {faq.question}
                    </b>
                  </div>
                  <div
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms ease",
                      color: isOpen ? "var(--brand)" : "var(--ink3)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 16px 14px",
                      borderTop: "1px solid var(--line)",
                      paddingTop: "10px",
                      color: "var(--ink2)",
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FINAL CTA & ENTERPRISE FOOTER
          ========================================================================= */}
      <section style={{ padding: "64px 0 0", borderTop: "1px solid var(--line)" }}>
        {/* Repeat CTA Box */}
        <div
          className="card"
          style={{
            padding: "48px 36px",
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 auto 64px",
            background: "color-mix(in srgb, var(--brand) 5%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--brand) 30%, var(--line))",
            borderRadius: "14px",
          }}
        >
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "34px", fontWeight: 600, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
            Deploy verified AI fixes with zero compromises.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", maxWidth: "600px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            Explore live seed investigations, run active DAST probes, and inspect cryptographic evidence ledgers today.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn lg btn-primary"
              onClick={handleLaunchDemo}
              style={{
                padding: "12px 24px",
                fontWeight: 600,
                cursor: "pointer",
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
              Open Live Demo
            </button>
            <Link
              href="/catalog"
              className="btn lg sec btn-secondary"
              style={{
                padding: "12px 22px",
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "#EFECE6",
                border: "1px solid #D8D3C8",
                color: "#141413",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Browse 19 Problem Classes →
            </Link>
          </div>
        </div>

        {/* Enterprise Footer */}
        <footer style={{ borderTop: "1px solid var(--line)", paddingTop: "48px", paddingBottom: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "32px", marginBottom: "40px" }}>
            {/* Brand Block */}
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
                <b style={{ fontFamily: "var(--f-display)", fontSize: "18px" }}>ProofStack</b>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.55, margin: "0 0 14px", maxWidth: "260px" }}>
                Autonomous verification for AI-written fixes: make it faster, with cryptographic proof it is still safe.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="chip" style={{ fontSize: "10px" }}>Open source · Apache-2.0</span>
              </div>
            </div>

            {/* Column 1: Platform */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Platform
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/studio">DevSecOps Studio</Link>
                <Link href="/cockpit/TASK9142">Verification Cockpit</Link>
                <Link href="/findings">Findings &amp; DAST</Link>
                <Link href="/ledger">Evidence Ledger</Link>
              </div>
            </div>

            {/* Column 2: Verifiers */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Verifiers
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <Link href="/catalog">Benchmark Catalog (19)</Link>
                <span>Correctness Gate (G1)</span>
                <span>Performance Gate (G5)</span>
                <span>Security Gate (G2)</span>
                <span>Zero-Noise Statistics</span>
              </div>
            </div>

            {/* Column 3: Architecture */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Architecture
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <span>NVIDIA Nemotron 3</span>
                <span>Nebius Token Factory</span>
                <span>Rootless MicroVMs</span>
                <span>SHA-256 Merkle Ledger</span>
                <span>Multi-Tenant RBAC</span>
              </div>
            </div>

            {/* Column 4: Access */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Access
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <Link href="/login">Sign In / Sign Up</Link>
                <Link href="/control-plane">Admin Control Plane</Link>
                <Link href="/settings">Settings &amp; Keys</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub Repository ↗</a>
              </div>
            </div>
          </div>

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
              gap: "10px",
            }}
          >
            <div>© 2026 ProofStack Engine. Autonomous DevSecOps &amp; Cryptographic Verification.</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <span>Privacy Policy</span>
              <span>Security Invariants</span>
              <span>Status: All Systems Operational</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
