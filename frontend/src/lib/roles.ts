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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department: string;
  tokenQuota: number;
  tokenUsed: number;
  assignedTasksCount: number;
  status: "active" | "suspended";
}

export const TEAM_MEMBERS: TeamMember[] = [
  // 👑 Super Admin (Single Root)
  {
    id: "sarah-lin",
    name: "Dr. Sarah Lin",
    email: "superadmin@perfproof.internal",
    role: "super_admin",
    avatar: "👑",
    title: "Chief Systems Architect & Root Authority",
    department: "Executive & Core Engineering",
    tokenQuota: 500000,
    tokenUsed: 142000,
    assignedTasksCount: 14,
    status: "active",
  },
  // ⚙️ Workspace Admins (Multiple)
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    email: "admin@perfproof.internal",
    role: "admin",
    avatar: "⚙️",
    title: "Lead Platform & Infrastructure Admin",
    department: "Cloud Operations",
    tokenQuota: 250000,
    tokenUsed: 98000,
    assignedTasksCount: 8,
    status: "active",
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    email: "priya.admin@perfproof.internal",
    role: "admin",
    avatar: "🧭",
    title: "DevSecOps Governance Manager",
    department: "Security Compliance & Triage",
    tokenQuota: 200000,
    tokenUsed: 64000,
    assignedTasksCount: 6,
    status: "active",
  },
  // 👨‍💻 Developers (Multiple)
  {
    id: "nitin-pandey",
    name: "Nitin Pandey",
    email: "nitin.dev@perfproof.internal",
    role: "developer",
    avatar: "👨‍💻",
    title: "Staff Systems Optimization Engineer",
    department: "Core Backend Optimization",
    tokenQuota: 100000,
    tokenUsed: 42000,
    assignedTasksCount: 5,
    status: "active",
  },
  {
    id: "nikhil-lakra",
    name: "Nikhil Lakra",
    email: "nikhil.dev@perfproof.internal",
    role: "developer",
    avatar: "👨‍💻",
    title: "Senior Autonomous Security Systems Engineer",
    department: "Application Security & Core Sandbox",
    tokenQuota: 85000,
    tokenUsed: 29000,
    assignedTasksCount: 4,
    status: "active",
  },
  // 🛡️ Security Auditors (Multiple)
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    email: "auditor@perfproof.internal",
    role: "auditor",
    avatar: "🛡️",
    title: "Principal Security Auditor & Cryptographer",
    department: "Audit & Formal Verification",
    tokenQuota: 120000,
    tokenUsed: 22000,
    assignedTasksCount: 7,
    status: "active",
  },
  {
    id: "rohan-verma",
    name: "Rohan Verma",
    email: "rohan.audit@perfproof.internal",
    role: "auditor",
    avatar: "🔍",
    title: "Lead DAST & Gauntlet Specialist",
    department: "Penetration Testing & Gauntlet",
    tokenQuota: 90000,
    tokenUsed: 19000,
    assignedTasksCount: 3,
    status: "active",
  },
];

export const DEFAULT_MEMBER_BY_ROLE: Record<UserRole, string> = {
  super_admin: "sarah-lin",
  admin: "marcus-vance",
  developer: "nitin-pandey",
  auditor: "elena-rostova",
};

export function getTeamMemberById(id: string): TeamMember {
  const found = TEAM_MEMBERS.find((m) => m.id === id);
  return found || TEAM_MEMBERS[0];
}

export function getTeamMembersByRole(role: UserRole): TeamMember[] {
  return TEAM_MEMBERS.filter((m) => m.role === role);
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  super_admin: {
    role: "super_admin",
    label: "Super Admin",
    badge: "super_admin",
    email: "superadmin@perfproof.internal",
    tenantUuid: "8f4b238e-89c1-4289-0dba-f423a8e9e19d",
    tenantName: "Global Root Tenant",
    roleTitle: "Super Admin (Full Fleet Control & Policy Override)",
    description: "Full fleet control: global token budgets, microVM telemetry, emergency policy override",
    primaryRoute: "/ciso",
    primaryButtonLabel: "Open CISO Control Plane",
    canOverridePolicy: true,
    canIngestTask: true,
    canRemediate: true,
    canSelfHeal: true,
    canAccessControlPlane: true,
    canAccessStudio: true,
    canSimulateTamper: true,
    allowedRoutes: ["/", "/home", "/dashboard", "/ciso", "/control-plane", "/ledger", "/settings", "/dast"],
  },
  admin: {
    role: "admin",
    label: "Workspace Admin",
    badge: "admin",
    email: "admin@perfproof.internal",
    tenantUuid: "4a9c712b-33d8-4e11-9b20-77c1290f44a2",
    tenantName: "Operations & Budget Tenant",
    roleTitle: "Workspace Admin (Token Budgets, Task Allocation & Triage)",
    description: "Management access: developer/auditor quotas, task assignment corridor, catalog triage",
    primaryRoute: "/admin",
    primaryButtonLabel: "Open Workspace Admin",
    canOverridePolicy: false,
    canIngestTask: true,
    canRemediate: true,
    canSelfHeal: true,
    canAccessControlPlane: true,
    canAccessStudio: true,
    canSimulateTamper: false,
    allowedRoutes: ["/", "/home", "/dashboard", "/admin", "/control-plane", "/catalog", "/findings", "/settings", "/dast"],
  },
  developer: {
    role: "developer",
    label: "Lead Developer",
    badge: "developer",
    email: "nitin.dev@perfproof.internal",
    tenantUuid: "9c2e601f-58a4-41c9-8e73-19b4502d88e5",
    tenantName: "Engineering Sandbox Tenant",
    roleTitle: "Lead Developer (Studio, Sandboxes & Patch Submission)",
    description: "Task execution, patch synthesis, DAST testing, and security audit referrals",
    primaryRoute: "/developer",
    primaryButtonLabel: "Open Developer Workspace",
    canOverridePolicy: false,
    canIngestTask: true,
    canRemediate: true,
    canSelfHeal: true,
    canAccessControlPlane: false,
    canAccessStudio: true,
    canSimulateTamper: false,
    allowedRoutes: ["/", "/home", "/dashboard", "/developer", "/studio", "/cockpit", "/dast", "/settings"],
  },
  auditor: {
    role: "auditor",
    label: "Security Auditor",
    badge: "auditor",
    email: "auditor@perfproof.internal",
    tenantUuid: "2d7b194a-60f2-4c88-a105-55e8913c72b9",
    tenantName: "Compliance Audit Tenant",
    roleTitle: "Security Auditor (Gate Approvals, Ledger & Tamper Audit)",
    description: "Patch gate approval, cryptographically sealed ledger commits, and compliance verification",
    primaryRoute: "/auditor",
    primaryButtonLabel: "Open Auditor Portal",
    canOverridePolicy: false,
    canIngestTask: false,
    canRemediate: false,
    canSelfHeal: false,
    canAccessControlPlane: false,
    canAccessStudio: false,
    canSimulateTamper: true,
    allowedRoutes: ["/", "/home", "/dashboard", "/auditor", "/findings", "/ledger", "/cockpit", "/dast", "/settings"],
  },
};

export function canRoleAccessRoute(role: UserRole, pathname: string): boolean {
  const def = ROLES[role];
  if (!def) return false;
  if (pathname === "/" || pathname === "/login" || pathname === "/home") return true;

  return def.allowedRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}
