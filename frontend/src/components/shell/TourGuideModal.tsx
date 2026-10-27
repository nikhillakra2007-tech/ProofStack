"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
  selector?: string;
  suggestedAction?: {
    label: string;
    route: string;
  };
}

export default function TourGuideModal({ isOpen, onClose }: TourGuideModalProps) {
  const router = useRouter();
  const { role, activeMember } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Define dedicated 4-step tour tailored specifically to the active role
  const getRoleSteps = (): TourStep[] => {
    if (role === "developer") {
      return [
        {
          title: "Developer Workspace & Assigned Tasks",
          badge: `STEP 1 OF 4 · ${activeMember.name.toUpperCase()}`,
          icon: "👨‍💻",
          description:
            "Your workspace is tailored for autonomous optimization. Review your assigned tasks, monitor latency reduction (e.g., 428ms → 12ms), and launch rootless microVM sandboxes.",
          highlights: [
            "My Assigned Tasks: Direct benchmark fixtures allocated to your avatar.",
            "Visual latency reduction & SQL query elimination tracking.",
            "One-click launch into the Monaco code studio.",
          ],
          suggestedAction: { label: "Go to Dashboard", route: "/dashboard" },
        },
        {
          title: "Monaco Split Diff & Live Execution",
          badge: "STEP 2 OF 4 · STUDIO",
          icon: "💻",
          description:
            "In /studio, inspect baseline vulnerable code against Candidate AI patches. You can also switch to 'Edit / Custom Code' mode to run code live in Linux 6.6 sandboxes.",
          highlights: [
            "Dynamic split diff with synchronized syntax highlighting.",
            "Live 'Run Code ↵' evaluates candidate code via rootless microVM.",
            "Self-Heal: NVIDIA Nemotron-3.5-Lightning repair cycles.",
          ],
          suggestedAction: { label: "Open Studio", route: "/studio?problem=T1-2" },
        },
        {
          title: "Zero-Compromise Gauntlet (Gates G0–G7)",
          badge: "STEP 3 OF 4 · GAUNTLET",
          icon: "🛡️",
          description:
            "Every optimization candidate is evaluated against 8 rigorous gates before referral. Regressions, security flaws, or identity leaks trigger immediate vetoes.",
          highlights: [
            "G0 AST Scan · G1 Correctness · G2 Security Exploit Oracle.",
            "G3 Identity Preservation Guard (tenant_id / user_id AST binding).",
            "G5 Performance (ΔPerf > τ_noise) ensures true speedup.",
          ],
          suggestedAction: { label: "Inspect Cockpit Invariants", route: "/cockpit/TASK9142" },
        },
        {
          title: "Submit Patch for Security Audit",
          badge: "STEP 4 OF 4 · AUDIT HANDOFF",
          icon: "✅",
          description:
            "Once all 8 gates pass, click '✅ Submit Patch for Security Audit (OK)'. The patch is dispatched directly to the Security Auditor queue for formal verification and ledger sealing.",
          highlights: [
            "Interactive handoff to Elena Rostova or Rohan Verma.",
            "Real-time status tracking: 'Pending Audit' ➔ 'Sealed to Ledger'.",
            "No direct merge until formal auditor verification.",
          ],
          suggestedAction: { label: "View Audit Status in Dashboard", route: "/dashboard" },
        },
      ];
    }

    if (role === "auditor") {
      return [
        {
          title: "Security Auditor Console & Queue",
          badge: `STEP 1 OF 4 · ${activeMember.name.toUpperCase()}`,
          icon: "🛡️",
          description:
            "As a Security Auditor, your role is formal verification and cryptographic signing. Inspect pending patches referred by developers and verify 8/8 gates.",
          highlights: [
            "Pending Developer Patch Approvals queue right on your dashboard.",
            "One-click '🛡️ Audit OK — Approve & Seal to Ledger'.",
            "Full tamper detection and SHA-256 Merkle chain verification.",
          ],
          suggestedAction: { label: "Open Auditor Dashboard", route: "/dashboard" },
        },
        {
          title: "Pending Developer Patch Verification",
          badge: "STEP 2 OF 4 · APPROVAL PIPELINE",
          icon: "🔍",
          description:
            "Review patches submitted by developers like Nitin Pandey or Alex Chen. Verify AST invariants, query complexity drop, and security boundary isolation.",
          highlights: [
            "orders.py: +74.2% speedup, 428ms → 12ms, 8/8 gates verified.",
            "Audit OK creates an immutable cryptographic commit.",
            "Reject & Return triggers an autonomous repair cycle with feedback.",
          ],
          suggestedAction: { label: "Inspect Findings", route: "/findings" },
        },
        {
          title: "DAST Scanner & Invariant Breakdown",
          badge: "STEP 3 OF 4 · DAST SUITE",
          icon: "⚡",
          description:
            "Inspect live dynamic vulnerability scans (missing CSP, exposed AWS credentials, DOM-based XSS, and cookie security flags) with zero false-positives.",
          highlights: [
            "Deterministic DAST scanners for production staging.",
            "Severity breakdown across Critical, High, and Medium.",
            "Immediate remediation patches synthesized via Nemotron.",
          ],
          suggestedAction: { label: "View DAST Console", route: "/findings" },
        },
        {
          title: "Cryptographic SHA-256 Ledger & Reports",
          badge: "STEP 4 OF 4 · MERKLE AUDIT",
          icon: "📜",
          description:
            "Inspect append-only ledger blocks, simulate cryptographic tampering on Block #2, and export non-repudiable audit markdown packs for regulatory compliance.",
          highlights: [
            "SHA-256 Merkle hash chain with live tamper detection.",
            "Export Audit Pack (.md) with full signing metadata.",
            "Non-repudiable proof signed by Nebius Token Factory.",
          ],
          suggestedAction: { label: "Open Evidence Ledger", route: "/ledger" },
        },
      ];
    }

    if (role === "admin") {
      return [
        {
          title: "Workspace Admin & Team Governance",
          badge: `STEP 1 OF 4 · ${activeMember.name.toUpperCase()}`,
          icon: "⚙️",
          description:
            "Manage resource budgets, allocate benchmark optimization tasks across Developers and Auditors, and maintain operational stability.",
          highlights: [
            "Interactive token budget sliders for all team members.",
            "Task & Project Allocation Corridor to dispatch benchmark problems.",
            "MicroVM pool saturation telemetry.",
          ],
          suggestedAction: { label: "Open Admin Dashboard", route: "/dashboard" },
        },
        {
          title: "Interactive Token Budget Allocation",
          badge: "STEP 2 OF 4 · RESOURCE QUOTAS",
          icon: "📊",
          description:
            "Adjust NVIDIA Nemotron LLM token limits per developer and auditor in real time to prevent runaway cloud inference spend.",
          highlights: [
            "Real-time slider controls from 10k to 200k tokens.",
            "Instant quota propagation across microVM tenant boundaries.",
            "Usage alerts and saturation monitoring.",
          ],
          suggestedAction: { label: "Adjust Quotas", route: "/dashboard" },
        },
        {
          title: "Task & Project Allocation Corridor",
          badge: "STEP 3 OF 4 · DISPATCH",
          icon: "📂",
          description:
            "Assign benchmark fixtures (e.g., T1-2 N+1 query in orders.py) directly to Nitin Pandey or Alex Chen with priority levels and speedup targets.",
          highlights: [
            "One-click task assignment modal.",
            "Seamless synchronization with the Developer's active dashboard.",
            "Tracks progress from Assigned ➔ Audit Pending ➔ Completed.",
          ],
          suggestedAction: { label: "Assign New Task", route: "/dashboard" },
        },
        {
          title: "Control Plane & 19-Problem Benchmark Catalog",
          badge: "STEP 4 OF 4 · CATALOG",
          icon: "🏛️",
          description:
            "Browse 19 industrial test cases across Performance, Security, Concurrency, and Resource categories, and configure governance policies.",
          highlights: [
            "Access to the 19-Problem Catalog and problem specifications.",
            "Control Plane tenant boundary telemetry.",
            "Central findings triage and remediation overview.",
          ],
          suggestedAction: { label: "Open Benchmark Catalog", route: "/catalog" },
        },
      ];
    }

    // Super Admin
    return [
      {
        title: "Super Admin Global Fleet Health",
        badge: `STEP 1 OF 4 · ${activeMember.name.toUpperCase()}`,
        icon: "👑",
        description:
          "Root authority over the entire ProofStack autonomous verification platform. Monitor 99.4% global fleet health, global token spend, and MicroVM firecracker workers.",
        highlights: [
          "SonarQube/NERA SVG circular fleet health donut ring.",
          "Global token quota monitoring across all tenants.",
          "MicroVM pool telemetry: 16 sandboxes, zero network egress leaks.",
        ],
        suggestedAction: { label: "View Fleet Dashboard", route: "/dashboard" },
      },
      {
        title: "Workspace Admins Governance Control",
        badge: "STEP 2 OF 4 · GOVERNANCE",
        icon: "👥",
        description:
          "Delegate, audit, and manage intermediate Workspace Admins (Marcus Vance, Priya Nair). Super Admin maintains root privilege to suspend or reactivate admins.",
        highlights: [
          "Direct control table over delegated workspace administrators.",
          "One-click suspend / reactivate governance toggle.",
          "Enforces organizational security boundaries.",
        ],
        suggestedAction: { label: "Manage Workspace Admins", route: "/dashboard" },
      },
      {
        title: "Emergency Policy Override (G0–G7)",
        badge: "STEP 3 OF 4 · EMERGENCY OVERRIDE",
        icon: "🚨",
        description:
          "During critical incident recovery, Super Admin has exclusive power to toggle Emergency Policy Override to bypass specific gauntlet invariants.",
        highlights: [
          "Exclusive Super Admin root capability.",
          "Bypasses Gate G3 identity locks or G4 concurrency watchdogs during recovery.",
          "All override actions are permanently logged into the SHA-256 ledger.",
        ],
        suggestedAction: { label: "Inspect Override Controls", route: "/dashboard" },
      },
      {
        title: "Cryptographic Evidence Ledger & Tamper Audit",
        badge: "STEP 4 OF 4 · EVIDENCE",
        icon: "📜",
        description:
          "Full immutable audit trail with SHA-256 Merkle chain verification, interactive tamper simulation, and exportable regulatory compliance packages.",
        highlights: [
          "Inspect full ledger blocks and SHA-256 hashes.",
          "Simulate tampering on Block #2 to demonstrate fraud detection.",
          "Export compliance audit markdown reports with 1 click.",
        ],
        suggestedAction: { label: "Inspect Ledger", route: "/ledger" },
      },
    ];
  };

  const steps = getRoleSteps();

  useEffect(() => {
    // Reset step when role changes
    setCurrentStep(0);
  }, [role]);

  // Google Developer Style Spotlight Effect: highlight & scroll active feature into view
  useEffect(() => {
    if (!isOpen) return;
    const stepObj = steps[currentStep];
    if (!stepObj) return;

    // Remove any previous active spotlight
    document.querySelectorAll(".tour-spotlight-active").forEach((el) => {
      el.classList.remove("tour-spotlight-active");
    });

    const candidates = [
      stepObj.selector,
      `[data-tour="${role}-${currentStep + 1}"]`,
      ".card",
      "table",
      "main",
    ].filter(Boolean) as string[];

    let targetEl: HTMLElement | null = null;
    for (const sel of candidates) {
      try {
        const found = document.querySelector(sel) as HTMLElement;
        if (found) {
          targetEl = found;
          break;
        }
      } catch {}
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.classList.add("tour-spotlight-active");
    }

    return () => {
      document.querySelectorAll(".tour-spotlight-active").forEach((el) => {
        el.classList.remove("tour-spotlight-active");
      });
    };
  }, [isOpen, currentStep, role, steps]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) setCurrentStep((p) => p - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, steps.length, onClose]);

  if (!isOpen) return null;

  const step = steps[currentStep] || steps[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

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
    <>
      {/* Floating Spotlight Tour Card: Bottom-Right Viewport (380px wide, high contrast, clean shadow) */}
      <div
        className="card tour-popover-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "380px",
          maxWidth: "calc(100vw - 36px)",
          padding: "18px 20px",
          borderRadius: "14px",
          border: "2px solid #10B981",
          background: "var(--surface)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08), 0 0 25px rgba(16, 185, 129, 0.2)",
          zIndex: 9999,
          animation: "fadeIn 140ms ease-out",
        }}
      >
        {/* Step Progress Bar */}
        <div
          style={{
            height: "4px",
            width: "100%",
            background: "var(--surface2)",
            borderRadius: "2px",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: "linear-gradient(90deg, #10B981, #059669)",
              transition: "width 220ms ease",
            }}
          />
        </div>

        {/* Card Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "#ECFDF5",
                color: "#059669",
                border: "1px solid #A7F3D0",
                letterSpacing: "0.04em",
              }}
            >
              {step.badge}
            </span>
          </div>
          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            aria-label="Close guide"
            style={{ width: "24px", height: "24px", color: "var(--ink2)", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Title & Icon */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "24px", lineHeight: 1 }}>{step.icon}</span>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 3px", color: "var(--ink)" }}>
              {step.title}
            </h3>
            <p style={{ fontSize: "12px", lineHeight: 1.45, color: "var(--ink2)", margin: 0 }}>
              {step.description}
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--surface2)",
            border: "1px solid var(--line)",
            marginBottom: "12px",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", lineHeight: 1.5, color: "var(--ink)" }}>
            {step.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        {/* Suggested Quick Jump Action */}
        {step.suggestedAction && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--ink2)" }}>Quick Jump:</span>
            <button
              type="button"
              className="btn sm sec"
              onClick={handleActionClick}
              style={{ fontSize: "11px", height: "26px", padding: "0 10px", cursor: "pointer" }}
            >
              {step.suggestedAction.label} →
            </button>
          </div>
        )}

        {/* Footer Navigation: Clear [← Previous] and [Next Step →] Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--line)",
            paddingTop: "12px",
          }}
        >
          {/* Step dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: idx === currentStep ? "#10B981" : "var(--ink3)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
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
                height: "28px",
                padding: "0 12px",
                fontWeight: 600,
              }}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                fontSize: "12px",
                height: "28px",
                padding: "0 14px",
                fontWeight: 600,
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.35)",
              }}
            >
              {isLast ? "Done ✓" : "Next Step →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
