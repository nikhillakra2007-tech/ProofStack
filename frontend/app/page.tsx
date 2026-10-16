"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, Run } from "@/lib/api";
import { CreateRunModal } from "@/components/CreateRunModal";

export default function OperationalOverviewPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listRuns({ per_page: 50 });
      setRuns(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load runs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  const handleSeedDemo = async () => {
    setSeedingDemo(true);
    setDemoMessage(null);
    try {
      const res = await api.seedDemo(true);
      setDemoMessage(`Demo fixture loaded: ${res.run_id}`);
      await loadRuns();
    } catch (err: unknown) {
      setDemoMessage(err instanceof Error ? err.message : "Failed to seed demo");
    } finally {
      setSeedingDemo(false);
    }
  };

  // Compute operational stats
  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === "COMPLETED").length;
  const failedRuns = runs.filter((r) => r.status === "FAILED").length;
  const cancelledRuns = runs.filter((r) => r.status === "CANCELLED").length;
  const acceptedVerdicts = runs.filter((r) => r.final_verdict === "ACCEPTED").length;
  const rejectedVerdicts = runs.filter((r) => r.final_verdict === "REJECTED").length;
  const inconclusiveVerdicts = runs.filter((r) => r.final_verdict === "INCONCLUSIVE").length;

  const filteredRuns = runs.filter((r) => {
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus || r.final_verdict === filterStatus;
    const matchesSearch =
      !searchQuery ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.verdict_reason && r.verdict_reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ps-rule">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ps-ink">Forensic Verification Operations</h1>
          <p className="text-sm text-ps-ink-2">
            Deterministic code decides; empirical evidence is hashed and committed to the append-only ledger
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDemo}
            disabled={seedingDemo}
            className="text-xs px-3 py-2 border border-ps-rule rounded-sm bg-ps-sheet hover:bg-ps-paper text-ps-ink cursor-pointer font-medium"
            title="Seed Path B: Deterministic Walkthrough of IDOR cache patch"
          >
            {seedingDemo ? "Seeding Demo..." : "⚡ Seed Demo Fixture"}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="badge badge-focus text-xs px-4 py-2 cursor-pointer font-medium shadow-xs"
          >
            + Dispatch Live Run
          </button>
        </div>
      </div>

      {demoMessage && (
        <div className="p-2.5 rounded-sm bg-ps-seated/10 border border-ps-seated/30 text-ps-seated text-xs flex items-center justify-between">
          <span>{demoMessage}</span>
          <button onClick={() => setDemoMessage(null)} className="text-ps-seated font-bold ml-2">✕</button>
        </div>
      )}

      {error && (
        <div className="panel p-3 bg-ps-breach/10 border border-ps-breach/30 text-ps-breach text-sm rounded-sm">
          Failed to connect to backend: {error}
        </div>
      )}

      {/* Operational Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Total Runs</div>
          <div className="text-2xl font-bold font-mono text-ps-ink mt-1">{totalRuns}</div>
        </div>
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Completed</div>
          <div className="text-2xl font-bold font-mono text-ps-seated mt-1">{completedRuns}</div>
        </div>
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Accepted</div>
          <div className="text-2xl font-bold font-mono text-ps-seated mt-1">{acceptedVerdicts}</div>
        </div>
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Rejected (Breach)</div>
          <div className="text-2xl font-bold font-mono text-ps-breach mt-1">{rejectedVerdicts}</div>
        </div>
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Inconclusive</div>
          <div className="text-2xl font-bold font-mono text-ps-hold mt-1">{inconclusiveVerdicts}</div>
        </div>
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Failed Pipeline</div>
          <div className="text-2xl font-bold font-mono text-ps-breach mt-1">{failedRuns}</div>
        </div>
        <div className="panel p-3 border border-ps-rule">
          <div className="text-xs text-ps-ink-2 font-semibold">Cancelled</div>
          <div className="text-2xl font-bold font-mono text-ps-notrun mt-1">{cancelledRuns}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {["ALL", "COMPLETED", "ACCEPTED", "REJECTED", "INCONCLUSIVE", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-sm border cursor-pointer font-medium transition-colors ${
                filterStatus === st
                  ? "bg-ps-focus text-white border-ps-focus"
                  : "bg-ps-sheet border-ps-rule text-ps-ink hover:bg-ps-paper"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search run ID, task, or verdict..."
            className="w-full text-xs border border-ps-rule rounded-sm px-3 py-1.5 bg-ps-sheet text-ps-ink"
          />
        </div>
      </div>

      {/* Run List Table */}
      {loading ? (
        <div className="panel py-12 text-center text-sm text-ps-ink-2">Loading verification runs...</div>
      ) : runs.length === 0 ? (
        /* First Run Onboarding Experience */
        <div className="panel p-8 text-center border-2 border-dashed border-ps-rule space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-ps-ink">Welcome to ProofStack</h2>
            <p className="text-xs text-ps-ink-2">
              No verification runs recorded in this database yet. You can launch a live execution or explore the pre-packaged IDOR showcase.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleSeedDemo}
              disabled={seedingDemo}
              className="badge badge-focus px-4 py-2 text-xs cursor-pointer font-medium"
            >
              ⚡ Load Deterministic IDOR Fixture (Path B)
            </button>
            <Link
              href="/projects"
              className="text-xs px-4 py-2 border border-ps-rule rounded-sm text-ps-ink bg-ps-sheet hover:bg-ps-paper no-underline font-medium"
            >
              Configure Tasks & Projects (Path A)
            </Link>
          </div>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="panel py-8 text-center text-sm text-ps-ink-2">
          No runs matched filter &quot;{filterStatus}&quot; {searchQuery ? `and query "${searchQuery}"` : ""}.
        </div>
      ) : (
        <div className="panel p-0 overflow-hidden border border-ps-rule">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ps-paper border-b border-ps-rule text-ps-ink-2 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Run ID & Provenance</th>
                  <th className="py-2.5 px-4">Task & Mode</th>
                  <th className="py-2.5 px-4">Stage</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Canonical Verdict</th>
                  <th className="py-2.5 px-4">Ledger Head</th>
                  <th className="py-2.5 px-4">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ps-rule">
                {filteredRuns.map((run) => {
                  const isDemo = run.run_config && (run.run_config as Record<string, unknown>).is_demo_fixture;
                  return (
                    <tr
                      key={run.id}
                      className="hover:bg-ps-paper/60 transition-colors cursor-pointer group"
                      onClick={() => (window.location.href = `/runs/${run.id}`)}
                    >
                      <td className="py-3 px-4 font-mono">
                        <Link
                          href={`/runs/${run.id}`}
                          className="font-bold text-ps-focus group-hover:underline no-underline block"
                        >
                          {run.id.slice(0, 13)}
                        </Link>
                        {isDemo ? (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded border border-ps-hold bg-ps-hold/10 text-ps-hold font-sans font-medium">
                            FIXTURE
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded border border-ps-rule bg-ps-paper text-ps-ink-2 font-sans font-medium">
                            LIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ps-ink truncate max-w-[180px]">
                          {run.task_id}
                        </div>
                        <div className="text-ps-ink-2 font-mono text-[11px]">
                          base: {run.requested_baseline.slice(0, 7)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-ps-ink">
                        <span className="px-1.5 py-0.5 rounded bg-ps-paper border border-ps-rule">
                          {run.current_stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            run.status === "COMPLETED"
                              ? "badge-seated"
                              : run.status === "FAILED" || run.status === "CANCELLED"
                              ? "badge-breach"
                              : "badge-hold"
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {run.final_verdict ? (
                          <div>
                            <span
                              className={`badge ${
                                run.final_verdict === "ACCEPTED"
                                  ? "badge-seated"
                                  : run.final_verdict === "REJECTED"
                                  ? "badge-breach"
                                  : "badge-hold"
                              }`}
                            >
                              {run.final_verdict}
                            </span>
                            {run.verdict_reason && (
                              <div className="text-[11px] text-ps-ink-2 truncate max-w-[220px] mt-0.5" title={run.verdict_reason}>
                                {run.verdict_reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-ps-ink-2 text-xs italic">Pending...</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-ps-ink-2">
                        {run.ledger_head_hash ? (
                          <span title={run.ledger_head_hash}>
                            {run.ledger_head_hash.slice(0, 10)}...
                          </span>
                        ) : (
                          <span className="text-ps-ink-2 italic">open</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ps-ink-2 font-mono text-[11px]">
                        {new Date(run.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatch Run Modal */}
      <CreateRunModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          loadRuns();
        }}
      />
    </div>
  );
}
