import { UserRole } from "./types";

export interface RoleDefinition {
  role: UserRole;
  label: string;
  badge: string;
  email: string;
  tenantUuid: string;
  tenantName: string;
  roleTitle: string;
  description: string;
  primaryRoute: string;
  primaryButtonLabel: string;
  canOverridePolicy: boolean;
  canIngestTask: boolean;
  canRemediate: boolean;
  canSelfHeal: boolean;
  canAccessControlPlane: boolean;
  canAccessStudio: boolean;
  canSimulateTamper: boolean;
  allowedRoutes: string[];
}

export const TENANT_UUID = "8f4b238e-89c1-4289-0dba-f423a8e9e19d";
export const TENANT_BOUNDARY_UUID = TENANT_UUID;

export const ROLES: Record<UserRole, RoleDefinition> = {
  super_admin: {
    role: "super_admin",
    label: "Super Admin",
    badge: "super_admin",
    email: "superadmin@perfproof.internal",
    tenantUuid: "8f4b238e-89c1-4289-0dba-f423a8e9e19d",
    tenantName: "Global Root Tenant",
    roleTitle: "Super Admin (Full Control & Policy Override)",
    description: "Full control plane: token budgets, microVM telemetry, emergency policy override",
    primaryRoute: "/cockpit/TASK9142",
    primaryButtonLabel: "Open in Cockpit",
    canOverridePolicy: true,
    canIngestTask: true,
    canRemediate: true,
    canSelfHeal: true,
    canAccessControlPlane: true,
    canAccessStudio: true,
    canSimulateTamper: true,
    allowedRoutes: ["/", "/home", "/studio", "/cockpit", "/findings", "/ledger", "/catalog", "/control-plane", "/settings"],
  },
  admin: {
    role: "admin",
    label: "Admin",
    badge: "admin",
    email: "admin@perfproof.internal",
    tenantUuid: "4a9c712b-33d8-4e11-9b20-77c1290f44a2",
    tenantName: "Operations & Budget Tenant",
    roleTitle: "Admin (Token Budgets, User Management & Triage)",
    description: "Management access: token budget allocation, MicroVM pool telemetry, findings triage. Gates locked.",
    primaryRoute: "/control-plane",
    primaryButtonLabel: "Open Control Plane",
    canOverridePolicy: false,
    canIngestTask: true,
    canRemediate: true,
    canSelfHeal: true,
    canAccessControlPlane: true,
    canAccessStudio: true,
    canSimulateTamper: false,
    allowedRoutes: ["/", "/home", "/studio", "/cockpit", "/findings", "/catalog", "/control-plane", "/settings"],
  },
  developer: {
    role: "developer",
    label: "Lead Developer",
    badge: "developer",
    email: "developer@perfproof.internal",
    tenantUuid: "9c2e601f-58a4-41c9-8e73-19b4502d88e5",
    tenantName: "Engineering Sandbox Tenant",
    roleTitle: "Lead Developer (Studio, DAST & Patch Synthesis)",
    description: "Task creation, patch verification, DAST scanning, and sandbox execution",
    primaryRoute: "/studio",
    primaryButtonLabel: "Open in Studio",
    canOverridePolicy: false,
    canIngestTask: true,
    canRemediate: true,
    canSelfHeal: true,
    canAccessControlPlane: false,
    canAccessStudio: true,
    canSimulateTamper: false,
    allowedRoutes: ["/", "/home", "/studio", "/cockpit", "/findings", "/catalog", "/settings"],
  },
  auditor: {
    role: "auditor",
    label: "Security Auditor",
    badge: "auditor",
    email: "auditor@perfproof.internal",
    tenantUuid: "2d7b194a-60f2-4c88-a105-55e8913c72b9",
    tenantName: "Compliance Audit Tenant",
    roleTitle: "Security Auditor (Read-Only Ledger & Tamper Audit)",
    description: "Read-only ledger verification and tamper audit inspection",
    primaryRoute: "/ledger",
    primaryButtonLabel: "Open in Ledger",
    canOverridePolicy: false,
    canIngestTask: false,
    canRemediate: false,
    canSelfHeal: false,
    canAccessControlPlane: false,
    canAccessStudio: false,
    canSimulateTamper: true,
    allowedRoutes: ["/", "/home", "/cockpit", "/findings", "/ledger", "/catalog"],
  },
};

export function canRoleAccessRoute(role: UserRole, pathname: string): boolean {
  const def = ROLES[role];
  if (!def) return false;
  if (pathname === "/" || pathname === "/login") return true;

  return def.allowedRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}
