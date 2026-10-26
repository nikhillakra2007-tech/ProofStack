"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { downloadEvidenceReport } from "@/lib/evidenceExport";

export default function ScrollStorySections() {
  const router = useRouter();
  const { loginAs, isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Section 3: The Problem tab state ('idor' | 'redos' | 'nplusone')
  const [problemTab, setProblemTab] = useState<"idor" | "redos" | "nplusone">("idor");

  // Section 5: Product Tour tab state ('investigate' | 'gate' | 'ledger')
  const [tourTab, setTourTab] = useState<"investigate" | "gate" | "ledger">("investigate");

  // Section 6: Mini Tamper Test demo
  const [isMiniTampered, setIsMiniTampered] = useState(false);

  // Section 7: Detector tier filter
  const [detectorTier, setDetectorTier] = useState<"ALL" | "PERF" | "SEC" | "RES">("ALL");

  // Section 11: Roles tab state ('developer' | 'security' | 'admin')
  const [roleTab, setRoleTab] = useState<"developer" | "security" | "admin">("developer");

  // Section 12: Copyable CLI snippet
  const [copiedCi, setCopiedCi] = useState(false);

  const handleLaunchDemo = () => {
    if (isAuthenticated) {
      router.push("/cockpit/TASK9142");
    } else {
      router.push("/login?redirect=/cockpit/TASK9142");
    }
  };

  const handleCopyGithubAction = () => {
    const yaml = `name: ProofStack Zero-Compromise Verification
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ProofStack Verification Action
        uses: perfproof/proofstack-action@v1
        with:
          api-token: \${{ secrets.PROOFSTACK_TOKEN }}
          nebius-api-key: \${{ secrets.NEBIUS_TOKEN_FACTORY_KEY }}
          mode: "OPTIMIZE"
          enforce-gates: "G0,G1,G2,G3,G4,G5,G6,G7"
`;
    navigator.clipboard.writeText(yaml);
    setCopiedCi(true);
    setTimeout(() => setCopiedCi(false), 2000);
  };

  const handleExportSampleLedger = () => {
    downloadEvidenceReport({
      problemId: "T1-2",
      problemTitle: "N+1 Query Explosion & The SQL-Injection Trap",
      filename: "orders.py",
    });
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", width: "100%" }}>
      {/* =========================================================================
          SECTION 2: THREE GATES
          ========================================================================= */}
      <section id="three-gates" style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            The Zero-Compromise Policy
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Three gates. One verdict in 5 seconds.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", lineHeight: 1.55, margin: 0 }}>
            Standard AI copilot fixes make code fast by silently stripping auth checks or introducing race conditions.
            ProofStack evaluates candidate patches simultaneously across three strict gates.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {/* Gate 1 */}
          <div className="card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--pass)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span className="chip brand">Gate 1</span>
              <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>PASS 28/28</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>Correctness Gate</h3>
            <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Re-executes original unit and integration tests inside an ephemeral rootless microVM. Zero behavioral changes allowed.
            </p>
            <div className="mono" style={{ fontSize: "11px", padding: "8px 10px", background: "var(--surface2)", borderRadius: "6px" }}>
              pytest · coverage ≥ baseline · 0 regressions
            </div>
          </div>

          {/* Gate 2 */}
          <div className="card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--pass)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span className="chip brand">Gate 2</span>
              <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>PASS +74.2%</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>Performance Gate</h3>
            <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Statistically isolates wall-clock and CPU time above measurement noise floor (τ_noise = 5.0%). Proves true speedup.
            </p>
            <div className="mono" style={{ fontSize: "11px", padding: "8px 10px", background: "var(--surface2)", borderRadius: "6px" }}>
              pyperf · cProfile · tracemalloc &lt; 20 MB
            </div>
          </div>

          {/* Gate 3 */}
          <div className="card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--pass)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span className="chip brand">Gate 3</span>
              <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>PASS 0 LEAKS</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>Security Gate</h3>
            <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Replays exploit oracles for IDOR, SQL injection, ReDoS, and auth bypass. If speed breaks safety, the patch is killed.
            </p>
            <div className="mono" style={{ fontSize: "11px", padding: "8px 10px", background: "var(--surface2)", borderRadius: "6px" }}>
              Exploit oracles · tenant isolation · AST bans
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE PROBLEM
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--fail)", marginBottom: "6px" }}>
            The Danger of Naive AI Optimization
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Fast patches that quietly break security.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", lineHeight: 1.55, margin: 0 }}>
            Large language models optimize for benchmark metrics by taking shortcuts. Explore real before/after cases caught by ProofStack.
          </p>
        </div>

        {/* Problem Switcher Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
          {[
            { id: "idor", title: "Cache IDOR (Cross-Tenant Leak)" },
            { id: "redos", title: "Regex Optimization (ReDoS Trap)" },
            { id: "nplusone", title: "N+1 Query (SQLi Concatenation)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn sm ${problemTab === tab.id ? "" : "sec"}`}
              onClick={() => setProblemTab(tab.id as any)}
              style={{ fontSize: "12.5px" }}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Interactive Before / After Card */}
        <div className="card" style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          {problemTab === "idor" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <b style={{ fontSize: "15px" }}>Problem T1-3: Broken Object-Level Auth in Speedup Cache</b>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "2px" }}>
                    AI sped up checkout by caching documents by doc_id alone, allowing Tenant B to read Tenant A&apos;s records.
                  </div>
                </div>
                <span className="chip fail">High Severity</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "var(--term-bg, #12151F)", padding: "14px", borderRadius: "8px", color: "#F87171", fontFamily: "var(--f-mono)", fontSize: "12px", lineHeight: 1.6 }}>
                  <div style={{ color: "#9CA3AF", marginBottom: "6px" }}># Naive AI Patch (15x faster, but IDOR!)</div>
                  <div>- def get_cached(tenant_id, doc_id):</div>
                  <div style={{ background: "rgba(239, 68, 68, 0.2)", padding: "2px 4px" }}>-     return redis.get(f&quot;doc:{"{doc_id}"}&quot;)</div>
                  <div style={{ color: "#EF4444", marginTop: "8px" }}>✗ Security Gate: REJECTED (CWE-639)</div>
                </div>
                <div style={{ background: "var(--term-bg, #12151F)", padding: "14px", borderRadius: "8px", color: "#34D399", fontFamily: "var(--f-mono)", fontSize: "12px", lineHeight: 1.6 }}>
                  <div style={{ color: "#9CA3AF", marginBottom: "6px" }}># ProofStack Verified Patch (4.8x faster &amp; safe)</div>
                  <div>+ def get_cached(tenant_id, doc_id):</div>
                  <div style={{ background: "rgba(52, 211, 153, 0.2)", padding: "2px 4px" }}>+     key = f&quot;{"{tenant_id}:{hash(tenant_id, doc_id)}"}&quot;</div>
                  <div>+     return redis.get(key)</div>
                  <div style={{ color: "#10B981", marginTop: "8px" }}>✓ 3/3 Gates Passed (Zero IDOR leak)</div>
                </div>
              </div>
            </div>
          )}

          {problemTab === "redos" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <b style={{ fontSize: "15px" }}>Problem T2-1: Regular Expression Catastrophic Backtracking</b>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "2px" }}>
                    Naive optimization simplified validation regex to nested quantifiers, making the API vulnerable to ReDoS denial of service.
                  </div>
                </div>
                <span className="chip fail">High Severity</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "var(--term-bg, #12151F)", padding: "14px", borderRadius: "8px", color: "#F87171", fontFamily: "var(--f-mono)", fontSize: "12px", lineHeight: 1.6 }}>
                  <div style={{ color: "#9CA3AF", marginBottom: "6px" }}># Naive AI Regex</div>
                  <div>- EMAIL_REGEX = r&quot;^([a-zA-Z0-9]+)*@([a-zA-Z0-9]+)*$&quot;</div>
                  <div style={{ color: "#EF4444", marginTop: "8px" }}>✗ ReDoS Probe: 18.4s CPU hang on 35-char payload</div>
                </div>
                <div style={{ background: "var(--term-bg, #12151F)", padding: "14px", borderRadius: "8px", color: "#34D399", fontFamily: "var(--f-mono)", fontSize: "12px", lineHeight: 1.6 }}>
                  <div style={{ color: "#9CA3AF", marginBottom: "6px" }}># ProofStack Hardened Regex</div>
                  <div>+ EMAIL_REGEX = r&quot;^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$&quot;</div>
                  <div style={{ color: "#10B981", marginTop: "8px" }}>✓ Linear time verification (max match time 0.04 ms)</div>
                </div>
              </div>
            </div>
          )}

          {problemTab === "nplusone" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <b style={{ fontSize: "15px" }}>Problem T1-2: N+1 Database Explosion &amp; SQL Injection Concatenation</b>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "2px" }}>
                    Naive fix collapsed 5,001 queries into raw SQL string formatting, reintroducing injection vulnerabilities.
                  </div>
                </div>
                <span className="chip fail">Critical Severity</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "var(--term-bg, #12151F)", padding: "14px", borderRadius: "8px", color: "#F87171", fontFamily: "var(--f-mono)", fontSize: "12px", lineHeight: 1.6 }}>
                  <div style={{ color: "#9CA3AF", marginBottom: "6px" }}># Naive AI Raw SQL Query</div>
                  <div>- db.execute(f&quot;SELECT * FROM orders WHERE tenant = &apos;{"{tenant_id}"}&apos;&quot;)</div>
                  <div style={{ color: "#EF4444", marginTop: "8px" }}>✗ Security Gate: SQL Injection Exploit Succeeded</div>
                </div>
                <div style={{ background: "var(--term-bg, #12151F)", padding: "14px", borderRadius: "8px", color: "#34D399", fontFamily: "var(--f-mono)", fontSize: "12px", lineHeight: 1.6 }}>
                  <div style={{ color: "#9CA3AF", marginBottom: "6px" }}># ProofStack Eager Joinedload Fix</div>
                  <div>+ db.query(Order).options(joinedload(Order.customer))</div>
                  <div>+     .filter(Order.tenant_id == tenant_id).all()</div>
                  <div style={{ color: "#10B981", marginTop: "8px" }}>✓ 1 SQL Query (428ms → 12ms) · Zero injection risk</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: HOW IT WORKS
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "750px", margin: "0 auto 40px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            The 5-Step Pipeline
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            How ProofStack verifies in seconds.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", lineHeight: 1.55, margin: 0 }}>
            Every step is powered by specialized NVIDIA Nemotron models hosted on Nebius Token Factory.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {[
            {
              step: "01",
              title: "Baseline Profile",
              desc: "cProfile & pyperf run against slow target to isolate p95 latency and query count.",
              model: "Runtime Harness",
              tag: "Deterministic",
            },
            {
              step: "02",
              title: "Hypotheses",
              desc: "Nemotron-3-Super synthesizes 3 competing architectural hypotheses.",
              model: "Nemotron-3-Super 120B",
              tag: "Token Factory",
            },
            {
              step: "03",
              title: "Sandbox Probing",
              desc: "Discriminator spins up isolated sandbox worktrees with network disabled.",
              model: "MicroVM Sandboxes",
              tag: "Isolated",
            },
            {
              step: "04",
              title: "Patch Synthesis",
              desc: "Nemotron-3.5-Lightning writes the candidate defensive code patch.",
              model: "Nemotron-3.5-Lightning",
              tag: "Fast & Precise",
            },
            {
              step: "05",
              title: "Zero-Compromise Gates",
              desc: "Gauntlet executes G0-G7. Verdict sealed in SHA-256 evidence ledger.",
              model: "Gauntlet Engine",
              tag: "Append-Only",
            },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: "18px 16px" }}>
              <div className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 700, marginBottom: "6px" }}>
                STEP {item.step}
              </div>
              <b style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>{item.title}</b>
              <p style={{ fontSize: "12px", color: "var(--ink2)", lineHeight: 1.45, margin: "0 0 12px", minHeight: "52px" }}>
                {item.desc}
              </p>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
                <span className="chip" style={{ fontSize: "9.5px" }}>{item.model}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: PRODUCT TOUR
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Product Tour
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            The cockpit built for high-stakes verification.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Switch between workspaces to see how engineers, auditors, and admins interact with ProofStack.
          </p>
        </div>

        {/* Tour Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          <button
            type="button"
            className={`btn sm ${tourTab === "investigate" ? "" : "sec"}`}
            onClick={() => setTourTab("investigate")}
          >
            Investigate (Cockpit)
          </button>
          <button
            type="button"
            className={`btn sm ${tourTab === "gate" ? "" : "sec"}`}
            onClick={() => setTourTab("gate")}
          >
            Gate Gauntlet (Studio)
          </button>
          <button
            type="button"
            className={`btn sm ${tourTab === "ledger" ? "" : "sec"}`}
            onClick={() => setTourTab("ledger")}
          >
            Evidence Ledger
          </button>
        </div>

        {/* Tour Preview Screen */}
        <div
          className="card"
          style={{
            padding: "24px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
          }}
        >
          {tourTab === "investigate" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="chip brand">COCKPIT VIEW</span>
                  <b>Investigation INV-4821: /checkout/pricing</b>
                </div>
                <button type="button" className="btn sm" onClick={handleLaunchDemo}>
                  Open in Cockpit →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                <div style={{ padding: "14px", background: "var(--surface2)", borderRadius: "8px" }}>
                  <div className="eyebrow" style={{ fontSize: "10px" }}>Baseline Profile</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0" }}>412 ms p95</div>
                  <div style={{ fontSize: "11px", color: "var(--ink2)" }}>14 SQL queries per checkout</div>
                </div>
                <div style={{ padding: "14px", background: "var(--surface2)", borderRadius: "8px" }}>
                  <div className="eyebrow" style={{ fontSize: "10px" }}>Active Candidates</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0" }}>2 Drafted</div>
                  <div style={{ fontSize: "11px", color: "var(--ink2)" }}>Nemotron-3-Super + Lightning</div>
                </div>
                <div style={{ padding: "14px", background: "var(--surface2)", borderRadius: "8px" }}>
                  <div className="eyebrow" style={{ fontSize: "10px" }}>Acceptance Status</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0", color: "var(--pass)" }}>VERIFIED</div>
                  <div style={{ fontSize: "11px", color: "var(--pass)" }}>Candidate B accepted (3/3 gates)</div>
                </div>
              </div>
            </div>
          )}

          {tourTab === "gate" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="chip brand">STUDIO GAUNTLET</span>
                  <b>Invariants G0 through G7 Verification Status</b>
                </div>
                <button type="button" className="btn sm" onClick={() => router.push("/studio")}>
                  Open Studio →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {["G0: AST & Lockfile", "G1: Unit Tests", "G2: Exploit Oracle", "G3: Identity Guard", "G4: Concurrency", "G5: Perf Speedup", "G6: Tracemalloc", "G7: Hygiene"].map((gate, i) => (
                  <div key={i} style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "6px", background: "var(--surface2)" }}>
                    <div style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>PASS ✓</div>
                    <b style={{ fontSize: "12px", display: "block", marginTop: "2px" }}>{gate}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tourTab === "ledger" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="chip brand">EVIDENCE LEDGER</span>
                  <b>Cryptographic SHA-256 Provenance Chain</b>
                </div>
                <button type="button" className="btn sm" onClick={() => router.push("/ledger")}>
                  Open Ledger →
                </button>
              </div>
              <div className="mono" style={{ fontSize: "11.5px", background: "var(--term-bg, #12151F)", color: "#93C5FD", padding: "16px", borderRadius: "8px", lineHeight: 1.7 }}>
                <div>BLOCK #0: 8f4b238e89c1... · TASK_INTAKE (orders.py:get_orders)</div>
                <div>BLOCK #1: 318cb92931ea... · BASELINE (428ms · 5,001 SQL queries)</div>
                <div>BLOCK #2: 45a89df0123b... · HYPOTHESIS (H1: Joinedload eager query)</div>
                <div>BLOCK #3: e89012389012... · CANDIDATE_PATCH (nemotron-3.5-lightning)</div>
                <div>BLOCK #4: d90123890123... · GATE_RESULT (8/8 PASS)</div>
                <div>BLOCK #5: b3e94a8f1234... · DEFENSIVE_PATCH_COMMIT [HEAD #5 VERIFIED]</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: EVIDENCE LEDGER (INTERACTIVE TAMPER DEMO + EXPORT)
          ========================================================================= */}
      <section id="ledger" style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Cryptographic Evidence Ledger
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Hash-chained proof you can verify.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Every measurement, model response, and gate verdict is hashed into an append-only chain. Test tampering in real-time below.
          </p>
        </div>

        <div className="card" style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`chip ${isMiniTampered ? "fail" : "pass"}`}>
                {isMiniTampered ? "HASH MISMATCH DETECTED" : "CHAIN INTACT (SHA-256)"}
              </span>
              <span className="mono" style={{ fontSize: "12px", color: "var(--ink2)" }}>
                entry_hash = SHA256(prev_hash + body)
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`btn sm ${isMiniTampered ? "danger" : "sec"}`}
                onClick={() => setIsMiniTampered(!isMiniTampered)}
              >
                {isMiniTampered ? "Restore Clean Chain" : "Simulate Tamper on Block #2"}
              </button>
              <button
                type="button"
                className="btn sm sec"
                onClick={handleExportSampleLedger}
              >
                Export Evidence (Markdown)
              </button>
            </div>
          </div>

          {/* 4 Chained Blocks Display */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              { idx: 0, type: "INTAKE", hash: "8f4b238e", status: "VERIFIED" },
              { idx: 1, type: "BASELINE", hash: "318cb929", status: "VERIFIED" },
              {
                idx: 2,
                type: "HYPOTHESIS",
                hash: isMiniTampered ? "45a89df0 [MUTATED]" : "45a89df0",
                status: isMiniTampered ? "TAMPERED" : "VERIFIED",
              },
              {
                idx: 3,
                type: "VERDICT",
                hash: isMiniTampered ? "BROKEN CHAIN" : "b3e94a8f",
                status: isMiniTampered ? "HASH MISMATCH" : "VERIFIED",
              },
            ].map((b) => {
              const isBad = isMiniTampered && b.idx >= 2;
              return (
                <div
                  key={b.idx}
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    border: `1px solid ${isBad ? "var(--fail)" : "var(--line)"}`,
                    background: isBad ? "color-mix(in srgb, var(--fail) 6%, var(--surface))" : "var(--surface2)",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span className="mono">BLOCK #{b.idx}</span>
                    <span style={{ color: isBad ? "var(--fail)" : "var(--pass)", fontWeight: 700 }}>
                      {b.status}
                    </span>
                  </div>
                  <b style={{ fontSize: "12px", display: "block" }}>{b.type}</b>
                  <div className="mono" style={{ fontSize: "10.5px", marginTop: "6px", color: isBad ? "var(--fail)" : "var(--ink2)" }}>
                    {b.hash}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: DETECTOR LIBRARY (19 CLASSES ACROSS 3 TIERS)
          ========================================================================= */}
      <section id="detectors" style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Detector Library
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            19 problem classes. Zero blind spots.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Structured across performance regressions, security boundary invariants, and concurrency &amp; resource safety.
          </p>
        </div>

        {/* Tier filter */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            className={`btn sm ${detectorTier === "ALL" ? "" : "sec"}`}
            onClick={() => setDetectorTier("ALL")}
          >
            All 19 Detectors
          </button>
          <button
            type="button"
            className={`btn sm ${detectorTier === "PERF" ? "" : "sec"}`}
            onClick={() => setDetectorTier("PERF")}
          >
            Tier 1: Performance (7)
          </button>
          <button
            type="button"
            className={`btn sm ${detectorTier === "SEC" ? "" : "sec"}`}
            onClick={() => setDetectorTier("SEC")}
          >
            Tier 2: Security Invariants (6)
          </button>
          <button
            type="button"
            className={`btn sm ${detectorTier === "RES" ? "" : "sec"}`}
            onClick={() => setDetectorTier("RES")}
          >
            Tier 3: Concurrency &amp; Resources (6)
          </button>
        </div>

        {/* Detector Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {[
            { id: "T1-1", title: "Unindexed Query in Hot Path", tier: "PERF", status: "Live" },
            { id: "T1-2", title: "N+1 Query Explosion", tier: "PERF", status: "Live" },
            { id: "T1-3", title: "Broken Cache Isolation (IDOR)", tier: "PERF", status: "Live" },
            { id: "T1-4", title: "Excessive Serialization", tier: "PERF", status: "Live" },
            { id: "T1-5", title: "Redundant API Roundtrips", tier: "PERF", status: "Beta" },
            { id: "T1-6", title: "Connection Pool Starvation", tier: "PERF", status: "Beta" },
            { id: "T1-7", title: "Unbounded Payload Ingest", tier: "PERF", status: "Planned" },
            { id: "T2-1", title: "Regex Backtracking (ReDoS)", tier: "SEC", status: "Live" },
            { id: "T2-2", title: "Missing Authorization Predicate", tier: "SEC", status: "Live" },
            { id: "T2-3", title: "Insecure Session Cookie", tier: "SEC", status: "Live" },
            { id: "T2-4", title: "Permissive CSP Wildcards", tier: "SEC", status: "Live" },
            { id: "T2-5", title: "Exposed Secret / Key In Script", tier: "SEC", status: "Live" },
            { id: "T2-6", title: "DOM-Based innerHTML Sink", tier: "SEC", status: "Beta" },
            { id: "T3-1", title: "Blocking Call in async def", tier: "RES", status: "Live" },
            { id: "T3-2", title: "File Descriptor Leak", tier: "RES", status: "Live" },
            { id: "T3-3", title: "Memory Leak in In-Process Cache", tier: "RES", status: "Live" },
            { id: "T3-4", title: "Thread Pool Deadlock", tier: "RES", status: "Beta" },
            { id: "T3-5", title: "Unbounded Event Emitter", tier: "RES", status: "Beta" },
            { id: "T3-6", title: "Lost Update Race Condition", tier: "RES", status: "Planned" },
          ]
            .filter((d) => detectorTier === "ALL" || d.tier === detectorTier)
            .map((d, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span className="chip brand" style={{ fontSize: "10px" }}>{d.id}</span>
                  <span
                    className={`chip ${d.status === "Live" ? "pass" : d.status === "Beta" ? "warn" : ""}`}
                    style={{ fontSize: "9px" }}
                  >
                    {d.status}
                  </span>
                </div>
                <b style={{ fontSize: "13px" }}>{d.title}</b>
              </div>
            ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: RUNS ON (HONEST ARCHITECTURE DIAGRAM)
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Infrastructure
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Runs on Nebius Token Factory &amp; NVIDIA Nemotron 3.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Honest architecture with real latency and token cost transparency.
          </p>
        </div>

        <div className="card" style={{ padding: "28px", maxWidth: "1000px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
              gap: "10px",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "16px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Client Interface</div>
              <b style={{ fontSize: "14px" }}>Next.js UI &amp; CLI</b>
              <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "4px" }}>&lt; 50 ms render</div>
            </div>

            <div style={{ color: "var(--brand)", fontWeight: 700 }}>→</div>

            <div style={{ padding: "16px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Verification Core</div>
              <b style={{ fontSize: "14px" }}>FastAPI Engine</b>
              <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "4px" }}>Orchestrator</div>
            </div>

            <div style={{ color: "var(--brand)", fontWeight: 700 }}>→</div>

            <div style={{ padding: "16px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>Token Factory</div>
              <b style={{ fontSize: "14px" }}>NVIDIA Nemotron 3</b>
              <div style={{ fontSize: "11px", color: "var(--brand)", marginTop: "4px" }}>142 ms latency · $0.0018</div>
            </div>

            <div style={{ color: "var(--brand)", fontWeight: 700 }}>→</div>

            <div style={{ padding: "16px", background: "var(--surface2)", borderRadius: "8px" }}>
              <div className="eyebrow" style={{ fontSize: "9.5px" }}>MicroVM Sandboxes</div>
              <b style={{ fontSize: "14px" }}>Rootless Sandbox</b>
              <div style={{ fontSize: "11px", color: "var(--pass)", marginTop: "4px" }}>network=none</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: BENCHMARKS
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Statistical Verification
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Verified benchmarks. No marketing claims.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Every benchmark publishes sample size n, confidence interval, and p-value against the noise floor.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <div className="eyebrow" style={{ fontSize: "10px" }}>Benchmark Run #9142</div>
            <h3 style={{ fontSize: "16px", margin: "4px 0 10px" }}>N+1 Query Elimination</h3>
            <div style={{ fontSize: "28px", fontFamily: "var(--f-display)", fontWeight: 700, color: "var(--pass)" }}>
              +74.2% <small style={{ fontSize: "14px", color: "var(--ink2)" }}>speedup</small>
            </div>
            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "8px" }}>
              n = 50 runs · 99% CI [72.1%, 76.3%] · p &lt; 0.001
            </div>
          </div>

          <div className="card" style={{ padding: "20px" }}>
            <div className="eyebrow" style={{ fontSize: "10px" }}>Benchmark Run #4821</div>
            <h3 style={{ fontSize: "16px", margin: "4px 0 10px" }}>Tenant-Isolated Cache</h3>
            <div style={{ fontSize: "28px", fontFamily: "var(--f-display)", fontWeight: 700, color: "var(--pass)" }}>
              4.8× <small style={{ fontSize: "14px", color: "var(--ink2)" }}>p95 reduction</small>
            </div>
            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "8px" }}>
              n = 30 runs · 99% CI [4.5x, 5.1x] · p &lt; 0.001
            </div>
          </div>

          <div className="card" style={{ padding: "20px" }}>
            <div className="eyebrow" style={{ fontSize: "10px" }}>Benchmark Run #2034</div>
            <h3 style={{ fontSize: "16px", margin: "4px 0 10px" }}>Async Non-Blocking IO</h3>
            <div style={{ fontSize: "28px", fontFamily: "var(--f-display)", fontWeight: 700, color: "var(--pass)" }}>
              +91.0% <small style={{ fontSize: "14px", color: "var(--ink2)" }}>throughput</small>
            </div>
            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "8px" }}>
              n = 100 runs · 99% CI [89.4%, 92.6%] · p &lt; 0.001
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: SECURITY & GOVERNANCE
          ========================================================================= */}
      <section id="security" style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Enterprise Trust
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Designed for strict enterprise governance.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Rootless sandbox microVMs, immutable hash-chained audit trails, and 4-tier tenant isolation.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <b style={{ fontSize: "15px" }}>Sandbox Isolation</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "8px 0 0" }}>
              Every candidate patch runs in an isolated ephemeral microVM with <code>network=none</code>, 60s hard timeout, and 1GB RAM quota.
            </p>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <b style={{ fontSize: "15px" }}>4-Tier RBAC Boundaries</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "8px 0 0" }}>
              Strict isolation between Super Admin, Operations Admin, Lead Developer, and Security Auditor personas.
            </p>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <b style={{ fontSize: "15px" }}>Zero Data Retention</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "8px 0 0" }}>
              Customer code is wiped immediately upon sandbox teardown. Only cryptographic hashes persist in the ledger.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: ROLES (INTERACTIVE TABS: DEVELOPER, AUDITOR, ADMIN)
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Persona Views
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            Tailored consoles for each role.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            See how ProofStack tailors its interface to the needs of different team members.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          <button
            type="button"
            className={`btn sm ${roleTab === "developer" ? "" : "sec"}`}
            onClick={() => setRoleTab("developer")}
          >
            Lead Developer
          </button>
          <button
            type="button"
            className={`btn sm ${roleTab === "security" ? "" : "sec"}`}
            onClick={() => setRoleTab("security")}
          >
            Security Auditor
          </button>
          <button
            type="button"
            className={`btn sm ${roleTab === "admin" ? "" : "sec"}`}
            onClick={() => setRoleTab("admin")}
          >
            Super Admin
          </button>
        </div>

        <div className="card" style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
          {roleTab === "developer" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <b style={{ fontSize: "14px" }}>Developer Workspace: Studio &amp; DAST Scanner</b>
                <span className="chip brand">Lead Developer</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 14px" }}>
                Write code, test candidate patches, trigger Nemotron self-healing repair cycles, and inspect unified diffs.
              </p>
              <div className="mono" style={{ fontSize: "11px", background: "var(--surface2)", padding: "10px 14px", borderRadius: "6px" }}>
                Primary Path: /studio · Quota: 80,000 tokens · Permissions: Code execution &amp; DAST scans
              </div>
            </div>
          )}

          {roleTab === "security" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <b style={{ fontSize: "14px" }}>Auditor Workspace: Cryptographic Ledger &amp; Tamper Verification</b>
                <span className="chip brand">Security Auditor</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 14px" }}>
                Read-only verification of SHA-256 evidence ledgers, adversarial tamper simulations, and exportable audit packs.
              </p>
              <div className="mono" style={{ fontSize: "11px", background: "var(--surface2)", padding: "10px 14px", borderRadius: "6px" }}>
                Primary Path: /ledger · Permissions: Tamper simulation &amp; compliance exports (code execution denied)
              </div>
            </div>
          )}

          {roleTab === "admin" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <b style={{ fontSize: "14px" }}>Governance Workspace: Control Plane &amp; Team Quotas</b>
                <span className="chip brand">Super Admin</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 14px" }}>
                Manage team token budgets, monitor MicroVM pool saturation, and enforce emergency policy override locks.
              </p>
              <div className="mono" style={{ fontSize: "11px", background: "var(--surface2)", padding: "10px 14px", borderRadius: "6px" }}>
                Primary Path: /control-plane · Quota: Unlimited · Powers: Emergency policy override &amp; user credentials
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: CLI & CI
          ========================================================================= */}
      <section id="cli-ci" style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Developer Automation
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            CLI &amp; CI/CD integration in one line.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            Run ProofStack locally with <code>proofstack scan | verify | report</code> or in your GitHub Actions pipeline.
          </p>
        </div>

        <div className="card" style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span className="mono" style={{ fontSize: "12px", color: "var(--ink2)" }}>
              .github/workflows/proofstack.yml
            </span>
            <button type="button" className="btn sm sec" onClick={handleCopyGithubAction}>
              {copiedCi ? "Copied YAML!" : "Copy GitHub Action"}
            </button>
          </div>

          <pre
            className="mono"
            style={{
              background: "var(--term-bg, #12151F)",
              color: "#E2E7F5",
              padding: "16px",
              borderRadius: "8px",
              fontSize: "12px",
              lineHeight: 1.55,
              margin: 0,
              overflowX: "auto",
            }}
          >
{`name: ProofStack Zero-Compromise Verification
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ProofStack Verification Action
        uses: perfproof/proofstack-action@v1
        with:
          api-token: \${{ secrets.PROOFSTACK_TOKEN }}
          nebius-api-key: \${{ secrets.NEBIUS_TOKEN_FACTORY_KEY }}
          mode: "OPTIMIZE"
          enforce-gates: "G0,G1,G2,G3,G4,G5,G6,G7"`}
          </pre>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13: FAQ + LIMITS (HONEST SCOPE)
          ========================================================================= */}
      <section style={{ padding: "64px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--brand)", marginBottom: "6px" }}>
            Transparent Scope
          </div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "36px", fontWeight: 600, margin: "0 0 12px" }}>
            FAQ &amp; honest limits.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", margin: 0 }}>
            No exaggerated claims. Here is exactly what ProofStack v0.1 supports today.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "1000px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "18px" }}>
            <b style={{ fontSize: "14px" }}>What languages are supported in v0.1?</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "6px 0 0" }}>
              v0.1 focuses deeply on Python 3.11/3.12 (FastAPI, SQLAlchemy, asyncio). Node.js and Go detectors are on the 2026 roadmap.
            </p>
          </div>
          <div className="card" style={{ padding: "18px" }}>
            <b style={{ fontSize: "14px" }}>Does ProofStack auto-merge patches?</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "6px 0 0" }}>
              Never without explicit human sign-off. A patch must pass all gates, and then an authorized engineer must accept it.
            </p>
          </div>
          <div className="card" style={{ padding: "18px" }}>
            <b style={{ fontSize: "14px" }}>How are sandboxes isolated?</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "6px 0 0" }}>
              Each run executes inside a rootless container/microVM with zero network egress, seccomp filters, and cgroup resource caps.
            </p>
          </div>
          <div className="card" style={{ padding: "18px" }}>
            <b style={{ fontSize: "14px" }}>Can the evidence ledger be forged?</b>
            <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "6px 0 0" }}>
              No. Each block includes the SHA-256 hash of the previous block plus the canonical JSON payload. Any mutation breaks the chain.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 14: FINAL CTA + COMPLETE ENTERPRISE FOOTER
          ========================================================================= */}
      <section style={{ padding: "64px 0 0", borderTop: "1px solid var(--line)" }}>
        {/* Repeat CTA Box */}
        <div
          className="card"
          style={{
            padding: "48px 36px",
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 auto 64px",
            background: "color-mix(in srgb, var(--brand) 5%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--brand) 30%, var(--line))",
          }}
        >
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "34px", fontWeight: 600, margin: "0 0 14px" }}>
            Deploy verified AI fixes with zero compromises.
          </h2>
          <p style={{ color: "var(--ink2)", fontSize: "15px", maxWidth: "600px", margin: "0 auto 24px" }}>
            Explore the live seed investigations, run active DAST probes, and inspect cryptographic evidence ledgers today.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button type="button" className="btn lg" onClick={handleLaunchDemo}>
              Open live demo
            </button>
            <a href="#cli-ci" className="btn lg sec">
              Read Docs
            </a>
          </div>
        </div>

        {/* 4 Columns Enterprise Footer */}
        <footer style={{ borderTop: "1px solid var(--line)", paddingTop: "48px", paddingBottom: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "32px", marginBottom: "40px" }}>
            {/* Brand Block */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <b style={{ fontFamily: "var(--f-display)", fontSize: "18px" }}>ProofStack</b>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--ink2)", lineHeight: 1.5, margin: "0 0 14px", maxWidth: "260px" }}>
                Autonomous verification for AI-written fixes: faster code, with proof it is still safe.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="chip" style={{ fontSize: "10px" }}>Open source · Apache-2.0</span>
              </div>
            </div>

            {/* Column 1: Product */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Product
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <li><Link href="/cockpit/TASK9142">Cockpit</Link></li>
                <li><Link href="/studio">Investigations</Link></li>
                <li><Link href="/ledger">Evidence ledger</Link></li>
                <li><Link href="/catalog">Detectors</Link></li>
                <li><Link href="/findings">Reports</Link></li>
              </ul>
            </div>

            {/* Column 2: Developers */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Developers
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <li><a href="#cli-ci">Docs</a></li>
                <li><a href="#cli-ci">CLI quickstart</a></li>
                <li><a href="/api/docs">API reference</a></li>
                <li><a href="#cli-ci">GitHub Action</a></li>
                <li><span style={{ color: "var(--ink3)" }}>Changelog (v0.1)</span></li>
              </ul>
            </div>

            {/* Column 3: Trust */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Trust
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <li><a href="#security">Security model</a></li>
                <li><a href="#security">Sandbox isolation</a></li>
                <li><a href="#security">Data handling</a></li>
                <li><Link href="/control-plane">Audit &amp; RBAC</Link></li>
                <li><a href="mailto:security@perfproof.internal">Report vulnerability</a></li>
              </ul>
            </div>

            {/* Column 4: Project */}
            <div>
              <div className="eyebrow" style={{ fontSize: "10.5px", marginBottom: "12px", color: "var(--ink)" }}>
                Project
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--ink2)" }}>
                <li><a href="https://github.com/perfproof/proofstack" target="_blank" rel="noreferrer">GitHub Repo</a></li>
                <li><a href="https://devpost.com" target="_blank" rel="noreferrer">Devpost submission</a></li>
                <li><button type="button" onClick={handleLaunchDemo} style={{ color: "inherit", padding: 0 }}>Demo video</button></li>
                <li><a href="mailto:contact@perfproof.internal">Contact team</a></li>
              </ul>
            </div>
          </div>

          {/* Status & Legal Bar */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--ink2)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="dot" style={{ background: "var(--pass)" }} />
                All systems normal
              </span>
              <span>·</span>
              <span className="mono">Region: EU · v1.0</span>
            </div>

            <div>
              © 2026 ProofStack · Built for the Nebius × NVIDIA Global AI Hackathon
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>Terms</span>
              <span>·</span>
              <span>Privacy</span>
              <span>·</span>
              <span>Licences</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
