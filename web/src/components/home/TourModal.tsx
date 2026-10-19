"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TourModal({ isOpen, onClose }: TourModalProps) {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const steps = [
    {
      title: "1. Slow Endpoint Profiling",
      subtitle: "Baseline profiled: checkout pricing cache p95 = 412 ms",
      code: `def get_pricing_summary(tenant_id: str, cart_id: str):\n    # SLOW: 14 un-indexed DB queries per checkout calculation\n    rates = db.query(TaxRate).filter_by(tenant_id=tenant_id).all()\n    items = db.query(CartItem).filter_by(cart_id=cart_id).all()\n    return calculate_totals(rates, items)`,
      badge: "PROFILED",
      badgeColor: "brand",
      metrics: "p95: 412 ms · 14 SQL queries · CPU: 82%",
    },
    {
      title: "2. Competing Hypotheses Drafted",
      subtitle: "Nemotron-3-Super generates 2 candidate caching strategies",
      code: `# Candidate A: naive redis cache keyed by cart_id\ncache_key = f"cart:{cart_id}"\n\n# Candidate B: tenant-isolated cache with salted tenant token\ncache_key = f"{tenant_id}:{cart_id}"`,
      badge: "HYPOTHESES READY",
      badgeColor: "warn",
      metrics: "Nemotron 3 Ultra → Lightning synthesis · 2 sandboxes booted",
    },
    {
      title: "3. Gate 1 Correctness & Gate 2 Performance",
      subtitle: "Both candidates accelerate endpoint dramatically and pass unit tests",
      code: `Candidate A: 15.0x faster (p95: 27 ms) ✓ 28 tests pass\nCandidate B:  4.8x faster (p95: 86 ms) ✓ 28 tests pass`,
      badge: "G1 & G2 PASSED",
      badgeColor: "pass",
      metrics: "Both speedup gates cleared without functional regressions",
    },
    {
      title: "4. Gate 3 Security (Zero-Compromise Invariant)",
      subtitle: "Candidate A caught leaking tenant data; Candidate B verified safe",
      code: `[GATE G3 SECURITY]\nCandidate A · naive cache:\n  FAIL: Exploit probe demonstrated tenant B can read tenant A pricing!\n  REJECTED: IDOR Vulnerability (CWE-639 / T1-3)\n\nCandidate B · tenant-isolated:\n  PASS: Exploit probe confirmed zero cross-tenant leakage.\n  ACCEPTED: 3/3 Gates passed!`,
      badge: "IDOR BLOCKED",
      badgeColor: "fail",
      metrics: "Candidate A REJECTED · Candidate B ACCEPTED",
    },
    {
      title: "5. Hash-Chained Evidence Ledger Sealed",
      subtitle: "Every profile, candidate, and gate outcome cryptographically sealed",
      code: `Block #0: TASK_INTAKE (8f4b238e...)\nBlock #1: BASELINE_PROFILE (318cb929...)\nBlock #2: HYPOTHESIS_SYNTHESIS (45a89df0...)\nBlock #3: CANDIDATE_PATCH_B (e8901238...)\nBlock #4: GATE_RESULT (d9012389...)\nBlock #5: VERIFIED_COMMIT (b3e94a8f...) -> HEAD #5`,
      badge: "LEDGER VERIFIED",
      badgeColor: "pass",
      metrics: "SHA-256 Chain Intact · Non-repudiable Proof Generated",
    },
  ];

  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, steps.length]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    loginAs("developer");
    onClose();
    router.push("/cockpit/TASK9142");
  };

  const step = steps[currentStep];

  return (
    <div
      className="scrim"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        zIndex: 500,
        padding: "20px",
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "760px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="chip brand">2-Min Product Tour</span>
            <b style={{ fontSize: "14px" }}>Autonomous Verification in Action</b>
          </div>
          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            aria-label="Close modal"
            style={{ width: "28px", height: "28px" }}
          >
            <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {/* Progress Indicators */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {steps.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  flex: 1,
                  height: "4px",
                  borderRadius: "2px",
                  background:
                    idx === currentStep
                      ? "var(--brand)"
                      : idx < currentStep
                      ? "var(--pass)"
                      : "var(--line)",
                  cursor: "pointer",
                  transition: "background 200ms",
                }}
              />
            ))}
          </div>

          {/* Current Step Content */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div>
              <div className="eyebrow" style={{ fontSize: "11px", color: "var(--brand)" }}>
                Step {currentStep + 1} of {steps.length}
              </div>
              <h3 style={{ fontSize: "18px", margin: "4px 0", fontFamily: "var(--f-display)" }}>
                {step.title}
              </h3>
              <p style={{ margin: "2px 0 0", color: "var(--ink2)", fontSize: "12.5px" }}>
                {step.subtitle}
              </p>
            </div>
            <span className={`chip ${step.badgeColor}`}>{step.badge}</span>
          </div>

          {/* Terminal / Code Box */}
          <div
            style={{
              background: "var(--term-bg, #12151F)",
              border: "1px solid #282E44",
              borderRadius: "8px",
              padding: "14px",
              marginTop: "14px",
              color: "#E2E7F5",
              fontFamily: "var(--f-mono)",
              fontSize: "12px",
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              minHeight: "150px",
            }}
          >
            {step.code}
          </div>

          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              borderRadius: "6px",
              background: "var(--surface2)",
              fontSize: "12px",
              fontFamily: "var(--f-mono)",
              color: "var(--ink2)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Telemetry:</span>
            <b style={{ color: "var(--ink)" }}>{step.metrics}</b>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="btn sm sec"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <>
                  <svg style={{ width: "12px", height: "12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg style={{ width: "12px", height: "12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Play
                </>
              )}
            </button>
            <button
              type="button"
              className="btn sm sec"
              onClick={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn sm sec"
              onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
            >
              Next
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button type="button" className="btn sm ghost" onClick={onClose}>
              Dismiss
            </button>
            <button type="button" className="btn sm" onClick={handleLaunch}>
              Open live demo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
