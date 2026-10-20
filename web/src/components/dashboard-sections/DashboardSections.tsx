"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";

const GATES = [
  { id: "G0", name: "AST Integrity", desc: "Lockfile boundary, imports & strict type constraints", status: "pass", time: "0.12s" },
  { id: "G1", name: "Regression Suite", desc: "28 unit/integration tests re-executed in isolation", status: "pass", time: "1.42s" },
  { id: "G2", name: "Exploit Oracle", desc: "Live IDOR, ReDoS & SQL injection attack probes", status: "pass", time: "2.10s" },
  { id: "G3", name: "Identity Guard", desc: "Authorization predicates strictly preserved", status: "pass", time: "0.45s" },
  { id: "G4", name: "Concurrency", desc: "Lost updates, deadlocks & race contention checks", status: "pass", time: "1.15s" },
  { id: "G5", name: "Performance", desc: "p95 latency reduction measured above 5% noise floor", status: "pass", time: "4.20s" },
  { id: "G6", name: "Memory Leaks", desc: "tracemalloc growth capped under 20MB threshold", status: "pass", time: "0.85s" },
  { id: "G7", name: "Hygiene", desc: "Zero hardcoded secrets, eval calls or supply chain flaws", status: "pass", time: "0.30s" },
];

export default function DashboardSections() {
  const router = useRouter();
  const { session, role, canOverridePolicy } = useAuth();
  const { isTampered, setIsTampered, setIsCopilotOpen } = useTheme();

  // Role states
  const [policyOverrideActive, setPolicyOverrideActive] = useState(false);
  const [superAdminNotice, setSuperAdminNotice] = useState<string | null>(null);
  const [adminTokenQuotas, setAdminTokenQuotas] = useState({ dev: 80000, auditor: 30000, ops: 50000 });
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [devScanUrl, setDevScanUrl] = useState("https://staging.perfproof.internal");
  const [isDevScanning, setIsDevScanning] = useState(false);
  const [auditorNotice, setAuditorNotice] = useState<string | null>(null);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  const roleDef = ROLES[role] || ROLES.developer;

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
    }, 600);
  };

  const handleAuditorExport = (format: string) => {
    const text = `# ProofStack Compliance Ledger Export\nTenant: ${roleDef.tenantUuid}\nChain Status: ${isTampered ? "TAMPERED" : "VERIFIED (SHA-256)"}\nAudited by: ${session?.email || "auditor@proofstack.internal"}\nDate: ${new Date().toISOString()}`;
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
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 24px 60px", display: "flex", flexDirection: "column", gap: "36px" }}>
      {/* SECTION 1: SOOTHING STATUS HERO & IDENTITY */}
      <section
        style={{
          position: "relative",
          borderRadius: "18px",
          border: "1px solid var(--line)",
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(233, 229, 218, 0.05), rgba(18, 18, 16, 0.7))",
          backdropFilter: "blur(16px)",
          padding: "28px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "700px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "var(--f-mono)",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                background: "rgba(233, 229, 218, 0.12)",
                color: "var(--ink)",
                border: "1px solid rgba(233, 229, 218, 0.2)",
              }}
            >
              {roleDef.label.toUpperCase()} WORKSPACE
            </span>
            <span style={{ fontSize: "11px", color: "var(--ink3)", fontFamily: "var(--f-mono)" }}>
              Tenant: {roleDef.tenantName} ({roleDef.tenantUuid})
            </span>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 400, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Autonomous Verification Engine
          </h1>

          <p style={{ fontSize: "13.5px", color: "var(--ink2)", margin: 0, lineHeight: 1.6 }}>
            Deterministic code decides. The model only proposes. All 8 verification gates are armed across 16 rootless MicroVM sandboxes.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={() => router.push("/cockpit/TASK9142")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--brand), var(--accent))",
              color: "#07090E",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>Open Cockpit (TASK9142)</span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCopilotOpen(true)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Copilot Triage
          </button>
        </div>
      </section>

      {/* SECTION 2: VISUAL TELEMETRY METERS */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="label">Live Verification Telemetry</div>
          <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)" }}>
            Sample: TASK9142 · 5,000 Iterations
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {/* Meter 1: Verdict */}
          <div
            onClick={() => router.push("/cockpit/TASK9142")}
            style={{
              padding: "20px 22px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              background: "rgba(18, 18, 16, 0.5)",
              cursor: "pointer",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)" }}>LATEST VERDICT</span>
              <span style={{ fontSize: "11px", color: "var(--pass)", fontFamily: "var(--f-mono)" }}>8/8 GATES</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "6px 0" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--pass)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>✓</span> ACCEPT
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
              Candidate B validated · Signed into Block #4
            </div>
          </div>

          {/* Meter 2: Latency Drop */}
          <div
            style={{
              padding: "20px 22px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              background: "rgba(18, 18, 16, 0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)" }}>LATENCY DELTA (ΔPERF)</span>
              <span style={{ fontSize: "11px", color: "var(--pass)", fontFamily: "var(--f-mono)" }}>+74.2%</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--ink)" }}>428ms → 12ms</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
              Above noise floor τ_noise (5.0%) · Verified
            </div>
          </div>

          {/* Meter 3: Query Reduction */}
          <div
            style={{
              padding: "20px 22px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              background: "rgba(18, 18, 16, 0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)" }}>SQL SUBQUERIES</span>
              <span style={{ fontSize: "11px", color: "var(--pass)", fontFamily: "var(--f-mono)" }}>-99.98%</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--ink)" }}>5,001 → 1 query</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
              N+1 query amplified load eliminated cleanly
            </div>
          </div>

          {/* Meter 4: MicroVM Farm */}
          <div
            style={{
              padding: "20px 22px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              background: "rgba(18, 18, 16, 0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)" }}>SANDBOX FLEET</span>
              <span style={{ fontSize: "11px", color: "var(--pass)", fontFamily: "var(--f-mono)" }}>ZERO BACKPRESSURE</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--ink)" }}>12 / 16 Idle</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
              Rootless MicroVMs · 60s timeout · 1GB cap
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE 8-GATE SENTINEL MATRIX */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div className="label">Zero-Compromise Invariant Gates</div>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", margin: "4px 0 0" }}>
              Every candidate must pass all 8 gates. One failure immediately revokes deployment authorization.
            </p>
          </div>
          <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--pass)" }}>
            ● 8/8 ENFORCED
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {GATES.map((gate) => {
            const isSelected = selectedGate === gate.id;
            return (
              <motion.div
                key={gate.id}
                onClick={() => setSelectedGate(isSelected ? null : gate.id)}
                whileHover={{ y: -2 }}
                style={{
                  padding: "16px 18px",
                  borderRadius: "12px",
                  border: `1px solid ${isSelected ? "rgba(233, 229, 218, 0.4)" : "var(--line)"}`,
                  background: isSelected ? "rgba(233, 229, 218, 0.06)" : "rgba(18, 18, 16, 0.45)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontFamily: "var(--f-mono)",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "var(--ink)",
                      }}
                    >
                      {gate.id}
                    </span>
                    <strong style={{ fontSize: "13.5px", color: "var(--ink)" }}>{gate.name}</strong>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--f-mono)",
                      fontSize: "10px",
                      color: "var(--pass)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "rgba(127, 174, 122, 0.12)",
                    }}
                  >
                    PASS · {gate.time}
                  </span>
                </div>

                <div style={{ fontSize: "12px", color: "var(--ink2)", lineHeight: 1.5 }}>
                  {gate.desc}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--line)", fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink)" }}
                  >
                    <div style={{ color: "var(--ink3)" }}>PROBE METHOD:</div>
                    <div style={{ color: "var(--pass)", marginTop: "2px" }}>
                      Executed automated invariant verification probe in sandboxed worker. 0 regressions detected.
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: ROLE ACTION CONSOLE (CLEAN & NON-CLUSTERED) */}
      <section
        style={{
          borderRadius: "16px",
          border: "1px solid var(--line)",
          background: "rgba(18, 18, 16, 0.5)",
          padding: "24px 28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div className="label">
            {roleDef.label} Operational Deck
          </div>
          <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)" }}>
            RBAC Enforced Mode
          </span>
        </div>

        {/* 1. Super Admin Deck */}
        {role === "super_admin" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
              <div style={{ maxWidth: "600px" }}>
                <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block" }}>
                  Emergency Policy Override Controls
                </strong>
                <p style={{ fontSize: "12px", color: "var(--ink2)", margin: "4px 0 0" }}>
                  Allows privileged bypass of Gate G3 &amp; G4 for catastrophic incident mitigation. All overrides are permanently anchored to the SHA-256 chain.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleTogglePolicyOverride}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: policyOverrideActive ? "rgba(194, 107, 94, 0.2)" : "var(--surface)",
                    color: policyOverrideActive ? "var(--fail)" : "var(--ink)",
                    border: `1px solid ${policyOverrideActive ? "var(--fail)" : "var(--line)"}`,
                  }}
                >
                  {policyOverrideActive ? "Disengage Policy Override" : "Engage Emergency Policy Override"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/control-plane")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    border: "1px solid var(--line)",
                    cursor: "pointer",
                  }}
                >
                  Control Plane →
                </button>
              </div>
            </div>

            {superAdminNotice && (
              <div style={{ fontSize: "12px", fontFamily: "var(--f-mono)", color: policyOverrideActive ? "var(--fail)" : "var(--pass)", padding: "8px 12px", borderRadius: "6px", background: "rgba(0,0,0,0.3)" }}>
                {superAdminNotice}
              </div>
            )}
          </div>
        )}

        {/* 2. Admin Deck */}
        {role === "admin" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <strong style={{ fontSize: "14px", color: "var(--ink)" }}>Team Token Budget Quotas</strong>
              <button
                type="button"
                onClick={handleSaveQuotas}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Save Quotas
              </button>
            </div>

            {adminNotice && (
              <div style={{ fontSize: "12px", fontFamily: "var(--f-mono)", color: "var(--pass)", marginBottom: "12px" }}>
                ✓ {adminNotice}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "14px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--ink)" }}>Lead Developer Quota</span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "12px", color: "var(--ink)" }}>{adminTokenQuotas.dev.toLocaleString()} tok</span>
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

              <div style={{ padding: "14px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--ink)" }}>Security Auditor Quota</span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "12px", color: "var(--ink)" }}>{adminTokenQuotas.auditor.toLocaleString()} tok</span>
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
            </div>
          </div>
        )}

        {/* 3. Developer Deck */}
        {role === "developer" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <strong style={{ fontSize: "14px", color: "var(--ink)" }}>Quick Sandbox DAST Dispatch</strong>
              <button
                type="button"
                onClick={() => router.push("/studio")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Launch Studio Editor →
              </button>
            </div>

            <form onSubmit={handleTriggerDevScan} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="url"
                value={devScanUrl}
                onChange={(e) => setDevScanUrl(e.target.value)}
                placeholder="Target endpoint URL..."
                style={{
                  flex: 1,
                  minWidth: "260px",
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  background: "var(--surface2)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  fontFamily: "var(--f-mono)",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isDevScanning}
                style={{
                  padding: "0 16px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {isDevScanning ? "Scanning..." : "Dispatch DAST Scan"}
              </button>
            </form>
          </div>
        )}

        {/* 4. Auditor Deck */}
        {role === "auditor" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block" }}>
                  Cryptographic Chain Integrity &amp; Export
                </strong>
                <p style={{ fontSize: "12px", color: "var(--ink2)", margin: "4px 0 0" }}>
                  Read-only non-repudiable audit verification. Code modification blocked by tenant boundary.
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsTampered(!isTampered)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: isTampered ? "rgba(194, 107, 94, 0.2)" : "var(--surface)",
                    color: isTampered ? "var(--fail)" : "var(--ink)",
                    border: `1px solid ${isTampered ? "var(--fail)" : "var(--line)"}`,
                  }}
                >
                  {isTampered ? "Restore Valid Chain" : "Simulate Tamper on Block #2"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAuditorExport("Markdown")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Export Audit Pack (.md)
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/ledger")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  View Full Chain →
                </button>
              </div>
            </div>

            {auditorNotice && (
              <div style={{ fontSize: "12px", fontFamily: "var(--f-mono)", color: "var(--pass)" }}>
                ✓ {auditorNotice}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
