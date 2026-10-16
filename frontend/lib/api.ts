"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_KEY || "change-me-in-production";

export function getApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("proofstack_api_key") || DEFAULT_API_KEY;
  }
  return DEFAULT_API_KEY;
}

export function setApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("proofstack_api_key", key);
  }
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository_path: string;
  default_branch: string;
  version: number;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  mode: string;
  target_file: string;
  target_symbol: string;
  target_kind: string;
  baseline_commit: string;
  candidate_commit?: string | null;
  benchmark_command: string[];
  workload_seed: number;
  warmups: number;
  samples: number;
  tau_noise: number;
  regression_budget: number;
  noise_max_rel_mad: number;
  test_command: string[];
  protected_paths: string[];
  sandbox_backend: string;
  require_backend: string;
  version: number;
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
  version: number;
  run_config?: Record<string, unknown>;
  environment_fingerprint?: Record<string, unknown>;
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
  evidence?: Record<string, unknown>;
  failure_reason?: string | null;
}

export interface Finding {
  id: string;
  run_id: string;
  probe_id: string;
  found: boolean;
  status: string;
  families: string[];
  metrics?: Record<string, unknown>;
  evidence?: Record<string, unknown>;
  fingerprint?: string | null;
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
  created_at: string;
}

export interface Decision {
  id: string;
  run_id: string;
  verdict: string;
  policy_version: string;
  profile_version: string;
  reasons: string[];
  family_summary: Record<string, string>;
  gate_results: Array<{ gate_id: string; family: string; status: string; [key: string]: unknown }>;
  waiver_ids: string[];
  budget_usage: Record<string, unknown>;
  evidence_manifest_hash?: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  run_id: string;
  report_type: string;
  format: string;
  schema_version: string;
  content: string | null;
  content_json: Record<string, unknown> | null;
  decision_id: string | null;
  generated_at: string;
  deterministic_hash: string | null;
}

export interface DemoSeedResult {
  status: string;
  project_id: string;
  task_id: string;
  run_id: string;
  verdict: string;
  provenance: string;
  entry_count: number;
  message: string;
}

export interface DemoStatusResult {
  seeded: boolean;
  demo_run_id: string | null;
  demo_project_id: string | null;
  demo_task_id: string | null;
}

export interface ServiceHealth {
  status: string;
  version: string;
}

export interface ServiceReady {
  ready: boolean;
  database: string;
}

export class ApiError extends Error {
  statusCode: number;
  detail: string;
  isConflict: boolean;
  isAuth: boolean;
  isNotFound: boolean;

  constructor(statusCode: number, detail: string) {
    super(detail || `HTTP ${statusCode}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.detail = detail;
    this.isConflict = statusCode === 409;
    this.isAuth = statusCode === 401 || statusCode === 403;
    this.isNotFound = statusCode === 404;
  }
}

async function fetchJSON<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const apiKey = getApiKey();
  if (apiKey) {
    headers.set("X-API-Key", apiKey);
  }
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.detail || body.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => `HTTP ${res.status}`);
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // System Health
  getHealth: () => fetchJSON<ServiceHealth>("/health"),
  getReady: () => fetchJSON<ServiceReady>("/ready"),

  // Projects
  listProjects: () => fetchJSON<Project[]>("/projects"),
  createProject: (data: { name: string; description?: string; repository_path: string; default_branch?: string }) =>
    fetchJSON<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  getProject: (id: string) => fetchJSON<Project>(`/projects/${id}`),
  updateProject: (id: string, data: Partial<Project> & { expected_version?: number }) =>
    fetchJSON<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Tasks
  listTasks: (projectId?: string) =>
    fetchJSON<Task[]>(`/tasks${projectId ? `?project_id=${projectId}` : ""}`),
  createTask: (data: Record<string, unknown>) =>
    fetchJSON<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  getTask: (id: string) => fetchJSON<Task>(`/tasks/${id}`),
  updateTask: (id: string, data: Record<string, unknown> & { expected_version?: number }) =>
    fetchJSON<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  validateTask: (id: string) => fetchJSON<{ valid: boolean; errors: string[] }>(`/tasks/${id}/validate`, { method: "POST" }),

  // Runs
  listRuns: (params?: { task_id?: string; status?: string; page?: number; per_page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.task_id) qs.set("task_id", params.task_id);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    return fetchJSON<Run[]>(`/runs?${qs}`);
  },
  createRun: (data: { task_id: string; requested_baseline: string; requested_candidate?: string; run_config?: Record<string, unknown> }) =>
    fetchJSON<Run>("/runs", { method: "POST", body: JSON.stringify(data) }),
  getRun: (id: string) => fetchJSON<Run>(`/runs/${id}`),
  startRun: (id: string) =>
    fetchJSON<{ run_id: string; status: string; message?: string }>(`/runs/${id}/start`, { method: "POST" }),
  cancelRun: (id: string) =>
    fetchJSON<{ run_id: string; status: string }>(`/runs/${id}/cancel`, { method: "POST" }),
  getRunStatus: (id: string) => fetchJSON<Run>(`/runs/${id}/status`),
  getRunTimeline: (id: string) =>
    fetchJSON<Array<{ sequence_number: number; event_type: string; payload: Record<string, unknown> }>>(`/runs/${id}/timeline`),

  // Evidence & Gates
  getBaseline: (runId: string) => fetchJSON<Baseline[]>(`/runs/${runId}/baseline`),
  getHypotheses: (runId: string) =>
    fetchJSON<Array<{ id: string; hypothesis_id: string; category: string; statement: string; validation_status: string }>>(`/runs/${runId}/hypotheses`),
  getExperiments: (runId: string) =>
    fetchJSON<Array<{ id: string; experiment_id: string; experiment_type: string; result_status: string | null; actual_observations?: Record<string, unknown> }>>(`/runs/${runId}/experiments`),
  getPatches: (runId: string) =>
    fetchJSON<Array<{ id: string; cycle_number: number; validation_status: string | null; diff_text?: string; line_count: number }>>(`/runs/${runId}/patches`),
  getGates: (runId: string) => fetchJSON<Gate[]>(`/runs/${runId}/gates`),
  getFindings: (runId: string) => fetchJSON<Finding[]>(`/runs/${runId}/findings`),
  getDecision: (runId: string) => fetchJSON<Decision>(`/runs/${runId}/decision`),

  // Cryptographic Ledger
  getLedger: (runId: string) => fetchJSON<LedgerEntry[]>(`/runs/${runId}/ledger`),
  verifyLedger: (runId: string) =>
    fetchJSON<{ valid: boolean; head_hash: string | null; reason: string | null; entry_count: number }>(
      `/runs/${runId}/ledger/verify`,
      { method: "POST" }
    ),

  // Artifacts
  listArtifacts: (runId: string) => fetchJSON<Artifact[]>(`/runs/${runId}/artifacts`),

  // Reports
  createReport: (runId: string, format: "markdown" | "json" = "markdown", schemaVersion: string = "1.0") =>
    fetchJSON<Report>(`/runs/${runId}/reports`, {
      method: "POST",
      body: JSON.stringify({ report_format: format, schema_version: schemaVersion }),
    }),
  listReports: (runId: string) => fetchJSON<Report[]>(`/runs/${runId}/reports`),
  getReport: (runId: string, reportId: string) => fetchJSON<Report>(`/runs/${runId}/reports/${reportId}`),

  // Demo Fixture Service (Deterministic Path B)
  seedDemo: (force: boolean = false) =>
    fetchJSON<DemoSeedResult>(`/demo/seed?force=${force}`, { method: "POST" }),
  resetDemo: () => fetchJSON<{ status: string; message: string }>("/demo/reset", { method: "POST" }),
  getDemoStatus: () => fetchJSON<DemoStatusResult>("/demo/status"),
};

export function subscribeToEvents(
  runId: string,
  onEvent: (event: { type: string; data?: Record<string, unknown>; seq?: number }) => void,
  onError?: (err: Error) => void
): () => void {
  // Check if browser environment supports EventSource
  if (typeof window === "undefined" || !window.EventSource) {
    return () => {};
  }

  const es = new EventSource(`${API_BASE}/runs/${runId}/events`);
  es.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data);
      onEvent(event);
    } catch {}
  };
  es.onerror = () => {
    if (onError) onError(new Error("SSE connection interrupted"));
  };
  return () => es.close();
}
