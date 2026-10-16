"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api, Run, Gate, Baseline, Finding, LedgerEntry, subscribeToEvents } from "@/lib/api";
import { Interlock } from "@/components/Interlock";
import { GateTable } from "@/components/GateTable";
import { LedgerChain } from "@/components/LedgerChain";
import { BaselineView } from "@/components/BaselineView";
import { HypothesisView } from "@/components/HypothesisView";

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.runId as string;

  const [run, setRun] = useState<Run | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [baseline, setBaseline] = useState<Baseline[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [hypotheses, setHypotheses] = useState<Array<{ id: string; hypothesis_id: string; category: string; statement: string; validation_status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [runData, gatesData, baselineData, findingsData, ledgerData, hypData] = await Promise.all([
        api.getRun(runId),
        api.getGates(runId),
        api.getBaseline(runId),
        api.getFindings(runId),
        api.getLedger(runId),
        api.getHypotheses(runId),
      ]);
      setRun(runData);
      setGates(gatesData);
      setBaseline(baselineData);
      setFindings(findingsData);
      setLedger(ledgerData);
      setHypotheses(hypData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load run");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = subscribeToEvents(
      runId,
      (event) => {
        if (event.type === "gate.finished" || event.type === "verdict.final" || event.type === "baseline.complete") {
          loadData();
        }
      },
      () => {}
    );
    return unsubscribe;
  }, [runId, loadData]);

  if (loading) return <div className="panel m-4">Loading run...</div>;
  if (error) return <div className="panel m-4 text-ps-breach">Error: {error}</div>;
  if (!run) return <div className="panel m-4">Run not found</div>;

  const familyStatus = computeFamilyStatus(gates);

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Run {run.id.slice(0, 8)}</h1>
          <p className="text-ps-ink-2 text-sm">{run.current_stage} | {run.execution_backend || "unknown backend"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${run.status === "COMPLETED" ? "badge-seated" : "badge-hold"}`}>
            {run.status}
          </span>
          {run.final_verdict && (
            <span className={`badge ${
              run.final_verdict === "ACCEPTED" ? "badge-seated" :
              run.final_verdict === "REJECTED" ? "badge-breach" : "badge-hold"
            }`}>
              {run.final_verdict}
            </span>
          )}
        </div>
      </header>

      <Interlock families={familyStatus} verdict={run.final_verdict} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaselineView baseline={baseline} />
        <HypothesisView hypotheses={hypotheses} />
        <GateTable gates={gates} />
        <LedgerChain entries={ledger} runId={runId} />
      </div>

      {findings.length > 0 && (
        <div className="panel">
          <h2 className="text-lg font-semibold mb-2">Findings</h2>
          <div className="space-y-1">
            {findings.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-sm">
                <span className={`glyph ${f.found ? "glyph-breach" : "glyph-seated"}`} />
                <span className="font-mono">{f.probe_id}</span>
                <span className={f.found ? "text-ps-breach" : "text-ps-seated"}>
                  {f.found ? "EXPLOIT_PROVEN" : "NOT_REPRODUCED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {run.verdict_reason && (
        <div className="panel">
          <h2 className="text-lg font-semibold mb-1">Verdict Reason</h2>
          <p className="text-ps-ink-2">{run.verdict_reason}</p>
        </div>
      )}
    </div>
  );
}

function computeFamilyStatus(gates: Gate[]): Record<string, { status: string; caption: string }> {
  const families: Record<string, { status: string; caption: string }> = {
    PERF: { status: "NOT_RUN", caption: "Performance" },
    SEC: { status: "NOT_RUN", caption: "Security" },
    CORR: { status: "NOT_RUN", caption: "Correctness" },
    CONC: { status: "NOT_RUN", caption: "Concurrency" },
  };
  for (const gate of gates) {
    if (gate.family in families && gate.required) {
      families[gate.family] = { status: gate.status, caption: families[gate.family].caption };
    }
  }
  return families;
}
