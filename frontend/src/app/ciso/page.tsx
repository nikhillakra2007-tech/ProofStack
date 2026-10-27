"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  ShieldCheck, Lock, AlertTriangle, KeyRound, Award, 
  ArrowRight, Shield, CheckCircle2, TrendingDown, FileText, Info 
} from "lucide-react";

export default function CisoRolePage() {
  const { session } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [emergencyOverride, setEmergencyOverride] = useState(false);

  const complianceStandards = [
    { name: "SOC 2 Type II", status: "Framework Ready", auditScope: "Security & Confidentiality Controls", verification: "Automated Merkle Evidence" },
    { name: "FedRAMP Baseline", status: "Mapped", auditScope: "Incident Response & Boundary Protection", verification: "Zero-Trust Invariant Logs" },
    { name: "ISO/IEC 27001", status: "Aligned", auditScope: "Annex A.12 Cryptographic Controls", verification: "SHA-256 Non-Repudiation" },
    { name: "OWASP Top-10 / ASVS", status: "Automated", auditScope: "12 Dynamic Exploit Probes", verification: "Ephemeral Sandbox Validation" },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Role Header Banner */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • CISO EXECUTIVE CONTROL PLANE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              Enterprise Zero-Trust Posture &amp; Release Gate Governance
            </h1>
            <p className="text-[var(--ink-body)] text-xs sm:text-sm max-w-2xl leading-relaxed">
              Assigned to <strong>Dr. Sarah Lin (Chief Information Security Officer)</strong>. Root signing authority, organizational release gate metrics, and emergency release policy override.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigateWithCurtain("/settings", "Model Settings")}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Security Settings</span>
            </button>
            <button
              onClick={() => navigateWithCurtain("/ledger", "Merkle Ledger")}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] transition-all flex items-center gap-2"
            >
              <span>Audit Chain</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Executive Status KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Active Verification Gates</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">8 / 8</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Zero-Compromise Veto</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">OWASP DAST Vectors</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">12 Probes</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Hot-loaded in microVM</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Evidence Chain Blocks</div>
            <div className="text-2xl font-bold font-mono text-amber-400">Chained</div>
            <div className="text-[11px] text-[var(--ink-muted)]">HMAC-SHA256 Stamped</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Gate Enforcement</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{emergencyOverride ? "OVERRIDE" : "STRICT"}</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Compiler &amp; Exploit Veto</div>
          </div>
        </div>

        {/* CISO Governance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Compliance & Attestations */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--ink)]">
                    Enterprise Compliance Mapping &amp; Evidence Log
                  </h2>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                    Hardware-attested cryptographic evidence mapping for security evaluation frameworks.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>MAPPED</span>
                </div>
              </div>

              <div className="divide-y divide-[var(--line)] font-mono text-xs">
                {complianceStandards.map((std) => (
                  <div key={std.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-[var(--ink)]">
                        {std.name}
                      </div>
                      <div className="text-[11px] text-[var(--ink-muted)]">{std.auditScope}</div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-[var(--ink-muted)]">{std.verification}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                        {std.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Override Policy */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Executive Override Controls</span>
              </div>

              <p className="text-xs text-[var(--ink-body)] leading-relaxed">
                Emergency override allows the CISO to manually permit release deployment during zero-day incident response. All override actions are immutably logged to the evidence ledger.
              </p>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">Release Gate Status:</span>
                  <span className={emergencyOverride ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                    {emergencyOverride ? "OVERRIDE ACTIVE" : "ENFORCED (STRICT)"}
                  </span>
                </div>

                <button
                  onClick={() => setEmergencyOverride(!emergencyOverride)}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 ${
                    emergencyOverride
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      : "bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)]"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{emergencyOverride ? "Disarm Emergency Override" : "Arm Dual-Key Emergency Override"}</span>
                </button>
              </div>

              <div className="text-[11px] text-[var(--ink-muted)] font-mono leading-relaxed pt-1">
                Operator Clearance: <code>CISO Level 4 Root</code><br />
                Audit Trail Nonce: <code>0x89f2a41d00c42</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
