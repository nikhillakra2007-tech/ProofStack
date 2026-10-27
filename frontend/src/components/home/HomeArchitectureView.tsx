"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function HomeArchitectureView({ onOpenTour }: { onOpenTour?: () => void }) {
  const router = useRouter();
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 2]);

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
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Sub-Page Header */}
      <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>
            HIGH-THROUGHPUT ENGINE
          </span>
          <span style={{ fontSize: "12px", background: "#EFF6FF", color: "#1E40AF", padding: "3px 10px", borderRadius: "12px", border: "1px solid #BFDBFE", fontWeight: 600 }}>
            🤖 NVIDIA Nemotron 3 (120B)
          </span>
          <span style={{ fontSize: "12px", background: "#ECFDF5", color: "#065F46", padding: "3px 10px", borderRadius: "12px", border: "1px solid #A7F3D0", fontWeight: 600 }}>
            ⚡ Nebius Token Factory (142ms)
          </span>
          <span style={{ fontSize: "12px", background: "#F0FDF4", color: "#166534", padding: "3px 10px", borderRadius: "12px", border: "1px solid #BBF7D0", fontWeight: 600 }}>
            🔒 Air-Gapped MicroVM
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "40px", fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          Autonomous Verification Pipeline &amp; FAQ
        </h1>

        <p style={{ color: "var(--ink2)", fontSize: "16px", lineHeight: 1.6, margin: "0 auto 24px" }}>
          How ProofStack couples NVIDIA Nemotron 3 on Nebius Token Factory with rootless MicroVM sandboxes
          to evaluate code safely in under 5 seconds.
        </p>

        <div style={{ display: "inline-flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLaunchDemo}
            style={{ padding: "0 22px", height: "40px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
          >
            Launch Interactive Demo →
          </button>
          {onOpenTour && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenTour}
              style={{ padding: "0 18px", height: "40px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
            >
              Watch 2-Min Architecture Tour ↗
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Pipeline Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginBottom: "36px" }}>
        {[
          {
            step: "01",
            title: "Baseline Profile",
            desc: "cProfile & pyperf run against slow target to isolate p95 latency, call graphs, and query count.",
            model: "Deterministic Profiler",
            tag: "pyperf",
            badgeColor: "var(--ink2)",
          },
          {
            step: "02",
            title: "Hypotheses",
            desc: "Nemotron-3-Super 120B synthesizes 3 competing architectural hypotheses in parallel.",
            model: "Nemotron-3-Super 120B",
            tag: "Nebius",
            badgeColor: "var(--brand)",
          },
          {
            step: "03",
            title: "Sandbox Probing",
            desc: "Discriminator spins up isolated microVM worktrees with egress completely severed.",
            model: "Rootless MicroVM",
            tag: "network=none",
            badgeColor: "#10B981",
          },
          {
            step: "04",
            title: "Patch Synthesis",
            desc: "Nemotron-3.5-Lightning writes the precise unified diff with AST invariant annotations.",
            model: "Nemotron-3.5-Lightning",
            tag: "142ms Latency",
            badgeColor: "var(--brand)",
          },
          {
            step: "05",
            title: "Gates & Ledger",
            desc: "Gauntlet runs G0 through G7. Cryptographic verdict is sealed into SHA-256 Merkle chain.",
            model: "Gauntlet Engine",
            tag: "SHA-256",
            badgeColor: "#D97706",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: "22px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "12px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 800 }}>
                  STEP {item.step}
                </span>
                <span className="chip" style={{ fontSize: "10px", padding: "2px 7px" }}>
                  {item.tag}
                </span>
              </div>
              <b style={{ fontSize: "15px", display: "block", marginBottom: "8px", color: "var(--ink)" }}>
                {item.title}
              </b>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
                {item.desc}
              </p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
              <span
                className="chip"
                style={{
                  fontSize: "10.5px",
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

      {/* Unified Architecture Pipeline Diagram */}
      <div
        className="card"
        style={{
          padding: "24px 28px",
          background: "color-mix(in srgb, var(--brand) 3%, var(--surface))",
          border: "1px solid color-mix(in srgb, var(--brand) 25%, var(--line))",
          borderRadius: "12px",
          marginBottom: "40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", fontWeight: 700 }}>
            END-TO-END FLOW
          </div>
          <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "2px 0 0" }}>
            Next.js 14 Console → FastAPI Gauntlet → Nebius Token Factory → MicroVMs
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
            <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>Client UI</div>
            <b style={{ fontSize: "13.5px" }}>Next.js 14 App</b>
            <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}>Edge Render &lt; 50ms</div>
          </div>

          <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
            <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>Verification Core</div>
            <b style={{ fontSize: "13.5px" }}>FastAPI Engine</b>
            <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}>Gauntlet Orchestrator</div>
          </div>

          <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
            <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>Nebius Token Factory</div>
            <b style={{ fontSize: "13.5px" }}>NVIDIA Nemotron 3</b>
            <div style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600, marginTop: "3px" }}>
              142ms · $0.0018 / patch
            </div>
          </div>

          <div style={{ padding: "14px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
            <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "3px" }}>MicroVM Sandboxes</div>
            <b style={{ fontSize: "13.5px" }}>Rootless Linux</b>
            <div style={{ fontSize: "11px", color: "#10B981", fontWeight: 600, marginTop: "3px" }}>
              network=none · 60s cap
            </div>
          </div>
        </div>
      </div>

      {/* Partner & Tech Stack Badges */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div className="eyebrow" style={{ color: "var(--ink2)", marginBottom: "12px", letterSpacing: "0.08em" }}>
          POWERED BY INDUSTRY-GRADE ECOSYSTEM
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "Python 3.12", color: "#3776AB" },
            { label: "FastAPI", color: "#009688" },
            { label: "SQLAlchemy 2.0", color: "#D71F00" },
            { label: "Docker MicroVM", color: "#2496ED" },
            { label: "GitHub Actions", color: "#2088FF" },
            { label: "NVIDIA Nemotron 3", color: "#76B900" },
            { label: "Nebius Token Factory", color: "#0052FF" },
          ].map((tech) => (
            <span
              key={tech.label}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "20px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tech.color }} />
              {tech.label}
            </span>
          ))}
        </div>
      </div>

      {/* Compact Interactive Accordion FAQ */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px", fontWeight: 700 }}>
            TRANSPARENT SCOPE
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>
            Frequently Asked Questions &amp; System Bounds
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "14px", margin: 0 }}>
            No hand-waving or black-box magic. Exactly how ProofStack executes, verifies, and bounds AI patches.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndices.includes(idx);
            return (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: `1.5px solid ${isOpen ? "var(--brand)" : "var(--line)"}`,
                  background: isOpen ? "color-mix(in srgb, var(--brand) 2%, var(--surface))" : "var(--surface)",
                  transition: "all 150ms ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span className="mono" style={{ fontSize: "10.5px", color: "var(--brand)", fontWeight: 700, display: "block", marginBottom: "3px" }}>
                      {faq.category}
                    </span>
                    <b style={{ fontSize: "14px", color: "var(--ink)" }}>{faq.question}</b>
                  </div>
                  <span
                    style={{
                      fontSize: "18px",
                      color: isOpen ? "var(--brand)" : "var(--ink2)",
                      fontWeight: 700,
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 150ms ease",
                      flex: "none",
                    }}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 20px 16px",
                      fontSize: "13px",
                      color: "var(--ink2)",
                      lineHeight: 1.6,
                      borderTop: "1px dashed var(--line)",
                      paddingTop: "12px",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
