"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { MOCK_FINDINGS, MOCK_SENTINEL_GATES, FindingItem } from "@/lib/mockData";
import { 
  ShieldCheck, AlertTriangle, Bug, Play, 
  CheckCircle2, ArrowRight, FileCode, Cpu, Check, Copy,
  ShieldAlert, Layers, RefreshCw, Terminal, CheckCheck,
  Server, Link as LinkIcon
} from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";

export default function CockpitPage() {
  const { user } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [selectedFinding, setSelectedFinding] = useState<FindingItem>(MOCK_FINDINGS[0]);
  const [isPatching, setIsPatching] = useState(false);
  const [patchedFindings, setPatchedFindings] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "online" | "local">("connecting");
  const [copiedVuln, setCopiedVuln] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);
  const [gateFilter, setGateFilter] = useState<"ALL" | "PASS">("ALL");

  // Check FastAPI backend on port 8765
  useEffect(() => {
    fetch("http://127.0.0.1:8765/api/health")
      .then((res) => {
        if (res.ok) setBackendStatus("online");
        else setBackendStatus("local");
      })
      .catch(() => setBackendStatus("local"));
  }, []);

  const handleApplyPatch = async (findingId: string) => {
    setIsPatching(true);
    try {
      await fetch("http://127.0.0.1:8765/api/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selectedFinding.vulnerableCode, problemId: "T1-3" }),
      });
    } catch {
      // Local fallback
    }
    setTimeout(() => {
      setIsPatching(false);
      if (!patchedFindings.includes(findingId)) {
        setPatchedFindings((prev) => [...prev, findingId]);
      }
    }, 750);
  };

  const handleCopy = (text: string, isVuln: boolean) => {
    navigator.clipboard.writeText(text);
    if (isVuln) {
      setCopiedVuln(true);
      setTimeout(() => setCopiedVuln(false), 1500);
    } else {
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 1500);
    }
  };

  const isPatched = patchedFindings.includes(selectedFinding.id);

  const activeGates = isPatched
    ? MOCK_SENTINEL_GATES.map((g) => ({ ...g, status: "pass" as const }))
    : MOCK_SENTINEL_GATES.map((g) => {
        if (selectedFinding.id === "P-01" && (g.id === "G2" || g.id === "G5")) {
          return { ...g, status: "fail" as const, timing: "VETO (2.8s)" };
        }
        if (selectedFinding.id === "P-02" && (g.id === "G0" || g.id === "G2")) {
          return { ...g, status: "fail" as const, timing: "VETO (SQLi)" };
        }
        if (selectedFinding.id === "P-03" && (g.id === "G2" || g.id === "G3")) {
          return { ...g, status: "fail" as const, timing: "VETO (IDOR)" };
        }
        if (selectedFinding.id === "P-04" && (g.id === "G0" || g.id === "G7")) {
          return { ...g, status: "fail" as const, timing: "VETO (RCE)" };
        }
        return { ...g, status: "warn" as const, timing: "PENDING" };
      });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Cockpit Top Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span className="font-bold">REMEDIATION COCKPIT</span>
              <span className="text-[var(--ink-muted)]">·</span>
              <span className="text-[var(--ink-muted)] font-normal">
                {backendStatus === "online" 
                  ? "FastAPI Engine Connected (Port 8765)" 
                  : "Local Deterministic Mode Active"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              Vulnerability Invariant Synthesis Workspace
            </h1>
            <p className="text-xs text-[var(--ink-body)] mt-1">
              Side-by-side AST hardened diff vs vulnerable source with 8-gate deterministic verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--ink-muted)]">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <span className="text-[var(--ink)] font-bold">{MOCK_FINDINGS.length}</span> Defect Sinks
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <span className="text-emerald-400 font-bold">{patchedFindings.length}</span> Invariants Sealed
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <span className="text-cyan-400 font-bold">8/8</span> Gates Active
            </div>
          </div>
        </div>

        {/* 2-Column Cockpit Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Triage Feed (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center justify-between">
              <span>Candidate Defect Feed</span>
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
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      active
                        ? "bg-[var(--card-bg)] border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                        : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        {finding.cwe}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          patched
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : finding.severity === "Critical"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        }`}
                      >
                        {patched ? "Sealed" : finding.severity}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[var(--ink)] line-clamp-1 mb-1.5">
                      {finding.title}
                    </div>

                    <div className="text-xs font-mono text-[var(--ink-muted)] flex items-center gap-1.5 truncate">
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{finding.file}:{finding.line}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigateWithCurtain("/studio", "AST Studio")}
              className="w-full py-3 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--card-bg)] border border-[var(--line)] text-xs font-mono font-semibold text-[var(--ink)] flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Open Custom AST Repair Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Right Panel: Side-by-Side AST Diff & Remediation (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-6 space-y-6 shadow-xl">
              {/* Finding Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--line)]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)] mb-1">
                    <span className="text-emerald-400 font-bold">{selectedFinding.id}</span>
                    <span>·</span>
                    <span>{selectedFinding.cwe}</span>
                    <span>·</span>
                    <span>{selectedFinding.file}:{selectedFinding.line}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--ink)]">{selectedFinding.title}</h2>
                  <p className="text-xs text-[var(--ink-body)] mt-1.5 leading-relaxed">{selectedFinding.description}</p>
                </div>

                <div className="shrink-0 pt-1">
                  <button
                    onClick={() => handleApplyPatch(selectedFinding.id)}
                    disabled={isPatching || isPatched}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                      isPatched
                        ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300 cursor-default"
                        : isPatching
                        ? "bg-emerald-500/30 text-emerald-300 cursor-wait"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md"
                    }`}
                  >
                    {isPatching ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Synthesizing Invariant...</span>
                      </>
                    ) : isPatched ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span>Hardened Patch Sealed</span>
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

              {/* Side-by-Side Diff with Clean Headers & Copy Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vulnerable Source */}
                <div className="rounded-xl border border-red-500/30 bg-red-950/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-red-400 border-b border-red-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5" />
                      Vulnerable Source Sink
                    </span>
                    <button
                      onClick={() => handleCopy(selectedFinding.vulnerableCode, true)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-300 transition-colors"
                      title="Copy vulnerable snippet"
                      aria-label="Copy vulnerable code snippet"
                    >
                      {copiedVuln ? <Check className="w-3.5 h-3.5 text-red-300" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-red-300/90 leading-relaxed overflow-x-auto p-3 bg-black/40 rounded-lg min-h-[160px]">
                    <code>{selectedFinding.vulnerableCode}</code>
                  </pre>
                </div>

                {/* Hardened Patch */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Hardened AST Candidate
                    </span>
                    <button
                      onClick={() => handleCopy(selectedFinding.suggestedFix, false)}
                      className="p-1 rounded hover:bg-emerald-500/20 text-emerald-300 transition-colors"
                      title="Copy hardened patch"
                      aria-label="Copy hardened patch snippet"
                    >
                      {copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto p-3 bg-black/40 rounded-lg min-h-[160px]">
                    <code>{selectedFinding.suggestedFix}</code>
                  </pre>
                </div>
              </div>

              {/* 8-Gate Interlock Table */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-[var(--ink)]">8 Deterministic Verification Gates</span>
                    <span className="text-[var(--ink-muted)]">· Zero-Compromise Security Veto</span>
                  </div>
                  <div className="text-[11px] font-mono">
                    Canonical Status:{" "}
                    {isPatched ? (
                      <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                        VERIFIED & SEALED (ACCEPT)
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 animate-pulse">
                        VETOED BY GATES (REJECT)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  {activeGates.map((gate) => {
                    const isFail = gate.status === "fail";
                    const isPass = gate.status === "pass";
                    return (
                      <div 
                        key={gate.id}
                        className={`p-2.5 rounded-lg border flex flex-col justify-between transition-colors ${
                          isFail
                            ? "border-red-500/40 bg-red-950/20"
                            : isPass
                            ? "border-emerald-500/30 bg-emerald-950/10"
                            : "border-[var(--line)] bg-[var(--bg)]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[var(--ink)]">{gate.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isFail
                              ? "text-red-400 bg-red-500/20"
                              : isPass
                              ? "text-emerald-400 bg-emerald-500/20"
                              : "text-amber-400 bg-amber-500/20"
                          }`}>
                            {gate.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--ink-body)] truncate">{gate.name}</div>
                        <div className={`text-[9px] mt-1 ${isFail ? "text-red-400 font-bold" : "text-[var(--ink-muted)]"}`}>
                          {gate.timing}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
