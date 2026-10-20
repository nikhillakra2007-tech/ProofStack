"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  ShieldCheck, Lock, AlertTriangle, KeyRound, Award, 
  ArrowRight, Shield, CheckCircle2, TrendingDown, FileText 
} from "lucide-react";

export default function CisoRolePage() {
  const { user } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  const complianceStandards = [
    { name: "SOC 2 Type II", status: "Compliant", auditDate: "Oct 2026", auditor: "PwC Attested" },
    { name: "FedRAMP High", status: "Compliant", auditDate: "Sep 2026", auditor: "3PAO Certified" },
    { name: "ISO/IEC 27001", status: "Compliant", auditDate: "Aug 2026", auditor: "BSI Group" },
    { name: "HIPAA Security Rule", status: "Compliant", auditDate: "Oct 2026", auditor: "Internal HSM" },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Role Header Banner */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-surface via-bg to-surface p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
              <Award className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • CISO EXECUTIVE CONTROL PLANE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Zero-Trust Posture & Release Gate Governance
            </h1>
            <p className="text-ink-body text-sm max-w-2xl leading-relaxed">
              Assigned to <strong>Dr. Sarah Lin (Chief Information Security Officer)</strong>. Root HSM signing keys, organization-wide vulnerability liability metrics, and emergency release policy override.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigateWithCurtain("/settings", "Model Settings")}
              className="px-4 py-2.5 rounded-xl bg-fawn hover:opacity-90 text-black text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>HSM Key Vault</span>
            </button>
            <button
              onClick={() => navigateWithCurtain("/ledger", "Merkle Ledger")}
              className="px-4 py-2.5 rounded-xl bg-surface hover:bg-card-bg border border-white/10 text-xs font-mono transition-all flex items-center gap-2"
            >
              <span>Audit Chain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Global Risk Posture</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">99.8%</div>
            <div className="text-[11px] text-ink-muted">0 critical bypasses</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Est. Liability Avoided</div>
            <div className="text-2xl font-bold font-mono text-fawn">$3.42M</div>
            <div className="text-[11px] text-ink-muted">Past 90 days via AST</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Mean Remediation SLA</div>
            <div className="text-2xl font-bold font-mono text-azure">3.8s</div>
            <div className="text-[11px] text-ink-muted">Versus 4.2d manual MTTR</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Root HSM Seal</div>
            <div className="text-2xl font-bold font-mono text-purple-400">ARMED</div>
            <div className="text-[11px] text-ink-muted">Ed25519 Hardware Vault</div>
          </div>
        </div>

        {/* CISO Governance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Compliance & Attestations */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Regulatory Compliance & Third-Party Audits
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Continuous hardware-attested Merkle proofs for active compliance frameworks.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>4/4 COMPLIANT</span>
                </div>
              </div>

              <div className="divide-y divide-white/5 font-mono text-xs">
                {complianceStandards.map((std) => (
                  <div key={std.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-2 text-ink">
                        <span>{std.name}</span>
                      </div>
                      <div className="text-[11px] text-ink-muted">{std.auditor}</div>
                    </div>

                    <div className="flex items-center gap-6 text-[11px]">
                      <div>
                        <span className="text-ink-muted">Audit Date: </span>
                        <span>{std.auditDate}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {std.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Override & Root HSM Policy */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-5">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Executive Override Controls</span>
              </div>

              <p className="text-xs text-ink-body leading-relaxed">
                Emergency override allows the CISO to manually bypass an AST gate invariant in P0 zero-day war-room situations. All overrides require hardware multi-signature and are immutably logged on-chain.
              </p>

              <div className="p-4 rounded-xl bg-card-bg border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Release Gate Status:</span>
                  <span className={emergencyOverride ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                    {emergencyOverride ? "OVERRIDE ARMED" : "ENFORCED (STRICT)"}
                  </span>
                </div>

                <button
                  onClick={() => setEmergencyOverride(!emergencyOverride)}
                  className={`w-full py-2.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-2 ${
                    emergencyOverride
                      ? "bg-amber-500 text-black hover:bg-amber-400"
                      : "bg-surface hover:bg-white/5 border border-white/20 text-ink"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{emergencyOverride ? "Disarm Override" : "Arm Dual-Key Override"}</span>
                </button>
              </div>

              <div className="text-[11px] text-ink-muted font-mono leading-relaxed pt-2">
                Signing HSM: <code>YubiHSM-Enterprise-US-East-01</code><br />
                Audit Trail Nonce: <code>0x89f2a41d00c42</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
