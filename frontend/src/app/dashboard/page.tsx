"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES, TeamMember } from "@/lib/roles";
import { MOCK_CATALOG } from "@/lib/mockData";
import {
  getAuditQueue,
  approveAndSealPatch,
  rejectAuditPatch,
  AuditQueueItem,
  getLedgerBlocks,
} from "@/lib/ledgerStore";

interface AssignedTask {
  id: string;
  problemId: string;
  problemTitle: string;
  filename: string;
  assignedToMemberId: string;
  assignedToName: string;
  assignedToAvatar: string;
  priority: "Critical" | "High" | "Medium";
  status: "Assigned" | "In Progress" | "Audit Pending" | "Completed";
  speedupTarget: string;
}

const INITIAL_ASSIGNED_TASKS: AssignedTask[] = [
  {
    id: "task-9142",
    problemId: "T1-2",
    problemTitle: "N+1 Query Explosion & SQL-Injection Trap in orders.py",
    filename: "orders.py (get_orders)",
    assignedToMemberId: "nitin-pandey",
    assignedToName: "Nitin Pandey",
    assignedToAvatar: "👨‍💻",
    priority: "Critical",
    status: "Audit Pending",
    speedupTarget: "+74.2% (428ms → 12ms)",
  },
  {
    id: "task-9143",
    problemId: "T1-1",
    problemTitle: "Catastrophic Regex Backtracking (ReDoS) in auth/validators.py",
    filename: "validators.py",
    assignedToMemberId: "alex-chen",
    assignedToName: "Alex Chen",
    assignedToAvatar: "🚀",
    priority: "High",
    status: "Completed",
    speedupTarget: "+98.4% (3200ms → 2ms)",
  },
  {
    id: "task-9144",
    problemId: "T1-3",
    problemTitle: "Multi-Tenant Cache IDOR Boundary in cache/store.py",
    filename: "cache/store.py",
    assignedToMemberId: "nitin-pandey",
    assignedToName: "Nitin Pandey",
    assignedToAvatar: "👨‍💻",
    priority: "High",
    status: "In Progress",
    speedupTarget: "Tenant Isolation Lock",
  },
  {
    id: "task-9145",
    problemId: "T1-4",
    problemTitle: "Quadratic O(n²) Reconciliation Contention in billing/reconcile.py",
    filename: "billing/reconcile.py",
    assignedToMemberId: "alex-chen",
    assignedToName: "Alex Chen",
    assignedToAvatar: "🚀",
    priority: "Medium",
    status: "In Progress",
    speedupTarget: "+89.0% (O(n²) → O(n log n))",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    session,
    isAuthenticated,
    isInitialized,
    role,
    activeMember,
    allMembers,
    switchMember,
  } = useAuth();
  const { isTampered, setIsTampered } = useTheme();

  // Audit queue state for real-time Developer-to-Auditor pipeline
  const [auditQueue, setAuditQueue] = useState<AuditQueueItem[]>([]);

  // Task allocation state
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("proofstack_assigned_tasks");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_ASSIGNED_TASKS;
  });

  // Super Admin state: Workspace Admins list & policy override
  const [policyOverrideActive, setPolicyOverrideActive] = useState(false);
  const [superAdminNotice, setSuperAdminNotice] = useState<string | null>(null);
  const [workspaceAdmins, setWorkspaceAdmins] = useState([
    { id: "marcus-vance", name: "Marcus Vance", email: "admin@perfproof.internal", avatar: "⚙️", status: "active", quotas: "250,000 tok" },
    { id: "priya-nair", name: "Priya Nair", email: "priya.admin@perfproof.internal", avatar: "🧭", status: "active", quotas: "200,000 tok" },
  ]);

  // Workspace Admin state: Interactive token budget sliders
  const [memberQuotas, setMemberQuotas] = useState<Record<string, number>>({
    "nitin-pandey": 100000,
    "alex-chen": 80000,
    "elena-rostova": 120000,
    "rohan-verma": 90000,
  });
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskProblemId, setNewTaskProblemId] = useState("T1-2");
  const [newTaskMemberId, setNewTaskMemberId] = useState("nitin-pandey");
  const [newTaskPriority, setNewTaskPriority] = useState<"Critical" | "High" | "Medium">("High");

  // Auditor state
  const [auditorNotice, setAuditorNotice] = useState<string | null>(null);

  // Sync audit queue
  useEffect(() => {
    setAuditQueue(getAuditQueue());
    const handleUpdate = () => setAuditQueue(getAuditQueue());
    window.addEventListener("proofstack:audit-queue-updated", handleUpdate);
    window.addEventListener("proofstack:ledger-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("proofstack:audit-queue-updated", handleUpdate);
      window.removeEventListener("proofstack:ledger-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Save assigned tasks to localStorage
  const saveAssignedTasks = (tasks: AssignedTask[]) => {
    setAssignedTasks(tasks);
    if (typeof window !== "undefined") {
      localStorage.setItem("proofstack_assigned_tasks", JSON.stringify(tasks));
    }
  };

  // Auth redirect
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || !session)) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isInitialized, isAuthenticated, session, router]);

  if (!isInitialized || !isAuthenticated || !session) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div className="mono" style={{ fontSize: "13px", color: "var(--ink2)" }}>
          Loading ProofStack workspace…
        </div>
      </div>
    );
  }

  const roleDef = ROLES[role] || ROLES.developer;

  // Super Admin handlers
  const handleTogglePolicyOverride = () => {
    const next = !policyOverrideActive;
    setPolicyOverrideActive(next);
    setSuperAdminNotice(
      next
        ? "⚠️ Emergency Policy Override ACTIVE: Gate G3 tenant invariant & Gate G4 watchdog bypass enabled."
        : "✓ Policy Override Disengaged: Standard Zero-Compromise Invariant (8/8 Gates) enforced."
    );
    setTimeout(() => setSuperAdminNotice(null), 4000);
  };

  const handleToggleAdminStatus = (adminId: string) => {
    setWorkspaceAdmins((prev) =>
      prev.map((a) =>
        a.id === adminId
          ? { ...a, status: a.status === "active" ? "suspended" : "active" }
          : a
      )
    );
    setSuperAdminNotice("Workspace Admin governance record updated.");
    setTimeout(() => setSuperAdminNotice(null), 3000);
  };

  // Workspace Admin Task Assignment
  const handleCreateAssignedTask = (e: React.FormEvent) => {
    e.preventDefault();
    const prob = MOCK_CATALOG.find((p) => p.id === newTaskProblemId) || MOCK_CATALOG[0];
    const member = allMembers.find((m) => m.id === newTaskMemberId) || allMembers[3];
    const newTask: AssignedTask = {
      id: `task-${Date.now().toString().slice(-4)}`,
      problemId: prob.id,
      problemTitle: prob.title,
      filename: prob.filename || "file.py",
      assignedToMemberId: member.id,
      assignedToName: member.name,
      assignedToAvatar: member.avatar,
      priority: newTaskPriority,
      status: "Assigned",
      speedupTarget: prob.metrics?.safe.delta || "+65.0%",
    };
    saveAssignedTasks([newTask, ...assignedTasks]);
    setIsAddTaskModalOpen(false);
    setAdminNotice(`Assigned benchmark fixture ${prob.id} to ${member.name} (${member.avatar}).`);
    setTimeout(() => setAdminNotice(null), 4000);
  };

  // Auditor approval actions
  const handleAuditorApprove = async (auditId: string) => {
    try {
      const { block } = await approveAndSealPatch(auditId, activeMember.name);
      setAuditorNotice(`🛡️ Patch Approved & Sealed into SHA-256 Evidence Ledger (Block #${block.index})!`);
      setTimeout(() => setAuditorNotice(null), 4000);
    } catch (err: any) {
      setAuditorNotice("Error sealing patch: " + err.message);
      setTimeout(() => setAuditorNotice(null), 4000);
    }
  };

  const handleAuditorReject = (auditId: string) => {
    rejectAuditPatch(auditId, activeMember.name, "Gate G3 boundary violation flagged by security auditor");
    setAuditorNotice("Patch rejected and returned to developer with counterexample feedback.");
    setTimeout(() => setAuditorNotice(null), 4000);
  };

  // Developer tasks (filtered for active developer)
  const myAssignedTasks = assignedTasks.filter(
    (t) => t.assignedToMemberId === activeMember.id
  );

  return (
    <div style={{ maxWidth: "100%", paddingBottom: "40px" }}>
      {/* 1. Header Banner & Team Persona Context */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "16px",
          border: "1px solid color-mix(in srgb, var(--brand) 30%, var(--line))",
          background: "color-mix(in srgb, var(--brand) 4%, var(--surface))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1,
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {activeMember.avatar}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="chip brand" style={{ fontSize: "10px", fontWeight: 700 }}>
                {roleDef.label.toUpperCase()}
              </span>
              <b style={{ fontSize: "16px", color: "var(--ink)" }}>{activeMember.name}</b>
              <span style={{ fontSize: "12px", color: "var(--ink2)" }}>· {activeMember.title}</span>
            </div>
            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{activeMember.email}</span>
              <span>·</span>
              <span>{activeMember.department}</span>
              <span>·</span>
              <span className="chip" style={{ fontSize: "10px" }}>
                {role === "super_admin"
                  ? "👑 Global Fleet Root"
                  : role === "admin"
                  ? "⚙️ Operations & Governance"
                  : role === "developer"
                  ? "👨‍💻 Engineering Sandbox"
                  : "🛡️ Audit & Formal Verification"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {role === "developer" && (
            <button
              type="button"
              className="btn sm"
              onClick={() => router.push("/studio?problem=T1-2")}
            >
              Open Studio Code Editor →
            </button>
          )}
          {role === "auditor" && (
            <button
              type="button"
              className="btn sm"
              onClick={() => router.push("/ledger")}
            >
              Open Cryptographic Ledger →
            </button>
          )}
          {role === "admin" && (
            <button
              type="button"
              className="btn sm"
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              + Assign Task to Developer
            </button>
          )}
          {role === "super_admin" && (
            <button
              type="button"
              className={`btn sm ${policyOverrideActive ? "danger" : "sec"}`}
              onClick={handleTogglePolicyOverride}
            >
              {policyOverrideActive ? "Disengage Policy Override" : "Emergency Policy Override (G0–G7)"}
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: 👑 SUPER ADMIN DEDICATED FLEET HEALTH & GOVERNANCE DASHBOARD
         ========================================================================= */}
      {role === "super_admin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Super Admin Notice Banner */}
          {superAdminNotice && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: policyOverrideActive ? "color-mix(in srgb, var(--fail) 10%, var(--surface))" : "color-mix(in srgb, var(--pass) 10%, var(--surface))",
                border: policyOverrideActive ? "1px solid var(--fail)" : "1px solid var(--pass)",
                color: "var(--ink)",
                fontSize: "12.5px",
                animation: "fadeIn 120ms ease",
              }}
            >
              {superAdminNotice}
            </div>
          )}

          {/* Top Row: NERA/SonarQube SVG Circular Donut Ring + Fleet Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "16px" }}>
            {/* SVG Donut Health Ring */}
            <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
                <svg width="130" height="130" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--pass)"
                    strokeWidth="12"
                    strokeDasharray="314.159"
                    strokeDashoffset="1.88" // 99.4%
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <b style={{ fontSize: "22px", color: "var(--ink)" }}>99.4%</b>
                  <span style={{ fontSize: "9px", color: "var(--ink2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Fleet Health
                  </span>
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ fontSize: "10px", color: "var(--brand)" }}>
                  GLOBAL PLATFORM INTEGRITY
                </div>
                <h3 style={{ margin: "2px 0 6px", fontSize: "16px" }}>Zero-Compromise Invariants Enforced</h3>
                <p style={{ fontSize: "12px", color: "var(--ink2)", margin: 0, lineHeight: 1.5 }}>
                  14 verification pipelines active across 3 tenants. Zero network egress leaks, zero IDOR breaches, and deterministic microVM isolation.
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <span className="chip pass" style={{ fontSize: "10.5px" }}>Gate G0–G7 Strict</span>
                  <span className="chip" style={{ fontSize: "10.5px" }}>Nebius Cloud L40S</span>
                  <span className="chip brand" style={{ fontSize: "10.5px" }}>Firecracker MicroVM</span>
                </div>
              </div>
            </div>

            {/* Global Token Spend & MicroVM Pool Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="card" style={{ padding: "16px" }}>
                <div className="eyebrow" style={{ fontSize: "9.5px" }}>GLOBAL TOKEN SPEND (NVIDIA NEMOTRON)</div>
                <div style={{ fontSize: "22px", fontWeight: 700, margin: "6px 0 2px" }}>
                  1.42M <small style={{ fontSize: "13px", color: "var(--ink2)" }}>/ 2.0M</small>
                </div>
                <div style={{ width: "100%", height: "6px", background: "var(--surface2)", borderRadius: "3px", overflow: "hidden", margin: "8px 0" }}>
                  <div style={{ width: "71%", height: "100%", background: "var(--brand)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--ink2)" }}>
                  <span>71.0% allocated</span>
                  <span style={{ color: "var(--pass)" }}>Budget Healthy ✓</span>
                </div>
              </div>

              <div className="card" style={{ padding: "16px" }}>
                <div className="eyebrow" style={{ fontSize: "9.5px" }}>MICROVM FIRECRACKER POOL</div>
                <div style={{ fontSize: "22px", fontWeight: 700, margin: "6px 0 2px", color: "var(--pass)" }}>
                  16 / 16 <small style={{ fontSize: "13px", color: "var(--ink)" }}>Sandboxes</small>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink2)" }}>Avg Boot Latency:</span>
                    <b>12ms (Kernel 6.6)</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink2)" }}>Network Egress:</span>
                    <b style={{ color: "var(--pass)" }}>0 bytes (Airgapped)</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink2)" }}>Queue Backpressure:</span>
                    <b>0ms</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Table: Super Admin Controls Workspace Admins */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <b style={{ fontSize: "14px", color: "var(--ink)" }}>Workspace Admins &amp; Governance Control</b>
                <div style={{ fontSize: "11.5px", color: "var(--ink2)" }}>
                  Root Super Admin authority to provision, suspend, or audit delegated Workspace Admins.
                </div>
              </div>
              <span className="chip brand" style={{ fontSize: "10px" }}>Root Authority: Dr. Sarah Lin</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left", color: "var(--ink2)" }}>
                    <th style={{ padding: "8px 10px" }}>ADMIN PERSONA</th>
                    <th style={{ padding: "8px 10px" }}>TENANT DELEGATION</th>
                    <th style={{ padding: "8px 10px" }}>TOKEN CEILING</th>
                    <th style={{ padding: "8px 10px" }}>STATUS</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaceAdmins.map((adm) => (
                    <tr key={adm.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "18px" }}>{adm.avatar}</span>
                          <div>
                            <b>{adm.name}</b>
                            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)" }}>{adm.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        Operations &amp; Budget Tenant
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span className="mono">{adm.quotas}</span>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span className={`chip ${adm.status === "active" ? "pass" : "fail"}`} style={{ fontSize: "10px" }}>
                          {adm.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <button
                          type="button"
                          className={`btn sm ${adm.status === "active" ? "sec" : "acc"}`}
                          onClick={() => handleToggleAdminStatus(adm.id)}
                          style={{ fontSize: "11px", height: "26px", padding: "0 10px" }}
                        >
                          {adm.status === "active" ? "Suspend Admin" : "Reactivate Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: ⚙️ WORKSPACE ADMIN DEDICATED TEAM MANAGEMENT & TASK CORRIDOR
         ========================================================================= */}
      {role === "admin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Admin Notice */}
          {adminNotice && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "color-mix(in srgb, var(--pass) 10%, var(--surface))",
                border: "1px solid var(--pass)",
                color: "var(--ink)",
                fontSize: "12.5px",
                animation: "fadeIn 120ms ease",
              }}
            >
              ✓ {adminNotice}
            </div>
          )}

          {/* Interactive Token Budget Sliders per Team Member */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <b style={{ fontSize: "14px", color: "var(--ink)" }}>Team Token Budget Allocation</b>
                <div style={{ fontSize: "11.5px", color: "var(--ink2)" }}>
                  Dynamically adjust NVIDIA Nemotron token quotas for Developers and Security Auditors.
                </div>
              </div>
              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  setAdminNotice("Token quota revisions successfully committed across microVM boundaries.");
                  setTimeout(() => setAdminNotice(null), 3000);
                }}
              >
                Save All Quotas
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
              {[
                { id: "nitin-pandey", name: "Nitin Pandey", role: "Lead Developer", avatar: "👨‍💻", min: 40000, max: 200000 },
                { id: "alex-chen", name: "Alex Chen", role: "Full-Stack Dev", avatar: "🚀", min: 40000, max: 200000 },
                { id: "elena-rostova", name: "Elena Rostova", role: "Principal Auditor", avatar: "🛡️", min: 20000, max: 150000 },
                { id: "rohan-verma", name: "Rohan Verma", role: "DAST Auditor", avatar: "🔍", min: 20000, max: 150000 },
              ].map((m) => {
                const quota = memberQuotas[m.id] || 80000;
                return (
                  <div
                    key={m.id}
                    style={{
                      padding: "12px 14px",
                      background: "var(--surface2)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{m.avatar}</span>
                        <div>
                          <b style={{ fontSize: "12.5px" }}>{m.name}</b>
                          <div style={{ fontSize: "10.5px", color: "var(--ink2)" }}>{m.role}</div>
                        </div>
                      </div>
                      <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)" }}>
                        {quota.toLocaleString()} tok
                      </span>
                    </div>

                    <input
                      type="range"
                      min={m.min}
                      max={m.max}
                      step="5000"
                      value={quota}
                      onChange={(e) =>
                        setMemberQuotas({ ...memberQuotas, [m.id]: parseInt(e.target.value) })
                      }
                      style={{ width: "100%", accentColor: "var(--brand)", cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--ink3)", marginTop: "2px" }}>
                      <span>Min: {m.min.toLocaleString()}</span>
                      <span>Max: {m.max.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task & Project Allocation Corridor */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <b style={{ fontSize: "14px", color: "var(--ink)" }}>Task &amp; Project Allocation Corridor</b>
                <div style={{ fontSize: "11.5px", color: "var(--ink2)" }}>
                  Assign industrial benchmark optimization tasks to specific Developers and Auditors.
                </div>
              </div>
              <button
                type="button"
                className="btn sm"
                onClick={() => setIsAddTaskModalOpen(true)}
              >
                + Assign New Task
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left", color: "var(--ink2)" }}>
                    <th style={{ padding: "8px 10px" }}>BENCHMARK FIXTURE</th>
                    <th style={{ padding: "8px 10px" }}>ASSIGNED TEAM MEMBER</th>
                    <th style={{ padding: "8px 10px" }}>PRIORITY</th>
                    <th style={{ padding: "8px 10px" }}>SPEEDUP TARGET</th>
                    <th style={{ padding: "8px 10px" }}>STATUS</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTasks.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="chip brand" style={{ fontSize: "9.5px", padding: "1px 5px" }}>
                            {t.problemId}
                          </span>
                          <b style={{ fontSize: "12px" }}>{t.filename}</b>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>
                          {t.problemTitle}
                        </div>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "16px" }}>{t.assignedToAvatar}</span>
                          <b>{t.assignedToName}</b>
                        </div>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span className={`chip ${t.priority === "Critical" ? "fail" : t.priority === "High" ? "warn" : "brand"}`} style={{ fontSize: "10px" }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 600 }}>
                          {t.speedupTarget}
                        </span>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span className={`chip ${t.status === "Completed" ? "pass" : t.status === "Audit Pending" ? "brand" : ""}`} style={{ fontSize: "10px" }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn sm sec"
                          onClick={() => router.push(`/studio?problem=${t.problemId}`)}
                          style={{ fontSize: "11px", height: "26px", padding: "0 8px" }}
                        >
                          View in Studio →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: 👨‍💻 DEVELOPER DEDICATED CODING, SPEEDUP & AUDIT SUBMISSION DASHBOARD
         ========================================================================= */}
      {role === "developer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Developer Quick Metrics: Latency reduction bar & status */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: "16px" }}>
            {/* Visual Latency Reduction Bar Card */}
            <div className="card" style={{ padding: "18px" }}>
              <div className="eyebrow" style={{ fontSize: "10px", color: "var(--brand)" }}>
                VERIFIED PERFORMANCE GAIN (ORDERS.PY)
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0 12px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--pass)" }}>+74.2%</span>
                <span style={{ fontSize: "14px", color: "var(--ink2)" }}>latency reduction</span>
              </div>

              {/* Visual comparison bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "3px" }}>
                    <span>Baseline (N+1 Query Explosion)</span>
                    <b className="mono" style={{ color: "var(--fail)" }}>428 ms (5,001 SQL queries)</b>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--surface2)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: "100%", background: "var(--fail)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "3px" }}>
                    <span>Safe Candidate (Joinedload Eager Fetch)</span>
                    <b className="mono" style={{ color: "var(--pass)" }}>12 ms (1 SQL query)</b>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--surface2)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "2.8%", height: "100%", background: "var(--pass)", minWidth: "12px" }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => router.push("/studio?problem=T1-2")}
                >
                  Inspect in Studio Monaco Split Diff →
                </button>
              </div>
            </div>

            {/* Quick Sandbox Launcher & Patch Referral Tracker */}
            <div className="card" style={{ padding: "18px" }}>
              <div className="eyebrow" style={{ fontSize: "10px" }}>MY SUBMITTED PATCHES &amp; AUDIT PIPELINE</div>
              <h3 style={{ margin: "4px 0 10px", fontSize: "15px" }}>Referred to Security Auditor Queue</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {auditQueue.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      background: "var(--surface2)",
                      border: "1px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="chip brand" style={{ fontSize: "9px" }}>{item.problemId}</span>
                        <b style={{ fontSize: "12px" }}>{item.filename}</b>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>
                        Speedup: <span className="mono" style={{ color: "var(--pass)" }}>{item.speedupDelta}</span> · {item.gatesPassed}
                      </div>
                    </div>

                    <span
                      className={`chip ${
                        item.status === "SEALED_AND_DEPLOYED"
                          ? "pass"
                          : item.status === "REJECTED"
                          ? "fail"
                          : "warn"
                      }`}
                      style={{ fontSize: "10px", fontWeight: 700 }}
                    >
                      {item.status === "SEALED_AND_DEPLOYED"
                        ? "✓ SEALED TO LEDGER"
                        : item.status === "REJECTED"
                        ? "✕ REJECTED"
                        : "⏳ PENDING AUDIT"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Assigned Optimization Tasks Table */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <b style={{ fontSize: "14px", color: "var(--ink)" }}>My Assigned Optimization Tasks</b>
                <div style={{ fontSize: "11.5px", color: "var(--ink2)" }}>
                  Tasks allocated specifically to {activeMember.name} ({activeMember.avatar}).
                </div>
              </div>
              <span className="chip brand" style={{ fontSize: "10.5px" }}>{myAssignedTasks.length} Assigned</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left", color: "var(--ink2)" }}>
                    <th style={{ padding: "8px 10px" }}>BENCHMARK PROBLEM</th>
                    <th style={{ padding: "8px 10px" }}>TARGET FILE</th>
                    <th style={{ padding: "8px 10px" }}>PRIORITY</th>
                    <th style={{ padding: "8px 10px" }}>SPEEDUP GOAL</th>
                    <th style={{ padding: "8px 10px" }}>STATUS</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>LAUNCH</th>
                  </tr>
                </thead>
                <tbody>
                  {myAssignedTasks.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "11px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="chip brand" style={{ fontSize: "9.5px", padding: "1px 5px" }}>
                            {t.problemId}
                          </span>
                          <b>{t.problemTitle}</b>
                        </div>
                      </td>
                      <td style={{ padding: "11px 10px" }}>
                        <span className="chip mono" style={{ fontSize: "11px" }}>{t.filename}</span>
                      </td>
                      <td style={{ padding: "11px 10px" }}>
                        <span className={`chip ${t.priority === "Critical" ? "fail" : t.priority === "High" ? "warn" : "brand"}`} style={{ fontSize: "10px" }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: "11px 10px" }}>
                        <span className="mono" style={{ color: "var(--pass)", fontWeight: 600 }}>{t.speedupTarget}</span>
                      </td>
                      <td style={{ padding: "11px 10px" }}>
                        <span className={`chip ${t.status === "Completed" ? "pass" : t.status === "Audit Pending" ? "brand" : ""}`} style={{ fontSize: "10px" }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: "11px 10px", textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => router.push(`/studio?problem=${t.problemId}`)}
                          style={{ fontSize: "11px", height: "26px", padding: "0 10px" }}
                        >
                          Open in Studio ↵
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: 🛡️ SECURITY AUDITOR DEDICATED APPROVAL QUEUE & LEDGER VERIFICATION
         ========================================================================= */}
      {role === "auditor" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Auditor Notice Banner */}
          {auditorNotice && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "color-mix(in srgb, var(--pass) 10%, var(--surface))",
                border: "1px solid var(--pass)",
                color: "var(--ink)",
                fontSize: "12.5px",
                animation: "fadeIn 120ms ease",
              }}
            >
              {auditorNotice}
            </div>
          )}

          {/* Pending Developer Patch Approvals Queue (TOP SECTION) */}
          <div className="card" style={{ padding: "18px", border: "1px solid color-mix(in srgb, var(--brand) 40%, var(--line))" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <div className="eyebrow" style={{ fontSize: "10px", color: "var(--brand)" }}>
                  APPROVAL HANDOFF PIPELINE
                </div>
                <h3 style={{ margin: "2px 0 0", fontSize: "16px", color: "var(--ink)" }}>
                  Pending Developer Patch Approvals
                </h3>
              </div>
              <span className="chip brand" style={{ fontSize: "10px" }}>
                Auditor: {activeMember.name} ({activeMember.avatar})
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {auditQueue.map((item) => {
                const isPending = item.status === "PENDING_AUDIT";
                const isSealed = item.status === "SEALED_AND_DEPLOYED";

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: isPending
                        ? "color-mix(in srgb, var(--brand) 5%, var(--surface))"
                        : "var(--surface2)",
                      border: isPending
                        ? "1.5px solid color-mix(in srgb, var(--brand) 40%, var(--line))"
                        : "1px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{item.developerAvatar}</span>
                        <b style={{ fontSize: "13.5px" }}>Submitted by {item.developerName}</b>
                        <span style={{ fontSize: "12px", color: "var(--ink2)" }}>· {item.filename}</span>
                        <span className="chip pass" style={{ fontSize: "10px", fontWeight: 700 }}>
                          {item.speedupDelta} speedup
                        </span>
                        <span className="chip" style={{ fontSize: "10px" }}>{item.gatesPassed}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
                        {item.problemTitle} (Latency: {item.latencyBefore} → {item.latencyAfter})
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => handleAuditorApprove(item.id)}
                            style={{
                              background: "var(--pass)",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "11.5px",
                              height: "30px",
                              padding: "0 12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <svg className="i" style={{ width: "13px", height: "13px" }} viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            🛡️ Audit OK — Approve &amp; Seal to Ledger
                          </button>
                          <button
                            type="button"
                            className="btn sm danger"
                            onClick={() => handleAuditorReject(item.id)}
                            style={{ fontSize: "11.5px", height: "30px", padding: "0 10px" }}
                          >
                            Reject &amp; Return
                          </button>
                        </>
                      ) : isSealed ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="chip pass" style={{ fontSize: "11px", fontWeight: 700 }}>
                            ✓ SEALED TO LEDGER (Block #{item.sealedBlockIndex ?? 5})
                          </span>
                          <button
                            type="button"
                            className="btn sm sec"
                            onClick={() => router.push("/ledger")}
                            style={{ fontSize: "11px", height: "26px", padding: "0 8px" }}
                          >
                            View Block →
                          </button>
                        </div>
                      ) : (
                        <span className="chip fail" style={{ fontSize: "11px" }}>
                          REJECTED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DAST Scanner & Vulnerability Severity Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "16px" }}>
            {/* Vulnerability Severity Breakdown Bars */}
            <div className="card" style={{ padding: "18px" }}>
              <div className="eyebrow" style={{ fontSize: "10px" }}>VULNERABILITY SEVERITY BREAKDOWN</div>
              <h3 style={{ margin: "4px 0 12px", fontSize: "15px" }}>Active Findings Fleet</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Critical", count: 0, color: "var(--fail)", width: "0%" },
                  { label: "High (CSP, Key Literal, DOM-XSS)", count: 3, color: "var(--fail)", width: "60%" },
                  { label: "Medium (Cookie, Wildcard)", count: 4, color: "var(--warn)", width: "80%" },
                  { label: "Low (Version Disclosure)", count: 1, color: "var(--brand)", width: "20%" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "3px" }}>
                      <span>{s.label}</span>
                      <b>{s.count} findings</b>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "var(--surface2)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: s.width, height: "100%", background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn sm sec"
                  onClick={() => router.push("/findings")}
                  style={{ width: "100%" }}
                >
                  Inspect All 8 Findings in DAST Console →
                </button>
              </div>
            </div>

            {/* SHA-256 Merkle Chain Integrity Status */}
            <div className="card" style={{ padding: "18px" }}>
              <div className="eyebrow" style={{ fontSize: "10px" }}>CRYPTOGRAPHIC PROOF &amp; TAMPER STATUS</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 10px" }}>
                <h3 style={{ margin: 0, fontSize: "15px" }}>SHA-256 Merkle Chain Integrity</h3>
                <span className={`chip ${isTampered ? "fail" : "pass"}`} style={{ fontSize: "10.5px", fontWeight: 700 }}>
                  {isTampered ? "TAMPER ALERT DETECTED" : "CHAIN VALID (100%)"}
                </span>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--line)", marginBottom: "12px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--ink2)" }}>Genesis Block:</span>
                  <span className="mono">0000000000000000…</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--ink2)" }}>Current Chain Head:</span>
                  <span className="mono">b3e94a8f12345678… (Block #5)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink2)" }}>Signing Authority:</span>
                  <b>Nebius Token Factory / NVIDIA Nemotron</b>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={`btn sm ${isTampered ? "danger" : "sec"}`}
                  onClick={() => setIsTampered(!isTampered)}
                >
                  {isTampered ? "Restore Authentic Chain" : "Simulate Tamper on Block #2"}
                </button>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => router.push("/ledger")}
                >
                  Open Full Ledger View →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Workspace Admin Task Assignment */}
      {isAddTaskModalOpen && (
        <div
          onClick={() => setIsAddTaskModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.48)",
            display: "grid",
            placeItems: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "22px 24px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              background: "var(--surface)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <b style={{ fontSize: "16px" }}>Assign Benchmark Task to Team Member</b>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setIsAddTaskModalOpen(false)}
                style={{ width: "26px", height: "26px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignedTask} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="field">
                <label>Select 19-Problem Benchmark</label>
                <select
                  value={newTaskProblemId}
                  onChange={(e) => setNewTaskProblemId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "6px",
                    padding: "0 10px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                  }}
                >
                  {MOCK_CATALOG.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id}: {p.title} ({p.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Assign To Developer / Team Member</label>
                <select
                  value={newTaskMemberId}
                  onChange={(e) => setNewTaskMemberId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "6px",
                    padding: "0 10px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                  }}
                >
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} {m.name} — {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Priority Tier</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "6px",
                    padding: "0 10px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                  }}
                >
                  <option value="Critical">Critical Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn sm sec"
                  onClick={() => setIsAddTaskModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn sm">
                  Assign &amp; Dispatch Task ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
