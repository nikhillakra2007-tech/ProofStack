/**
 * ProofStack / Sentinel Gate Centralized Typed API Client
 * Connects frontend views to backend FastAPI endpoints with full authentication,
 * error handling, and response typing.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8765";

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: "developer" | "auditor" | "admin" | "super_admin";
  tenant_id: string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
  role: "developer" | "auditor" | "admin" | "super_admin";
  tenant_id: string;
  can_override_policy: boolean;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  repository_path: string;
  default_branch: string;
  allowed_paths: string[];
  policy_config: Record<string, any>;
  budget_config: Record<string, any>;
  version: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskResponse {
  id: string;
  project_id: string;
  name: string;
  description: string;
  target_file: string;
  target_symbol: string;
  target_kind: string;
  baseline_commit: string;
  candidate_commit?: string;
  mode: string;
  version: number;
  created_at?: string;
}

export interface RunResponse {
  id: string;
  task_id: string;
  status: string;
  requested_baseline: string;
  requested_candidate?: string;
  current_stage: string;
  final_verdict?: string;
  verdict_reason?: string;
  started_at?: string;
  completed_at?: string;
  version: number;
}

export interface LedgerEntryResponse {
  sequence_number: number;
  event_type: string;
  timestamp: string;
  entry_hash: string;
  previous_hash: string;
  payload: Record<string, any>;
}

export interface LedgerVerifyResponse {
  valid: boolean;
  head_hash?: string;
  reason?: string;
  entry_count: number;
}

export interface GlobalLedgerVerifyResponse {
  verified: boolean;
  totalBlocks: number;
  runsVerified?: number;
  headHash: string;
  status: string;
  hashAlgorithm: string;
  zeroCompromiseCompliant: boolean;
  failureReason?: string;
}

export interface DastTargetResponse {
  id: string;
  targetId: string;
  targetUrl: string;
  repoPath: string;
  scanProfile: string;
  ownershipStatus: string;
  verificationToken: string;
  tenantId: string;
  createdAt?: string;
}

export interface DastScanResponse {
  scanId: string;
  targetUrl: string;
  ownershipStatus: string;
  checksExecuted: number;
  findings: Array<{
    checkId: string;
    title: string;
    severity: string;
    status: string;
    evidenceSummary: string;
    sourceFile: string;
  }>;
}

export interface ModelStatusResponse {
  provider: string;
  configured: boolean;
  active_model_diagnosis: string;
  active_model_patch: string;
  base_url: string;
  api_key_configured: boolean;
  api_key_preview?: string;
  project_id_configured: boolean;
  fallback_available: boolean;
  supported_providers: string[];
}

export interface RunCodeResponse {
  success: boolean;
  runId: string;
  exitCode: number;
  executionTimeMs: number;
  memoryDeltaMb: number;
  isolationLevel: string;
  logs: string[];
}

export interface AuditCodeResponse {
  verdict: "ACCEPT" | "REJECT";
  gates: Array<{
    gateId: string;
    name: string;
    status: "PASS" | "FAIL";
    description: string;
    details: string;
  }>;
  detectedFlaws: string[];
  metrics: {
    sqlQueryCount: number;
    latencyMs: number;
    scalingExponent: number;
    memoryDeltaMb: number;
    tauNoise: number;
  };
}

export interface HealCodeResponse {
  model: string;
  hypothesis: {
    id: string;
    claim: string;
    confidence: number;
    computedSupport: number;
    experimentKind: string;
  };
  originalCode: string;
  patchedCode: string;
  explanation: string;
  gatePreview: string;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sentinel_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.token || null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Send and receive HttpOnly cookies
  };

  let res: Response;
  try {
    res = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(0, `Network connection to Sentinel backend failed: ${err.message}`);
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    let data: any = null;
    try {
      data = await res.json();
      detail = data.detail || data.message || detail;
    } catch {
      // Body not JSON
    }
    throw new ApiError(res.status, detail, data);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<{ success: boolean; message: string }>("/api/auth/logout", {
        method: "POST",
      }),
    me: () => request<UserResponse>("/api/auth/me"),
  },

  // Health
  health: {
    check: () => request<{ status: string; version: string }>("/api/health"),
    ready: () => request<{ ready: boolean; database: string }>("/api/ready"),
  },

  // Projects
  projects: {
    list: () => request<ProjectResponse[]>("/api/projects"),
    get: (id: string) => request<ProjectResponse>(`/api/projects/${id}`),
    create: (data: Partial<ProjectResponse>) =>
      request<ProjectResponse>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Tasks
  tasks: {
    list: (projectId?: string) =>
      request<TaskResponse[]>(projectId ? `/api/tasks?project_id=${projectId}` : "/api/tasks"),
    get: (id: string) => request<TaskResponse>(`/api/tasks/${id}`),
    create: (data: any) =>
      request<TaskResponse>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Runs
  runs: {
    list: (taskId?: string) =>
      request<RunResponse[]>(taskId ? `/api/runs?task_id=${taskId}` : "/api/runs"),
    get: (id: string) => request<any>(`/api/runs/${id}`),
    create: (data: { task_id: string; requested_baseline: string; requested_candidate?: string }) =>
      request<RunResponse>("/api/runs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    start: (id: string) =>
      request<{ run_id: string; status: string; message: string }>(`/api/runs/${id}/start`, {
        method: "POST",
      }),
    cancel: (id: string) =>
      request<{ run_id: string; status: string }>(`/api/runs/${id}/cancel`, {
        method: "POST",
      }),
    getLedger: (id: string) => request<LedgerEntryResponse[]>(`/api/runs/${id}/ledger`),
    verifyLedger: (id: string) => request<LedgerVerifyResponse>(`/api/runs/${id}/ledger/verify`, { method: "POST" }),
    getGates: (id: string) => request<any[]>(`/api/runs/${id}/gates`),
    getFindings: (id: string) => request<any[]>(`/api/runs/${id}/findings`),
    getPatches: (id: string) => request<any[]>(`/api/runs/${id}/patches`),
  },

  // Ledger Verification
  ledger: {
    verifyGlobal: () => request<GlobalLedgerVerifyResponse>("/api/ledger/verify"),
  },

  // DAST Scanner
  dast: {
    listTargets: () => request<DastTargetResponse[]>("/api/dast/targets"),
    registerTarget: (targetUrl: string, repoPath?: string, scanProfile?: string) =>
      request<{ success: boolean; targetId: string; target: any; message: string }>("/api/dast/targets", {
        method: "POST",
        body: JSON.stringify({ targetUrl, repoPath, scanProfile }),
      }),
    triggerScan: (
      targetOrPayload: string | { targetUrl: string; scanProfile?: string },
      maybeProfile?: string
    ) => {
      const payload =
        typeof targetOrPayload === "string"
          ? { targetUrl: targetOrPayload, scanProfile: maybeProfile }
          : targetOrPayload;
      return request<DastScanResponse>("/api/dast/scans", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  // Studio & Code Tools
  studio: {
    runCode: (code: string, language: string = "python", problemId?: string) =>
      request<RunCodeResponse>("/api/run", {
        method: "POST",
        body: JSON.stringify({ code, language, problemId }),
      }),
    auditCode: (code: string, problemId?: string) =>
      request<AuditCodeResponse>("/api/audit", {
        method: "POST",
        body: JSON.stringify({ code, problemId }),
      }),
    healCode: (code: string, problemId?: string) =>
      request<HealCodeResponse>("/api/heal", {
        method: "POST",
        body: JSON.stringify({ code, problemId }),
      }),
  },

  // Model & AI Service
  model: {
    getStatus: () => request<ModelStatusResponse>("/api/model/status"),
  },

  // Demo Fixture
  demo: {
    seed: (force: boolean = false) =>
      request<any>(`/api/demo/seed?force=${force}`, { method: "POST" }),
    reset: () => request<any>("/api/demo/reset", { method: "POST" }),
    status: () => request<{ seeded: boolean; demo_run_id: string | null }>("/api/demo/status"),
  },
};

export default api;
