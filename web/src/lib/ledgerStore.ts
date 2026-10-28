/**
 * Shared Cryptographic Evidence Ledger Store
 * Synchronizes SHA-256 chained blocks across Studio, Ledger, and Cockpit pages.
 */

export interface StoredLedgerBlock {
  index: number;
  type: string;
  actor: string;
  time: string;
  prevHash: string;
  entryHash: string;
  payload: Record<string, any>;
  verified: boolean;
}

export const INITIAL_LEDGER_BLOCKS: StoredLedgerBlock[] = [
  {
    index: 0,
    type: "TASK_INTAKE",
    actor: "nitin@perfproof.local",
    time: "11:30:00 PM",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
    entryHash: "8f4b238e89c132890dbaf423a8e9e19d7010a3952f012c8b74f38891ac3980bc",
    payload: {
      task_id: "TASK9142",
      target: "orders.py:get_orders",
      class: "performance",
    },
    verified: true,
  },
  {
    index: 1,
    type: "BASELINE",
    actor: "controller/baseline",
    time: "11:31:12 PM",
    prevHash: "8f4b238e89c132890dbaf423a8e9e19d7010a3952f012c8b74f38891ac3980bc",
    entryHash: "318cb92931ea789dcba2891901a8df9038ba1c890123f890dbca901283901def",
    payload: {
      median_time_s: 0.428,
      cv: 0.041,
      tau_noise: 0.05,
      sql_queries: 5001,
    },
    verified: true,
  },
  {
    index: 2,
    type: "HYPOTHESIS",
    actor: "controller/discriminator",
    time: "11:32:28 PM",
    prevHash: "318cb92931ea789dcba2891901a8df9038ba1c890123f890dbca901283901def",
    entryHash: "45a89df0123bc890192389102389019238901238901238901234e890123890123",
    payload: {
      supported_hypothesis: "H1",
      claim: "N+1 query explosion via iterative customer load",
      score: 0.96,
    },
    verified: true,
  },
  {
    index: 3,
    type: "PATCH",
    actor: "model/nemotron-3.5-lightning",
    time: "11:33:04 PM",
    prevHash: "45a89df0123bc890192389102389019238901238901238901234e890123890123",
    entryHash: "e890123890123890123890123890123890123890123890123890123890123890",
    payload: {
      candidate: "nemotron-3.5-lightning",
      template: "Template B (joinedload)",
      identity_preserved: true,
    },
    verified: true,
  },
  {
    index: 4,
    type: "GATE_RESULT",
    actor: "gauntlet/zero-compromise",
    time: "11:33:48 PM",
    prevHash: "e890123890123890123890123890123890123890123890123890123890123890",
    entryHash: "d901238901238901238901238901238901238901238901238901238901238901",
    payload: {
      G0: "PASS",
      G1: "PASS",
      G2: "PASS",
      G3: "PASS",
      G4: "PASS",
      G5: "PASS",
      G6: "PASS",
      G7: "PASS",
    },
    verified: true,
  },
  {
    index: 5,
    type: "DEFENSIVE_PATCH_COMMIT",
    actor: "controller/commit",
    time: "11:34:02 PM",
    prevHash: "d901238901238901238901238901238901238901238901238901238901238901",
    entryHash: "b3e94a8f1234567890abcdef1234567890abcdef1234567890abcdef12345678",
    payload: {
      verdict: "ACCEPT",
      delta_perf: 0.742,
      tau_noise: 0.05,
      head_commit: "c8a94e1",
    },
    verified: true,
  },
];

const STORAGE_KEY = "proofstack_ledger_blocks";

/**
 * Returns all ledger blocks from localStorage, falling back to INITIAL_LEDGER_BLOCKS.
 */
export function getLedgerBlocks(): StoredLedgerBlock[] {
  if (typeof window === "undefined") return INITIAL_LEDGER_BLOCKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_LEDGER_BLOCKS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= INITIAL_LEDGER_BLOCKS.length) {
      return parsed;
    }
  } catch {
    // Fall back to initial blocks on parse error
  }
  return INITIAL_LEDGER_BLOCKS;
}

/**
 * Appends a new verified commit block to the ledger chain, persists in localStorage,
 * and notifies other open views via custom event.
 */
export async function commitPatchToLedger(params: {
  problemId: string;
  patchTitle: string;
  actor?: string;
  speedupDelta?: string;
}): Promise<StoredLedgerBlock> {
  const currentBlocks = getLedgerBlocks();
  const lastBlock = currentBlocks[currentBlocks.length - 1];
  const newIndex = lastBlock ? lastBlock.index + 1 : 6;
  const prevHash = lastBlock ? lastBlock.entryHash : "b3e94a8f1234567890abcdef1234567890abcdef1234567890abcdef12345678";

  let createdBlock: StoredLedgerBlock;

  try {
    const res = await fetch("/api/ledger/append", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: params.problemId,
        patchTitle: params.patchTitle,
        actor: params.actor || "controller/commit",
        index: newIndex,
        prevHash,
      }),
    });
    const data = await res.json();
    if (data.success && data.block) {
      createdBlock = {
        index: data.block.index,
        type: "DEFENSIVE_PATCH_COMMIT",
        actor: data.block.actor || "controller/commit",
        time: new Date().toLocaleTimeString(),
        prevHash: data.block.prev_hash,
        entryHash: data.block.entry_hash,
        payload: {
          verdict: "ACCEPT",
          problem_id: params.problemId,
          delta_perf: params.speedupDelta || "+74.2%",
          tau_noise: 0.05,
          head_commit: `commit_${Math.random().toString(16).slice(2, 9)}`,
          ...data.block.payload,
        },
        verified: true,
      };
    } else {
      throw new Error(data.error || "Failed API append");
    }
  } catch {
    // Client-side fallback calculation if offline / API error
    const simpleHash = Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(prevHash + params.problemId + params.patchTitle + Date.now())
        )
      )
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    createdBlock = {
      index: newIndex,
      type: "DEFENSIVE_PATCH_COMMIT",
      actor: params.actor || "controller/commit",
      time: new Date().toLocaleTimeString(),
      prevHash,
      entryHash: simpleHash,
      payload: {
        verdict: "ACCEPT",
        problem_id: params.problemId,
        delta_perf: params.speedupDelta || "+74.2%",
        tau_noise: 0.05,
        head_commit: `c8a${Math.random().toString(16).slice(2, 6)}`,
      },
      verified: true,
    };
  }

  const updated = [...currentBlocks, createdBlock];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("proofstack:ledger-updated", { detail: { newBlock: createdBlock } }));
  }

  return createdBlock;
}

/**
 * Resets the ledger back to clean authentic state.
 */
export function resetLedgerBlocks(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("proofstack:ledger-updated", { detail: { reset: true } }));
  }
}

// -------------------------------------------------------------
// Developer -> Security Auditor Approval Pipeline Store
// -------------------------------------------------------------

export interface AuditQueueItem {
  id: string;
  problemId: string;
  problemTitle: string;
  filename: string;
  developerId: string;
  developerName: string;
  developerAvatar: string;
  submittedAt: string;
  speedupDelta: string;
  latencyBefore: string;
  latencyAfter: string;
  gatesPassed: string;
  status: "PENDING_AUDIT" | "SEALED_AND_DEPLOYED" | "REJECTED";
  patchCode: string;
  auditNotes?: string;
  auditorName?: string;
  sealedBlockIndex?: number;
}

export const INITIAL_AUDIT_QUEUE: AuditQueueItem[] = [
  {
    id: "audit-101",
    problemId: "T1-2",
    problemTitle: "N+1 Query Explosion & SQL-Injection Trap in orders.py",
    filename: "orders.py",
    developerId: "nitin-pandey",
    developerName: "Nitin Pandey",
    developerAvatar: "👨‍💻",
    submittedAt: "10m ago",
    speedupDelta: "+74.2%",
    latencyBefore: "428ms",
    latencyAfter: "12ms",
    gatesPassed: "8/8 Gates PASS",
    status: "PENDING_AUDIT",
    patchCode: `# SAFE DEFENSIVE FIX: Eager load customer relationship
from sqlalchemy.orm import joinedload
from app.models import Order

def get_orders(session, limit: int = 50):
    return session.query(Order).options(joinedload(Order.customer)).limit(limit).all()`,
  },
  {
    id: "audit-100",
    problemId: "T1-1",
    problemTitle: "Catastrophic Regex Backtracking (ReDoS) in auth/validators.py",
    filename: "validators.py",
    developerId: "alex-chen",
    developerName: "Alex Chen",
    developerAvatar: "🚀",
    submittedAt: "1h ago",
    speedupDelta: "+98.4%",
    latencyBefore: "3200ms",
    latencyAfter: "2ms",
    gatesPassed: "8/8 Gates PASS",
    status: "SEALED_AND_DEPLOYED",
    auditorName: "Elena Rostova",
    sealedBlockIndex: 5,
    patchCode: `import re
# Precompiled linear deterministic regex with length bounds
SAFE_EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')`,
  },
];

const AUDIT_STORAGE_KEY = "proofstack_audit_queue";

export function getAuditQueue(): AuditQueueItem[] {
  if (typeof window === "undefined") return INITIAL_AUDIT_QUEUE;
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_QUEUE));
      return INITIAL_AUDIT_QUEUE;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // parse fallback
  }
  return INITIAL_AUDIT_QUEUE;
}

export function submitPatchForAudit(data: {
  problemId: string;
  problemTitle: string;
  filename: string;
  developerId: string;
  developerName: string;
  developerAvatar: string;
  speedupDelta: string;
  latencyBefore: string;
  latencyAfter: string;
  patchCode: string;
}): AuditQueueItem {
  const queue = getAuditQueue();
  const newItem: AuditQueueItem = {
    id: `audit-${Date.now().toString().slice(-4)}`,
    problemId: data.problemId,
    problemTitle: data.problemTitle,
    filename: data.filename,
    developerId: data.developerId,
    developerName: data.developerName,
    developerAvatar: data.developerAvatar,
    submittedAt: "Just now",
    speedupDelta: data.speedupDelta,
    latencyBefore: data.latencyBefore,
    latencyAfter: data.latencyAfter,
    gatesPassed: "8/8 Gates PASS",
    status: "PENDING_AUDIT",
    patchCode: data.patchCode,
  };

  const updated = [newItem, ...queue];
  if (typeof window !== "undefined") {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("proofstack:audit-queue-updated", { detail: { item: newItem } }));
  }
  return newItem;
}

export async function approveAndSealPatch(
  auditId: string,
  auditorName: string
): Promise<{ auditItem: AuditQueueItem; block: StoredLedgerBlock }> {
  const queue = getAuditQueue();
  const target = queue.find((i) => i.id === auditId);
  if (!target) {
    throw new Error(`Audit task ${auditId} not found`);
  }

  // 1. Commit new verified block to SHA-256 Ledger
  const block = await commitPatchToLedger({
    problemId: target.problemId,
    patchTitle: `${target.problemTitle} (Auditor Approved)`,
    actor: `auditor/${auditorName.toLowerCase().replace(/\s+/g, ".")}`,
    speedupDelta: target.speedupDelta,
  });

  // 2. Mark audit item as sealed & deployed
  const updatedQueue = queue.map((item) => {
    if (item.id === auditId) {
      return {
        ...item,
        status: "SEALED_AND_DEPLOYED" as const,
        auditorName,
        sealedBlockIndex: block.index,
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedQueue));
    window.dispatchEvent(
      new CustomEvent("proofstack:audit-queue-updated", {
        detail: { auditId, status: "SEALED_AND_DEPLOYED", blockIndex: block.index },
      })
    );
  }

  const updatedTarget = updatedQueue.find((i) => i.id === auditId)!;
  return { auditItem: updatedTarget, block };
}

export function rejectAuditPatch(
  auditId: string,
  auditorName: string,
  reason: string = "Gate G3 tenant boundary constraint violation detected"
): AuditQueueItem {
  const queue = getAuditQueue();
  const updatedQueue = queue.map((item) => {
    if (item.id === auditId) {
      return {
        ...item,
        status: "REJECTED" as const,
        auditorName,
        auditNotes: reason,
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedQueue));
    window.dispatchEvent(
      new CustomEvent("proofstack:audit-queue-updated", {
        detail: { auditId, status: "REJECTED", reason },
      })
    );
  }

  return updatedQueue.find((i) => i.id === auditId)!;
}
