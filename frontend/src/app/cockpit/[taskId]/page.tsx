"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { MOCK_CATALOG, getProblemLogs } from "@/lib/mockData";
import { CatalogProblem } from "@/lib/types";

function CockpitContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const { setIsCopilotOpen } = useTheme();
  const roleDef = ROLES[role] || ROLES.developer;

  const taskId = (params?.taskId as string) || "TASK9142";
  const problemParam = searchParams.get("problem");
  const tabParam = searchParams.get("tab") || searchParams.get("viewport");
  const initialTab = tabParam ? parseInt(tabParam) : 4;
  const [activeTab, setActiveTab] = useState<number>(initialTab || 4);

  // Dynamic problem resolution
  const targetProblem: CatalogProblem =
    MOCK_CATALOG.find((p) => p.id.toLowerCase() === (problemParam || "").toLowerCase()) ||
    MOCK_CATALOG.find((p) => p.id.toLowerCase() === taskId.toLowerCase()) ||
    (taskId === "TASK771B" || taskId === "F-102"
      ? MOCK_CATALOG.find((p) => p.id === "T1-3")
      : taskId === "TASK248E" || taskId === "F-103"
      ? MOCK_CATALOG.find((p) => p.id === "T1-1")
      : taskId === "TASKC02A" || taskId === "F-104"
      ? MOCK_CATALOG.find((p) => p.id === "T1-4")
      : taskId === "F-105"
      ? MOCK_CATALOG.find((p) => p.id === "T1-5")
      : taskId === "F-106"
      ? MOCK_CATALOG.find((p) => p.id === "T1-6")
      : MOCK_CATALOG.find((p) => p.id === "T1-2")) ||
    MOCK_CATALOG[0];

  const [selectedProblem, setSelectedProblem] = useState<CatalogProblem>(targetProblem);
  const targetFilename = selectedProblem.filename || "main.py";
  const targetProbe = selectedProblem.probeFile || "probe.py";

  // DAST Scanner state
  const [isDastRunning, setIsDastRunning] = useState<boolean>(false);
  const [dastProgress, setDastProgress] = useState<string>("12 / 12 checks");
  const [dastUrl, setDastUrl] = useState<string>("https://staging.perfproof.internal");
  const [dastProfile, setDastProfile] = useState<"OWASP Top-10 Quick" | "Full Active Probe">("OWASP Top-10 Quick");
  const [remediationModal, setRemediationModal] = useState<{ id: string; title: string; file: string; fix: string } | null>(null);

  // Terminal interactive command state
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[PROOFSTACK_SANDBOX] Bootstrapping rootless microVM environment... (network=none, limits=60s, 1GB RAM)",
    ...getProblemLogs(targetProblem, "safe"),
  ]);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  // Sync selected problem when taskId or problemParam changes
  useEffect(() => {
    setSelectedProblem(targetProblem);
    setTerminalLogs([
      "[PROOFSTACK_SANDBOX] Bootstrapping rootless microVM environment... (network=none, limits=60s, 1GB RAM)",
      ...getProblemLogs(targetProblem, "safe"),
    ]);
  }, [taskId, problemParam]);

  useEffect(() => {
    if (tabParam) {
      const parsed = parseInt(tabParam);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        setActiveTab(parsed);
      }
    }
  }, [tabParam]);

  // Listen for keyboard tab switches (1-6) dispatched by AppShell
  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (e.detail?.tab && e.detail.tab >= 1 && e.detail.tab <= 6) {
        handleTabChange(e.detail.tab);
      }
    };
    window.addEventListener("proofstack:switch-cockpit-tab", handleSwitch);
    return () => window.removeEventListener("proofstack:switch-cockpit-tab", handleSwitch);
  }, []);

  const handleTabChange = (t: number) => {
    setActiveTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t.toString());
    window.history.pushState({}, "", url.toString());
  };

  const handleDispatchDast = () => {
    setIsDastRunning(true);
    setDastProgress("Running: 3 / 12 checks");
    setTimeout(() => setDastProgress("Running: 7 / 12 checks"), 350);
    setTimeout(() => setDastProgress("Running: 10 / 12 checks"), 700);
    setTimeout(() => {
      setDastProgress("12 / 12 checks");
      setIsDastRunning(false);
    }, 1100);
  };

  const handleRemediate = (checkId: string) => {
    const fixes: Record<string, { title: string; file: string; fix: string }> = {
      "D-01": {
        title: "D-01: Missing Security Headers (CSP, HSTS)",
        file: "next.config.js",
        fix: `// next.config.js - Injected strict security headers\nmodule.exports = {\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [\n          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'nonce-rAnd0m'; object-src 'none';" },\n          { key: 'X-Content-Type-Options', value: 'nosniff' },\n          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }\n        ]\n      }\n    ];\n  }\n};`,
      },
      "D-02": {
        title: "D-02: Permissive CSP Wildcards",
        file: "middleware.ts",
        fix: `// middleware.ts - Nonce generator & safe origins\nimport { NextResponse } from 'next/server';\nexport function middleware(request) {\n  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');\n  const csp = "default-src 'self'; script-src 'self' 'nonce-" + nonce + "';";\n  const response = NextResponse.next();\n  response.headers.set('Content-Security-Policy', csp);\n  return response;\n}`,
      },
      "D-03": {
        title: "D-03: Insecure Session Cookie",
        file: "src/server/auth.ts",
        fix: `// Set-Cookie with HttpOnly & SameSite=Strict\nres.setHeader('Set-Cookie', \`session_id=\${id}; Path=/; HttpOnly; SameSite=Strict; Secure\`);`,
      },
      "D-05": {
        title: "D-05: Exposed Client-Side AWS Access Key",
        file: ".env.production",
        fix: `// Remove from client bundle - move to server-side only\nAWS_SECRET_ACCESS_KEY=process.env.INTERNAL_AWS_KEY;\n// Delete NEXT_PUBLIC_AWS_KEY from client bundle`,
      },
      "D-06": {
        title: "D-06: DOM-Based XSS (location.hash sink)",
        file: "src/components/SearchBox.tsx",
        fix: `// Sanitize or use textContent instead of innerHTML\ndocument.getElementById('results').textContent = decodeURIComponent(location.hash.slice(1));`,
      },
      "D-07": {
        title: "D-07: Exposed Public Environment File (/.env)",
        file: "public/.env",
        fix: `# Remove .env from static public/ assets directory completely\nrm public/.env\n# Enforce .gitignore rule for all environment configurations`,
      },
    };

    const targetFix = fixes[checkId] || {
      title: `${checkId}: Security Remediation`,
      file: targetFilename,
      fix: `# Verified Defensive Fix synthesized via NVIDIA Nemotron 3.5\n# Invariant predicates preserved across all routes.`,
    };

    setRemediationModal({ id: checkId, ...targetFix });
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const lower = cmd.toLowerCase();
    const ts = new Date().toLocaleTimeString();

    if (lower === "clear") {
      setTerminalLogs(["[PROOFSTACK_SANDBOX] Console cleared. Type 'help' for available commands."]);
      setTerminalInput("");
      return;
    }

    let newLogs = [`proofstack@microvm:~$ ${cmd}`];

    if (lower === "help") {
      newLogs.push(
        "Available ProofStack MicroVM Commands:",
        `  pytest             - Run test suite for ${targetFilename} (28 tests)`,
        `  proofstack verify  - Evaluate Zero-Compromise Invariants (G0-G7) on ${selectedProblem.id}`,
        `  scan               - Run static AST hygiene and credential detector on ${targetFilename}`,
        "  ledger             - Inspect SHA-256 evidence chain head state",
        "  env                - Inspect MicroVM sandbox isolation parameters",
        "  clear              - Clear terminal console output"
      );
    } else if (lower === "pytest") {
      const probeName = targetProbe;
      newLogs.push(
        `[${ts}] rootless@microvm:~$ pytest tests/ -v`,
        `tests/test_${selectedProblem.id.toLowerCase().replace("-", "_")}.py::test_${selectedProblem.id.toLowerCase().replace("-", "_")}_correctness PASSED  [ 14%]`,
        `tests/test_${selectedProblem.id.toLowerCase().replace("-", "_")}.py::test_${selectedProblem.id.toLowerCase().replace("-", "_")}_invariants PASSED   [ 35%]`,
        `tests/test_performance.py::test_scaling_bound PASSED     [ 60%]`,
        `tests/test_security.py::test_${probeName.replace(".py", "")} PASSED   [ 85%]`,
        `tests/test_hygiene.py::test_clean_ast PASSED            [100%]`,
        "======================== 28 passed in 0.42s ========================"
      );
    } else if (lower.includes("verify")) {
      newLogs.push(
        `[${ts}] [GAUNTLET] Zero-Compromise Invariant Verification for ${selectedProblem.id} (G0-G7):`,
        "  ✓ GATE G0: PASS (Pre-gate AST scan: 0 banned imports, lockfile clean)",
        "  ✓ GATE G1: PASS (28 unit tests passed on candidate, zero regressions)",
        `  ✓ GATE G2: PASS (Target probe ${targetProbe} flipped RED -> GREEN)`,
        `  ✓ GATE G3: PASS (Identity Guard: user_id, tenant_id preserved in ${targetFilename})`,
        "  ✓ GATE G4: PASS (Concurrency: 0 lost updates, max loop lag 12ms < 50ms)",
        `  ✓ GATE G5: PASS (Performance: ${selectedProblem.metrics?.baseline.keyMetric || "baseline"} -> ${selectedProblem.metrics?.safe.keyMetric || "safe"}, delta: +74.2%)`,
        "  ✓ GATE G6: PASS (Resources: tracemalloc delta 1.2MB < 20MB ceiling, FD delta = 0)",
        `  ✓ GATE G7: PASS (Hygiene: writable paths respected in ${targetFilename}, tests untouched)`,
        "  VERDICT: ZERO-COMPROMISE INVARIANT SATISFIED -> ACCEPT"
      );
    } else if (lower === "scan") {
      newLogs.push(
        `[${ts}] [AST_SCAN] Analyzing ${targetFilename} tree for unsafe patterns...`,
        `  - Target: ${targetFilename} (${selectedProblem.domain})`,
        "  - Checked source files for banned imports (pickle, os.system, raw string sql)",
        "  - AST validation result: CLEAN · Zero banned symbols identified"
      );
    } else if (lower === "ledger") {
      newLogs.push(
        `[${ts}] [LEDGER] Querying SHA-256 evidence chain head...`,
        "  Chain status: VALID",
        `  Current head: BLOCK #5 (DEFENSIVE_PATCH_COMMIT for ${selectedProblem.id})`,
        "  Entry hash:   b3e94a8f1234567890abcdef1234567890abcdef1234567890abcdef12345678",
        "  Verified by:  Nebius Token Factory / NVIDIA Nemotron 3"
      );
    } else if (lower === "env") {
      newLogs.push(
        `[${ts}] [SANDBOX_ENV] MicroVM Parameters:`,
        "  isolation_backend: firecracker/rootless",
        "  network: none (zero egress)",
        "  execution_ceiling: 60s hard timeout",
        "  memory_quota: 1024 MB",
        `  active_target: ${targetFilename}`,
        "  ephemeral_scratch: /tmp/scratch_cebb6932"
      );
    } else {
      newLogs.push(`bash: command not found: ${cmd}. Type 'help' for available commands.`);
    }

    setTerminalLogs((prev) => [...prev, ...newLogs]);
    setTerminalInput("");
  };

  const handleCopyTerminal = () => {
    const text = terminalLogs.join("\n");
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    }
  };

  const primaryMetric = selectedProblem.metrics?.baseline.keyMetric || "5,001";
  const safeMetric = selectedProblem.metrics?.safe.keyMetric || "1";
  const latencyDisplay = selectedProblem.metrics
    ? `${selectedProblem.metrics.baseline.latency} → ${selectedProblem.metrics.safe.latency}`
    : "428 → 12 ms";
  const scalingDisplay = selectedProblem.metrics?.safe.delta || "1.02";

  return (
    <div>
      {/* Header Row */}
      <div
        className="row"
        style={{
          marginBottom: "14px",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div className="row" style={{ gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <span className="chip mono" style={{ fontSize: "11px", fontWeight: 700 }}>
            {taskId}
          </span>
          <b
            className="disp"
            style={{ fontSize: "17px", fontWeight: 600, color: "var(--ink)" }}
          >
            {targetFilename}: ({selectedProblem.id} {selectedProblem.title})
          </b>
          {/* Quick Problem Switcher for Hackathon Judges */}
          <select
            value={selectedProblem.id}
            onChange={(e) => {
              const p = MOCK_CATALOG.find((item) => item.id === e.target.value);
              if (p) {
                setSelectedProblem(p);
                const url = new URL(window.location.href);
                url.searchParams.set("problem", p.id);
                window.history.pushState({}, "", url.toString());
                setTerminalLogs([
                  "[PROOFSTACK_SANDBOX] Bootstrapping rootless microVM environment... (network=none, limits=60s, 1GB RAM)",
                  ...getProblemLogs(p, "safe"),
                ]);
              }
            }}
            style={{
              padding: "4px 8px",
              borderRadius: "5px",
              border: "1px solid var(--line)",
              background: "var(--surface2)",
              color: "var(--ink)",
              fontSize: "11.5px",
              fontFamily: "var(--f-mono)",
            }}
          >
            {MOCK_CATALOG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.filename} — {p.title}
              </option>
            ))}
          </select>
          <span className="chip" style={{ fontSize: "11px", padding: "2px 8px" }}>
            📄 orders.py (get_orders)
          </span>
        </div>

        <div className="row" style={{ gap: "10px" }}>
          <span className="stamp">
            <svg className="i" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            GAUNTLET VERDICT: ACCEPT
          </span>
          {roleDef.canAccessStudio && (
            <button
              type="button"
              className="btn sm sec"
              onClick={() => router.push(`/studio?problem=${selectedProblem.id}`)}
              style={{ cursor: "pointer" }}
              title="Open in Studio"
            >
              STUDIO →
            </button>
          )}
          {roleDef.canIngestTask && (
            <button
              type="button"
              className="btn sm sec"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
            >
              <svg className="i" viewBox="0 0 24 24">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              RETEST
            </button>
          )}
        </div>
      </div>

      {/* Six Cockpit Tabs */}
      <div className="tabs" style={{ marginBottom: "18px" }}>
        <div
          className={`tab ${activeTab === 1 ? "on" : ""}`}
          onClick={() => handleTabChange(1)}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          1. Baseline &amp; Telemetry
        </div>
        <div
          className={`tab ${activeTab === 2 ? "on" : ""}`}
          onClick={() => handleTabChange(2)}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          2. Hypothesis Timeline
        </div>
        <div
          className={`tab ${activeTab === 3 ? "on" : ""}`}
          onClick={() => handleTabChange(3)}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          3. Diff &amp; Exploit Inspector
        </div>
        <div
          className={`tab ${activeTab === 4 ? "on" : ""}`}
          onClick={() => handleTabChange(4)}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          4. Zero-Compromise Console
        </div>
        <div
          className={`tab ${activeTab === 5 ? "on" : ""}`}
          onClick={() => handleTabChange(5)}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          5. Live Sandbox Terminal
        </div>
        <div
          className={`tab ${activeTab === 6 ? "on" : ""}`}
          onClick={() => handleTabChange(6)}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          6. Live DAST Scanner
        </div>
      </div>

      {/* TAB 1: Baseline & Telemetry */}
      {activeTab === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 4 Stat Cards */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div className="card kpi">
              <div className="eyebrow">Exact Baseline Metric (Rank {selectedProblem.truthRank || 1})</div>
              <div className="v">{primaryMetric}</div>
              <div className="d">{selectedProblem.summary}</div>
            </div>
            <div className="card kpi">
              <div className="eyebrow">Baseline Latency / Scaling</div>
              <div className="v">
                {latencyDisplay.split("→")[0]?.trim() || "428 ms"}
              </div>
              <div className="d">Empirical Benchmark Profile ({selectedProblem.domain})</div>
            </div>
            <div className="card kpi">
              <div className="eyebrow">Coefficient of Variation</div>
              <div className="v">0.041</div>
              <div className="d">(4.1%) · Stable environment (&lt; 15% threshold)</div>
            </div>
            <div className="card kpi">
              <div className="eyebrow">Empirical Noise Floor (τ_noise)</div>
              <div className="v">0.050</div>
              <div className="d">(5.0%) · max(τ_min, k·CV, CI95)</div>
            </div>
          </div>

          {/* Histogram & Hotspots Row */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* pyperf Latency Dispersion Histogram */}
            <div className="card">
              <div className="row" style={{ marginBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Latency dispersion histogram (pyperf)</h3>
                <span className="chip" style={{ marginLeft: "auto" }}>10 SAMPLES</span>
              </div>
              <div className="hist">
                <i style={{ height: "35px" }} />
                <i style={{ height: "55px" }} />
                <i style={{ height: "85px" }} />
                <i style={{ height: "120px" }} />
                <i className="hi" style={{ height: "140px" }} />
                <i style={{ height: "115px" }} />
                <i style={{ height: "75px" }} />
                <i style={{ height: "45px" }} />
                <i style={{ height: "25px" }} />
                <i style={{ height: "15px" }} />
              </div>
              <div
                className="row mono"
                style={{
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--ink2)",
                  marginTop: "6px",
                }}
              >
                <span>420 ms</span>
                <span>425 ms</span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>428 ms</span>
                <span>432 ms</span>
                <span>435 ms</span>
              </div>
              <div className="sub" style={{ marginTop: "12px", fontSize: "11.5px" }}>
                Tight distribution verifies test bench stability · cv = 0.041
              </div>
            </div>

            {/* Profile Hotspot Breakdown */}
            <div className="card">
              <h3 style={{ margin: "0 0 12px" }}>Profile hotspot breakdown</h3>
              <div className="hot">
                <div>
                  <div className="nm">proofstack.{targetFilename.replace(/\//g, ".").replace(/\.py$/, "")}</div>
                  <div className="bar-h">
                    <i style={{ width: "68%" }} />
                  </div>
                </div>
                <b className="mono" style={{ textAlign: "right" }}>
                  291 ms (68%)
                </b>
              </div>
              <div className="hot">
                <div>
                  <div className="nm">core.runtime.execution_harness</div>
                  <div className="bar-h">
                    <i style={{ width: "21%" }} />
                  </div>
                </div>
                <b className="mono" style={{ textAlign: "right" }}>
                  90 ms (21%)
                </b>
              </div>
              <div className="hot">
                <div>
                  <div className="nm">telemetry.metrics.perf_collector</div>
                  <div className="bar-h">
                    <i style={{ width: "8%" }} />
                  </div>
                </div>
                <b className="mono" style={{ textAlign: "right" }}>
                  34 ms (8%)
                </b>
              </div>
              <div className="hot">
                <div>
                  <div className="nm">pydantic.main.BaseModel.model_dump</div>
                  <div className="bar-h">
                    <i style={{ width: "3%" }} />
                  </div>
                </div>
                <b className="mono" style={{ textAlign: "right" }}>
                  13 ms (3%)
                </b>
              </div>
            </div>
          </div>

          {/* Run Provenance Strip */}
          <div
            className="row mono"
            style={{
              padding: "10px 14px",
              border: "1px solid var(--line)",
              borderRadius: "7px",
              background: "var(--surface)",
              fontSize: "11px",
              color: "var(--ink2)",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <b style={{ color: "var(--brand)" }}>RUN PROVENANCE</b>
            <span>Linux 6.6-microvm x86_64</span>
            <span>read-only root</span>
            <span>Python 3.11.8</span>
            <span>📄 orders.py (get_orders)</span>
            <span>target: {targetFilename}</span>
            <span>probe: {targetProbe}</span>
            <span>network=none</span>
            <span>60 s · 1 GB RAM</span>
          </div>
        </div>
      )}

      {/* TAB 2: Hypothesis Timeline */}
      {activeTab === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Header Title with Model Chip */}
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <h2 className="disp" style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 3px" }}>
                NVIDIA Nemotron Competing Hypotheses
              </h2>
              <div className="sub">
                Model proposals vs measured empirical counter-probes for {selectedProblem.id} ({targetFilename})
              </div>
            </div>
            <span className="chip brand">MODEL: NVIDIA/NEMOTRON-3-SUPER-120B</span>
          </div>

          {/* 3 Hypothesis Cards */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {/* H1 CONFIRMED */}
            <div className="hyp win">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="id">H1</span>
                <span className="chip pass">✓ CONFIRMED</span>
              </div>
              <div className="claim">
                {selectedProblem.title}: {selectedProblem.summary}
              </div>
              <dl>
                <dt>Model Score</dt>
                <dd>94%</dd>
                <dt>Computed Support</dt>
                <dd>96%</dd>
                <div className="meter">
                  <i style={{ width: "96%" }} />
                </div>
                <dt>Experiment</dt>
                <dd>counter_probe</dd>
              </dl>
            </div>

            {/* H2 REFUTED */}
            <div className="hyp">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="id">H2</span>
                <span className="chip fail">✕ REFUTED</span>
              </div>
              <div className="claim">
                Contention caused by global lock acquisition or unindexed secondary caller overhead.
              </div>
              <dl>
                <dt>Model Score</dt>
                <dd>32%</dd>
                <dt>Computed Support</dt>
                <dd>8%</dd>
                <div className="meter">
                  <i style={{ width: "8%" }} />
                </div>
                <dt>Experiment</dt>
                <dd>static_ast</dd>
              </dl>
            </div>

            {/* H3 REFUTED */}
            <div className="hyp">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="id">H3</span>
                <span className="chip fail">✕ REFUTED</span>
              </div>
              <div className="claim">
                Ephemeral network buffer starvation or async event-loop blocking under high load.
              </div>
              <dl>
                <dt>Model Score</dt>
                <dd>41%</dd>
                <dt>Computed Support</dt>
                <dd>12%</dd>
                <div className="meter">
                  <i style={{ width: "12%" }} />
                </div>
                <dt>Experiment</dt>
                <dd>race_harness</dd>
              </dl>
            </div>
          </div>

          {/* Timeline Rail */}
          <div className="card" style={{ padding: "14px 18px" }}>
            <div className="eyebrow" style={{ marginBottom: "10px" }}>
              TIMELINE ({selectedProblem.id} · {selectedProblem.probeFile || "probe.py"})
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
              <div style={{ borderLeft: "2px solid var(--fail)", paddingLeft: "8px" }}>
                <b style={{ fontSize: "12px", display: "block" }}>Baseline</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--fail)" }}>
                  RED PROVEN
                </span>
              </div>
              <div style={{ borderLeft: "2px solid var(--brand)", paddingLeft: "8px" }}>
                <b style={{ fontSize: "12px", display: "block" }}>Hypotheses</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
                  H1 · H2 · H3
                </span>
              </div>
              <div style={{ borderLeft: "2px solid var(--pass)", paddingLeft: "8px" }}>
                <b style={{ fontSize: "12px", display: "block" }}>Discriminator</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--pass)" }}>
                  Score = 0.96
                </span>
              </div>
              <div style={{ borderLeft: "2px solid var(--brand)", paddingLeft: "8px" }}>
                <b style={{ fontSize: "12px", display: "block" }}>Patch</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
                  nemotron-3.5-lightning
                </span>
              </div>
              <div style={{ borderLeft: "2px solid var(--pass)", paddingLeft: "8px" }}>
                <b style={{ fontSize: "12px", display: "block" }}>Gauntlet</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--pass)" }}>
                  G0 – G7 PASS
                </span>
              </div>
              <div style={{ borderLeft: "2px solid var(--brand)", paddingLeft: "8px" }}>
                <b style={{ fontSize: "12px", display: "block" }}>Ledger</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
                  index 5 recorded
                </span>
              </div>
            </div>
          </div>

          {/* Decision Strip */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: "14px",
            }}
          >
            <div className="card">
              <div className="eyebrow">SELECTED HYPOTHESIS</div>
              <b style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>
                H1 · Confirmed ({selectedProblem.id})
              </b>
              <div className="sub" style={{ fontSize: "11.5px", marginTop: "4px" }}>
                Computed support 96% beat refuted H2 (8%) and H3 (12%)
              </div>
            </div>
            <div className="card">
              <div className="eyebrow">EXPERIMENT CHOSEN</div>
              <b className="mono" style={{ fontSize: "14px", display: "block", marginTop: "4px" }}>
                e_counter_probe
              </b>
              <div className="sub mono" style={{ fontSize: "11.5px", marginTop: "4px" }}>
                DISCRIMINATOR: Score(e_counter_probe) = 0.96
              </div>
            </div>
            <div className="card">
              <div className="eyebrow">NEXT</div>
              <div style={{ fontSize: "12px", marginTop: "4px", color: "var(--ink)" }}>
                Patch synthesized via nvidia/nemotron-3.5-lightning for {targetFilename}
              </div>
              <button
                type="button"
                onClick={() => handleTabChange(3)}
                style={{
                  color: "var(--brand)",
                  fontWeight: 600,
                  fontSize: "12px",
                  marginTop: "6px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                Open Diff &amp; Exploit Inspector →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Diff & Exploit Inspector */}
      {activeTab === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Title Row */}
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <h2 className="disp" style={{ fontSize: "19px", fontWeight: 600, margin: "0 0 3px" }}>
                Monaco Code Diff &amp; Identity Guard Panel
              </h2>
              <div className="sub mono" style={{ fontSize: "11.5px" }}>
                {targetFilename} · Synthesized by nvidia/nemotron-3.5-lightning
              </div>
            </div>
            <span className="chip pass">
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              G3 IDENTITY VERIFIED
            </span>
          </div>

          {/* Split Diff */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              border: "1px solid var(--line)",
              borderRadius: "8px",
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            {/* Baseline */}
            <div
              className="code"
              style={{ border: 0, borderRadius: 0, borderRight: "1px solid var(--line)", overflowX: "auto" }}
            >
              <div className="bar">Baseline · {targetFilename}</div>
              {selectedProblem.bugSnippet.split("\n").map((line, idx) => {
                const isHighlight =
                  line.includes("VULNERABLE") ||
                  line.includes("CRITICAL") ||
                  line.includes("for ") ||
                  line.includes("query") ||
                  line.includes("match") ||
                  line.includes("re.compile") ||
                  line.includes("loads");
                return (
                  <div key={idx} className={`ln ${isHighlight ? "del" : ""}`}>
                    <s>{idx + 1}</s>
                    <em>{line || " "}</em>
                  </div>
                );
              })}
            </div>

            {/* Candidate */}
            <div className="code" style={{ border: 0, borderRadius: 0, overflowX: "auto" }}>
              <div className="bar">Candidate · nemotron-3.5-lightning (Safe Fix)</div>
              {selectedProblem.safeFixSnippet.split("\n").map((line, idx) => {
                const isAdd =
                  line.includes("SAFE FIX") ||
                  line.includes("DEFENSIVE") ||
                  line.includes("joinedload") ||
                  line.includes("options") ||
                  line.includes("await") ||
                  line.includes("quantize") ||
                  line.includes("URL_PATTERN");
                return (
                  <div key={idx} className={`ln ${isAdd ? "add" : ""}`}>
                    <s>{idx + 1}</s>
                    <em>{line || " "}</em>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Identity Preservation Guard (Gate G3 Enforced) */}
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="row" style={{ marginBottom: "12px" }}>
              <div className="row">
                <svg className="i" viewBox="0 0 24 24" style={{ color: "var(--pass)" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <b className="eyebrow" style={{ fontSize: "11px" }}>
                  IDENTITY PRESERVATION GUARD (GATE G3 ENFORCED)
                </b>
              </div>
              <span className="chip pass" style={{ marginLeft: "auto" }}>
                5 / 5 PRESERVED
              </span>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  background: "var(--bg)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b className="mono" style={{ fontSize: "12px" }}>
                    tenant_id: UUID
                  </b>
                  <span className="chip pass" style={{ fontSize: "9px" }}>
                    PRESERVED
                  </span>
                </div>
                <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)", marginTop: "3px" }}>
                  parameter · {targetFilename}:42
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  background: "var(--bg)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b className="mono" style={{ fontSize: "12px" }}>
                    user_id: str
                  </b>
                  <span className="chip pass" style={{ fontSize: "9px" }}>
                    PRESERVED
                  </span>
                </div>
                <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)", marginTop: "3px" }}>
                  parameter · {targetFilename}:42
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  background: "var(--bg)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b className="mono" style={{ fontSize: "12px" }}>
                    enforce_tenant_context
                  </b>
                  <span className="chip pass" style={{ fontSize: "9px" }}>
                    PRESERVED
                  </span>
                </div>
                <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)", marginTop: "3px" }}>
                  predicate · {targetFilename}:46
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  background: "var(--bg)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b className="mono" style={{ fontSize: "12px" }}>
                    @login_required
                  </b>
                  <span className="chip pass" style={{ fontSize: "9px" }}>
                    PRESERVED
                  </span>
                </div>
                <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)", marginTop: "3px" }}>
                  decorator · {targetFilename}:40
                </div>
              </div>

              <div
                style={{
                  gridColumn: "span 2",
                  border: "1px solid var(--line)",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  background: "var(--bg)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b className="mono" style={{ fontSize: "12px" }}>
                    auth_context_validation
                  </b>
                  <span className="chip pass" style={{ fontSize: "9px" }}>
                    PRESERVED
                  </span>
                </div>
                <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)", marginTop: "3px" }}>
                  authorization_branch · {targetFilename}:52
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Zero-Compromise Console */}
      {activeTab === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Decision Invariant Card */}
          <div className="card" style={{ padding: "14px 18px" }}>
            <div className="row" style={{ marginBottom: "8px" }}>
              <div className="row">
                <svg className="i" viewBox="0 0 24 24" style={{ color: "var(--brand)" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <b className="eyebrow" style={{ fontSize: "11px" }}>
                  ZERO-COMPROMISE DECISION INVARIANT ({selectedProblem.id})
                </b>
              </div>
              <span className="stamp" style={{ marginLeft: "auto", fontSize: "11.5px" }}>
                FINAL VERDICT: ACCEPT
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div style={{ padding: "10px 14px", borderRadius: "6px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                <div className="eyebrow" style={{ fontSize: "10px" }}>SPEEDUP</div>
                <b style={{ color: "var(--pass)", fontSize: "15px" }}>+74.2% Faster</b>
                <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>Latency reduced 428ms → 12ms</div>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: "6px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                <div className="eyebrow" style={{ fontSize: "10px" }}>SECURITY</div>
                <b style={{ color: "var(--pass)", fontSize: "15px" }}>100% Safe</b>
                <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>Zero vulnerability or auth regression</div>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: "6px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                <div className="eyebrow" style={{ fontSize: "10px" }}>TESTS</div>
                <b style={{ color: "var(--pass)", fontSize: "15px" }}>Passed</b>
                <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>All 28 baseline unit tests green</div>
              </div>
            </div>
          </div>

          {/* 4 Summary Numbers */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div className="card kpi">
              <div className="eyebrow">PRIMARY METRIC</div>
              <div className="v">{primaryMetric} → {safeMetric}</div>
              <div className="d">{selectedProblem.domain} invariant satisfied</div>
            </div>
            <div className="card kpi">
              <div className="eyebrow">LATENCY</div>
              <div className="v">{latencyDisplay}</div>
              <div className="d">Profiled Execution Time</div>
            </div>
            <div className="card kpi">
              <div className="eyebrow">SCALING EXPONENT</div>
              <div className="v">{scalingDisplay}</div>
              <div className="d">Linear Scaling Bound</div>
            </div>
            <div className="card kpi">
              <div className="eyebrow">LEDGER</div>
              <div className="v" style={{ fontSize: "24px" }}>index 5</div>
              <div className="d">SHA-256 entry recorded</div>
            </div>
          </div>

          {/* 8 Gate Cells (4 x 2 Grid) */}
          <div className="gates">
            {/* G0 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G0 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G0: Pre-gate</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">AST Scan, Slopsquatting &amp; Secrets</div>
              <div className="p">Zero banned imports in {targetFilename}, AST syntax clean.</div>
            </div>

            {/* G1 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G1 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G1: Correctness</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Baseline vs Candidate Test Suite</div>
              <div className="p">All 28 baseline tests passed on candidate (0 regressions).</div>
            </div>

            {/* G2 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G2 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G2: Security</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Exploit Oracle Re-Execution</div>
              <div className="p">Target probe {targetProbe} flipped RED -&gt; GREEN. Injection vectors blocked.</div>
            </div>

            {/* G3 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G3 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G3: Identity</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Identity &amp; Auth Preservation</div>
              <div className="p">user_id, tenant_id, and @login_required preserved in AST.</div>
            </div>

            {/* G4 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G4 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G4: Concurrency</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Race Condition &amp; Deadlock Watchdog</div>
              <div className="p">20-thread stress completed: 0 lost updates, loop lag 12ms (&lt;50ms).</div>
            </div>

            {/* G5 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G5 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G5: Performance</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Truth-Hierarchy Invariant Check</div>
              <div className="p">Speedup: {primaryMetric} → {safeMetric} (+74.2% Verified Speedup)</div>
            </div>

            {/* G6 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G6 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G6: Resources</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Tracemalloc &amp; FD Leak Monitor</div>
              <div className="p">Memory growth: 1.2MB (&lt;20MB ceiling), open FD delta = 0 (&lt;5).</div>
            </div>

            {/* G7 */}
            <div
              className="gate"
              onClick={() => handleTabChange(5)}
              style={{ cursor: "pointer" }}
              title="Click to view G7 in Sandbox logs"
            >
              <div className="h">
                <span className="id">G7: Patch Hygiene</span>
                <span className="chip pass">✓ PASS</span>
              </div>
              <div className="t">Writable Scope &amp; Lockfile Guard</div>
              <div className="p">Diff strictly confined to {targetFilename}; tests untouched.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Live Sandbox Terminal */}
      {activeTab === 5 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <h2 className="disp" style={{ fontSize: "19px", fontWeight: 600, margin: "0 0 3px" }}>
                Live MicroVM Execution Stream ({selectedProblem.id})
              </h2>
              <div className="sub">
                Isolated Token Factory Sandbox · Zero network egress · Target: {targetFilename}
              </div>
            </div>
            <div className="row" style={{ gap: "8px" }}>
              <button
                type="button"
                className="btn sm sec"
                onClick={handleCopyTerminal}
                style={{ cursor: "pointer" }}
              >
                {copiedLogs ? "Copied!" : "Copy Logs"}
              </button>
            </div>
          </div>

          <div style={{ border: "1px solid #262B3B", borderRadius: "8px", overflow: "hidden", background: "#12151F" }}>
            <div className="termbar">
              <span className="chip" style={{ background: "#232838", color: "#AEB5CC" }}>
                MicroVM Sandbox Console · {targetFilename}
              </span>
              <span className="mono" style={{ fontSize: "11px", color: "#8FB0FF" }}>
                RUN_8292F0C1
              </span>
              <span className="mono" style={{ fontSize: "11px", color: "#7C8398" }}>
                ISOLATION: FIRECRACKER / ROOTLESS
              </span>
              <span
                className="chip"
                style={{
                  marginLeft: "auto",
                  background: "#1E3B2E",
                  color: "#6FD39B",
                  borderColor: "#2B523E",
                }}
              >
                EXIT CODE 0
              </span>
            </div>

            <div id="terminal-stream" className="term" role="log" style={{ minHeight: "360px", maxHeight: "450px", overflowY: "auto" }}>
              {terminalLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: "2px" }}>
                  {log}
                </div>
              ))}
            </div>

            {/* Interactive Terminal Command Input Bar */}
            <form
              onSubmit={handleCommandSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 14px",
                borderTop: "1px solid #282E44",
                background: "#0E1119",
                fontFamily: "var(--f-mono)",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#6FD39B", fontWeight: 600, marginRight: "8px", whiteSpace: "nowrap" }}>
                proofstack@microvm:~$
              </span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder={`type 'help', 'pytest', 'proofstack verify', 'scan', 'ledger', 'env', 'clear'...`}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FFFFFF",
                  fontFamily: "var(--f-mono)",
                  fontSize: "12px",
                }}
              />
              <button
                type="submit"
                className="btn sm"
                style={{ height: "24px", padding: "0 8px", fontSize: "11px", marginLeft: "8px" }}
              >
                Execute ↵
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: Live DAST Scanner */}
      {activeTab === 6 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Custom Website URL Input Bar + Profile Selector */}
          <div
            className="row"
            style={{
              padding: "12px 16px",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              background: "var(--surface)",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "320px", flexWrap: "wrap" }}>
              <div className="input mono" style={{ flex: 1, minWidth: "260px", height: "34px", padding: 0 }}>
                <input
                  type="url"
                  value={dastUrl}
                  onChange={(e) => setDastUrl(e.target.value)}
                  placeholder="Enter any live website URL, e.g., https://my-app.vercel.app"
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

              <select
                value={dastProfile}
                onChange={(e: any) => setDastProfile(e.target.value)}
                style={{
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  background: "var(--surface2)",
                  color: "var(--ink)",
                  fontSize: "12px",
                  fontFamily: "var(--f-ui)",
                }}
              >
                <option value="OWASP Top-10 Quick">OWASP Top-10 Quick</option>
                <option value="Full Active Probe">Full Active Probe</option>
              </select>
            </div>

            <button
              type="button"
              className="btn"
              onClick={handleDispatchDast}
              disabled={isDastRunning}
              style={{ cursor: "pointer" }}
            >
              <svg className="i" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {isDastRunning ? `Scanning... (${dastProgress})` : "Dispatch DAST Scan"}
            </button>
          </div>

          {/* DAST Findings Table */}
          <div className="card" style={{ padding: "14px 6px 6px", overflowX: "auto" }}>
            <table className="t">
              <thead>
                <tr>
                  <th>CHECK ID</th>
                  <th>SEVERITY</th>
                  <th>FINDING</th>
                  <th>SOURCE MAP</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {/* D-01 */}
                <tr>
                  <td><b className="mono" style={{ color: "var(--brand)" }}>D-01</b></td>
                  <td><span className="sev sevM">Medium</span></td>
                  <td>
                    <b>Missing Security Headers (CSP, HSTS, X-Content-Type-Options)</b>
                    <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "2px" }}>
                      Main document response omitted Content-Security-Policy and X-Content-Type-Options: nosniff headers.
                    </div>
                  </td>
                  <td className="m">next.config.js</td>
                  <td style={{ textAlign: "right" }}>
                    {roleDef.canRemediate && (
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => handleRemediate("D-01")}
                        style={{ cursor: "pointer" }}
                      >
                        Remediate
                      </button>
                    )}
                  </td>
                </tr>

                {/* D-02 */}
                <tr>
                  <td><b className="mono" style={{ color: "var(--brand)" }}>D-02</b></td>
                  <td><span className="sev sevM">Medium</span></td>
                  <td>
                    <b>Permissive CSP Contains &apos;unsafe-inline&apos; and Wildcard (*)</b>
                    <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "2px" }}>
                      script-src directive includes &apos;unsafe-inline&apos; and wildcard origin (*).
                    </div>
                  </td>
                  <td className="m">middleware.ts</td>
                  <td style={{ textAlign: "right" }}>
                    {roleDef.canRemediate && (
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => handleRemediate("D-02")}
                        style={{ cursor: "pointer" }}
                      >
                        Remediate
                      </button>
                    )}
                  </td>
                </tr>

                {/* D-03 */}
                <tr>
                  <td><b className="mono" style={{ color: "var(--brand)" }}>D-03</b></td>
                  <td><span className="sev sevM">Medium</span></td>
                  <td>
                    <b>Insecure Session Cookie Missing HttpOnly &amp; SameSite=Strict</b>
                    <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "2px" }}>
                      Cookie &apos;session_id&apos; set without HttpOnly flag; accessible to client JavaScript.
                    </div>
                  </td>
                  <td className="m">src/server/auth.ts</td>
                  <td style={{ textAlign: "right" }}>
                    {roleDef.canRemediate && (
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => handleRemediate("D-03")}
                        style={{ cursor: "pointer" }}
                      >
                        Remediate
                      </button>
                    )}
                  </td>
                </tr>

                {/* D-05 */}
                <tr>
                  <td><b className="mono" style={{ color: "var(--brand)" }}>D-05</b></td>
                  <td><span className="sev sevH">High</span></td>
                  <td>
                    <b>Exposed Client-Side AWS Access Key in Script Bundle</b>
                    <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "2px" }}>
                      Production JS bundle includes AWS IAM credential literal.
                    </div>
                  </td>
                  <td className="m">.env.production</td>
                  <td style={{ textAlign: "right" }}>
                    {roleDef.canRemediate && (
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => handleRemediate("D-05")}
                        style={{ cursor: "pointer" }}
                      >
                        Remediate
                      </button>
                    )}
                  </td>
                </tr>

                {/* D-06 */}
                <tr>
                  <td><b className="mono" style={{ color: "var(--brand)" }}>D-06</b></td>
                  <td><span className="sev sevH">High</span></td>
                  <td>
                    <b>DOM-Based XSS: location.hash Flows into innerHTML Sink</b>
                    <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "2px" }}>
                      Dynamic probe confirmed marker canary string reached Element.innerHTML sink without sanitization.
                    </div>
                  </td>
                  <td className="m">src/components/SearchBox.tsx</td>
                  <td style={{ textAlign: "right" }}>
                    {roleDef.canRemediate && (
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => handleRemediate("D-06")}
                        style={{ cursor: "pointer" }}
                      >
                        Remediate
                      </button>
                    )}
                  </td>
                </tr>

                {/* D-07 */}
                <tr>
                  <td><b className="mono" style={{ color: "var(--brand)" }}>D-07</b></td>
                  <td><span className="sev sevH">High</span></td>
                  <td>
                    <b>Exposed Public Environment File (/.env)</b>
                    <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "2px" }}>
                      HTTP GET /.env returned status 200 with matching KEY=VALUE content signature.
                    </div>
                  </td>
                  <td className="m">public/.env</td>
                  <td style={{ textAlign: "right" }}>
                    {roleDef.canRemediate && (
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => handleRemediate("D-07")}
                        style={{ cursor: "pointer" }}
                      >
                        Remediate
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remediation Code Modal */}
      {remediationModal && (
        <div
          className="scrim"
          onClick={() => setRemediationModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "680px",
              width: "100%",
              padding: "22px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span className="chip brand" style={{ fontSize: "10px", marginBottom: "4px" }}>
                  Automated Code Remediation
                </span>
                <h3 style={{ margin: "2px 0 0", fontSize: "16px" }}>
                  {remediationModal.title}
                </h3>
              </div>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setRemediationModal(null)}
                aria-label="Close modal"
              >
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mono" style={{ fontSize: "11px", color: "var(--ink2)", marginBottom: "8px" }}>
              Target File: <b>{remediationModal.file}</b>
            </div>

            <pre
              className="mono"
              style={{
                background: "var(--term-bg, #12151F)",
                color: "#6FD39B",
                padding: "14px",
                borderRadius: "8px",
                fontSize: "11.5px",
                lineHeight: 1.55,
                margin: 0,
                overflowX: "auto",
              }}
            >
              {remediationModal.fix}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <button
                type="button"
                className="btn sec"
                onClick={() => {
                  navigator.clipboard.writeText(remediationModal.fix);
                  alert("Remediation snippet copied to clipboard!");
                }}
              >
                Copy Code Fix
              </button>
              {roleDef.canAccessStudio && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setRemediationModal(null);
                    router.push(`/studio?problem=${selectedProblem.id}`);
                  }}
                >
                  Open in Studio →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CockpitPage() {
  return (
    <Suspense fallback={<div className="card">Loading Cockpit...</div>}>
      <CockpitContent />
    </Suspense>
  );
}
