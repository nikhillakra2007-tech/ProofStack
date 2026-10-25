"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TourGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  badge: string;
  icon: string;
  description: string;
  highlights: string[];
  suggestedAction?: {
    label: string;
    route: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to ProofStack Verification Engine",
    badge: "STEP 1 OF 5 · OVERVIEW",
    icon: "🚀",
    description:
      "ProofStack is an autonomous DevSecOps verification platform powered by NVIDIA Nemotron on Nebius Token Factory. It deterministically optimizes slow code while mathematically proving zero regressions in correctness, performance, and security.",
    highlights: [
      "Deterministic microVM test harnesses with zero network egress.",
      "Self-healing patches synthesized via NVIDIA Nemotron-3.5-Lightning.",
      "Immutable SHA-256 Merkle chain ensures auditability.",
    ],
    suggestedAction: {
      label: "View Dashboard Overview",
      route: "/dashboard",
    },
  },
  {
    title: "19-Problem Benchmark Catalog",
    badge: "STEP 2 OF 5 · CATALOG",
    icon: "📂",
    description:
      "Explore 19 industrial benchmark problem fixtures categorized across Performance, Security, Concurrency, and Resource boundaries (T1-1 through T3-4).",
    highlights: [
      "T1-1: Catastrophic Regex Backtracking (ReDoS) in auth/validators.py.",
      "T1-2: N+1 Query Explosion & SQL-Injection Trap in orders.py.",
      "T1-3: Multi-Tenant Cache IDOR Boundary in cache/store.py.",
      "T1-4: Quadratic O(n²) Reconciliation Contention in billing/reconcile.py.",
    ],
    suggestedAction: {
      label: "Open Benchmark Catalog",
      route: "/catalog",
    },
  },
  {
    title: "Zero-Compromise Gauntlet (Gates G0–G7)",
    badge: "STEP 3 OF 5 · GAUNTLET",
    icon: "🛡️",
    description:
      "Every candidate patch is subjected to 8 rigorous gates. Naive AI shortcuts are immediately vetoed if they violate security invariants or break edge cases.",
    highlights: [
      "G0 AST Scan · G1 Correctness · G2 Security Exploit Oracle",
      "G3 Identity Preservation Guard (tenant_id / user_id AST binding)",
      "G4 Concurrency Watchdog · G5 Performance (ΔPerf > τ_noise)",
      "G6 Resource Leak Detector · G7 Patch Hygiene Scope",
    ],
    suggestedAction: {
      label: "Inspect Cockpit Invariants",
      route: "/cockpit/TASK9142",
    },
  },
  {
    title: "Studio: Monaco Split Diff & Live Editable Code",
    badge: "STEP 4 OF 5 · STUDIO",
    icon: "💻",
    description:
      "In /studio, inspect baseline vulnerable code side-by-side with Candidate AI patches. You can also switch to 'Edit / Custom Code' mode to write or paste your own code and execute it against rootless sandboxes.",
    highlights: [
      "Dynamic baseline vs. candidate split diff with synchronized highlights.",
      "One-click switching: Bug Snippet ➔ Naive AI Patch ➔ Safe Fix ➔ Custom Code.",
      "Interactive 'Run Code ↵' evaluates candidate code via backend microVM.",
    ],
    suggestedAction: {
      label: "Open Studio Code Editor",
      route: "/studio",
    },
  },
  {
    title: "Cryptographic SHA-256 Ledger & Reports",
    badge: "STEP 5 OF 5 · EVIDENCE",
    icon: "📜",
    description:
      "Every accepted patch, hypothesis discrimination score, and gate verdict is cryptographically hashed and chained into an append-only ledger.",
    highlights: [
      "SHA-256 Merkle chain with interactive tamper simulation.",
      "One-click 'Export Evidence (Markdown)' generates comprehensive audit reports.",
      "Non-repudiable proof signed by Nebius Token Factory / NVIDIA Nemotron.",
    ],
    suggestedAction: {
      label: "Inspect Evidence Ledger",
      route: "/ledger",
    },
  },
];

export default function TourGuideModal({ isOpen, onClose }: TourGuideModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (currentStep < TOUR_STEPS.length - 1) setCurrentStep((p) => p + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) setCurrentStep((p) => p - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, onClose]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleActionClick = () => {
    if (step.suggestedAction) {
      onClose();
      router.push(step.suggestedAction.route);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8, 12, 20, 0.48)",
        display: "grid",
        placeItems: "center",
        zIndex: 10000,
        padding: "20px",
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "24px 28px",
          borderRadius: "14px",
          border: "1px solid var(--line)",
          background: "var(--surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--line)",
          animation: "fadeIn 120ms ease-out",
          position: "relative",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="chip brand" style={{ fontSize: "10px", fontWeight: 700 }}>
              {step.badge}
            </span>
          </div>
          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            aria-label="Close guide"
            style={{ width: "28px", height: "28px" }}
          >
            <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step Title & Icon */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "28px", lineHeight: 1 }}>{step.icon}</span>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
              {step.title}
            </h2>
            <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--ink2)", margin: 0 }}>
              {step.description}
            </p>
          </div>
        </div>

        {/* Key Highlights */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "var(--surface2)",
            border: "1px solid var(--line)",
            marginBottom: "20px",
          }}
        >
          <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: "8px" }}>
            KEY CAPABILITIES
          </div>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: 1.6, color: "var(--ink)" }}>
            {step.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        {/* Suggested Jump Action */}
        {step.suggestedAction && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--ink2)" }}>Want to try this right now?</span>
            <button
              type="button"
              className="btn sm sec"
              onClick={handleActionClick}
              style={{ fontSize: "11.5px", cursor: "pointer" }}
            >
              {step.suggestedAction.label} →
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--line)",
            paddingTop: "16px",
          }}
        >
          {/* Dot Step Indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? "18px" : "7px",
                  height: "7px",
                  borderRadius: "4px",
                  background: idx === currentStep ? "var(--brand)" : "var(--ink3)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title={`Go to Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn sm sec"
              onClick={handleBack}
              disabled={isFirst}
              style={{
                cursor: isFirst ? "not-allowed" : "pointer",
                opacity: isFirst ? 0.4 : 1,
                fontSize: "12px",
              }}
            >
              ← Back
            </button>

            <button
              type="button"
              className="btn sm"
              onClick={handleNext}
              style={{ fontSize: "12px", cursor: "pointer" }}
            >
              {isLast ? "Done · Explore Cockpit ✓" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
