"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Project, Task } from "@/lib/api";

interface CreateRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
  initialTaskId?: string;
}

export function CreateRunModal({ isOpen, onClose, initialProjectId, initialTaskId }: CreateRunModalProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || "");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || "");
  const [baselineCommit, setBaselineCommit] = useState<string>("HEAD");
  const [candidateCommit, setCandidateCommit] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api
      .listProjects()
      .then((p) => {
        setProjects(p);
        if (p.length > 0 && !selectedProjectId) {
          setSelectedProjectId(p[0].id);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    api
      .listTasks(selectedProjectId)
      .then((t) => {
        setTasks(t);
        if (t.length > 0) {
          const defaultTask = initialTaskId && t.some((item) => item.id === initialTaskId)
            ? t.find((item) => item.id === initialTaskId)!
            : t[0];
          setSelectedTaskId(defaultTask.id);
          setBaselineCommit(defaultTask.baseline_commit || "HEAD");
          setCandidateCommit(defaultTask.candidate_commit || "");
        } else {
          setSelectedTaskId("");
        }
      })
      .catch((e) => setError(e.message));
  }, [selectedProjectId, initialTaskId]);

  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    const chosen = tasks.find((t) => t.id === taskId);
    if (chosen) {
      setBaselineCommit(chosen.baseline_commit || "HEAD");
      setCandidateCommit(chosen.candidate_commit || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setError("Please select a task to execute.");
      return;
    }
    if (!baselineCommit.trim()) {
      setError("Baseline commit or reference is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const run = await api.createRun({
        task_id: selectedTaskId,
        requested_baseline: baselineCommit.trim(),
        requested_candidate: candidateCommit.trim() || undefined,
        run_config: {
          execution_mode: "local_orchestrator",
          provenance: "LIVE_EXECUTION",
        },
      });

      // Automatically dispatch/start the run
      await api.startRun(run.id);

      onClose();
      router.push(`/runs/${run.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to launch run");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="panel max-w-lg w-full bg-ps-sheet shadow-2xl border border-ps-rule rounded-sm">
        <div className="flex items-center justify-between pb-3 border-b border-ps-rule">
          <div>
            <h2 className="text-base font-bold text-ps-ink">Dispatch Verification Run</h2>
            <p className="text-xs text-ps-ink-2">Launches the hardware-isolated verification gauntlet</p>
          </div>
          <button
            onClick={onClose}
            className="text-ps-ink-2 hover:text-ps-ink text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-ps-breach/10 border border-ps-breach/30 text-ps-breach text-xs rounded-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-xs text-ps-ink-2">Loading projects and tasks...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-ps-ink mb-1">Target Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-sm border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper text-ps-ink"
                disabled={submitting}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.repository_path})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ps-ink mb-1">Audit / Benchmark Task</label>
              {tasks.length === 0 ? (
                <div className="text-xs text-ps-ink-2 p-2 border border-dashed border-ps-rule rounded-sm">
                  No tasks found for this project. Please create a task first.
                </div>
              ) : (
                <select
                  value={selectedTaskId}
                  onChange={(e) => handleTaskChange(e.target.value)}
                  className="w-full text-sm border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper text-ps-ink"
                  disabled={submitting}
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} [{t.mode}] — {t.target_file}::{t.target_symbol}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ps-ink mb-1">Baseline Revision</label>
                <input
                  type="text"
                  value={baselineCommit}
                  onChange={(e) => setBaselineCommit(e.target.value)}
                  placeholder="e.g. 3f9c2ab or HEAD"
                  className="w-full text-sm font-mono border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper text-ps-ink"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ps-ink mb-1">Candidate Revision (Opt.)</label>
                <input
                  type="text"
                  value={candidateCommit}
                  onChange={(e) => setCandidateCommit(e.target.value)}
                  placeholder="e.g. c59ca2c (or AI synthesized)"
                  className="w-full text-sm font-mono border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper text-ps-ink"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="bg-ps-paper p-2.5 rounded-sm border border-ps-rule text-xs text-ps-ink-2 space-y-1">
              <div className="font-semibold text-ps-ink">Execution Guarantees:</div>
              <div>• Baseline stability enforced (rel_MAD &le; threshold)</div>
              <div>• Zero-Compromise Interlock (Perf, Sec, Corr, Conc)</div>
              <div>• Append-only SHA-256 evidence ledger chain</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ps-rule">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-xs px-3 py-1.5 border border-ps-rule rounded-sm text-ps-ink-2 hover:bg-ps-paper"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedTaskId}
                className="badge badge-focus text-xs px-4 py-2 disabled:opacity-50 font-medium"
              >
                {submitting ? "Launching Run..." : "🚀 Launch Verification Run"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
