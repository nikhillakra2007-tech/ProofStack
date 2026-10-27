import { UserRole, UserSession } from "./types";
import { ROLES, TENANT_UUID, DEFAULT_MEMBER_BY_ROLE, getTeamMemberById, TEAM_MEMBERS } from "./roles";

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
    landingPath: "/dashboard",
  },
  {
    label: ROLES.admin.label,
    email: ROLES.admin.email,
    role: "admin",
    badge: "admin",
    description: ROLES.admin.description,
    canOverridePolicy: false,
    landingPath: "/dashboard",
  },
  {
    label: ROLES.developer.label,
    email: ROLES.developer.email,
    role: "developer",
    badge: "developer",
    description: ROLES.developer.description,
    canOverridePolicy: false,
    landingPath: "/dashboard",
  },
  {
    label: ROLES.auditor.label,
    email: ROLES.auditor.email,
    role: "auditor",
    badge: "auditor",
    description: ROLES.auditor.description,
    canOverridePolicy: false,
    landingPath: "/dashboard",
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
        // Ensure member metadata exists
        if (!parsed.memberId || !parsed.name || !parsed.avatar) {
          const defaultMemberId = DEFAULT_MEMBER_BY_ROLE[parsed.role as UserRole] || "nitin-pandey";
          const member = getTeamMemberById(defaultMemberId);
          parsed.memberId = member.id;
          parsed.name = member.name;
          parsed.avatar = member.avatar;
          parsed.email = member.email;
        }
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
        const defaultMemberId = DEFAULT_MEMBER_BY_ROLE[role] || "nitin-pandey";
        const member = getTeamMemberById(defaultMemberId);
        const session: UserSession = {
          userId: `usr_${def.role}`,
          memberId: member.id,
          name: member.name,
          avatar: member.avatar,
          tenantId: def.tenantUuid,
          email: member.email,
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
