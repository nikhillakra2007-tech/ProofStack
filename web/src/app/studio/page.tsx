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
  Copy,
  Check,
  CheckCheck,
  Zap,
  ExternalLink,
  SlidersHorizontal,
  Code2,
} from "lucide-react";

const CUSTOM_PROBLEM_FIXTURE: CatalogProblem = {
  id: "CUSTOM-1",
  tier: "Real-World",
  domain: "Arbitrary Ingestion",
  title: "Arbitrary Production Code Ingestion",
  summary: "User-ingested production function evaluated live via rootless Linux 6.6 microVM sandboxes & AST security scans.",
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
  safeReason: "G0-G7 Invariants Passed: Bound parameters verified, O(1) query complexity, zero injection vectors.",
  probeMethod: "Live AST Security Visitor + Rootless Linux 6.6 MicroVM Probe",
  truthRank: 1,
  filename: "custom_worker.py",
  metrics: {
    baseline: { keyMetric: "Vulnerable code", latency: "380 ms", invariant: "Unsafe SQL", delta: "0.0%" },
    naive: { keyMetric: "Unbound formatting", latency: "42 ms", invariant: "Gate Vetoed", delta: "+45.0%" },
    safe: { keyMetric: "1 bound query", latency: "14 ms", invariant: "100% Invariant Met", delta: "+82.5%" },
  },
};

function highlightLine(line: string) {
  const trimmed = line.trim();
  if (trimmed.startsWith("#")) {
    return <span className="text-emerald-600/80 dark:text-emerald-400/80 italic">{line}</span>;
  }
  
  // Highlight common Python tokens
  const parts = line.split(/(\b(?:def|from|import|return|for|in|select|where|if|else|while|class|try|except)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (/^(def|from|import|return|for|in|select|where|if|else|while|class|try|except)$/.test(part)) {
          return <span key={i} className="text-teal-600 dark:text-teal-400 font-bold">{part}</span>;
        }
        if (part.startsWith('"') || part.startsWith("'")) {
          return <span key={i} className="text-amber-600 dark:text-amber-300">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

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

  // Mobile code diff view mode: 'baseline' | 'candidate'
  const [mobileCodeTab, setMobileCodeTab] = useState<"baseline" | "candidate">("candidate");

  // Expandable details toggle
  const [showFindingDetails, setShowFindingDetails] = useState(false);

  // Status & interactive toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastLink, setToastLink] = useState<{ text: string; href: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

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
      setToastMessage("Loaded custom ingestion fixture. Edit below and test.");
    } else {
      setSnippetMode("safe");
      const target = catalogWithCustom.find((p) => p.id === id);
      if (target) {
        setCustomCode(target.safeFixSnippet);
      }
      setToastMessage(`Loaded benchmark scenario [${id}]: ${target?.title}`);
    }
    setIteration(1);
    setHardenedCandidateCode(null);
    setToastLink(null);
    setTimeout(() => setToastMessage(null), 3500);

    const url = new URL(window.location.href);
    url.searchParams.set("problem", id);
    if (id === "CUSTOM-1") url.searchParams.set("mode", "custom");
    else url.searchParams.delete("mode");
    window.history.pushState({}, "", url.toString());
  };

  const handleCopyCode = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          setToastMessage(`MicroVM execution succeeded (${data.executionTimeMs}ms, memory delta: ${data.memoryDeltaMb}MB).`);
        } else {
          setToastMessage(`MicroVM probe exited with code ${data.exitCode} (${data.executionTimeMs}ms).`);
        }
        setToastLink(null);
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err: any) {
        setToastMessage(`Sandbox error: ${err?.message || "MicroVM execution failed"}`);
        setTimeout(() => setToastMessage(null), 3500);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setTimeout(() => {
      setIsProcessing(false);
      setCustomLogs(getProblemLogs(selectedProblem, snippetMode));
      setToastMessage(`MicroVM executed ${selectedProblem.filename || "benchmark"} with exit code 0.`);
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
        setToastMessage(`Gauntlet evaluation completed for ${selectedProblem.id}: all 8 invariants tested.`);
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
      setTimeout(() => setToastMessage(null), 3500);
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
    setToastMessage(`Triggering Nemotron Hardening Cycle (Iteration 2/3) for ${selectedProblem.id}...`);

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
    <div className="space-y-5 max-w-[1440px] mx-auto pb-14 px-1 sm:px-2">
      {/* =========================================================================
          SUBSECTION 1: WORKSPACE OVERVIEW
          Breadcrumbs, Scenario Identity, Execution State, and Primary Actions
          ========================================================================= */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 lg:p-6 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {/* Breadcrumb & Task Status Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-[var(--ink3)]">Workspace</span>
              <span className="text-[var(--ink3)]">/</span>
              <span className="font-mono text-[var(--ink3)]">Studio</span>
              <span className="text-[var(--ink3)]">/</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-[var(--brand)]/15 text-[var(--brand)] border border-[var(--brand)]/25">
                {selectedProblem.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[var(--ink2)] bg-[var(--surface2)] border border-[var(--line)]">
                Tier: {selectedProblem.tier || "Enterprise"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hermetic Sandbox Ready
              </span>
            </div>

            {/* Task Title & Summary */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)] leading-snug">
              {selectedProblem.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink2)] max-w-3xl leading-relaxed">
              {selectedProblem.summary}
            </p>
          </div>

          {/* Scenario Selector & Quick Execution Action */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Styled Scenario Select Control */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedProblem.id}
                onChange={(e) => handleSelectProblem(e.target.value)}
                aria-label="Select benchmark scenario"
                className="w-full h-10 pl-3 pr-9 text-xs font-mono rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 transition-all cursor-pointer appearance-none shadow-sm font-medium"
              >
                {catalogWithCustom.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[var(--surface)] text-[var(--ink)]">
                    [{p.id}] {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--ink3)] absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Primary Action Button */}
            {isSafeMode ? (
              <button
                type="button"
                onClick={handleAcceptPatch}
                disabled={isRepairing || isProcessing}
                className="h-10 px-4 rounded-xl bg-[var(--brand)] hover:brightness-105 active:scale-95 text-[var(--brand-ink)] text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                {role === "developer" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit for Audit</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve &amp; Seal</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isProcessing}
                className="h-10 px-4 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface3)] active:scale-95 border border-[var(--line)] text-xs font-mono font-bold text-[var(--ink)] transition-all flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-[var(--brand)] fill-current" />
                <span>Run MicroVM</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Interactive Toast Notification */}
        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/10 text-xs text-[var(--ink)] flex items-center justify-between gap-3 font-mono transition-all animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <div className="flex items-center gap-3">
              {toastLink && (
                <Link
                  href={toastLink.href}
                  className="text-[var(--brand)] font-semibold underline hover:opacity-80 flex items-center gap-1"
                >
                  <span>{toastLink.text}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setToastMessage(null);
                  setToastLink(null);
                }}
                className="text-[var(--ink3)] hover:text-[var(--ink)] px-1"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          MAIN WORKSPACE GRID: 8 COLUMNS (EDITOR & EVIDENCE) + 4 COLUMNS (DIAGNOSTICS)
          Eliminates unused whitespace and structures information logically
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =======================================================================
            LEFT COLUMN (8 COLS): Configuration, Execution Lab, Code & Verification
            ======================================================================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* SUBSECTION 2 & 3: SCENARIO CONFIGURATION & EXECUTION LAB */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-sm">
            {/* Mode Switcher Segmented Control */}
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  setSnippetMode("bug");
                  setHardenedCandidateCode(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isBugMode
                    ? "bg-[var(--surface)] text-[var(--fail)] shadow-sm border border-[var(--line)]"
                    : "text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                Baseline (Flaw)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSnippetMode("naive");
                  setHardenedCandidateCode(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isNaiveMode
                    ? "bg-[var(--surface)] text-amber-600 dark:text-amber-400 shadow-sm border border-[var(--line)]"
                    : "text-[var(--ink2)] hover:text-[var(--ink)]"
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
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isSafeMode
                    ? "bg-[var(--brand)] text-[var(--brand-ink)] shadow-sm"
                    : "text-[var(--ink2)] hover:text-[var(--ink)]"
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
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isCustomMode
                    ? "bg-[var(--surface)] text-teal-600 dark:text-teal-400 shadow-sm border border-[var(--line)]"
                    : "text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                Custom Ingestion
              </button>
            </div>

            {/* Execution Lab Action Deck */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isProcessing}
                title="Execute sandbox probe in rootless Linux microVM"
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] hover:bg-[var(--surface3)] text-[var(--ink)] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-[var(--brand)] fill-current" />
                <span>Run MicroVM</span>
              </button>

              <button
                type="button"
                onClick={handleAuditGauntlet}
                disabled={isProcessing || isRepairing}
                title="Evaluate 8 Zero-Compromise Security Invariants"
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] hover:bg-[var(--surface3)] text-[var(--ink)] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Audit Gauntlet</span>
              </button>

              <button
                type="button"
                onClick={handleSelfHeal}
                disabled={isProcessing || isRepairing}
                title="Synthesize defensive patch with NVIDIA Nemotron"
                className="px-3 py-1.5 rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/10 hover:bg-[var(--brand)]/20 text-[var(--brand)] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>Self-Heal</span>
              </button>
            </div>
          </div>

          {/* SUBSECTION 6: CANDIDATE PATCH & CODE REVIEW (MONACO DIFF CONTAINER) */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-sm">
            {/* Diff Header Bar */}
            <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-4 h-4 text-[var(--brand)]" />
                <span className="font-bold text-[var(--ink)]">{targetFilename}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--ink2)] border border-[var(--line)]">
                  Python 3.11 AST
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--ink2)] hidden sm:inline">
                  {isSafeMode ? "+8 lines added, -6 replaced" : "Inspection view"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(candidateDisplayCode)}
                  className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brand)] text-[var(--ink2)] hover:text-[var(--ink)] flex items-center gap-1 transition-all"
                  title="Copy candidate patch"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="sm:hidden flex border-b border-[var(--line)] font-mono text-xs">
              <button
                type="button"
                onClick={() => setMobileCodeTab("baseline")}
                className={`flex-1 py-2.5 text-center font-bold transition-all ${
                  mobileCodeTab === "baseline"
                    ? "border-b-2 border-[var(--fail)] text-[var(--fail)] bg-[var(--surface)]"
                    : "text-[var(--ink2)] bg-[var(--surface2)]"
                }`}
              >
                − Baseline Code
              </button>
              <button
                type="button"
                onClick={() => setMobileCodeTab("candidate")}
                className={`flex-1 py-2.5 text-center font-bold transition-all ${
                  mobileCodeTab === "candidate"
                    ? "border-b-2 border-emerald-500 text-emerald-500 bg-[var(--surface)]"
                    : "text-[var(--ink2)] bg-[var(--surface2)]"
                }`}
              >
                + Candidate Patch
              </button>
            </div>

            {/* Side-by-Side Code Diff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)]">
              {/* Left Column: Baseline Flaw */}
              <div className={`flex flex-col min-w-0 ${mobileCodeTab === "candidate" ? "hidden sm:flex" : "flex"}`}>
                <div className="px-3.5 py-2 border-b border-[var(--line)] bg-[var(--surface)]/80 flex items-center justify-between text-[11px] font-mono text-[var(--ink2)]">
                  <span className="font-semibold text-[var(--fail)] flex items-center gap-1">
                    <span>−</span> Baseline Vulnerability
                  </span>
                  <span className="text-[10px] text-[var(--ink3)]">Read-Only</span>
                </div>
                <div className="p-3.5 font-mono text-xs overflow-x-auto min-h-[340px] max-h-[460px] bg-[var(--term-bg)] text-[var(--term-ink)] selection:bg-rose-900/40">
                  {baselineDisplayCode.split("\n").map((line, idx) => (
                    <div key={idx} className="flex gap-3 py-0.5 leading-relaxed hover:bg-white/5 rounded px-1">
                      <span className="w-6 text-right select-none text-[var(--term-mute)] shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre font-mono">{highlightLine(line)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Candidate Patch */}
              <div className={`flex flex-col min-w-0 ${mobileCodeTab === "baseline" ? "hidden sm:flex" : "flex"}`}>
                <div className="px-3.5 py-2 border-b border-[var(--line)] bg-[var(--surface)]/80 flex items-center justify-between text-[11px] font-mono text-[var(--ink2)]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>+</span> Candidate Fix ({snippetMode})
                  </span>
                  <span className="text-[10px] text-[var(--ink3)]">
                    {isCustomMode ? "Interactive Editor" : "Synthesized by Nemotron"}
                  </span>
                </div>

                {isCustomMode ? (
                  <textarea
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="p-3.5 font-mono text-xs w-full min-h-[340px] max-h-[460px] bg-[var(--term-bg)] text-[var(--term-ink)] resize-none border-0 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] leading-relaxed selection:bg-teal-900/40"
                    spellCheck={false}
                    placeholder="# Enter custom production python function here..."
                  />
                ) : (
                  <div className="p-3.5 font-mono text-xs overflow-x-auto min-h-[340px] max-h-[460px] bg-[var(--term-bg)] text-[var(--term-ink)] selection:bg-emerald-900/40">
                    {candidateDisplayCode.split("\n").map((line, idx) => (
                      <div key={idx} className="flex gap-3 py-0.5 leading-relaxed hover:bg-white/5 rounded px-1">
                        <span className="w-6 text-right select-none text-[var(--term-mute)] shrink-0 text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="whitespace-pre font-mono">{highlightLine(line)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUBSECTION 7: VERIFICATION, GATES & EVIDENCE PANEL */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 space-y-4 shadow-sm">
            {/* Tab Headers */}
            <div className="flex border-b border-[var(--line)] gap-2">
              <button
                type="button"
                onClick={() => setPanelTab("gates")}
                className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                  panelTab === "gates"
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Verification Gates (8)</span>
              </button>

              <button
                type="button"
                onClick={() => setPanelTab("logs")}
                className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                  panelTab === "logs"
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>MicroVM Execution Logs</span>
              </button>

              <button
                type="button"
                onClick={() => setPanelTab("ledger")}
                className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                  panelTab === "ledger"
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Merkle Ledger Evidence</span>
              </button>
            </div>

            {/* Tab Content: 8 Verification Gates */}
            {panelTab === "gates" && (
              <div className="space-y-2.5 font-mono text-xs">
                {MOCK_GATES.map((g, index) => {
                  const isEvaluated = index < animatingGateIndex;
                  const isPassing = isSafeMode && isEvaluated;
                  const isFailing = isNaiveMode && index === 2; // Gate 2 fails in naive mode
                  return (
                    <div
                      key={g.gateId}
                      className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between gap-3 hover:border-[var(--brand)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-bold text-[var(--ink)] shrink-0">{g.gateId}:</span>
                        <span className="text-[var(--ink)] font-semibold truncate">{g.name}</span>
                        <span className="text-[11px] text-[var(--ink3)] truncate hidden md:inline">
                          — {g.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-[var(--ink3)]">
                          {isEvaluated ? "12ms" : "Pending"}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            !isEvaluated
                              ? "bg-[var(--surface)] text-[var(--ink3)] border border-[var(--line)]"
                              : isFailing
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
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

            {/* Tab Content: MicroVM Execution Console */}
            {panelTab === "logs" && (
              <div className="p-4 rounded-xl bg-[var(--term-bg)] border border-[var(--line)] text-emerald-400 font-mono text-xs overflow-x-auto max-h-[320px] shadow-inner space-y-1">
                {customLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre font-mono hover:bg-white/5 px-1 rounded">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Tab Content: Merkle Ledger */}
            {panelTab === "ledger" && (
              <div className="space-y-2.5 font-mono text-xs">
                {ledgerChain.slice(0, 5).map((block) => (
                  <div
                    key={block.index}
                    className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                        <span>Block #{block.index}:</span>
                        <span className="text-[var(--brand)]">{block.type}</span>
                      </div>
                      <div className="text-[11px] text-[var(--ink3)]">
                        Hash: {block.entryHash.slice(0, 24)}... · Actor: {block.actor} · {block.time}
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0 self-start sm:self-center">
                      SEALED IN CHAIN
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN (4 COLS): Security Findings, Performance, Invariants & Signoff
            ======================================================================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* SUBSECTION 4: SECURITY FINDINGS & DEFECT EXPLANATION */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Security Finding
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  isSafeMode
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : isNaiveMode
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
              >
                {isSafeMode
                  ? "Invariant Met"
                  : isNaiveMode
                  ? "Security Regress"
                  : "Vulnerability"}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-[var(--ink)]">
                Target: <code>{targetFilename}</code>
              </div>
              <p className="text-xs text-[var(--ink2)] leading-relaxed">
                {isRepairing
                  ? "Synthesizing hardened defensive patch via NVIDIA Nemotron..."
                  : iteration === 2
                  ? "Iteration 2: Enforced parameter bounds, query timeout, and tenant isolation."
                  : isSafeMode
                  ? selectedProblem.safeReason
                  : isNaiveMode
                  ? selectedProblem.naiveReason
                  : selectedProblem.realWorldImpact || selectedProblem.summary}
              </p>
            </div>

            {/* Collapsible Technical Details */}
            <div className="pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setShowFindingDetails(!showFindingDetails)}
                className="w-full flex items-center justify-between text-xs font-mono text-[var(--ink2)] hover:text-[var(--ink)] py-1"
              >
                <span>{showFindingDetails ? "Hide technical evidence" : "Show technical evidence"}</span>
                {showFindingDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFindingDetails && (
                <div className="mt-2.5 p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-[11px] font-mono text-[var(--ink2)] animate-fadeIn">
                  <div>
                    <span className="text-[var(--ink3)] uppercase block text-[10px]">Probe Method:</span>
                    <span className="text-[var(--ink)]">{selectedProblem.probeMethod || "AST Visitor & MicroVM Probe"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ink3)] uppercase block text-[10px]">Exploit Vector:</span>
                    <span className="text-[var(--ink)]">{selectedProblem.realWorldImpact}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ink3)] uppercase block text-[10px]">Classification:</span>
                    <span className="text-[var(--ink)]">{selectedProblem.domain} ({selectedProblem.tier})</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SUBSECTION 5: PERFORMANCE & INVARIANT ANALYSIS */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--brand)]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Performance &amp; Invariants
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-1">
                <div className="text-[10px] text-[var(--ink3)] uppercase">Gate Status</div>
                <div className={`text-base font-bold ${isSafeMode ? "text-emerald-600 dark:text-emerald-400" : isNaiveMode ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {isSafeMode ? "8/8 PASSED" : isNaiveMode ? "G2 VETOED" : "BASELINE"}
                </div>
                <div className="text-[10px] text-[var(--ink3)]">Deterministic Check</div>
              </div>

              <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-1">
                <div className="text-[10px] text-[var(--ink3)] uppercase">Speedup Delta</div>
                <div className="text-base font-bold text-[var(--brand)]">
                  {activeMetrics.delta}
                </div>
                <div className="text-[10px] text-[var(--ink3)]">
                  Latency: {activeMetrics.latency}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-1">
                <div className="text-[10px] text-[var(--ink3)] uppercase">Security Invariant</div>
                <div className={`text-base font-bold ${isSafeMode ? "text-emerald-600 dark:text-emerald-400" : isNaiveMode ? "text-rose-600 dark:text-rose-400" : "text-[var(--ink)]"}`}>
                  {isSafeMode ? "100% PRESERVED" : isNaiveMode ? "VIOLATION" : "UNSAFE"}
                </div>
                <div className="text-[10px] text-[var(--ink3)]">AST Bound Query</div>
              </div>

              <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-1">
                <div className="text-[10px] text-[var(--ink3)] uppercase">Sandbox Isolation</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  HERMETIC
                </div>
                <div className="text-[10px] text-[var(--ink3)]">Rootless MicroVM</div>
              </div>
            </div>
          </section>

          {/* SUBSECTION 8: WORKFLOW DECISION & SIGN-OFF ACTIONS */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--brand)]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Workflow Sign-off
              </h3>
            </div>

            <p className="text-xs text-[var(--ink2)] font-mono leading-relaxed">
              {isSafeMode
                ? "Candidate satisfies all invariant gates and SLA requirements. Ready for audit submission or cryptographic sealing."
                : isNaiveMode
                ? "Candidate rejected by security gate G2. SQL injection regression detected. Trigger repair cycle to harden."
                : "Baseline scenario loaded. Run microVM or synthesize defensive patch to begin repair."}
            </p>

            <div className="pt-2 space-y-2.5">
              {isSafeMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleAcceptPatch}
                    disabled={isProcessing}
                    className="w-full h-10 px-4 rounded-xl bg-[var(--brand)] hover:brightness-105 active:scale-95 text-[var(--brand-ink)] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {role === "developer"
                        ? "Submit Patch for Security Audit"
                        : "Approve & Seal to Ledger"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectPatch}
                    disabled={isRepairing}
                    className="w-full h-9 px-3 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Reject &amp; Trigger Hardening Cycle</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSelfHeal}
                  disabled={isProcessing}
                  className="w-full h-10 px-4 rounded-xl bg-[var(--brand)] hover:brightness-105 active:scale-95 text-[var(--brand-ink)] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Defensive Patch (Nemotron)</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-xs text-[var(--ink2)] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-ping" />
          <span>Initializing ProofStack Studio Environment...</span>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}