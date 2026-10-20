export type UserRole = "developer" | "auditor" | "admin" | "super_admin";

export interface UserSession {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
  token: string;
  canOverridePolicy: boolean;
}

export interface RoleDefinition {
  label: string;
  roleTitle: string;
  description: string;
  badgeColor: string;
  defaultPath: string;
  canAccessStudio: boolean;
  canApproveRelease: boolean;
  canOverridePolicy: boolean;
  canManageQuotas: boolean;
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  developer: {
    label: "Lead Developer",
    roleTitle: "Staff Software Engineer",
    description: "Synthesize patches, inspect AST diffs, and run DAST exploit probes.",
    badgeColor: "#10B981",
    defaultPath: "/developer",
    canAccessStudio: true,
    canApproveRelease: false,
    canOverridePolicy: false,
    canManageQuotas: false,
  },
  auditor: {
    label: "Security Auditor",
    roleTitle: "Cryptographic Assurance Auditor",
    description: "Inspect SHA-256 Merkle chain, simulate tamper vectors, export audit packs.",
    badgeColor: "#38BDF8",
    defaultPath: "/auditor",
    canAccessStudio: false,
    canApproveRelease: false,
    canOverridePolicy: false,
    canManageQuotas: false,
  },
  admin: {
    label: "Operations Admin",
    roleTitle: "DevSecOps Infrastructure Admin",
    description: "Manage token quotas, monitor microVM pools, and triage findings.",
    badgeColor: "#818CF8",
    defaultPath: "/admin",
    canAccessStudio: true,
    canApproveRelease: true,
    canOverridePolicy: false,
    canManageQuotas: true,
  },
  super_admin: {
    label: "SuperAdmin",
    roleTitle: "Chief Information Security Officer",
    description: "Full control plane authority, root signing key, emergency policy override.",
    badgeColor: "#F59E0B",
    defaultPath: "/ciso",
    canAccessStudio: true,
    canApproveRelease: true,
    canOverridePolicy: true,
    canManageQuotas: true,
  },
};

export const PRESET_USERS: Array<{ email: string; role: UserRole; name: string }> = [
  { email: "developer@sentinel.internal", role: "developer", name: "Alex Chen (Staff Dev)" },
  { email: "auditor@sentinel.internal", role: "auditor", name: "Elena Rostova (Lead Auditor)" },
  { email: "admin@sentinel.internal", role: "admin", name: "Marcus Vance (Ops Admin)" },
  { email: "ciso@sentinel.internal", role: "super_admin", name: "Dr. Sarah Lin (CISO)" },
];

const STORAGE_KEY = "sentinel_session";

export function getStoredSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to persist session", e);
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session", e);
  }
}
