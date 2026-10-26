import { UserRole, UserSession } from "./types";
import { ROLES, TENANT_UUID } from "./roles";

export interface RolePreset {
  label: string;
  email: string;
  role: UserRole;
  badge: string;
  description: string;
  canOverridePolicy: boolean;
  landingPath: string;
}

export const JUDGE_PRESETS: RolePreset[] = [
  {
    label: ROLES.super_admin.label,
    email: ROLES.super_admin.email,
    role: "super_admin",
    badge: "super_admin",
    description: ROLES.super_admin.description,
    canOverridePolicy: true,
    landingPath: ROLES.super_admin.primaryRoute,
  },
  {
    label: ROLES.admin.label,
    email: ROLES.admin.email,
    role: "admin",
    badge: "admin",
    description: ROLES.admin.description,
    canOverridePolicy: false,
    landingPath: ROLES.admin.primaryRoute,
  },
  {
    label: ROLES.developer.label,
    email: ROLES.developer.email,
    role: "developer",
    badge: "developer",
    description: ROLES.developer.description,
    canOverridePolicy: false,
    landingPath: ROLES.developer.primaryRoute,
  },
  {
    label: ROLES.auditor.label,
    email: ROLES.auditor.email,
    role: "auditor",
    badge: "auditor",
    description: ROLES.auditor.description,
    canOverridePolicy: false,
    landingPath: ROLES.auditor.primaryRoute,
  },
];

export function getStoredSession(): UserSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("proofstack_session");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.role && ROLES[parsed.role as UserRole]) {
        return parsed;
      }
    } catch {
      // invalid JSON
    }
  }

  // Also check cookie for proofstack_role
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)proofstack_role=([^;]*)/);
    if (match && match[1]) {
      const role = match[1] as UserRole;
      const def = ROLES[role];
      if (def) {
        const session: UserSession = {
          userId: `usr_${def.role}`,
          tenantId: def.tenantUuid,
          email: def.email,
          role: def.role,
          token: `jwt_rs256_${def.role}_token`,
          canOverridePolicy: def.canOverridePolicy,
        };
        localStorage.setItem("proofstack_session", JSON.stringify(session));
        return session;
      }
    }
  }

  return null;
}

export function setStoredSession(session: UserSession): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("proofstack_session", JSON.stringify(session));
    document.cookie = `proofstack_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function clearStoredSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("proofstack_session");
    document.cookie = "proofstack_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}
