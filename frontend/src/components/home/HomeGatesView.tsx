"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomeGatesView({ onOpenTour }: { onOpenTour?: () => void }) {
  const router = useRouter();

  // Interactive Gate Simulator State
  const [eagerLoading, setEagerLoading] = useState(true);
  const [tenantIsolation, setTenantIsolation] = useState(true);
  const [airGapSandbox, setAirGapSandbox] = useState(true);
  const [activeDiffTab, setActiveDiffTab] = useState<"orders" | "pricing">("orders");

  // Determine Gate Verdicts
  const g1Pass = true; // Correctness always passes if code runs
  const g2Pass = eagerLoading; // Performance only passes if eager loading is ON
  const g3Pass = tenantIsolation && airGapSandbox; // Security passes only if isolation + air gap are preserved
  const allPass = g1Pass && g2Pass && g3Pass;

  const handleGoToLogin = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("proofstack_auth_active");
        localStorage.removeItem("proofstack_session");
        localStorage.removeItem("proofstack_role");
        localStorage.removeItem("proofstack_user");
        document.cookie = "ps_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "proofstack_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ps_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}
    }
    router.push("/login");
  };

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Sub-Page Hero Header */}
      <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>
            POLICY ENFORCEMENT ENGINE
          </span>
          <span style={{ fontSize: "12px", background: "#ECFDF5", color: "#065F46", padding: "3px 10px", borderRadius: "12px", border: "1px solid #A7F3D0", fontWeight: 600 }}>
            🚀 +74.2% Faster
          </span>
          <span style={{ fontSize: "12px", background: "#FEF2F2", color: "#991B1B", padding: "3px 10px", borderRadius: "12px", border: "1px solid #FECACA", fontWeight: 600 }}>
            🛡️ 0 IDOR Leaks
          </span>
          <span style={{ fontSize: "12px", background: "#F0FDF4", color: "#166534", padding: "3px 10px", borderRadius: "12px", border: "1px solid #BBF7D0", fontWeight: 600 }}>
            🔒 Air-Gapped MicroVM
          </span>
          <span style={{ fontSize: "12px", background: "#EFF6FF", color: "#1E40AF", padding: "3px 10px", borderRadius: "12px", border: "1px solid #BFDBFE", fontWeight: 600 }}>
            🤖 Nemotron-3 120B
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "40px", fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          The Three Gates Policy. Zero Compromise Between Speed and Safety.
        </h1>

        <p style={{ color: "var(--ink2)", fontSize: "16px", lineHeight: 1.6, margin: "0 auto 24px" }}>
          Standard AI copilots speed up software by silently dropping authentication checks, relaxing tenant filters,
          or introducing async race conditions. ProofStack evaluates every candidate patch simultaneously across 3 strict gates.
        </p>

        <div style={{ display: "inline-flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGoToLogin}
            style={{ padding: "0 22px", height: "40px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
          >
            Launch Live Interactive Gauntlet →
          </button>
          {onOpenTour && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenTour}
              style={{ padding: "0 18px", height: "40px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
            >
              Watch 2-Min Guided Tour ↗
            </button>
          )}
        </div>
      </div>

      {/* 3 Circular SVG Metric Rings / Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px", marginBottom: "40px" }}>
        {/* Gate 1: Correctness */}
        <div
          className="card"
          style={{
            padding: "28px",
            borderRadius: "14px",
            background: "var(--surface)",
            border: `1.5px solid ${g1Pass ? "#10B981" : "#EF4444"}`,
            boxShadow: g1Pass ? "0 10px 25px rgba(16, 185, 129, 0.08)" : "0 10px 25px rgba(239, 68, 68, 0.08)",
            position: "relative",
            overflow: "hidden",
            transition: "all 200ms ease",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: g1Pass ? "#10B981" : "#EF4444" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <span className="chip brand" style={{ fontSize: "10.5px", fontWeight: 700 }}>GATE 01</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "8px 0 4px" }}>Behavioral Correctness</h2>
              <span style={{ fontSize: "12px", color: "var(--ink2)" }}>Pytest &amp; Hypothesis Invariant Suite</span>
            </div>
            {/* SVG Circular Metric Ring */}
            <div style={{ position: "relative", width: "68px", height: "68px", flex: "none" }}>
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="28" stroke="var(--line)" strokeWidth="5" fill="none" />
                <circle
                  cx="34"
                  cy="34"
                  r="28"
                  stroke="#10B981"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="175.9"
                  strokeDashoffset={g1Pass ? "0" : "175.9"}
                  strokeLinecap="round"
                  transform="rotate(-90 34 34)"
                  style={{ transition: "stroke-dashoffset 400ms ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "13px", fontWeight: 800, color: "#10B981" }}>
                100%
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
            Re-runs full regression test suite plus synthesized edge-case properties. Zero behavioral drift or altered return structures permitted.
          </p>

          <div style={{ background: "var(--surface2)", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--ink2)" }}>Unit + Property Tests:</span>
            <span className="mono" style={{ fontWeight: 700, color: "#10B981" }}>84 / 84 PASSED (0 FAIL)</span>
          </div>
        </div>

        {/* Gate 2: Performance */}
        <div
          className="card"
          style={{
            padding: "28px",
            borderRadius: "14px",
            background: "var(--surface)",
            border: `1.5px solid ${g2Pass ? "#10B981" : "#EF4444"}`,
            boxShadow: g2Pass ? "0 10px 25px rgba(16, 185, 129, 0.08)" : "0 10px 25px rgba(239, 68, 68, 0.08)",
            position: "relative",
            overflow: "hidden",
            transition: "all 200ms ease",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: g2Pass ? "#10B981" : "#EF4444" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <span className="chip brand" style={{ fontSize: "10.5px", fontWeight: 700 }}>GATE 02</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "8px 0 4px" }}>Performance Statistical Gain</h2>
              <span style={{ fontSize: "12px", color: "var(--ink2)" }}>pyperf Benchmark (τ_noise = 5.0%)</span>
            </div>
            {/* SVG Circular Metric Ring */}
            <div style={{ position: "relative", width: "68px", height: "68px", flex: "none" }}>
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="28" stroke="var(--line)" strokeWidth="5" fill="none" />
                <circle
                  cx="34"
                  cy="34"
                  r="28"
                  stroke={g2Pass ? "#10B981" : "#EF4444"}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="175.9"
                  strokeDashoffset={g2Pass ? "45" : "175.9"}
                  strokeLinecap="round"
                  transform="rotate(-90 34 34)"
                  style={{ transition: "stroke-dashoffset 400ms ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "12px", fontWeight: 800, color: g2Pass ? "#10B981" : "#EF4444" }}>
                {g2Pass ? "+74.2%" : "0.0%"}
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
            Enforces strict statistical noise rejection. Candidates must exceed the 99% confidence interval above baseline variance.
          </p>

          <div style={{ background: "var(--surface2)", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--ink2)" }}>Query Reduction:</span>
            <span className="mono" style={{ fontWeight: 700, color: g2Pass ? "#10B981" : "#EF4444" }}>
              {g2Pass ? "42 SQL → 1 SQL (-97.6%)" : "42 SQL → 42 SQL (NO GAIN)"}
            </span>
          </div>
        </div>

        {/* Gate 3: Security */}
        <div
          className="card"
          style={{
            padding: "28px",
            borderRadius: "14px",
            background: "var(--surface)",
            border: `1.5px solid ${g3Pass ? "#10B981" : "#EF4444"}`,
            boxShadow: g3Pass ? "0 10px 25px rgba(16, 185, 129, 0.08)" : "0 10px 25px rgba(239, 68, 68, 0.08)",
            position: "relative",
            overflow: "hidden",
            transition: "all 200ms ease",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: g3Pass ? "#10B981" : "#EF4444" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <span className="chip brand" style={{ fontSize: "10.5px", fontWeight: 700 }}>GATE 03</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "8px 0 4px" }}>Security &amp; Isolation</h2>
              <span style={{ fontSize: "12px", color: "var(--ink2)" }}>Exploit Oracles &amp; AST Ban Rules</span>
            </div>
            {/* SVG Circular Metric Ring */}
            <div style={{ position: "relative", width: "68px", height: "68px", flex: "none" }}>
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="28" stroke="var(--line)" strokeWidth="5" fill="none" />
                <circle
                  cx="34"
                  cy="34"
                  r="28"
                  stroke={g3Pass ? "#10B981" : "#EF4444"}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="175.9"
                  strokeDashoffset={g3Pass ? "0" : "175.9"}
                  strokeLinecap="round"
                  transform="rotate(-90 34 34)"
                  style={{ transition: "stroke-dashoffset 400ms ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "12px", fontWeight: 800, color: g3Pass ? "#10B981" : "#EF4444" }}>
                {g3Pass ? "0 LEAKS" : "BREACH"}
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
            Replays exploit oracles for IDOR, SQL injection, and tenant boundary breaches. If a speedup compromises security, the patch is killed.
          </p>

          <div style={{ background: "var(--surface2)", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--ink2)" }}>Tenant Boundary Status:</span>
            <span className="mono" style={{ fontWeight: 700, color: g3Pass ? "#10B981" : "#EF4444" }}>
              {g3Pass ? "SHIELDED (0 IDOR)" : "LEAK DETECTED (REJECTED)"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Invariant Simulator Panel */}
      <div
        className="card"
        style={{
          padding: "26px 30px",
          borderRadius: "14px",
          background: allPass ? "color-mix(in srgb, #10B981 4%, var(--surface))" : "color-mix(in srgb, #EF4444 4%, var(--surface))",
          border: `1.5px solid ${allPass ? "#A7F3D0" : "#FECACA"}`,
          marginBottom: "40px",
          transition: "all 200ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="eyebrow" style={{ color: allPass ? "#059669" : "#DC2626", fontWeight: 700 }}>
              LIVE GAUNTLET SIMULATOR
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "4px 0 0" }}>
              Test Invariant Rejection — Toggle Candidate Properties
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--ink2)" }}>Composite Verdict:</span>
            <span
              className="mono"
              style={{
                fontSize: "12.5px",
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: "6px",
                background: allPass ? "#10B981" : "#EF4444",
                color: "#FFFFFF",
              }}
            >
              {allPass ? "✓ ACCEPTED & SEALED TO LEDGER" : "✕ KILLED BY GAUNTLET (380ms)"}
            </span>
          </div>
        </div>

        {/* 3 Interactive Toggle Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "18px" }}>
          {/* Toggle 1: Eager Loading */}
          <div
            onClick={() => setEagerLoading(!eagerLoading)}
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "var(--surface)",
              border: `1px solid ${eagerLoading ? "#10B981" : "var(--line)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              userSelect: "none",
            }}
          >
            <div>
              <b style={{ fontSize: "13px", display: "block" }}>1. Eliminate N+1 DB Queries</b>
              <span style={{ fontSize: "11.5px", color: "var(--ink2)" }}>FastAPI + SQLAlchemy eager select</span>
            </div>
            <div
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "11px",
                background: eagerLoading ? "#10B981" : "#CBD5E1",
                position: "relative",
                transition: "background 180ms ease",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  position: "absolute",
                  top: "2px",
                  left: eagerLoading ? "20px" : "2px",
                  transition: "left 180ms ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>

          {/* Toggle 2: Tenant Isolation */}
          <div
            onClick={() => setTenantIsolation(!tenantIsolation)}
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "var(--surface)",
              border: `1px solid ${tenantIsolation ? "#10B981" : "#EF4444"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              userSelect: "none",
            }}
          >
            <div>
              <b style={{ fontSize: "13px", display: "block" }}>2. Retain Tenant Filter (`org_id`)</b>
              <span style={{ fontSize: "11.5px", color: tenantIsolation ? "var(--ink2)" : "#EF4444" }}>
                {tenantIsolation ? "AST check: org_id enforced" : "DROP CHECK (SIMULATE IDOR)"}
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "11px",
                background: tenantIsolation ? "#10B981" : "#EF4444",
                position: "relative",
                transition: "background 180ms ease",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  position: "absolute",
                  top: "2px",
                  left: tenantIsolation ? "20px" : "2px",
                  transition: "left 180ms ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>

          {/* Toggle 3: Rootless MicroVM Air-Gap */}
          <div
            onClick={() => setAirGapSandbox(!airGapSandbox)}
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "var(--surface)",
              border: `1px solid ${airGapSandbox ? "#10B981" : "#EF4444"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              userSelect: "none",
            }}
          >
            <div>
              <b style={{ fontSize: "13px", display: "block" }}>3. MicroVM Network Air-Gap</b>
              <span style={{ fontSize: "11.5px", color: airGapSandbox ? "var(--ink2)" : "#EF4444" }}>
                {airGapSandbox ? "network=none · 60s hard timeout" : "EGRESS ENABLED (RISK)"}
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "11px",
                background: airGapSandbox ? "#10B981" : "#EF4444",
                position: "relative",
                transition: "background 180ms ease",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  position: "absolute",
                  top: "2px",
                  left: airGapSandbox ? "20px" : "2px",
                  transition: "left 180ms ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Simulator Diagnostic Explanation */}
        <div style={{ fontSize: "12.5px", color: "var(--ink2)", background: "var(--surface)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
          {!tenantIsolation ? (
            <span style={{ color: "#DC2626", fontWeight: 600 }}>
              🚨 SIMULATION NOTICE: Dropping the `org_id` filter caused the Gauntlet&apos;s IDOR Exploit Oracle to trigger! An unauthenticated tenant could inspect other organizations&apos; orders. Gate 3 immediately aborted execution in 380ms. The patch was discarded.
            </span>
          ) : !eagerLoading ? (
            <span style={{ color: "#D97706", fontWeight: 600 }}>
              ⚠️ SIMULATION NOTICE: Without eager loading, query count remained at 42. pyperf measured zero speedup under the τ_noise 5.0% threshold. Gate 2 rejected the patch due to lack of statistically measurable improvement.
            </span>
          ) : !airGapSandbox ? (
            <span style={{ color: "#DC2626", fontWeight: 600 }}>
              🚨 SIMULATION NOTICE: MicroVM egress policy violation! Network egress is banned during candidate patch execution. Gate 3 security oracle rejected the untrusted container payload.
            </span>
          ) : (
            <span style={{ color: "#059669", fontWeight: 600 }}>
              ✓ ALL INVARIANTS PRESERVED: Patch eliminates 41 redundant SQL queries (-97.6%), verifies 84/84 unit tests, preserves multi-tenant isolation, and executes in isolated rootless microVM. Gate 0 through Gate 7 passed. Verdict sealed to SHA-256 Merkle chain.
            </span>
          )}
        </div>
      </div>

      {/* Before / After Code Diff Viewer */}
      <div className="card" style={{ padding: "24px 28px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span className="chip brand" style={{ fontSize: "10.5px", fontWeight: 700 }}>SYNTHESIZED CANDIDATE PATCH</span>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "6px 0 0" }}>Unified Diff &amp; AST Invariant Verification</h3>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setActiveDiffTab("orders")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                border: activeDiffTab === "orders" ? "1px solid var(--brand)" : "1px solid var(--line)",
                background: activeDiffTab === "orders" ? "var(--brand)" : "transparent",
                color: activeDiffTab === "orders" ? "#FFFFFF" : "var(--ink)",
                cursor: "pointer",
              }}
            >
              orders.py (N+1 &amp; IDOR)
            </button>
            <button
              type="button"
              onClick={() => setActiveDiffTab("pricing")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                border: activeDiffTab === "pricing" ? "1px solid var(--brand)" : "1px solid var(--line)",
                background: activeDiffTab === "pricing" ? "var(--brand)" : "transparent",
                color: activeDiffTab === "pricing" ? "#FFFFFF" : "var(--ink)",
                cursor: "pointer",
              }}
            >
              pricing.py (Memoization &amp; ReDoS)
            </button>
          </div>
        </div>

        {/* Code Diff Display */}
        {activeDiffTab === "orders" ? (
          <div
            className="mono"
            style={{
              background: "#0F172A",
              color: "#F8FAFC",
              borderRadius: "10px",
              padding: "18px 20px",
              fontSize: "12.5px",
              lineHeight: 1.65,
              overflowX: "auto",
            }}
          >
            <div style={{ color: "#94A3B8", marginBottom: "8px" }}># diff --git a/src/services/orders.py b/src/services/orders.py</div>
            <div style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              - # VULNERABLE &amp; SLOW: 42 SQL queries generated inside loop + missing tenant isolation check
            </div>
            <div style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              - orders = db.query(Order).all()
            </div>
            <div style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              - for order in orders:
            </div>
            <div style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              - &nbsp;&nbsp;&nbsp;&nbsp;user = db.query(User).filter(User.id == order.user_id).first()
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px", marginTop: "6px" }}>
              + # VERIFIED DEFENSIVE PATCH: 1 query with eager join + strict multi-tenant boundary
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + orders = (
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &nbsp;&nbsp;&nbsp;&nbsp;db.query(Order)
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &nbsp;&nbsp;&nbsp;&nbsp;.options(selectinload(Order.user))
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &nbsp;&nbsp;&nbsp;&nbsp;.filter(Order.tenant_id == current_user.tenant_id) # AST invariant enforced
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &nbsp;&nbsp;&nbsp;&nbsp;.all()
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + )
            </div>
          </div>
        ) : (
          <div
            className="mono"
            style={{
              background: "#0F172A",
              color: "#F8FAFC",
              borderRadius: "10px",
              padding: "18px 20px",
              fontSize: "12.5px",
              lineHeight: 1.65,
              overflowX: "auto",
            }}
          >
            <div style={{ color: "#94A3B8", marginBottom: "8px" }}># diff --git a/src/core/pricing.py b/src/core/pricing.py</div>
            <div style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              - # SLOW: Unbounded recursive tree traversal + dynamic string evaluation
            </div>
            <div style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              - return eval(f&quot;compute_tier_&#123;tier&#125;(&#123;base_price&#125;)&quot;)
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px", marginTop: "6px" }}>
              + # VERIFIED DEFENSIVE PATCH: Static tier dispatch table + memoized discount calculation
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + TIER_DISPATCH: Final[Dict[str, Callable[[Decimal], Decimal]]] = &#123;
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &nbsp;&nbsp;&nbsp;&nbsp;&quot;enterprise&quot;: compute_tier_enterprise,
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &nbsp;&nbsp;&nbsp;&nbsp;&quot;standard&quot;: compute_tier_standard,
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + &#125;
            </div>
            <div style={{ color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              + return TIER_DISPATCH[tier](base_price) # AST banned eval() eradicated
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
