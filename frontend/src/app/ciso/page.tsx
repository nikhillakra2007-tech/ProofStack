"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  KeyRound,
  Award,
  ArrowRight,
  Shield,
  CheckCircle2,
  FileText,
  Cpu,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  Sliders,
  Check,
  XCircle,
  FileCheck2,
} from "lucide-react";

interface ComplianceFramework {
  name: string;
  status: "Certified" | "Enforced" | "Aligned" | "Automated";
  auditScope: string;
  verification: string;
  lastAttestation: string;
}

export default function CisoRolePage() {
  const { session } = useAuth();
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"compliance" | "gates" | "hardware">("compliance");

  const complianceStandards: ComplianceFramework[] = [
    {
      name: "SOC 2 Type II",
      status: "Certified",
      auditScope: "Security & Confidentiality: Logical Access, Boundary Protection, and Release Authorization",
      verification: "Automated Audit Trail & Tamper-Evident Ledger Seals",
      lastAttestation: "2026-10-28 14:32 UTC",
    },
    {
      name: "FedRAMP High Baseline",
      status: "Enforced",
      auditScope: "Hardware-Enforced Enclave & Rootless MicroVM Boundary Isolation",
      verification: "AWS Nitro Enclave Hardware Attestation & Measured Boot Verification",
      lastAttestation: "2026-10-28 16:05 UTC",
    },
    {
      name: "ISO/IEC 27001:2022",
      status: "Aligned",
      auditScope: "Secure Software Development Lifecycle & Cryptographic Control Invariants",
      verification: "Deterministic Syntax & Security Invariant Checkpoints",
      lastAttestation: "2026-10-28 17:15 UTC",
    },
    {
      name: "OWASP ASVS Level 3",
      status: "Automated",
      auditScope: "Dynamic Automated Exploit Testing in Hermetic MicroVM Sandboxes",
      verification: "Automated Fuzzing & Runtime Memory Safety Verification",
      lastAttestation: "2026-10-28 18:40 UTC",
    },
  ];

  const verificationGates = [
    { id: 1, name: "Gate 1: AST Semantic Lexer", status: "PASSED", latency: "14ms", desc: "Tree-sitter AST validation & syntax normalization" },
    { id: 2, name: "Gate 2: Invariant Synthesis", status: "PASSED", latency: "62ms", desc: "Z3 SMT solver verification of pre/post conditions" },
    { id: 3, name: "Gate 3: Sandbox Compiler", status: "PASSED", latency: "380ms", desc: "Hermetic containerized compilation with zero network access" },
    { id: 4, name: "Gate 4: Firecracker MicroVM", status: "PASSED", latency: "410ms", desc: "Hypervisor-level isolation with seccomp BPF filters" },
    { id: 5, name: "Gate 5: OWASP DAST Probes", status: "PASSED", latency: "290ms", desc: "12 live attack payloads executed against runtime socket" },
    { id: 6, name: "Gate 6: Merkle Ledger Stamp", status: "PASSED", latency: "18ms", desc: "SHA-256 binary hash leaf inserted into audit tree" },
    { id: 7, name: "Gate 7: HSM Signature", status: "PASSED", latency: "45ms", desc: "Root authority ECDSA P-384 hardware signing" },
    { id: 8, name: "Gate 8: Quorum Policy Veto", status: emergencyOverride ? "OVERRIDDEN" : "ENFORCED", latency: "2ms", desc: "Dual-key authorization check before artifact deployment" },
  ];

  const handleExportCompliancePack = () => {
    setIsExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* CISO Executive Banner */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-[var(--brand)] font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • CISO EXECUTIVE CONTROL PLANE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              Enterprise Zero-Trust Posture &amp; Gate Governance
            </h1>
            <p className="text-[var(--ink2)] text-sm max-w-2xl leading-relaxed">
              Assigned to <strong>Dr. Sarah Lin (Chief Information Security Officer)</strong>. Root hardware signing authority, organizational compliance governance, and dual-key release gate policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportCompliancePack}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-[var(--brand)] hover:opacity-90 text-[var(--surface2)] text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Bundle...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Audit Bundle Ready</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Export CISO Pack</span>
                </>
              )}
            </button>

            <Link
              href="/ledger"
              className="px-4 py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface3)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] transition-all flex items-center gap-2"
            >
              <span>Audit Chain</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--brand)]" />
            </Link>
          </div>
        </div>

        {/* CISO Clearance & HSM Status Strip */}
        <div className="mt-6 pt-5 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--ink2)]">
            <Fingerprint className="w-4 h-4 text-[var(--brand)]" />
            <span>Root Authority: <strong className="text-[var(--ink)]">Hardware Key (HSM)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[var(--ink2)]">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>Hardware Enclave: <strong className="text-[var(--ink)]">Secure Enclave (Verified)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[var(--ink2)]">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Gate Mode: <strong className={emergencyOverride ? "text-amber-500" : "text-emerald-500"}>
              {emergencyOverride ? "EMERGENCY OVERRIDE" : "STRICT VETO (8/8)"}
            </strong></span>
          </div>
        </div>
      </div>

      {/* Executive Key Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--ink3)] uppercase tracking-wider">Active Gates</div>
          <div className="text-2xl font-bold font-mono text-emerald-500">8 / 8</div>
          <div className="text-[11px] text-[var(--ink2)]">Zero-Compromise Veto</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--ink3)] uppercase tracking-wider">OWASP DAST Vectors</div>
          <div className="text-2xl font-bold font-mono text-[var(--brand)]">12 Probes</div>
          <div className="text-[11px] text-[var(--ink2)]">Live microVM Testing</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--ink3)] uppercase tracking-wider">Merkle Evidence</div>
          <div className="text-2xl font-bold font-mono text-emerald-500">10,482</div>
          <div className="text-[11px] text-[var(--ink2)]">SHA-256 Leaves Sealed</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--ink3)] uppercase tracking-wider">Policy Quorum</div>
          <div className="text-2xl font-bold font-mono text-[var(--ink)]">100.0%</div>
          <div className="text-[11px] text-[var(--ink2)]">Dual-Key Consensus</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--line)] gap-2">
        <button
          onClick={() => setActiveTab("compliance")}
          className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "compliance"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--ink2)] hover:text-[var(--ink)]"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Compliance Frameworks (4)</span>
        </button>
        <button
          onClick={() => setActiveTab("gates")}
          className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "gates"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--ink2)] hover:text-[var(--ink)]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification Gates (8)</span>
        </button>
        <button
          onClick={() => setActiveTab("hardware")}
          className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "hardware"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--ink2)] hover:text-[var(--ink)]"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>HSM &amp; Enclave Roots</span>
        </button>
      </div>

      {/* Main Governance Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Tab Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "compliance" && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--ink)]">
                    Enterprise Compliance Mapping &amp; Evidence Log
                  </h2>
                  <p className="text-xs text-[var(--ink2)] mt-0.5">
                    Hardware-attested cryptographic evidence mapping for regulatory and trust frameworks.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-500 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ALL CONTROLS ACTIVE</span>
                </div>
              </div>

              <div className="divide-y divide-[var(--line)] font-mono text-xs">
                {complianceStandards.map((std) => (
                  <div key={std.name} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-lg">
                      <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                        <span>{std.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase">
                          {std.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--ink2)]">{std.auditScope}</div>
                      <div className="text-[10px] text-[var(--ink3)]">Proof: {std.verification}</div>
                    </div>

                    <div className="text-[11px] text-[var(--ink2)] shrink-0 sm:text-right">
                      <div className="text-[10px] text-[var(--ink3)] uppercase">Attestation Time</div>
                      <div>{std.lastAttestation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "gates" && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--ink)]">
                    Sequential Zero-Compromise Gate Pipeline
                  </h2>
                  <p className="text-xs text-[var(--ink2)] mt-0.5">
                    Every deployment artifact must sequentially satisfy all 8 gates before release artifact signing.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-500 font-bold">
                  8/8 PASS
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {verificationGates.map((gate) => (
                  <div
                    key={gate.id}
                    className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                        <span>{gate.name}</span>
                        <span className="text-[10px] font-normal text-[var(--ink3)]">({gate.latency})</span>
                      </div>
                      <div className="text-[11px] text-[var(--ink2)] truncate">{gate.desc}</div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          gate.status === "PASSED" || gate.status === "ENFORCED"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        }`}
                      >
                        {gate.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "hardware" && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 font-mono text-xs">
              <div>
                <h2 className="text-base font-bold text-[var(--ink)]">
                  Hardware Security Module (HSM) Cryptographic Roots
                </h2>
                <p className="text-xs text-[var(--ink2)] mt-0.5">
                  AWS CloudHSM &amp; Nitro Enclave hardware-enforced root keys preventing memory dump extraction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-2">
                  <div className="text-[10px] text-[var(--ink3)] uppercase tracking-wider">HSM Cluster ID</div>
                  <div className="font-bold text-[var(--ink)] break-all">hsm-cluster-us-east-1-0941a8e</div>
                  <div className="text-[11px] text-emerald-500 font-bold">FIPS 140-2 Level 3 Certified</div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-2">
                  <div className="text-[10px] text-[var(--ink3)] uppercase tracking-wider">Root Signing Key Fingerprint</div>
                  <div className="font-bold text-[var(--ink)] break-all">SHA256:8b4e72f91a0c44d183...</div>
                  <div className="text-[11px] text-[var(--ink2)]">Curve: SECP384R1 (P-384)</div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-2">
                  <div className="text-[10px] text-[var(--ink3)] uppercase tracking-wider">Nitro PCR0 Hash</div>
                  <div className="font-bold text-[var(--ink)] break-all">a4f912c003de5518b0f209...</div>
                  <div className="text-[11px] text-emerald-500 font-bold">Matches Build Manifest Exactly</div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-2">
                  <div className="text-[10px] text-[var(--ink3)] uppercase tracking-wider">Attestation Certificate</div>
                  <div className="font-bold text-[var(--ink)] truncate">AWS Nitro Hypervisor CA Root</div>
                  <div className="text-[11px] text-[var(--ink2)]">Valid through: 2029-12-31</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Emergency Release Policy Override Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-5">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Executive Dual-Key Controls</span>
            </div>

            <p className="text-xs text-[var(--ink2)] leading-relaxed">
              Emergency override allows the CISO to manually bypass automated gate quarantine during a zero-day incident response. All override events create an immutable, non-repudiable leaf in the Merkle audit chain.
            </p>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--ink)]">Gate Policy:</span>
                <span className={emergencyOverride ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {emergencyOverride ? "OVERRIDE ACTIVE" : "STRICT VETO (8/8)"}
                </span>
              </div>

              <button
                onClick={() => setEmergencyOverride(!emergencyOverride)}
                className={`w-full py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 ${
                  emergencyOverride
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "bg-[var(--surface)] hover:bg-[var(--surface3)] border border-[var(--line)] text-[var(--ink)]"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{emergencyOverride ? "Disarm Emergency Override" : "Arm Dual-Key Override"}</span>
              </button>
            </div>

            <div className="text-[11px] text-[var(--ink3)] font-mono leading-relaxed pt-1 border-t border-[var(--line)] space-y-1">
              <div>Operator Clearance: <code className="text-[var(--ink)]">CISO Level 4 Root</code></div>
              <div>Audit Nonce: <code className="text-[var(--ink)]">0x89f2a41d00c42</code></div>
              <div>Consensus Rule: <code className="text-[var(--ink)]">M-of-N (2 Keys Required)</code></div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 font-mono text-xs">
            <div className="font-bold text-[var(--ink)]">Related Authority Consoles</div>
            <div className="space-y-2">
              <Link
                href="/control-plane"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink2)] hover:text-[var(--ink)] transition-colors"
              >
                <span>Control Plane Operations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dast"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink2)] hover:text-[var(--ink)] transition-colors"
              >
                <span>DAST Exploit Probes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/settings"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink2)] hover:text-[var(--ink)] transition-colors"
              >
                <span>Global Governance Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
