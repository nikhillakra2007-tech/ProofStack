"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import PublicHomePage from "./home/page";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isAuthenticated, isInitialized, role, canOverridePolicy } = useAuth();
  const { isTampered, setIsTampered, setIsCopilotOpen } = useTheme();

  // SuperAdmin interactive state
  const [policyOverrideActive, setPolicyOverrideActive] = useState(false);
  const [superAdminNotice, setSuperAdminNotice] = useState<string | null>(null);

  // Admin interactive state
  const [adminTokenQuotas, setAdminTokenQuotas] = useState({
    dev: 80000,
    auditor: 30000,
    ops: 50000,
  });
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Developer quick DAST scan state
  const [devScanUrl, setDevScanUrl] = useState("https://staging.perfproof.internal");
  const [isDevScanning, setIsDevScanning] = useState(false);

  // Auditor export state
  const [auditorNotice, setAuditorNotice] = useState<string | null>(null);

  // If not initialized yet, display minimal loader
  if (!isInitialized) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div className="mono" style={{ fontSize: "13px", color: "var(--ink2)" }}>
          Loading ProofStack workspace…
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users see the 14-Section Public Marketing Homepage
  if (!isAuthenticated || !session) {
    return <PublicHomePage />;
  }

  const roleDef = ROLES[role] || ROLES.developer;

  const handleOpenCockpit = () => {
    router.push("/cockpit/TASK9142");
  };

  const handleOpenPrimaryWorkspace = () => {
    router.push(roleDef.primaryRoute);
  };

  const handleViewFix = (findingId: string) => {
    router.push(`/findings?selected=${findingId}`);
  };

  const handleSendPrompt = (promptText: string) => {
    setIsCopilotOpen(true);
  };

  const handleTogglePolicyOverride = () => {
    const next = !policyOverrideActive;
    setPolicyOverrideActive(next);
    setSuperAdminNotice(
      next
        ? "Emergency Policy Override ACTIVE: Gate G3 & G4 bypass enabled for root incident recovery."
        : "Emergency Policy Override STANDBY: Standard Zero-Compromise Invariant enforced."
    );
    setTimeout(() => setSuperAdminNotice(null), 4000);
  };

  const handleSaveQuotas = () => {
    setAdminNotice("Updated team token budgets committed successfully.");
    setTimeout(() => setAdminNotice(null), 3000);
  };

  const handleTriggerDevScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devScanUrl.trim()) return;
    setIsDevScanning(true);
    setTimeout(() => {
      setIsDevScanning(false);
      router.push("/findings");
    }, 700);
  };

  const handleAuditorExport = (format: string) => {
    const text = `# ProofStack Compliance Ledger Export\nTenant: ${roleDef.tenantUuid}\nChain Status: ${isTampered ? "TAMPERED" : "VERIFIED (SHA-256)"}\nAudited by: ${session.email}\nDate: ${new Date().toISOString()}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compliance-audit-${format.toLowerCase()}.${format.toLowerCase() === "markdown" ? "md" : "txt"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setAuditorNotice(`Exported compliance audit report (${format}).`);
    setTimeout(() => setAuditorNotice(null), 3000);
  };

  return (
    <div>
      {/* Role Context Banner (Module 2 #4) */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          marginBottom: "16px",
          border: "1px solid color-mix(in srgb, var(--brand) 30%, var(--line))",
          background: "color-mix(in srgb, var(--brand) 4%, var(--surface))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="chip brand" style={{ fontWeight: 700, fontSize: "11px" }}>
            {roleDef.label.toUpperCase()}
          </span>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ink)" }}>
              {roleDef.roleTitle}
            </div>
            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>
              Identity: <span style={{ color: "var(--ink)" }}>{session.email}</span> · Tenant: <span style={{ color: "var(--brand)" }}>{roleDef.tenantUuid}</span> ({roleDef.tenantName})
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="btn sm sec"
            onClick={() => router.push("/home")}
            title="Switch to public marketing website"
          >
            Public Site ↗
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={handleOpenPrimaryWorkspace}
          >
            {roleDef.primaryButtonLabel} →
          </button>
        </div>
      </div>

      {/* Role-Specific Hero Widgets */}
      {/* 1. SUPER ADMIN EXCLUSIVE HERO PANEL */}
      {role === "super_admin" && (
        <div
          className="card"
          style={{
            padding: "16px 18px",
            marginBottom: "16px",
            border: policyOverrideActive ? "1px solid var(--fail)" : "1px solid var(--line)",
            background: policyOverrideActive ? "color-mix(in srgb, var(--fail) 6%, var(--surface))" : "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`chip ${policyOverrideActive ? "fail" : "brand"}`}>
                {policyOverrideActive ? "OVERRIDE ENGAGED" : "SUPER ADMIN CONSOLE"}
              </span>
              <b style={{ fontSize: "14px" }}>Emergency Governance &amp; Global Fleet Controls</b>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`btn sm ${policyOverrideActive ? "danger" : "sec"}`}
                onClick={handleTogglePolicyOverride}
              >
                {policyOverrideActive ? "Disengage Policy Override" : "Enable Emergency Policy Override"}
              </button>
              <button
                type="button"
                className="btn sm sec"
                onClick={() => router.push("/control-plane")}
              >
                Open Full Control Plane
              </button>
            </div>
          </div>

          {superAdminNotice && (
            <div className="mono" style={{ fontSize: "11.5px", color: policyOverrideActive ? "var(--fail)" : "var(--pass)", marginBottom: "10px" }}>
              {superAdminNotice}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", fontSize: "12px" }}>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Global Team Spend</div>
              <div style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0" }}>79,600 / 160k</div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>49.7% of monthly quota</div>
            </div>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>MicroVM Pool</div>
              <div style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0", color: "var(--pass)" }}>12 / 16 Idle</div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>Zero queue backpressure</div>
            </div>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Active Tasks</div>
              <div style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0" }}>4 Pipelines</div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>TASK9142 Verified</div>
            </div>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Ledger Health</div>
              <div style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0", color: isTampered ? "var(--fail)" : "var(--pass)" }}>
                {isTampered ? "INTEGRITY ALERT" : "100% VALID"}
              </div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>Head Block #5</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN EXCLUSIVE HERO PANEL */}
      {role === "admin" && (
        <div className="card" style={{ padding: "16px 18px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="chip brand">ADMIN CONSOLE</span>
              <b style={{ fontSize: "14px" }}>Token Budget Allocation &amp; Findings Triage</b>
            </div>
            <button type="button" className="btn sm" onClick={handleSaveQuotas}>
              Save Quota Updates
            </button>
          </div>

          {adminNotice && (
            <div className="mono" style={{ fontSize: "11.5px", color: "var(--pass)", marginBottom: "10px" }}>
              ✓ {adminNotice}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            <div style={{ padding: "12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <b>Lead Developer Quota</b>
                <span className="mono">{adminTokenQuotas.dev.toLocaleString()} tok</span>
              </div>
              <input
                type="range"
                min="40000"
                max="120000"
                step="5000"
                value={adminTokenQuotas.dev}
                onChange={(e) => setAdminTokenQuotas({ ...adminTokenQuotas, dev: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--brand)" }}
              />
            </div>

            <div style={{ padding: "12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <b>Security Auditor Quota</b>
                <span className="mono">{adminTokenQuotas.auditor.toLocaleString()} tok</span>
              </div>
              <input
                type="range"
                min="10000"
                max="60000"
                step="5000"
                value={adminTokenQuotas.auditor}
                onChange={(e) => setAdminTokenQuotas({ ...adminTokenQuotas, auditor: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--brand)" }}
              />
            </div>

            <div style={{ padding: "12px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <b>MicroVM Saturation</b>
                <span className="chip pass" style={{ fontSize: "10px" }}>Optimal (28%)</span>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "6px" }}>
                4 active sandboxes across 16 available rootless workers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DEVELOPER EXCLUSIVE HERO PANEL */}
      {role === "developer" && (
        <div className="card" style={{ padding: "16px 18px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="chip brand">DEVELOPER STUDIO LAUNCHER</span>
              <b style={{ fontSize: "14px" }}>Live Sandbox Synthesis &amp; DAST Dispatch</b>
            </div>
            <button type="button" className="btn sm" onClick={() => router.push("/studio")}>
              Open Studio Code Editor →
            </button>
          </div>

          <form onSubmit={handleTriggerDevScan} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="input" style={{ flex: 1, minWidth: "260px", height: "34px", padding: 0 }}>
              <input
                type="url"
                value={devScanUrl}
                onChange={(e) => setDevScanUrl(e.target.value)}
                placeholder="Enter live web app URL to scan..."
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  padding: "0 10px",
                  fontSize: "12.5px",
                  color: "var(--ink)",
                  fontFamily: "var(--f-mono)",
                }}
              />
            </div>
            <button type="submit" className="btn sm sec" disabled={isDevScanning}>
              {isDevScanning ? "Scanning..." : "Dispatch DAST Scan"}
            </button>
            <button type="button" className="btn sm sec" onClick={() => router.push("/studio?problem=T1-2")}>
              Load T1-2 (N+1 Query)
            </button>
            <button type="button" className="btn sm sec" onClick={() => router.push("/studio?problem=T1-3")}>
              Load T1-3 (IDOR Cache)
            </button>
          </form>
        </div>
      )}

      {/* 4. AUDITOR EXCLUSIVE HERO PANEL */}
      {role === "auditor" && (
        <div className="card" style={{ padding: "16px 18px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="chip brand">COMPLIANCE &amp; TAMPER AUDIT</span>
              <b style={{ fontSize: "14px" }}>Cryptographic Evidence Ledger Inspection</b>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`btn sm ${isTampered ? "danger" : "sec"}`}
                onClick={() => setIsTampered(!isTampered)}
              >
                {isTampered ? "Restore Clean Chain" : "Simulate Tamper on Block #2"}
              </button>
              <button
                type="button"
                className="btn sm sec"
                onClick={() => handleAuditorExport("Markdown")}
              >
                Export Audit Pack (.md)
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={() => router.push("/ledger")}
              >
                View Full Chain →
              </button>
            </div>
          </div>

          {auditorNotice && (
            <div className="mono" style={{ fontSize: "11.5px", color: "var(--pass)", marginBottom: "10px" }}>
              ✓ {auditorNotice}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "12px" }}>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Chain Integrity Status</div>
              <div style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0", color: isTampered ? "var(--fail)" : "var(--pass)" }}>
                {isTampered ? "HASH MISMATCH DETECTED" : "VERIFIED (SHA-256)"}
              </div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>6/6 sealed blocks checked</div>
            </div>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Read-Only Mode</div>
              <div style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0" }}>Enforced by Tenant Boundary</div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>Code write &amp; execute blocked</div>
            </div>
            <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: "6px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Verified Runs</div>
              <div style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0" }}>TASK9142 &amp; TASKC02A</div>
              <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>Non-repudiable proof signed</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Row: 4 equal cards */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginBottom: "14px",
          gap: "14px",
        }}
      >
        {/* KPI 1: Latest Verdict */}
        <div
          className="card kpi"
          onClick={handleOpenCockpit}
          style={{ cursor: "pointer" }}
          title="Click to view TASK9142 Cockpit"
        >
          <div className="eyebrow">Latest verdict</div>
          <div className="v">
            <span className="stamp" style={{ fontSize: "15px", marginTop: "2px" }}>
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              ACCEPT
            </span>
          </div>
          <div className="d">
            <b>8 / 8</b> gates passed · TASK9142
          </div>
        </div>

        {/* KPI 2: ΔPerf */}
        <div className="card kpi">
          <div className="eyebrow">ΔPerf</div>
          <div className="v">
            +74.2<small>%</small>
          </div>
          <div className="d">above τ_noise 5.0% · latency 428 → 12 ms</div>
        </div>

        {/* KPI 3: SQL Queries */}
        <div className="card kpi">
          <div className="eyebrow">SQL queries</div>
          <div className="v">
            5,001<small>→ 1</small>
          </div>
          <div className="d">N+1 across 5k rows eliminated</div>
        </div>

        {/* KPI 4: Ledger Integrity */}
        <div
          className="card kpi"
          onClick={() => router.push("/ledger")}
          style={{ cursor: "pointer" }}
        >
          <div className="eyebrow">Ledger integrity</div>
          <div
            className="v"
            style={{ color: isTampered ? "var(--fail)" : "inherit" }}
          >
            {isTampered ? "VIOLATION" : "VALID"}
          </div>
          <div className="d">
            {isTampered
              ? "Tamper detected at block #2"
              : "6 blocks · SHA-256 chain, head #5"}
          </div>
        </div>
      </div>

      {/* Main Grid: 1.62fr left / 1fr right */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.62fr 1fr",
          alignItems: "start",
          gap: "14px",
        }}
      >
        {/* Left Column (1.62fr) */}
        <div className="grid" style={{ gap: "14px" }}>
          {/* Active Task Card */}
          <div className="card">
            <div className="row" style={{ marginBottom: "12px" }}>
              <div>
                <h3 style={{ margin: "0 0 3px", fontSize: "14px" }}>
                  Active task · TASK9142
                </h3>
                <div
                  className="sub mono"
                  style={{ fontSize: "11.5px", marginTop: "2px" }}
                >
                  orders.py:get_orders · Commit c8a94e1… (pinned)
                </div>
              </div>
              <span style={{ marginLeft: "auto" }} className="row">
                <span className="chip brand">Mode: Optimize</span>
                <button
                  type="button"
                  className="btn sm sec"
                  onClick={handleOpenCockpit}
                  style={{ cursor: "pointer" }}
                >
                  Open
                </button>
              </span>
            </div>

            {/* GateStrip: 8 perforated cells */}
            <div className="strip">
              <i>G0</i>
              <i>G1</i>
              <i>G2</i>
              <i>G3</i>
              <i>G4</i>
              <i>G5</i>
              <i>G6</i>
              <i>G7</i>
            </div>

            {/* Invariant Formula in mono */}
            <div
              className="mono"
              style={{
                fontSize: "11.5px",
                color: "var(--ink2)",
                marginTop: "12px",
                lineHeight: "1.7",
              }}
            >
              Verdict = ACCEPT ⇔ (ΔPerf (+74.2%) &gt; τ_noise (5.0%)) ∧
              (Security_regress = ∅) ∧ (Correctness_regress = ∅) ∧
              (Concurrency_safe = True)
            </div>
          </div>

          {/* Recent Tasks Table */}
          <div className="card" style={{ paddingBottom: "6px" }}>
            <div className="row" style={{ marginBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Recent tasks</h3>
              <Link
                href="/cockpit/TASK9142"
                style={{
                  marginLeft: "auto",
                  fontSize: "12px",
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                View all
              </Link>
            </div>
            <table className="t">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Target</th>
                  <th>Mode</th>
                  <th>Verdict</th>
                  <th style={{ textAlign: "right" }}>ΔPerf</th>
                  <th style={{ textAlign: "right" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  onClick={handleOpenCockpit}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <b className="mono">TASK9142</b>
                  </td>
                  <td className="m">orders.py:get_orders</td>
                  <td>Optimize</td>
                  <td>
                    <span className="chip pass">
                      <svg className="i" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      ACCEPT
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} className="mono">
                    +74.2%
                  </td>
                  <td style={{ textAlign: "right" }} className="m">
                    11:34 PM
                  </td>
                </tr>
                <tr
                  onClick={handleOpenCockpit}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <b className="mono">TASKC02A</b>
                  </td>
                  <td className="m">orders.py:get_orders</td>
                  <td>Retest</td>
                  <td>
                    <span className="chip pass">
                      <svg className="i" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      ACCEPT
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} className="mono">
                    +74.2%
                  </td>
                  <td style={{ textAlign: "right" }} className="m">
                    06:25 AM
                  </td>
                </tr>
                <tr
                  onClick={() => router.push("/findings")}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <b className="mono">DAST</b>
                  </td>
                  <td className="m">staging.perfproof.internal</td>
                  <td>Scan</td>
                  <td>
                    <span className="chip warn">
                      <svg className="i" viewBox="0 0 24 24">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      6 open
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} className="mono">
                    —
                  </td>
                  <td style={{ textAlign: "right" }} className="m">
                    06:26 AM
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1fr) */}
        <div className="grid" style={{ gap: "14px" }}>
          {/* Latest Findings Card */}
          <div className="card" style={{ paddingBottom: "4px" }}>
            <div className="row" style={{ marginBottom: "2px" }}>
              <h3 style={{ margin: 0 }}>Latest findings</h3>
              <Link
                href="/findings"
                style={{
                  marginLeft: "auto",
                  fontSize: "12px",
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                All findings
              </Link>
            </div>

            {/* Finding 1 */}
            <div
              style={{
                display: "flex",
                gap: "11px",
                alignItems: "flex-start",
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ width: "52px", flex: "none", paddingTop: "1px" }}>
                <span className="sev sevH">HIGH</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "12.5px", lineHeight: 1.3 }}>
                  Exposed Client-Side AWS Access Key in Script Bundle
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}
                >
                  .env.production · Cloud Security
                </div>
              </div>
              {roleDef.canRemediate && (
                <button
                  type="button"
                  onClick={() => handleViewFix("fd_d44e55667788")}
                  style={{
                    color: "var(--brand)",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  View fix
                </button>
              )}
            </div>

            {/* Finding 2 */}
            <div
              style={{
                display: "flex",
                gap: "11px",
                alignItems: "flex-start",
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ width: "52px", flex: "none", paddingTop: "1px" }}>
                <span className="sev sevH">HIGH</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "12.5px", lineHeight: 1.3 }}>
                  DOM-Based XSS: location.hash flows into innerHTML
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}
                >
                  src/components/SearchBox.tsx · Security
                </div>
              </div>
              {roleDef.canRemediate && (
                <button
                  type="button"
                  onClick={() => handleViewFix("fd_e99a88776655")}
                  style={{
                    color: "var(--brand)",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  View fix
                </button>
              )}
            </div>

            {/* Finding 3 */}
            <div
              style={{
                display: "flex",
                gap: "11px",
                alignItems: "flex-start",
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ width: "52px", flex: "none", paddingTop: "1px" }}>
                <span className="sev sevH">HIGH</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "12.5px", lineHeight: 1.3 }}>
                  Exposed Public Environment File (/.env)
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px" }}
                >
                  public/.env · Security
                </div>
              </div>
              {roleDef.canRemediate && (
                <button
                  type="button"
                  onClick={() => handleViewFix("fd_f11223344556")}
                  style={{
                    color: "var(--brand)",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  View fix
                </button>
              )}
            </div>
          </div>

          {/* Clean AI Co-Pilot card without Ctrl + / (Module 3 #1) */}
          {role !== "auditor" && (
            <div className="card">
              <div className="row" style={{ marginBottom: "6px" }}>
                <h3 style={{ margin: 0 }}>AI Co-Pilot</h3>
                <span style={{ marginLeft: "auto" }} className="chip brand">
                  Nemotron
                </span>
              </div>
              <div
                className="sugg"
                onClick={() =>
                  handleSendPrompt("Audit this code for SQL injection and latency bottlenecks")
                }
                style={{ cursor: "pointer" }}
              >
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                Audit this code for SQL injection and latency bottlenecks
              </div>
              <div
                className="sugg"
                onClick={() =>
                  handleSendPrompt(
                    "Run DAST scan on https://staging.example.com and fix missing CSP"
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                Run DAST scan on https://staging.example.com and fix missing CSP
              </div>
              <div
                className="sugg"
                onClick={() =>
                  handleSendPrompt("Explain why this caching logic caused an IDOR tenant leak")
                }
                style={{ cursor: "pointer" }}
              >
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                Explain why this caching logic caused an IDOR tenant leak
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
