"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/roles";

interface TeamMember {
  id: string;
  name: string;
  roleTitle: string;
  roleKey: "developer" | "auditor" | "admin" | "super_admin";
  email: string;
  tasksExecuted: number;
  contributionTime: string;
  tokensConsumed: number;
  tokenQuota: number;
  status: "Active" | "Suspended";
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "mem_1",
    name: "Nitin Pandey",
    roleTitle: "Lead Developer",
    roleKey: "developer",
    email: "developer@perfproof.internal",
    tasksExecuted: 14,
    contributionTime: "4h 18m",
    tokensConsumed: 48200,
    tokenQuota: 80000,
    status: "Active",
  },
  {
    id: "mem_2",
    name: "Elena Rostova",
    roleTitle: "Security Auditor",
    roleKey: "auditor",
    email: "auditor@perfproof.internal",
    tasksExecuted: 9,
    contributionTime: "2h 40m",
    tokensConsumed: 12400,
    tokenQuota: 30000,
    status: "Active",
  },
  {
    id: "mem_3",
    name: "Marcus Vance",
    roleTitle: "Operations Admin",
    roleKey: "admin",
    email: "admin@perfproof.internal",
    tasksExecuted: 6,
    contributionTime: "1h 55m",
    tokensConsumed: 19000,
    tokenQuota: 50000,
    status: "Active",
  },
];

export default function ControlPlanePage() {
  const { role } = useAuth();
  const [maxIterations, setMaxIterations] = useState<number>(3);
  const [isEditingIterations, setIsEditingIterations] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string>("");

  // Members state
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState<boolean>(false);

  // New member form state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"developer" | "auditor" | "admin">("developer");
  const [newMemberQuota, setNewMemberQuota] = useState(60000);

  // SuperAdmin Emergency Override State
  const [policyOverrideActive, setPolicyOverrideActive] = useState(false);

  const isSuperAdmin = role === "super_admin";
  const isAdminOrSuper = role === "admin" || role === "super_admin";

  const handleSaveIterations = (val: number) => {
    setMaxIterations(val);
    setIsEditingIterations(false);
    showNotice(`Policy update committed: Max Patch Iterations = ${val}`);
  };

  const showNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(""), 3500);
  };

  const handleQuotaChange = (id: string, newQuota: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, tokenQuota: newQuota } : m))
    );
  };

  const handleSaveMemberQuota = (m: TeamMember) => {
    showNotice(`Saved token quota for ${m.name}: ${m.tokenQuota.toLocaleString()} tokens.`);
  };

  const handleToggleSuspend = (id: string) => {
    if (!isSuperAdmin) {
      showNotice("Permission Denied: Only Super Admin can suspend team accounts.");
      return;
    }
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === "Active" ? "Suspended" : "Active";
          showNotice(`User account ${m.name} is now ${nextStatus}.`);
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newMem: TeamMember = {
      id: `mem_${Date.now()}`,
      name: newMemberName,
      roleTitle:
        newMemberRole === "developer"
          ? "Lead Developer"
          : newMemberRole === "auditor"
          ? "Security Auditor"
          : "Operations Admin",
      roleKey: newMemberRole,
      email: newMemberEmail,
      tasksExecuted: 0,
      contributionTime: "0h 00m",
      tokensConsumed: 0,
      tokenQuota: newMemberQuota,
      status: "Active",
    };

    setMembers([...members, newMem]);
    setIsAllotModalOpen(false);
    setNewMemberName("");
    setNewMemberEmail("");
    showNotice(`New credentials allotted for ${newMem.name} (${newMem.email}).`);
  };

  return (
    <div style={{ paddingBottom: "32px" }}>
      {/* Header (PDF p. 30) */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">Enterprise Governance</div>
          <h1 className="h1" style={{ marginTop: "6px" }}>
            {isSuperAdmin ? "SuperAdmin Control Plane" : "Admin Operations & Budget Console"}
          </h1>
          <p>
            Global token budgets, isolated sandbox microVM pool telemetry, team quota management &amp; tenant boundaries
          </p>
        </div>
        <div className="r" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isAdminOrSuper && (
            <button
              type="button"
              className="btn"
              onClick={() => setIsAllotModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
            >
              <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Allot New User Credentials
            </button>
          )}

          <span
            className="chip brand"
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSuperAdmin ? "🏢 Global Root Workspace" : "⚙️ Operations Workspace"}
          </span>
        </div>
      </div>

      {savedNotice && (
        <div
          style={{
            border: "1px solid var(--pass)",
            background: "color-mix(in srgb, var(--pass) 10%, var(--surface))",
            color: "var(--pass)",
            borderRadius: "7px",
            padding: "10px 16px",
            marginBottom: "16px",
            fontSize: "12.5px",
            fontFamily: "var(--f-mono)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>✓ {savedNotice}</span>
          <button
            type="button"
            onClick={() => setSavedNotice("")}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* SuperAdmin Emergency Policy Override Banner */}
      {isSuperAdmin && (
        <div
          style={{
            border: policyOverrideActive
              ? "1px solid var(--fail)"
              : "1px solid color-mix(in srgb, var(--brand) 40%, var(--line))",
            background: policyOverrideActive
              ? "color-mix(in srgb, var(--fail) 10%, var(--surface))"
              : "color-mix(in srgb, var(--brand) 6%, var(--surface))",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: policyOverrideActive ? "var(--fail)" : "var(--brand)" }}>
              <svg className="i" viewBox="0 0 24 24" style={{ width: "22px", height: "22px" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <b style={{ fontSize: "13.5px", display: "block" }}>
                Super Admin Emergency Invariant &amp; Policy Control
              </b>
              <span className="sub" style={{ fontSize: "12px" }}>
                {policyOverrideActive
                  ? "EMERGENCY OVERRIDE ENGAGED: Global gate bypass permitted for disaster recovery. All actions written to immutable audit trail."
                  : "All cryptographic gates (G0–G7) are locked by system invariant. Standard zero-compromise enforcement."}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className={`btn ${policyOverrideActive ? "danger" : "sec"}`}
              onClick={() => {
                setPolicyOverrideActive(!policyOverrideActive);
                showNotice(
                  !policyOverrideActive
                    ? "SUPER ADMIN EMERGENCY OVERRIDE ENGAGED."
                    : "Standard Safety Invariant Enforcement Restored."
                );
              }}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              {policyOverrideActive ? "Disengage Emergency Override" : "Engage Emergency Override"}
            </button>
          </div>
        </div>
      )}

      {/* 3 Responsive Governance Panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          alignItems: "start",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Panel 1: Policy & token budgets */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row" style={{ marginBottom: "6px" }}>
            <span style={{ color: "var(--brand)" }}>
              <svg className="i" viewBox="0 0 24 24">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            </span>
            <h3 style={{ margin: 0, fontSize: "14px" }}>Policy &amp; token budgets</h3>
          </div>

          {/* Task Token Budget */}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span style={{ color: "var(--ink2)", fontSize: "12.5px" }}>Task Token Budget</span>
            <span className="mono" style={{ fontWeight: 600, fontSize: "12.5px" }}>
              120,000 tokens{" "}
              <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px", verticalAlign: "middle" }}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </div>
          <div className="sub" style={{ padding: "6px 0 4px", fontSize: "11px" }}>
            Locked Decision D8: Max 120,000 tokens per task
          </div>

          {/* Max Patch Iterations */}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span style={{ color: "var(--ink2)", fontSize: "12.5px" }}>Max Patch Iterations</span>
            {isEditingIterations ? (
              <div className="row" style={{ gap: "6px" }}>
                <input
                  type="number"
                  min={1}
                  max={5}
                  defaultValue={maxIterations}
                  id="iterations-input"
                  style={{
                    width: "48px",
                    height: "26px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    padding: "0 6px",
                    color: "var(--ink)",
                    fontFamily: "var(--f-mono)",
                    fontSize: "12px",
                  }}
                />
                <button
                  type="button"
                  className="btn sm"
                  style={{ height: "26px", padding: "0 8px" }}
                  onClick={() => {
                    const el = document.getElementById("iterations-input") as HTMLInputElement;
                    if (el) handleSaveIterations(parseInt(el.value) || 3);
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <span
                className="mono"
                onClick={() => isAdminOrSuper && setIsEditingIterations(true)}
                style={{
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: isAdminOrSuper ? "pointer" : "default",
                  color: isAdminOrSuper ? "var(--brand)" : "inherit",
                  textDecoration: isAdminOrSuper ? "underline" : "none",
                }}
                title={isAdminOrSuper ? "Click to edit" : "Configured"}
              >
                {maxIterations} attempts {isAdminOrSuper && "(edit)"}
              </span>
            )}
          </div>

          {/* Noise Threshold */}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span style={{ color: "var(--ink2)", fontSize: "12.5px" }}>Noise Threshold (τ_min)</span>
            <span className="mono" style={{ fontWeight: 600, fontSize: "12.5px" }}>
              5.0%
            </span>
          </div>

          {/* Memory Ceiling */}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span style={{ color: "var(--ink2)", fontSize: "12.5px" }}>Memory Ceiling</span>
            <span className="mono" style={{ fontWeight: 600, fontSize: "12.5px" }}>
              1,024 MB (cgroup max)
            </span>
          </div>

          {/* Network Egress */}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              padding: "10px 0",
            }}
          >
            <span style={{ color: "var(--ink2)", fontSize: "12.5px" }}>Network Egress</span>
            <span className="mono" style={{ fontWeight: 600, fontSize: "12.5px", color: "var(--pass)" }}>
              BLOCKED (Zero Egress)
            </span>
          </div>
        </div>

        {/* Panel 2: Sandbox microVM pool */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row" style={{ marginBottom: "12px" }}>
            <span style={{ color: "var(--brand)" }}>
              <svg className="i" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
            </span>
            <h3 style={{ margin: 0, fontSize: "14px" }}>Sandbox microVM pool</h3>
          </div>

          {/* Primary Backend */}
          <div
            style={{
              border: "1px solid color-mix(in srgb, var(--pass) 40%, var(--line))",
              borderRadius: "9px",
              padding: "13px 14px",
              background: "color-mix(in srgb, var(--pass) 5%, var(--surface))",
              marginBottom: "12px",
            }}
          >
            <div className="row">
              <b>Nebius Token Factory Sandbox</b>
              <span style={{ marginLeft: "auto" }}>
                <span className="chip pass">Active Pool (8 VM)</span>
              </span>
            </div>
            <div className="sub" style={{ marginTop: "3px", fontSize: "11.5px" }}>
              Primary Platform Backend · NVIDIA Nemotron 3
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginTop: "12px",
                fontSize: "11.5px",
              }}
            >
              <div>
                <div className="eyebrow" style={{ fontSize: "9px" }}>
                  ISOLATION
                </div>
                <b className="mono">microvm</b>
              </div>
              <div>
                <div className="eyebrow" style={{ fontSize: "9px" }}>
                  EGRESS
                </div>
                <b className="mono">none</b>
              </div>
              <div>
                <div className="eyebrow" style={{ fontSize: "9px" }}>
                  BOOT TIME
                </div>
                <b className="mono">180 ms</b>
              </div>
            </div>
          </div>

          {/* Fallback Backend */}
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: "9px",
              padding: "13px 14px",
              background: "var(--surface2)",
            }}
          >
            <div className="row">
              <b>Local Rootless Container</b>
              <span style={{ marginLeft: "auto" }}>
                <span className="chip warn">Standby</span>
              </span>
            </div>
            <div className="sub" style={{ marginTop: "3px", fontSize: "11.5px" }}>
              Fallback backend for air-gapped environments
            </div>
          </div>
        </div>

        {/* Panel 3: Locked invariant gates */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row" style={{ marginBottom: "6px" }}>
            <span style={{ color: "var(--brand)" }}>
              <svg className="i" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <h3 style={{ margin: 0, fontSize: "14px" }}>Locked invariant gates</h3>
          </div>
          <div className="sub" style={{ marginBottom: "8px", fontSize: "11.5px" }}>
            {isSuperAdmin
              ? "Super Admin control mode: gates require cryptographic quorum to unlock."
              : "Locked — Requires Super Admin Override to modify safety invariants."}
          </div>

          {/* Gate rows G0-G7 */}
          {[
            { id: "G0", name: "Pre-gate (Secrets & AST)" },
            { id: "G1", name: "Correctness (pytest unit/integration)" },
            { id: "G2", name: "Security (Exploit Oracle & IDOR)" },
            { id: "G3", name: "Identity Preserved" },
            { id: "G4", name: "Concurrency & Event Loop" },
            { id: "G5", name: "Performance (p95 latency threshold)" },
            { id: "G6", name: "Resources (Memory & CPU Ceiling)" },
            { id: "G7", name: "Patch Hygiene & Scope" },
          ].map((g) => (
            <div
              key={g.id}
              className="row"
              style={{
                padding: "7px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: "12px",
                color: "var(--ink)",
              }}
            >
              <span style={{ color: "var(--brand)" }}>
                <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span style={{ color: "var(--ink)" }}>
                <b className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{g.id}:</b> {g.name}
              </span>
              <span style={{ marginLeft: "auto" }} className="row">
                <span className="chip" style={{ fontSize: "9.5px", height: "18px" }}>
                  {policyOverrideActive ? "Override" : "Locked on"}
                </span>
                <div
                  className={`toggle on ${policyOverrideActive ? "" : "locked"}`}
                  title={isSuperAdmin ? "Super Admin override" : "Locked — Requires Super Admin Override"}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Token Usage & Contribution Audit Table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>
              Team Token Usage &amp; Contribution Audit
            </h3>
            <p className="sub" style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--ink2)" }}>
              Active developers, auditors, and admins with allocated token quotas and task execution metrics.
            </p>
          </div>
          {isAdminOrSuper && (
            <button
              type="button"
              className="btn sm"
              onClick={() => setIsAllotModalOpen(true)}
              style={{ cursor: "pointer" }}
            >
              + Allot New User Credentials
            </button>
          )}
        </div>

        <div className="table-responsive" style={{ maxWidth: "100%", overflowX: "auto" }}>
          <table className="t" style={{ width: "100%", minWidth: "640px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "150px" }}>Member Name &amp; Role</th>
                <th style={{ minWidth: "180px" }}>Email</th>
                <th>Tasks Executed</th>
                <th>Active Contribution</th>
                <th style={{ minWidth: "160px" }}>Tokens Consumed / Quota</th>
                <th style={{ minWidth: "190px" }}>Quota Allocation Slider</th>
                <th style={{ minWidth: "120px" }}>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const pct = Math.min(100, Math.round((m.tokensConsumed / m.tokenQuota) * 100));
                return (
                  <tr key={m.id} style={{ opacity: m.status === "Suspended" ? 0.6 : 1, color: "var(--ink)" }}>
                    <td style={{ maxWidth: "180px", overflow: "hidden" }}>
                      <b style={{ color: "var(--ink)", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.name}>
                        {m.name}
                      </b>
                      <div className="sub" style={{ fontSize: "11px", color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.roleTitle}
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: "12px", color: "var(--ink2)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.email}>
                      {m.email}
                    </td>
                    <td className="mono" style={{ fontSize: "12.5px", color: "var(--ink)" }}>{m.tasksExecuted} tasks</td>
                    <td className="mono" style={{ fontSize: "12.5px", color: "var(--ink)" }}>{m.contributionTime}</td>
                    <td>
                      <div className="mono" style={{ fontSize: "11.5px", marginBottom: "4px", color: "var(--ink)" }}>
                        <b style={{ color: "var(--ink)" }}>{m.tokensConsumed.toLocaleString()}</b> / {m.tokenQuota.toLocaleString()} ({pct}%)
                      </div>
                      <div
                        style={{
                          height: "6px",
                          width: "100%",
                          maxWidth: "140px",
                          background: "var(--surface2)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct > 85 ? "var(--fail)" : pct > 60 ? "var(--brand)" : "var(--pass)",
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="range"
                          min="10000"
                          max="200000"
                          step="5000"
                          value={m.tokenQuota}
                          disabled={!isAdminOrSuper || m.status === "Suspended"}
                          onChange={(e) => handleQuotaChange(m.id, parseInt(e.target.value))}
                          style={{ flex: 1, accentColor: "var(--brand)", cursor: isAdminOrSuper ? "pointer" : "not-allowed" }}
                        />
                        <span className="mono" style={{ fontSize: "11px", minWidth: "65px", textAlign: "right" }}>
                          {(m.tokenQuota / 1000).toFixed(0)}k tok
                        </span>
                        {isAdminOrSuper && (
                          <button
                            type="button"
                            className="btn sm sec"
                            onClick={() => handleSaveMemberQuota(m)}
                            style={{ padding: "2px 8px", fontSize: "11px", cursor: "pointer" }}
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className={`chip ${m.status === "Active" ? "pass" : "fail"}`}
                          style={{ fontSize: "10px", height: "20px" }}
                        >
                          {m.status}
                        </span>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            className={`btn sm ${m.status === "Active" ? "sec" : "acc"}`}
                            onClick={() => handleToggleSuspend(m.id)}
                            style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                              cursor: "pointer",
                              borderColor: m.status === "Active" ? "var(--fail)" : "var(--pass)",
                              color: m.status === "Active" ? "var(--fail)" : "inherit",
                            }}
                          >
                            {m.status === "Active" ? "Suspend" : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allot New User Credentials Modal */}
      {isAllotModalOpen && (
        <div
          className="scrim"
          onClick={() => setIsAllotModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 className="disp" style={{ fontSize: "18px", margin: 0, fontWeight: 700 }}>
                  Allot New User Credentials
                </h3>
                <span className="sub" style={{ fontSize: "12px" }}>
                  Provision developer, auditor, or admin credentials with token quota bounds.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAllotModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--ink2)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="field">
                <label>Full Member Name *</label>
                <div className="input">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div className="field">
                <label>Principal Corporate Email *</label>
                <div className="input mono">
                  <input
                    type="email"
                    required
                    placeholder="sconnor@perfproof.internal"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontFamily: "var(--f-mono)", fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div className="field">
                <label>Assigned RBAC Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  style={{
                    height: "36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "7px",
                    padding: "0 12px",
                    color: "var(--ink)",
                    fontSize: "13px",
                  }}
                >
                  <option value="developer">Lead Developer (Engineering Sandbox)</option>
                  <option value="auditor">Security Auditor (Compliance &amp; Tamper Audit)</option>
                  <option value="admin">Operations Admin (Token Budgets &amp; Triage)</option>
                </select>
              </div>

              <div className="field">
                <label>Initial Token Quota: {newMemberQuota.toLocaleString()} tokens</label>
                <input
                  type="range"
                  min="20000"
                  max="150000"
                  step="5000"
                  value={newMemberQuota}
                  onChange={(e) => setNewMemberQuota(parseInt(e.target.value))}
                  style={{ accentColor: "var(--brand)", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn sec"
                  onClick={() => setIsAllotModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn acc"
                >
                  Allot Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
