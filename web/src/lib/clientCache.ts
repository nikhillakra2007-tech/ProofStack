import { CatalogProblem, UserRole } from "./types";
import { MOCK_CATALOG } from "./mockData";
import { INITIAL_LEDGER_BLOCKS, INITIAL_AUDIT_QUEUE } from "./ledgerStore";
import { ROLES, TEAM_MEMBERS } from "./roles";

export interface BenchmarkTaskCacheItem {
  id: string;
  problemId: string;
  title: string;
  filename: string;
  target: string;
  cwe: string;
  speedupDelta: string;
  latencyBefore: string;
  latencyAfter: string;
  status: string;
  codeSnippet: string;
  hardenedSnippet: string;
  gatesPassed: string;
  telemetry: Record<string, any>;
}

export const CACHED_BENCHMARK_TASKS: Record<string, BenchmarkTaskCacheItem> = {
  TASK9142: {
    id: "TASK9142",
    problemId: "T1-2",
    title: "N+1 Query Explosion & SQL-Injection Trap in orders.py",
    filename: "orders.py",
    target: "orders.py:get_orders",
    cwe: "CWE-89 / CWE-639",
    speedupDelta: "+74.2%",
    latencyBefore: "428ms",
    latencyAfter: "12ms",
    status: "Audit Pending",
    gatesPassed: "8/8 Gates PASS",
    codeSnippet: `def get_orders(session, limit: int = 50):\n    # VULNERABLE: Direct query causing N+1 customer lookups\n    return session.query(Order).limit(limit).all()`,
    hardenedSnippet: `from sqlalchemy.orm import joinedload\ndef get_orders(session, limit: int = 50):\n    # HARDENED: Eager join customer relationship\n    return session.query(Order).options(joinedload(Order.customer)).limit(limit).all()`,
    telemetry: {
      median_baseline_s: 0.428,
      median_candidate_s: 0.012,
      sql_queries_baseline: 5001,
      sql_queries_candidate: 1,
      memory_peak_mb: 28.4,
    },
  },
  TASK9143: {
    id: "TASK9143",
    problemId: "T1-1",
    title: "Catastrophic Regex Backtracking (ReDoS) in auth/validators.py",
    filename: "validators.py",
    target: "auth/validators.py:validate_email",
    cwe: "CWE-1333",
    speedupDelta: "+98.4%",
    latencyBefore: "3200ms",
    latencyAfter: "2ms",
    status: "Completed",
    gatesPassed: "8/8 Gates PASS",
    codeSnippet: `import re\ndef validate_email(email: str):\n    return bool(re.match(r"^([a-zA-Z0-9_.-]+)+@([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$", email))`,
    hardenedSnippet: `import re\nSAFE_EMAIL = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$")\ndef validate_email(email: str):\n    if len(email) > 254: return False\n    return bool(SAFE_EMAIL.match(email))`,
    telemetry: {
      median_baseline_s: 3.200,
      median_candidate_s: 0.002,
      redos_safe: true,
      memory_peak_mb: 12.1,
    },
  },
  TASK771B: {
    id: "TASK771B",
    problemId: "T1-3",
    title: "Multi-Tenant Cache IDOR Boundary in cache/store.py",
    filename: "cache/store.py",
    target: "cache/store.py:get_cached_session",
    cwe: "CWE-639",
    speedupDelta: "Tenant Isolation Lock",
    latencyBefore: "44ms",
    latencyAfter: "4ms",
    status: "In Progress",
    gatesPassed: "8/8 Gates PASS",
    codeSnippet: `def get_cached_session(cache_key: str):\n    return redis.get(f"session:{cache_key}")`,
    hardenedSnippet: `def get_cached_session(tenant_id: str, cache_key: str):\n    return redis.get(f"tenant:{tenant_id}:session:{cache_key}")`,
    telemetry: {
      tenant_isolated: true,
      idor_prevented: true,
    },
  },
  TASKC02A: {
    id: "TASKC02A",
    problemId: "T1-4",
    title: "Quadratic O(n²) Reconciliation Contention in billing/reconcile.py",
    filename: "billing/reconcile.py",
    target: "billing/reconcile.py:reconcile_ledger",
    cwe: "CWE-400",
    speedupDelta: "+89.0%",
    latencyBefore: "1850ms",
    latencyAfter: "28ms",
    status: "In Progress",
    gatesPassed: "8/8 Gates PASS",
    codeSnippet: `def reconcile_ledger(invoices, payments):\n    return [inv for inv in invoices for pay in payments if inv.id == pay.invoice_id]`,
    hardenedSnippet: `def reconcile_ledger(invoices, payments):\n    pay_map = {pay.invoice_id: pay for pay in payments}\n    return [inv for inv in invoices if inv.id in pay_map]`,
    telemetry: {
      complexity_before: "O(n²)",
      complexity_after: "O(n)",
      speedup: "89.0%",
    },
  },
};

export const CACHED_PERSONA_TELEMETRY: Record<UserRole, Record<string, any>> = {
  developer: {
    role: "developer",
    member: "nitin-pandey",
    name: "Nitin Pandey",
    title: "Lead Developer",
    tokenQuota: 100000,
    tokensUsed: 34200,
    activeTasks: ["TASK9142", "TASK771B"],
    microVMStatus: "Ready / Idle (Rootless 6.6 Linux)",
    gatesPassed: 8,
    totalGates: 8,
    lastPatchTime: "2m ago",
  },
  auditor: {
    role: "auditor",
    member: "elena-rostova",
    name: "Elena Rostova",
    title: "Security Auditor",
    tokenQuota: 120000,
    tokensUsed: 18400,
    verifiedLedgerBlocks: 9482,
    sealedBlocksCount: 5,
    dastProbesPassed: "12/12 PASS",
    tamperProofProof: "Ed25519 Hardware Attestation Confirmed",
  },
  admin: {
    role: "admin",
    member: "marcus-vance",
    name: "Marcus Vance",
    title: "Workspace Admin",
    tokenQuota: 250000,
    tokensUsed: 62000,
    managedSuites: 19,
    policyEnforcement: "Deterministic Gate Lock Active",
    tenantId: "perfproof-org-01",
  },
  super_admin: {
    role: "super_admin",
    member: "sarah-lin",
    name: "Dr. Sarah Lin",
    title: "Super Admin",
    tokenQuota: 1000000,
    tokensUsed: 98000,
    clusterHealth: "14/14 MicroVMs Healthy",
    policyOverride: "Authorized",
    emergencyOverrideReady: true,
  },
};

const CACHE_KEYS = {
  TASKS: "proofstack_cached_tasks",
  AUDIT_QUEUE: "proofstack_audit_queue",
  LEDGER_BLOCKS: "proofstack_ledger_blocks",
  PERSONA_TELEMETRY: "proofstack_persona_telemetry",
  INITIALIZED: "proofstack_cache_primed_v2",
};

/**
 * Prime client-side cache immediately in localStorage and sessionStorage.
 * Synchronous and non-blocking.
 */
export function primeClientCache(activeRole?: UserRole): void {
  if (typeof window === "undefined") return;

  try {
    // 1. Prime benchmark tasks
    sessionStorage.setItem(CACHE_KEYS.TASKS, JSON.stringify(CACHED_BENCHMARK_TASKS));
    if (!localStorage.getItem(CACHE_KEYS.TASKS)) {
      localStorage.setItem(CACHE_KEYS.TASKS, JSON.stringify(CACHED_BENCHMARK_TASKS));
    }

    // 2. Prime persona telemetry
    sessionStorage.setItem(CACHE_KEYS.PERSONA_TELEMETRY, JSON.stringify(CACHED_PERSONA_TELEMETRY));
    if (!localStorage.getItem(CACHE_KEYS.PERSONA_TELEMETRY)) {
      localStorage.setItem(CACHE_KEYS.PERSONA_TELEMETRY, JSON.stringify(CACHED_PERSONA_TELEMETRY));
    }

    // 3. Ensure audit queue & ledger blocks are ready
    if (!localStorage.getItem(CACHE_KEYS.AUDIT_QUEUE)) {
      localStorage.setItem(CACHE_KEYS.AUDIT_QUEUE, JSON.stringify(INITIAL_AUDIT_QUEUE));
    }
    if (!localStorage.getItem(CACHE_KEYS.LEDGER_BLOCKS)) {
      localStorage.setItem(CACHE_KEYS.LEDGER_BLOCKS, JSON.stringify(INITIAL_LEDGER_BLOCKS));
    }

    // 4. Mark cache primed
    sessionStorage.setItem(CACHE_KEYS.INITIALIZED, "true");
  } catch (err) {
    // Storage quota or privacy mode fallback
    console.warn("[ClientCache] Prime fallback:", err);
  }
}

/**
 * Synchronously retrieves a cached task by ID (0ms latency).
 */
export function getCachedTask(taskId: string): BenchmarkTaskCacheItem | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(CACHE_KEYS.TASKS) || localStorage.getItem(CACHE_KEYS.TASKS);
      if (raw) {
        const tasks = JSON.parse(raw);
        const normalized = taskId.toUpperCase();
        if (tasks[normalized]) return tasks[normalized];
        // Match by problem ID (e.g. T1-2)
        const found = Object.values(tasks as Record<string, BenchmarkTaskCacheItem>).find(
          (t) => t.problemId.toLowerCase() === taskId.toLowerCase() || t.filename.toLowerCase().includes(taskId.toLowerCase())
        );
        if (found) return found;
      }
    } catch {}
  }
  return CACHED_BENCHMARK_TASKS[taskId.toUpperCase()] || CACHED_BENCHMARK_TASKS.TASK9142;
}

/**
 * Synchronously retrieves cached persona telemetry (0ms latency).
 */
export function getCachedPersonaTelemetry(role: UserRole): Record<string, any> {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(CACHE_KEYS.PERSONA_TELEMETRY) || localStorage.getItem(CACHE_KEYS.PERSONA_TELEMETRY);
      if (raw) {
        const telemetries = JSON.parse(raw);
        if (telemetries[role]) return telemetries[role];
      }
    } catch {}
  }
  return CACHED_PERSONA_TELEMETRY[role] || CACHED_PERSONA_TELEMETRY.developer;
}

/**
 * Prefetch all core workspace routes for instant transitions without network stall.
 */
export function prefetchAllRoutes(router: any): void {
  if (!router || typeof router.prefetch !== "function") return;
  const routes = [
    "/dashboard",
    "/developer",
    "/studio",
    "/cockpit",
    "/cockpit/TASK9142",
    "/settings",
    "/auditor",
    "/findings",
    "/ledger",
    "/catalog",
    "/control-plane",
    "/dast",
    "/admin",
    "/home",
    "/login",
  ];
  routes.forEach((route) => {
    try {
      router.prefetch(route);
    } catch {}
  });
}

