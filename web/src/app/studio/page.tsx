"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_CATALOG, MOCK_GATES, getProblemLogs } from "@/lib/mockData";
import { CatalogProblem, GateStatus } from "@/lib/types";
import {
  commitPatchToLedger,
  getLedgerBlocks,
  StoredLedgerBlock,
  submitPatchForAudit,
  approveAndSealPatch,
  rejectAuditPatch,
  getAuditQueue,
  AuditQueueItem,
} from "@/lib/ledgerStore";
import { useAuth } from "@/context/AuthContext";
import {
  Play,
  Shield,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Terminal,
  Layers,
  ArrowRight,
  RefreshCw,
  XCircle,
  FileText,
  Clock,
  Cpu,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CUSTOM_PROBLEM_FIXTURE: CatalogProblem = {
  id: "CUSTOM-1",
  tier: "Real-World",
  domain: "Arbitrary Ingestion",
  title: "Arbitrary Production Code Ingestion",
  summary: "User-ingested production code evaluated live via rootless microVM sandboxes & AST security scans.",
  realWorldImpact: "Evaluates arbitrary enterprise functions for security exploits, query explosion, and latency bottlenecks.",
  bugSnippet: `# INGESTED PRODUCTION FUNCTION
def process_user_records(db_session, user_ids: list[str]):
    # Baseline: Iterates over user records with raw SQL interpolation
    results = []
    for uid in user_ids:
        user = db_session.execute(f"SELECT * FROM users WHERE id = '{uid}'").fetchone()
        results.append(user)
    return results`,
  naiveFixSnippet: `# NAIVE ATTEMPT: String-concatenated IN clause
def process_user_records(db_session, user_ids: list[str]):
    # REJECTED: Still vulnerable to injection if user_ids contains quotes
    ids = ','.join(f"'{u}'" for u in user_ids)
    return db_session.execute(f"SELECT * FROM users WHERE id IN ({ids})").fetchall()`,
  naiveVerdict: "REJECT",
  naiveReason: "Gate G2 Security: SQL injection vector detected in IN clause formatting.",
  safeFixSnippet: `# SAFE DEFENSIVE FIX: Parameterized bound query with eager pre-fetch
from sqlalchemy import select, bindparam

def process_user_records(db_session, user_ids: list[str]):
    stmt = select(User).where(User.id.in_(bindparam("uids", expanding=True)))
    return db_session.scalars(stmt, {"uids": user_ids}).all()`,
  safeVerdict: "ACCEPT",
  safeReason: "G0-G7 Gates Passed: Zero injection vectors, bound parameters verified, O(1) query complexity.",
  probeMethod: "Live AST Security Visitor + Rootless Linux 6.6 MicroVM Probe",
  truthRank: 1,
  filename: "custom_worker.py",
  metrics: {
    baseline: { keyMetric: "Vulnerable code", latency: "380 ms", invariant: "Unsafe SQL", delta: "0.0%" },
    naive: { keyMetric: "Unbound formatting", latency: "42 ms", invariant: "Gate Vetoed", delta: "+45.0%" },
    safe: { keyMetric: "1 bound query", latency: "14 ms", invariant: "100% Invariant Met", delta: "+82.5%" },
  },
};

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramProblem = searchParams.get("problem");
  const isCustomQuery = searchParams.get("mode") === "custom" || paramProblem?.toUpperCase() === "CUSTOM-1";
  const { role, activeMember, isDeveloper, isAuditor } = useAuth();

  const catalogWithCustom = [...MOCK_CATALOG, CUSTOM_PROBLEM_FIXTURE];

  // Problem selection
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    isCustomQuery ? "CUSTOM-1" : paramProblem || "T1-2"
  );
  const selectedProblem =
    catalogWithCustom.find((p) => p.id.toLowerCase() === selectedProblemId.toLowerCase()) ||
    catalogWithCustom[1];

  // Mode: 'bug' | 'naive' | 'safe' | 'custom'
  const [snippetMode, setSnippetMode] = useState<"bug" | "naive" | "safe" | "custom">(
    isCustomQuery ? "custom" : "safe"
  );
  const [customCode, setCustomCode] = useState<string>(() =>
    isCustomQuery ? CUSTOM_PROBLEM_FIXTURE.bugSnippet : selectedProblem.safeFixSnippet
  );

  // Evidence panel active tab: 'gates' | 'logs' | 'ledger'
  const [panelTab, setPanelTab] = useState<"gates" | "logs" | "ledger">("gates");

  // Mobile code diff view mode: 'split' | 'baseline' | 'candidate'
  const [mobileCodeTab, setMobileCodeTab] = useState<"baseline" | "candidate">("candidate");

  // Expandable details toggle
  const [showFindingDetails, setShowFindingDetails] = useState(false);

  // Status & interactive toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastLink, setToastLink] = useState<{ text: string; href: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Repair Cycle state
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(1);
  const [hardenedCandidateCode, setHardenedCandidateCode] = useState<string | null>(null);

  // Staggered Gate Evaluation
  const [animatingGateIndex, setAnimatingGateIndex] = useState<number>(8);
  const [gateEvaluationActive, setGateEvaluationActive] = useState<boolean>(false);

  // Logs state
  const [customLogs, setCustomLogs] = useState<string[]>(() =>
    getProblemLogs(selectedProblem, isCustomQuery ? "custom" : "safe")
  );

  // Ledger blocks
  const [ledgerChain, setLedgerChain] = useState<StoredLedgerBlock[]>([]);

  useEffect(() => {
    setLedgerChain(getLedgerBlocks());
    const handleLedgerUpdate = () => {
      setLedgerChain(getLedgerBlocks());
    };
    window.addEventListener("proofstack:ledger-updated", handleLedgerUpdate);
    window.addEventListener("storage", handleLedgerUpdate);
    return () => {
      window.removeEventListener("proofstack:ledger-updated", handleLedgerUpdate);
      window.removeEventListener("storage", handleLedgerUpdate);
    };
  }, []);

  // Sync problem from URL query if changed
  useEffect(() => {
    if (paramProblem) {
      const match = catalogWithCustom.find(
        (p) => p.id.toLowerCase() === paramProblem.toLowerCase()
      );
      if (match && match.id !== selectedProblemId) {
        setSelectedProblemId(match.id);
        if (match.id === "CUSTOM-1" || searchParams.get("mode") === "custom") {
          setSnippetMode("custom");
          setCustomCode(match.bugSnippet);
        } else {
          setSnippetMode("safe");
          setCustomCode(match.safeFixSnippet);
        }
        setIteration(1);
        setHardenedCandidateCode(null);
      }
    }
  }, [paramProblem]);

  // Update logs when problem or mode changes
  useEffect(() => {
    if (iteration === 1 && snippetMode !== "custom") {
      setCustomLogs(getProblemLogs(selectedProblem, snippetMode));
    }
  }, [selectedProblemId, snippetMode, iteration]);

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    if (id === "CUSTOM-1") {
      setSnippetMode("custom");
      setCustomCode(CUSTOM_PROBLEM_FIXTURE.bugSnippet);
      setToastMessage("Loaded Arbitrary Ingestion Fixture. Edit code below and run.");
    } else {
      setSnippetMode("safe");
      const target = catalogWithCustom.find((p) => p.id === id);
      if (target) {
        setCustomCode(target.safeFixSnippet);
      }
      setToastMessage(`Loaded benchmark ${id}: ${target?.title}`);
    }
    setIteration(1);
    setHardenedCandidateCode(null);
    setToastLink(null);
    setTimeout(() => setToastMessage(null), 3000);

    const url = new URL(window.location.href);
    url.searchParams.set("problem", id);
    if (id === "CUSTOM-1") url.searchParams.set("mode", "custom");
    else url.searchParams.delete("mode");
    window.history.pushState({}, "", url.toString());
  };

  const handleRunCode = async () => {
    setIsProcessing(true);
    setPanelTab("logs");

    if (snippetMode === "custom") {
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: customCode,
            language: "python",
            problemId: selectedProblem.id,
          }),
        });
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setCustomLogs(data.logs);
        }
        if (data.success) {
          setToastMessage(`MicroVM execution passed (${data.executionTimeMs}ms, memory delta: ${data.memoryDeltaMb}MB).`);
        } else {
          setToastMessage(`MicroVM probe exited with code ${data.exitCode} (${data.executionTimeMs}ms).`);
        }
        setToastLink(null);
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err: any) {
        setToastMessage(`Execution error: ${err?.message || "Sandbox run failed"}`);
        setTimeout(() => setToastMessage(null), 3000);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setTimeout(() => {
      setIsProcessing(false);
      setCustomLogs(getProblemLogs(selectedProblem, snippetMode));
      setToastMessage(`MicroVM executed ${selectedProblem.filename || "benchmark"}. Exit code 0.`);
      setToastLink(null);
      setTimeout(() => setToastMessage(null), 3000);
    }, 450);
  };

  const handleAuditGauntlet = () => {
    setPanelTab("gates");
    setGateEvaluationActive(true);
    setAnimatingGateIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAnimatingGateIndex(current);
      if (current >= 8) {
        clearInterval(interval);
        setGateEvaluationActive(false);
        setToastMessage(`Gauntlet audit complete for ${selectedProblem.id}: Invariants evaluated.`);
        setToastLink(null);
        setTimeout(() => setToastMessage(null), 3000);
      }
    }, 90);
  };

  const handleSelfHeal = () => {
    setIsProcessing(true);
    setSnippetMode("safe");
    setPanelTab("gates");
    setTimeout(() => {
      setIsProcessing(false);
      setToastMessage(`NVIDIA Nemotron synthesized defensive patch for ${selectedProblem.id}.`);
      setToastLink(null);
      setTimeout(() => setToastMessage(null), 3000);
    }, 500);
  };

  const handleAcceptPatch = async () => {
    setIsProcessing(true);
    try {
      if (role === "developer") {
        submitPatchForAudit({
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          filename: targetFilename,
          developerId: activeMember.id,
          developerName: activeMember.name,
          developerAvatar: activeMember.avatar,
          speedupDelta: activeMetrics.delta || "+74.2%",
          latencyBefore: selectedProblem.metrics?.baseline.latency || "380ms",
          latencyAfter: selectedProblem.metrics?.safe.latency || "14ms",
          patchCode: candidateDisplayCode,
        });
        setToastMessage("Patch submitted to Security Auditor for verification.");
        setToastLink({
          text: "View Audit Status in Dashboard →",
          href: "/dashboard",
        });
      } else if (role === "auditor") {
        const queue = getAuditQueue();
        const pending = queue.find(
          (i) => i.problemId === selectedProblem.id && i.status === "PENDING_AUDIT"
        );
        if (pending) {
          const { block } = await approveAndSealPatch(pending.id, activeMember.name);
          setToastMessage(`Audit Approved: Patch sealed to SHA-256 Ledger (Block #${block.index}).`);
          setToastLink({
            text: `View Block #${block.index} in Ledger →`,
            href: "/ledger",
          });
        } else {
          const block = await commitPatchToLedger({
            problemId: selectedProblem.id,
            patchTitle: selectedProblem.title,
            actor: activeMember.name,
            speedupDelta: activeMetrics.delta || "+74.2%",
          });
          setToastMessage(`Direct Commitment: Block #${block.index} sealed to Ledger.`);
          setToastLink({
            text: `View Block #${block.index} in Ledger →`,
            href: "/ledger",
          });
        }
      } else {
        const block = await commitPatchToLedger({
          problemId: selectedProblem.id,
          patchTitle: selectedProblem.title,
          actor: activeMember.name,
          speedupDelta: activeMetrics.delta || "+74.2%",
        });
        setToastMessage(`Administrative Commitment: Block #${block.index} sealed to Ledger.`);
        setToastLink({
          text: `View Block #${block.index} in Ledger →`,
          href: "/ledger",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPatch = () => {
    setIsRepairing(true);
    setToastMessage(`Triggering Nemotron Repair Cycle (Iteration 2/3) for ${selectedProblem.id}...`);

    setTimeout(() => {
      setIsRepairing(false);
      setIteration(2);
      const hardenedCode = `# ITERATION 2 — DEFENSIVE HARDENING SYNTHESIS
from sqlalchemy import select, bindparam
import time

def process_user_records(db_session, user_ids: list[str]):
    """Strictly parameterized query with bounded input ceiling and tenant isolation."""
    if not user_ids:
        return []
    bounded_ids = list(set(user_ids))[:500]  # Prevent unbounded allocation
    stmt = select(User).where(User.id.in_(bindparam("uids", expanding=True)))
    return db_session.scalars(stmt, {"uids": bounded_ids}).all()`;
      setHardenedCandidateCode(hardenedCode);
      setSnippetMode("safe");
      setPanelTab("gates");
      setToastMessage("Hardened iteration synthesized. Parameter bounds & tenant isolation enforced.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 850);
  };

  const isSafeMode = snippetMode === "safe";
  const isNaiveMode = snippetMode === "naive";
  const isBugMode = snippetMode === "bug";
  const isCustomMode = snippetMode === "custom";

  const targetFilename = selectedProblem.filename || `${selectedProblem.id.toLowerCase()}_benchmark.py`;
  const baselineDisplayCode = selectedProblem.bugSnippet;
  const candidateDisplayCode =
    hardenedCandidateCode ||
    (isCustomMode ? customCode : isSafeMode ? selectedProblem.safeFixSnippet : selectedProblem.naiveFixSnippet);

  const activeMetrics =
    isSafeMode
      ? selectedProblem.metrics?.safe || { keyMetric: "Safe", latency: "14ms", delta: "+82.5%" }
      : isNaiveMode
      ? selectedProblem.metrics?.naive || { keyMetric: "Vetoed", latency: "42ms", delta: "+45.0%" }
      : selectedProblem.metrics?.baseline || { keyMetric: "Baseline", latency: "380ms", delta: "0.0%" };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. STUDIO HEADER: Focused Task & Primary Action */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
              Studio Workspace
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Task: {selectedProblem.id}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {selectedProblem.title}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
            {selectedProblem.summary}
          </p>
        </div>

        {/* Compact Benchmark Selector & Primary Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <select
            value={selectedProblem.id}
            onChange={(e) => handleSelectProblem(e.target.value)}
            className="h-9 px-3 text-xs font-mono rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
          >
            {catalogWithCustom.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.title}
              </option>
            ))}
          </select>

          {/* Primary Action Button */}
          {isSafeMode ? (
            <button
              type="button"
              onClick={handleAcceptPatch}
              disabled={isRepairing || isProcessing}
              className="h-9 px-4 rounded-xl bg-[var(--accent-teal)] hover:opacity-90 text-[var(--surface-base)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              {role === "developer" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit for Audit</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approve &amp; Seal</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isProcessing}
              className="h-9 px-4 rounded-xl bg-[var(--surface-base)] hover:bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--text-primary)] transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
              <span>Run Code ↵</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl border border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/10 text-xs text-[var(--text-primary)] flex items-center justify-between gap-3 font-mono transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-teal)] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <div className="flex items-center gap-3">
            {toastLink && (
              <Link
                href={toastLink.href}
                className="text-[var(--accent-teal)] underline hover:opacity-80"
              >
                {toastLink.text}
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                setToastLink(null);
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. TASK CONFIGURATION & EXECUTION CONTROLS BAR */}
      <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Code Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              setSnippetMode("bug");
              setHardenedCandidateCode(null);
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              isBugMode
                ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Baseline (Bug)
          </button>
          <button
            type="button"
            onClick={() => {
              setSnippetMode("naive");
              setHardenedCandidateCode(null);
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              isNaiveMode
                ? "bg-[var(--surface-elevated)] text-[var(--status-danger)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Naive Fix
          </button>
          <button
            type="button"
            onClick={() => {
              setSnippetMode("safe");
              setHardenedCandidateCode(null);
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              isSafeMode
                ? "bg-[var(--accent-teal)]/15 text-[var(--accent-teal)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Defensive (Nemotron)
          </button>
          <button
            type="button"
            onClick={() => {
              setSnippetMode("custom");
              setHardenedCandidateCode(null);
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              isCustomMode
                ? "bg-[var(--surface-elevated)] text-[var(--accent-teal)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Custom Code
          </button>
        </div>

        {/* Execution Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-sunken)] text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 text-[var(--accent-teal)]" />
            <span>Run MicroVM</span>
          </button>

          <button
            type="button"
            onClick={handleAuditGauntlet}
            disabled={isProcessing || isRepairing}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-sunken)] text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
          >
            <Shield className="w-3 h-3 text-amber-500" />
            <span>Audit Gauntlet</span>
          </button>

          <button
            type="button"
            onClick={handleSelfHeal}
            disabled={isProcessing || isRepairing}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-sunken)] text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[var(--accent-teal)]" />
            <span>Self-Heal</span>
          </button>
        </div>
      </div>

      {/* 3. FINDING & PROPOSED FIX CARD */}
      <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isSafeMode
                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                  : isNaiveMode
                  ? "bg-red-500/15 text-red-500 border border-red-500/30"
                  : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
              }`}
            >
              {isSafeMode
                ? "100% Invariant Met (Safe)"
                : isNaiveMode
                ? "Vetoed (Security Regress)"
                : "Baseline Flaw"}
            </span>
            <span className="text-[var(--text-secondary)] font-mono">
              File: <strong className="text-[var(--text-primary)]">{targetFilename}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFindingDetails(!showFindingDetails)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-[11px]"
          >
            <span>{showFindingDetails ? "Hide details" : "Show vulnerability details"}</span>
            {showFindingDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-[var(--text-secondary)] leading-relaxed">
          {isRepairing
            ? "Synthesizing hardened defensive patch via NVIDIA Nemotron..."
            : iteration === 2
            ? "Iteration 2: Enforced parameter bounds, query timeout, and tenant isolation."
            : isSafeMode
            ? selectedProblem.safeReason
            : isNaiveMode
            ? selectedProblem.naiveReason
            : selectedProblem.realWorldImpact || selectedProblem.summary}
        </div>

        {/* Expandable Technical Evidence */}
        {showFindingDetails && (
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2 text-[11px] text-[var(--text-secondary)]">
            <div>
              <span className="text-[var(--text-muted)] uppercase">Exploit Probe:</span>{" "}
              <code>{selectedProblem.probeMethod || "AST Visitor & MicroVM Probe"}</code>
            </div>
            <div>
              <span className="text-[var(--text-muted)] uppercase">Severity Impact:</span>{" "}
              <span className="text-[var(--text-primary)]">{selectedProblem.realWorldImpact}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] uppercase">Domain:</span>{" "}
              <span className="text-[var(--text-primary)]">{selectedProblem.domain} ({selectedProblem.tier})</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. CONSOLIDATED VERIFICATION METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Gate Status</div>
          <div className={`text-base font-bold ${isSafeMode ? "text-emerald-500" : isNaiveMode ? "text-red-500" : "text-amber-500"}`}>
            {isSafeMode ? "8/8 PASSED" : isNaiveMode ? "G2 VETOED" : "BASELINE"}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">Zero-Compromise Interlock</div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Speedup Delta</div>
          <div className="text-base font-bold text-[var(--accent-teal)]">
            {activeMetrics.delta}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">
            Latency: {activeMetrics.latency}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Security Invariant</div>
          <div className={`text-base font-bold ${isSafeMode ? "text-emerald-500" : isNaiveMode ? "text-red-500" : "text-[var(--text-primary)]"}`}>
            {isSafeMode ? "100% PRESERVED" : isNaiveMode ? "VIOLATION" : "UNSAFE"}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">AST Parameter Bound</div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">MicroVM Isolation</div>
          <div className="text-base font-bold text-emerald-500">
            HERMETIC
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">Zero Network Egress</div>
        </div>
      </div>

      {/* 5. CODE COMPARISON: MONACO SPLIT DIFF (Wide) / TABS (Mobile) */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden shadow-sm">
        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-[var(--border-subtle)] font-mono text-xs">
          <button
            type="button"
            onClick={() => setMobileCodeTab("baseline")}
            className={`flex-1 py-2.5 text-center font-bold ${
              mobileCodeTab === "baseline"
                ? "border-b-2 border-red-500 text-red-500 bg-[var(--surface-base)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            - Baseline Code
          </button>
          <button
            type="button"
            onClick={() => setMobileCodeTab("candidate")}
            className={`flex-1 py-2.5 text-center font-bold ${
              mobileCodeTab === "candidate"
                ? "border-b-2 border-emerald-500 text-emerald-500 bg-[var(--surface-base)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            + Candidate Patch
          </button>
        </div>

        {/* Desktop Split View / Mobile Tab Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
          {/* Baseline Column */}
          <div
            className={`flex flex-col min-w-0 ${
              mobileCodeTab === "candidate" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-red-500 flex items-center gap-1.5">
                <span>−</span> Baseline Flaw · {targetFilename}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">Read-Only</span>
            </div>
            <div className="p-3 font-mono text-xs overflow-x-auto min-h-[320px] max-h-[460px] bg-[var(--surface-base)]">
              {baselineDisplayCode.split("\n").map((line, idx) => (
                <div key={idx} className="flex gap-3 py-0.5 text-[var(--text-secondary)]">
                  <span className="w-6 text-right select-none text-[var(--text-muted)] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Column */}
          <div
            className={`flex flex-col min-w-0 ${
              mobileCodeTab === "baseline" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                <span>+</span> Candidate Fix ({snippetMode})
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {isCustomMode ? "Editable" : "Synthesized"}
              </span>
            </div>

            {isCustomMode ? (
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="p-3 font-mono text-xs w-full min-h-[320px] max-h-[460px] bg-[var(--surface-base)] text-[var(--text-primary)] resize-none border-0 focus:outline-none"
                spellCheck={false}
              />
            ) : (
              <div className="p-3 font-mono text-xs overflow-x-auto min-h-[320px] max-h-[460px] bg-[var(--surface-base)]">
                {candidateDisplayCode.split("\n").map((line, idx) => (
                  <div key={idx} className="flex gap-3 py-0.5 text-[var(--text-primary)]">
                    <span className="w-6 text-right select-none text-[var(--text-muted)] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. AUDIT, GATES & EVIDENCE PANEL */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-[var(--border-subtle)] gap-2">
          <button
            type="button"
            onClick={() => setPanelTab("gates")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              panelTab === "gates"
                ? "border-[var(--accent-teal)] text-[var(--accent-teal)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Verification Gates (8)</span>
          </button>

          <button
            type="button"
            onClick={() => setPanelTab("logs")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              panelTab === "logs"
                ? "border-[var(--accent-teal)] text-[var(--accent-teal)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>MicroVM Execution Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setPanelTab("ledger")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              panelTab === "ledger"
                ? "border-[var(--accent-teal)] text-[var(--accent-teal)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Merkle Ledger Evidence</span>
          </button>
        </div>

        {/* Tab Content: Gates */}
        {panelTab === "gates" && (
          <div className="space-y-2 font-mono text-xs">
            {MOCK_GATES.map((g, index) => {
              const isEvaluated = index < animatingGateIndex;
              const isPassing = isSafeMode && isEvaluated;
              const isFailing = isNaiveMode && index === 2; // Gate 2 fails in naive mode
              return (
                <div
                  key={g.gateId}
                  className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[var(--text-primary)] shrink-0">{g.gateId}:</span>
                    <span className="text-[var(--text-secondary)] truncate">{g.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate hidden sm:inline">({g.description})</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {isEvaluated ? "12ms" : "Pending"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        !isEvaluated
                          ? "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                          : isFailing
                          ? "bg-red-500/15 text-red-500 border border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      }`}
                    >
                      {!isEvaluated ? "QUEUED" : isFailing ? "FAIL (VETO)" : "PASS"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content: Logs */}
        {panelTab === "logs" && (
          <div className="p-3 rounded-xl bg-slate-950 border border-[var(--border-subtle)] text-emerald-400 font-mono text-xs overflow-x-auto max-h-[300px]">
            {customLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed whitespace-pre">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Ledger */}
        {panelTab === "ledger" && (
          <div className="space-y-2 font-mono text-xs">
            {ledgerChain.slice(0, 5).map((block) => (
              <div
                key={block.index}
                className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-[var(--text-primary)]">
                    Block #{block.index}: {block.type}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Hash: {block.entryHash.slice(0, 24)}... · Actor: {block.actor} · {block.time}
                  </div>
                </div>
                <div className="text-[10px] text-emerald-500 font-bold shrink-0">
                  SEALED IN CHAIN
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. PATCH DECISION WORKFLOW ACTIONS */}
      <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="text-[var(--text-secondary)]">
          Workflow Decision:{" "}
          <strong className="text-[var(--text-primary)]">
            {isSafeMode
              ? "Candidate eligible for submission & ledger commitment."
              : isNaiveMode
              ? "Candidate rejected by security gate. Repair cycle required."
              : "Baseline code under inspection."}
          </strong>
        </div>

        <div className="flex items-center gap-2">
          {isSafeMode ? (
            <>
              <button
                type="button"
                onClick={handleAcceptPatch}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[var(--accent-teal)] hover:opacity-90 text-[var(--surface-base)] font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {role === "developer"
                    ? "Submit Patch for Security Audit"
                    : "Approve & Commit to Ledger"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleRejectPatch}
                disabled={isRepairing}
                className="px-3 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Reject &amp; Repair
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSelfHeal}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-[var(--accent-teal)] hover:opacity-90 text-[var(--surface-base)] font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize Defensive Patch (Nemotron)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-mono text-xs text-[var(--text-secondary)]">
          Initializing Studio Environment...
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
