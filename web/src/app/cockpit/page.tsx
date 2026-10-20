"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { MOCK_FINDINGS } from "@/lib/mockData";
import { 
  ShieldCheck, AlertTriangle, Bug, Play, 
  CheckCircle2, ArrowRight, FileCode, Cpu, Check
} from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";

export function CockpitPage() {
  const { user } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [selectedFinding, setSelectedFinding] = useState(MOCK_FINDINGS[0]);
  const [isPatching, setIsPatching] = useState(false);
  const [patchedFindings, setPatchedFindings] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "online" | "mock">("connecting");

  // Check FastAPI backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health")
      .then((res) => {
        if (res.ok) setBackendStatus("online");
        else setBackendStatus("mock");
      })
      .catch(() => setBackendStatus("mock"));
  }, []);

  const handleApplyPatch = (findingId: string) => {
    setIsPatching(true);
    setTimeout(() => {
      setIsPatching(false);
      if (!patchedFindings.includes(findingId)) {
        setPatchedFindings((prev) => [...prev, findingId]);
      }
    }, 900);
  };

  const isPatched = patchedFindings.includes(selectedFinding.id);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cockpit Top Bar - Natural, Uncluttered */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--fawn)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--fawn)] inline-block animate-pulse" />
              <span>Remediation Cockpit</span>
              <span className="text-[var(--ink-muted)]">·</span>
              <span className="text-[var(--ink-muted)] font-normal">
                {backendStatus === "online" ? "FastAPI Connected" : "Local Mode"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Vulnerability Invariant Synthesis
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[var(--ink-muted)]">
            <div><span className="text-[var(--ink)] font-bold">{MOCK_FINDINGS.length}</span> Findings</div>
            <span className="text-[var(--line)]">|</span>
            <div><span className="text-[var(--fawn)] font-bold">{patchedFindings.length}</span> Resolved</div>
            <span className="text-[var(--line)]">|</span>
            <div><span className="text-[var(--ink)] font-bold">8/8</span> Gates Active</div>
          </div>
        </div>

        {/* 2-Column Cockpit Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Triage Feed (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] flex items-center justify-between">
              <span>Candidate Defects</span>
              <span>{MOCK_FINDINGS.length} Items</span>
            </div>

            <div className="space-y-2.5">
              {MOCK_FINDINGS.map((finding) => {
                const active = selectedFinding.id === finding.id;
                const patched = patchedFindings.includes(finding.id);

                return (
                  <button
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      active
                        ? "bg-[var(--card-bg)] border-[var(--fawn)] shadow-sm"
                        : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--fawn)]">
                        {finding.cwe}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          patched
                            ? "bg-[var(--fawn)]/15 text-[var(--fawn)]"
                            : finding.severity === "Critical"
                            ? "bg-red-500/15 text-red-500"
                            : "bg-[#7A4419]/20 text-[#B86A2D]"
                        }`}
                      >
                        {patched ? "Resolved" : finding.severity}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[var(--ink)] line-clamp-1 mb-1.5">
                      {finding.title}
                    </div>

                    <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 truncate">
                      <FileCode className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      <span className="truncate">{finding.file}:{finding.line}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigateWithCurtain("/studio")}
              className="w-full py-3 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--card-bg)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Cpu className="w-4 h-4 text-[var(--fawn)]" />
              <span>Open Custom AST Repair Studio</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

          {/* Right Panel: Side-by-Side AST Diff & Remediation (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-6 space-y-6">
              {/* Finding Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--line)]">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] mb-1">
                    <span className="text-[var(--fawn)] font-bold">{selectedFinding.id}</span>
                    <span>·</span>
                    <span>{selectedFinding.cwe}</span>
                    <span>·</span>
                    <span>{selectedFinding.file}:{selectedFinding.line}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--ink)]">{selectedFinding.title}</h2>
                  <p className="text-sm text-[var(--ink-muted)] mt-1.5 leading-relaxed">{selectedFinding.description}</p>
                </div>

                <div className="shrink-0 pt-1">
                  <button
                    onClick={() => handleApplyPatch(selectedFinding.id)}
                    disabled={isPatching || isPatched}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      isPatched
                        ? "bg-[var(--fawn)]/15 border border-[var(--fawn)]/40 text-[var(--fawn)] cursor-default"
                        : isPatching
                        ? "bg-[var(--fawn)]/30 text-[var(--fawn)] cursor-wait"
                        : "bg-[var(--fawn)] hover:opacity-90 text-[#0E120D] shadow-sm"
                    }`}
                  >
                    {isPatching ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#0E120D] border-t-transparent rounded-full animate-spin" />
                        <span>Synthesizing Invariant...</span>
                      </>
                    ) : isPatched ? (
                      <>
                        <Check className="w-4 h-4 text-[var(--fawn)]" />
                        <span>Hardened Patch Applied</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Apply AST Patch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Diff with Clean Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vulnerable Source */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-500 border-b border-red-500/15 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5" />
                      Vulnerable Source
                    </span>
                    <span className="text-[10px] font-bold uppercase opacity-80">Risk Detected</span>
                  </div>
                  <pre className="font-mono text-xs text-red-400 dark:text-red-300 leading-relaxed overflow-x-auto p-3 bg-black/20 rounded-lg">
                    <code>{selectedFinding.vulnerableCode}</code>
                  </pre>
                </div>

                {/* Hardened Patch */}
                <div className="rounded-xl border border-[var(--fawn)]/30 bg-[var(--fawn)]/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--fawn)] border-b border-[var(--fawn)]/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Hardened AST Patch
                    </span>
                    <span className="text-[10px] font-bold uppercase opacity-80">Invariant Verified</span>
                  </div>
                  <pre className="font-mono text-xs text-[var(--fawn)] leading-relaxed overflow-x-auto p-3 bg-black/20 rounded-lg">
                    <code>{selectedFinding.suggestedFix}</code>
                  </pre>
                </div>
              </div>

              {/* Clean Inline Sentinel Gate Evaluation Bar (No Nested Bars!) */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--fawn)]" />
                  <span className="font-semibold text-[var(--ink)]">8/8 Invariant Gates Satisfied</span>
                  <span className="text-[var(--ink-muted)]">· Zero regression tolerance</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--ink-muted)]">
                  <span>✓ AST Structure</span>
                  <span>✓ DAST Probes</span>
                  <span>✓ Tenancy Bound</span>
                  <span>✓ Merkle Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default CockpitPage;
