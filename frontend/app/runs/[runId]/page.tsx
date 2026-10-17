"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  Run,
  Gate,
  Baseline,
  Finding,
  LedgerEntry,
  Decision,
  Report,
  subscribeToEvents,
} from "@/lib/api";
import { Interlock } from "@/components/Interlock";
import { GateTable } from "@/components/GateTable";
import { LedgerChain } from "@/components/LedgerChain";
import { BaselineView } from "@/components/BaselineView";
import { HypothesisView } from "@/components/HypothesisView";
import { PatchView } from "@/components/PatchView";
import { ReportViewer } from "@/components/ReportViewer";

const TERMINAL_STATUSES = ["COMPLETED", "FAILED", "CANCELLED"];

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;

  const [run, setRun] = useState<Run | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [baseline, setBaseline] = useState<Baseline[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [hypotheses, setHypotheses] = useState<Array<{ id: string; hypothesis_id: string; category: string; statement: string; validation_status: string; falsifiable_prediction?: string; model_metadata?: Record<string, unknown> }>>([]);
  const [experiments, setExperiments] = useState<Array<{ id: string; experiment_id: string; experiment_type: string; result_status: string | null; actual_observations?: Record<string, unknown>; duration_s?: number }>>([]);
  const [patches, setPatches] = useState<Array<{ id: string; cycle_number: number; validation_status: string | null; diff_text?: string; line_count: number; review_status?: string | null; diff_sha256?: string; changed_files?: string[] }>>([]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [proposingPatch, setProposingPatch] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"casefile" | "ledger" | "reports">("casefile");

  const isTerminalRef = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const [
        runData,
        gatesData,
        baselineData,
        findingsData,
        ledgerData,
        hypData,
        expData,
        patchData,
        reportsData,
      ] = await Promise.all([
        api.getRun(runId),
        api.getGates(runId).catch(() => []),
        api.getBaseline(runId).catch(() => []),
        api.getFindings(runId).catch(() => []),
        api.getLedger(runId).catch(() => []),
        api.getHypotheses(runId).catch(() => []),
        api.getExperiments(runId).catch(() => []),
        api.getPatches(runId).catch(() => []),
        api.listReports(runId).catch(() => []),
      ]);

      setRun(runData);
      setGates(gatesData);
      setBaseline(baselineData);
      setFindings(findingsData);
      setLedger(ledgerData);
      setHypotheses(hypData);
      setExperiments(expData);
      setPatches(patchData);
      setReports(reportsData);

      // Attempt to load decision if terminal or verdict present
      if (runData.final_verdict) {
        api.getDecision(runId).then(setDecision).catch(() => {});
      }

      const terminal = TERMINAL_STATUSES.includes(runData.status);
      isTerminalRef.current = terminal;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load run details");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live updates: SSE subscription with bounded polling fallback
  useEffect(() => {
    if (isTerminalRef.current) return;

    const unsubscribeSSE = subscribeToEvents(
      runId,
      (event) => {
        loadData();
        if (event.type === "verdict.final" || event.type === "run.completed" || event.type === "run.failed") {
          isTerminalRef.current = true;
        }
      },
      () => {
        // SSE error, fallback will handle updates
      }
    );

    // Bounded polling every 3 seconds while active
    const pollInterval = setInterval(() => {
      if (isTerminalRef.current) {
        clearInterval(pollInterval);
        return;
      }
      loadData();
    }, 3000);

    return () => {
      unsubscribeSSE();
      clearInterval(pollInterval);
    };
  }, [runId, loadData]);

  const handleCancelRun = async () => {
    setCancelling(true);
    setShowCancelConfirm(false);
    try {
      await api.cancelRun(runId);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel run");
    } finally {
      setCancelling(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      await api.analyzeRun(runId);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to run model diagnosis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProposePatch = async () => {
    setProposingPatch(true);
    try {
      await api.proposePatch(runId);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to propose remediation patch");
    } finally {
      setProposingPatch(false);
    }
  };

  if (loading) {
    return (
      <div className="panel p-8 text-center text-sm text-ps-ink-2 space-y-2">
        <div className="w-5 h-5 border-2 border-ps-focus border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading case file for Run {runId.slice(0, 13)}...</p>
      </div>
    );
  }

  if (error && !run) {
    return (
      <div className="panel p-6 border-ps-breach bg-ps-breach/10 text-ps-breach space-y-3">
        <h2 className="font-bold text-base">Error Loading Case File</h2>
        <p className="text-sm">{error}</p>
        <Link href="/" className="badge badge-focus text-xs px-3 py-1.5 inline-block no-underline">
          &larr; Return to Overview
        </Link>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="panel p-6 text-center text-ps-ink-2 space-y-3">
        <p>Run not found in backend.</p>
        <Link href="/" className="badge badge-focus text-xs px-3 py-1.5 inline-block no-underline">
          &larr; Return to Overview
        </Link>
      </div>
    );
  }

  const isDemo = run.run_config && (run.run_config as Record<string, unknown>).is_demo_fixture;
  const isTerminal = TERMINAL_STATUSES.includes(run.status);
  const familyStatus = computeFamilyStatus(gates, baseline, findings);

  return (
    <div className="space-y-6">
      {/* Top Identity Header */}
      <div className="panel border border-ps-rule bg-ps-sheet space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ps-rule">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-ps-focus hover:underline no-underline font-mono">
                &larr; Overview
              </Link>
              <span className="text-ps-rule">/</span>
              <h1 className="text-lg font-bold font-mono tracking-tight text-ps-ink">
                Run {run.id}
              </h1>
              {isDemo ? (
                <span className="badge badge-hold text-[11px] font-sans font-bold">
                  DEMO FIXTURE (Deterministic Walkthrough)
                </span>
              ) : (
                <span className="badge badge-focus text-[11px] font-sans font-bold">
                  LIVE EXECUTION (Local Sandbox)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ps-ink-2 font-mono mt-1.5">
              <span>Task: <strong className="text-ps-ink">{run.task_id}</strong></span>
              <span>Base: <strong className="text-ps-ink">{run.requested_baseline.slice(0, 8)}</strong></span>
              <span>Backend: <strong className="text-ps-ink">{run.execution_backend || "local"}</strong></span>
              <span>Ledger Head: <strong className="text-ps-ink">{run.ledger_head_hash ? run.ledger_head_hash.slice(0, 10) + "..." : "open"}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`badge text-xs px-3 py-1 font-mono ${
                run.status === "COMPLETED"
                  ? "badge-seated"
                  : run.status === "FAILED" || run.status === "CANCELLED"
                  ? "badge-breach"
                  : "badge-hold animate-pulse"
              }`}
            >
              {run.status}
            </span>

            {run.final_verdict && (
              <span
                className={`badge text-xs px-3 py-1 font-mono font-bold ${
                  run.final_verdict === "ACCEPTED"
                    ? "badge-seated"
                    : run.final_verdict === "REJECTED"
                    ? "badge-breach"
                    : "badge-hold"
                }`}
              >
                {run.final_verdict}
              </span>
            )}

            {!isTerminal && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className="text-xs border border-ps-breach text-ps-breach hover:bg-ps-breach/10 px-2.5 py-1 rounded-sm cursor-pointer font-medium"
              >
                {cancelling ? "Aborting..." : "Abort Run"}
              </button>
            )}
          </div>
        </div>

        {/* Live Stage Progress Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-ps-ink-2">
            <span>Execution Stage: <strong className="text-ps-focus">{run.current_stage}</strong></span>
            <span>
              Updated: {new Date(run.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {[
              "VALIDATING",
              "BASELINING",
              "AUDITING",
              "HYPOTHESIZING",
              "EXPERIMENTING",
              "PATCHING",
              "VERIFYING",
              "FINALIZING",
            ].map((stageName, idx) => {
              const currentStage = run.current_stage;
              const isPastOrCurrent =
                isTerminal ||
                currentStage === "COMPLETED" ||
                currentStage.includes(stageName) ||
                getStageIndex(currentStage) >= idx;
              const isCurrent = currentStage.includes(stageName) && !isTerminal;

              return (
                <div
                  key={stageName}
                  className={`text-center py-1 text-[10px] font-mono rounded-xs border transition-all ${
                    isCurrent
                      ? "bg-ps-focus text-white border-ps-focus font-bold shadow-xs animate-pulse"
                      : isPastOrCurrent
                      ? "bg-ps-seated/15 text-ps-seated border-ps-seated/40 font-semibold"
                      : "bg-ps-paper text-ps-ink-2 border-ps-rule opacity-60"
                  }`}
                  title={`Stage ${idx + 1}: ${stageName}`}
                >
                  <span className="hidden sm:inline">{stageName.slice(0, 4)}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="panel max-w-sm w-full bg-ps-sheet border border-ps-rule shadow-xl space-y-3">
            <h3 className="font-bold text-base text-ps-ink">Abort Active Run?</h3>
            <p className="text-xs text-ps-ink-2">
              Are you sure you want to cancel Run {run.id.slice(0, 8)}? The orchestrator will safely terminate in-flight sandboxes.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-ps-rule">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-xs px-3 py-1.5 border border-ps-rule rounded-sm text-ps-ink-2"
              >
                Keep Running
              </button>
              <button
                onClick={handleCancelRun}
                className="text-xs px-3 py-1.5 rounded-sm bg-ps-breach text-white font-medium hover:opacity-90"
              >
                Yes, Abort Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-ps-rule pb-1 text-xs">
        <button
          onClick={() => setActiveTab("casefile")}
          className={`px-4 py-2 rounded-t-sm font-semibold cursor-pointer transition-colors ${
            activeTab === "casefile"
              ? "bg-ps-sheet border-t-2 border-ps-focus text-ps-ink font-bold"
              : "text-ps-ink-2 hover:text-ps-ink"
          }`}
        >
          Audit Case File (4 Viewports)
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 rounded-t-sm font-semibold cursor-pointer transition-colors ${
            activeTab === "ledger"
              ? "bg-ps-sheet border-t-2 border-ps-focus text-ps-ink font-bold"
              : "text-ps-ink-2 hover:text-ps-ink"
          }`}
        >
          Cryptographic Evidence Ledger ({ledger.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-t-sm font-semibold cursor-pointer transition-colors ${
            activeTab === "reports"
              ? "bg-ps-sheet border-t-2 border-ps-focus text-ps-ink font-bold"
              : "text-ps-ink-2 hover:text-ps-ink"
          }`}
        >
          Audit Reports ({reports.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "casefile" && (
        <div className="space-y-6">
          {/* THE INTERLOCK: 4-Segment Gauge */}
          <Interlock
            families={familyStatus}
            verdict={run.final_verdict}
            blockerReason={run.verdict_reason}
          />

          {/* Canonical Decision Card */}
          {decision && (
            <div className="panel border border-ps-rule bg-ps-sheet space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-ps-rule">
                <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">Canonical Decision Record</span>
                <span className="text-[11px] font-mono text-ps-ink-2">Policy: {decision.policy_version}</span>
              </div>
              <div className="flex items-start justify-between text-xs font-mono">
                <div>
                  <span className="text-ps-ink-2 block">Verdict Explanation:</span>
                  <div className="font-bold text-ps-ink mt-0.5">
                    {decision.reasons?.join("; ") || run.verdict_reason || "All gates satisfied"}
                  </div>
                </div>
                {decision.evidence_manifest_hash && (
                  <div className="text-right">
                    <span className="text-ps-ink-2 block">Manifest Hash:</span>
                    <span className="text-ps-ink text-[11px]">{decision.evidence_manifest_hash.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid of Viewports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Viewport 1: Baseline */}
            <BaselineView baseline={baseline} />

            {/* Viewport 2: Hypotheses & Experiments */}
            <HypothesisView
              hypotheses={hypotheses}
              experiments={experiments}
              onTriggerAnalysis={handleTriggerAnalysis}
              analyzing={analyzing}
            />

            {/* Viewport 3: Patch & Exploit Inspector */}
            <PatchView
              patches={patches}
              findings={findings}
              onTriggerPatchProposal={handleProposePatch}
              proposingPatch={proposingPatch}
            />

            {/* Viewport 4: Gate Table */}
            <GateTable gates={gates} />
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <LedgerChain entries={ledger} runId={runId} />
      )}

      {activeTab === "reports" && (
        <ReportViewer
          runId={runId}
          reports={reports}
          onReportGenerated={loadData}
          runStatus={run.status}
        />
      )}
    </div>
  );
}

function getStageIndex(stage: string): number {
  const STAGES = [
    "VALIDATING",
    "BASELINING",
    "AUDITING",
    "HYPOTHESIZING",
    "EXPERIMENTING",
    "PATCHING",
    "VERIFYING",
    "FINALIZING",
    "COMPLETED",
  ];
  const idx = STAGES.indexOf(stage.replace("_DONE", ""));
  return idx >= 0 ? idx : 0;
}

function computeFamilyStatus(
  gates: Gate[],
  baseline: Baseline[],
  findings: Finding[]
): Record<string, { status: string; caption: string }> {
  const families: Record<string, { status: string; caption: string }> = {
    PERF: { status: "NOT_RUN", caption: "Performance" },
    SEC: { status: "NOT_RUN", caption: "Security" },
    CORR: { status: "NOT_RUN", caption: "Correctness" },
    CONC: { status: "NOT_RUN", caption: "Concurrency" },
  };

  // Inspect Baseline for PERF
  if (baseline.length > 0) {
    const b = baseline[0];
    if (b.stability_assessment === "UNSTABLE") {
      families.PERF = { status: "FAIL", caption: `Unstable (rel_MAD=${b.rel_mad?.toFixed(4)})` };
    }
  }

  // Inspect Findings for SEC
  const exploits = findings.filter((f) => f.found);
  if (exploits.length > 0) {
    families.SEC = { status: "FAIL", caption: `${exploits.length} exploit proven (${exploits[0].probe_id})` };
  }

  // Authoritative Gate results
  for (const gate of gates) {
    if (gate.family in families && gate.required) {
      let cap = families[gate.family].caption;
      if (gate.family === "PERF" && gate.evidence && (gate.evidence as Record<string, unknown>).speedup) {
        cap = `${Number((gate.evidence as Record<string, unknown>).speedup).toFixed(1)}x speedup`;
      } else if (gate.family === "SEC" && gate.status === "FAIL") {
        cap = `${gate.probe_id || "G4"} exploit reproduced`;
      } else if (gate.family === "CORR" && gate.status === "PASS") {
        cap = "Differential equivalence pass";
      } else if (gate.family === "CONC" && gate.status === "NOT_APPLICABLE") {
        cap = "Not applicable (sync)";
      }
      families[gate.family] = { status: gate.status, caption: cap };
    }
  }

  return families;
}
