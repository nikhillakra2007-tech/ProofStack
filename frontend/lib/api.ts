"use client";

const API_BASE = "/api";

export interface Project {
  id: string;
  name: string;
  description: string;
  repository_path: string;
  default_branch: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  mode: string;
  target_file: string;
  target_symbol: string;
  baseline_commit: string;
  created_at: string;
}

export interface Run {
  id: string;
  task_id: string;
  status: string;
  requested_baseline: string;
  requested_candidate: string | null;
  current_stage: string;
  execution_backend: string | null;
  started_at: string | null;
  updated_at: string;
  completed_at: string | null;
  final_verdict: string | null;
  verdict_reason: string | null;
  error_classification: string | null;
  ledger_head_hash: string | null;
}

export interface Baseline {
  id: string;
  run_id: string;
  source_revision: string;
  sample_count: number;
  median_ns: number | null;
  rel_mad: number | null;
  stability_assessment: string | null;
  execution_backend: string | null;
}

export interface Gate {
  id: string;
  run_id: string;
  gate_id: string;
  family: string;
  status: string;
  required: boolean;
  probe_id: string | null;
}

export interface Finding {
  id: string;
  run_id: string;
  probe_id: string;
  found: boolean;
  status: string;
  families: string[];
}

export interface LedgerEntry {
  sequence_number: number;
  event_type: string;
  timestamp: string;
  entry_hash: string;
  previous_hash: string;
  payload: Record<string, unknown>;
}

export interface Artifact {
  id: string;
  run_id: string;
  artifact_type: string;
  storage_key: string;
  original_filename: string | null;
  media_type: string | null;
  size_bytes: number;
  sha256: string | null;
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  listProjects: () => fetchJSON<Project[]>("/projects"),
  createProject: (data: Partial<Project>) =>
    fetchJSON<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  getProject: (id: string) => fetchJSON<Project>(`/projects/${id}`),
  updateProject: (id: string, data: Partial<Project>) =>
    fetchJSON<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  listTasks: (projectId?: string) =>
    fetchJSON<Task[]>(`/tasks${projectId ? `?project_id=${projectId}` : ""}`),
  createTask: (data: Record<string, unknown>) =>
    fetchJSON<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  getTask: (id: string) => fetchJSON<Task>(`/tasks/${id}`),
  validateTask: (id: string) => fetchJSON<{ valid: boolean; errors: string[] }>(`/tasks/${id}/validate`),

  listRuns: (params?: { task_id?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.task_id) qs.set("task_id", params.task_id);
    if (params?.status) qs.set("status", params.status);
    return fetchJSON<Run[]>(`/runs?${qs}`);
  },
  createRun: (data: { task_id: string; requested_baseline: string }) =>
    fetchJSON<Run>("/runs", { method: "POST", body: JSON.stringify(data) }),
  getRun: (id: string) => fetchJSON<Run>(`/runs/${id}`),
  startRun: (id: string) =>
    fetchJSON<{ run_id: string; status: string }>(`/runs/${id}/start`, { method: "POST" }),
  cancelRun: (id: string) =>
    fetchJSON<{ run_id: string; status: string }>(`/runs/${id}/cancel`, { method: "POST" }),
  getRunStatus: (id: string) => fetchJSON<Run>(`/runs/${id}/status`),
  getRunTimeline: (id: string) => fetchJSON<Array<{ sequence_number: number; event_type: string; payload: Record<string, unknown> }>>(`/runs/${id}/timeline`),

  getBaseline: (runId: string) => fetchJSON<Baseline[]>(`/runs/${runId}/baseline`),
  getHypotheses: (runId: string) => fetchJSON<Array<{ id: string; hypothesis_id: string; category: string; statement: string; validation_status: string }>>(`/runs/${runId}/hypotheses`),
  getExperiments: (runId: string) => fetchJSON<Array<{ id: string; experiment_id: string; experiment_type: string; result_status: string | null }>>(`/runs/${runId}/experiments`),
  getPatches: (runId: string) => fetchJSON<Array<{ id: string; cycle_number: number; validation_status: string | null }>>(`/runs/${runId}/patches`),
  getGates: (runId: string) => fetchJSON<Gate[]>(`/runs/${runId}/gates`),
  getFindings: (runId: string) => fetchJSON<Finding[]>(`/runs/${runId}/findings`),
  getLedger: (runId: string) => fetchJSON<LedgerEntry[]>(`/runs/${runId}/ledger`),
  verifyLedger: (runId: string) =>
    fetchJSON<{ valid: boolean; head_hash: string | null; reason: string | null; entry_count: number }>(
      `/runs/${runId}/ledger/verify`,
      { method: "POST" }
    ),
  listArtifacts: (runId: string) => fetchJSON<Artifact[]>(`/runs/${runId}/artifacts`),
};

export function subscribeToEvents(
  runId: string,
  onEvent: (event: { type: string; data: Record<string, unknown>; seq: number }) => void,
  onError?: (err: Error) => void
): () => void {
  const es = new EventSource(`/api/runs/${runId}/events`);
  es.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data);
      onEvent({ type: event.type, data: event.data, seq: event.seq });
    } catch {}
  };
  es.onerror = (e) => {
    if (onError) onError(new Error("SSE error"));
  };
  return () => es.close();
}
