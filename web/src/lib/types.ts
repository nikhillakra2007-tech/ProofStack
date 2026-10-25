export type UserRole = "super_admin" | "admin" | "developer" | "auditor";

export interface UserSession {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
  token: string;
  canOverridePolicy?: boolean;
}

export type ProblemTier = "Tier 1" | "Tier 2" | "Tier 3" | "Real-World";
export type ProblemDomain =
  | "Performance"
  | "Security"
  | "Concurrency"
  | "Database"
  | "Resource"
  | "Cloud Security"
  | "Supply Chain"
  | "Correctness"
  | "Fintech"
  | "Testing"
  | "Arbitrary Ingestion";

export interface CatalogProblem {
  id: string; // T1-1, T1-2, etc.
  tier: ProblemTier;
  domain: ProblemDomain;
  title: string;
  summary: string;
  realWorldImpact: string;
  bugSnippet: string;
  naiveFixSnippet: string;
  naiveVerdict: "REJECT";
  naiveReason: string;
  safeFixSnippet: string;
  safeVerdict: "ACCEPT";
  safeReason: string;
  probeMethod: string;
  truthRank: number;
  filename?: string;
  probeFile?: string;
  failingGate?: "G0" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";
  failingGateReason?: string;
  metrics?: {
    baseline: { keyMetric: string; latency: string; invariant: string; delta: string };
    naive: { keyMetric: string; latency: string; invariant: string; delta: string };
    safe: { keyMetric: string; latency: string; invariant: string; delta: string };
  };
}

export interface GateStatus {
  gateId: "G0" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";
  name: string;
  status: "PASS" | "FAIL" | "NOT_RUN" | "ERROR";
  description: string;
  details: string;
}

export interface NemotronHypothesis {
  id: "H1" | "H2" | "H3";
  claim: string;
  problemId: string;
  codeRefs: { file: string; lineStart: number; lineEnd: number }[];
  modelScore: number;
  computedSupport: number;
  experimentKind: string;
  status: "CONFIRMED" | "REFUTED" | "TESTING";
}

export interface IdentityCheck {
  type: "parameter" | "predicate" | "decorator" | "authorization_branch";
  name: string;
  preserved: boolean;
  baselineLocation: string;
  candidateLocation: string;
}

export interface DastFindingItem {
  id: string;
  checkId: string;
  title: string;
  owasp: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  url: string;
  evidenceSummary: string;
  redactedPreview: string;
  status: "OPEN" | "REMEDIATION_PROPOSED" | "VERIFIED";
  sourceFile: string;
}

export interface LedgerBlock {
  index: number;
  type: string;
  timestamp: string;
  actor: string;
  prev_hash: string;
  entry_hash: string;
  payload: Record<string, any>;
  verified: boolean;
}
