"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MOCK_CATALOG, MOCK_GATES, MOCK_LEDGER_CHAIN } from "@/lib/mockData";
import { CatalogProblem, GateStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramProblem = searchParams.get("problem");
  const { role } = useAuth();

  // Problem selection
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    paramProblem || "T1-2"
  );
  const selectedProblem =
    MOCK_CATALOG.find((p) => p.id === selectedProblemId) || MOCK_CATALOG[1];

  // Segmented control: 'bug' | 'naive' | 'safe'
  const [snippetMode, setSnippetMode] = useState<"bug" | "naive" | "safe">("safe");

  // Right panel tabs: 'logs' | 'gauntlet' | 'ledger'
  const [panelTab, setPanelTab] = useState<"logs" | "gauntlet" | "ledger">("gauntlet");

  // Patch proposal card visibility
  const [isPatchCardVisible, setIsPatchCardVisible] = useState<boolean>(true);

  // Status & toast
  const [toastMessage, setToastMessage] = useState<string | null>(
    "NVIDIA Nemotron synthesized defensive patch. Review diff below."
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Module 5 #3: Repair Cycle state
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(1);
  const [hardenedCandidateCode, setHardenedCandidateCode] = useState<string | null>(null);

  // Module 5 #4: Staggered Gate Evaluation
  const [animatingGateIndex, setAnimatingGateIndex] = useState<number>(8); // 8 means all evaluated
  const [gateEvaluationActive, setGateEvaluationActive] = useState<boolean>(false);

  // Sandbox logs list that can be appended to
  const [customLogs, setCustomLogs] = useState<string[]>([
    "001 [18:01:02.102] PROBE: Executing t1_2_n_plus_one.py on baseline...",
    "002 [18:01:02.450] STATS: Database executed 5001 SQL statements for 5000 rows (N+1 EXPLOSION)",
    "003 [18:01:02.455] STATE: Baseline Probe Outcome: RED PROVEN",
    "004 [18:01:03.110] NEMOTRON: Calling Token Factory (nvidia/nemotron-3-super-120b) for hypotheses...",
    "005 [18:01:04.280] DISCRIMINATOR: Score(e_counter_probe) = 0.96. Experiment chosen.",
    "006 [18:01:05.150] NEMOTRON: Patch synthesized via nvidia/nemotron-3.5-lightning (Template B)",
    "007 [18:01:06.010] GAUNTLET: Running Zero-Compromise Gates G0 through G7 in isolated microVM...",
    "008 [18:01:06.320] GATE G0: PASS (Pre-gate AST scan: zero banned imports, lockfile clean)",
    "009 [18:01:06.850] GATE G1: PASS (28 unit tests passed on candidate, zero regressions)",
    "010 [18:01:07.120] GATE G2: PASS (Re-ran t1_2 probe: GREEN PROVEN; 4 injection payloads blocked)",
    "011 [18:01:07.410] GATE G3: PASS (Identity Guard: user_id, tenant_id, @login_required preserved)",
    "012 [18:01:07.820] GATE G4: PASS (Concurrency: 0 lost updates, max loop lag 12ms < 50ms)",
    "013 [18:01:08.200] GATE G5: PASS (Performance: SQL queries reduced from 5001 -> 1. Delta: +74.2% > tau_noise 5.0%)",
    "014 [18:01:08.550] GATE G6: PASS (Resources: tracemalloc delta 1.2MB < 20MB ceiling, FD delta = 0)",
    "015 [18:01:08.790] GATE G7: PASS (Hygiene: writable paths respected, zero tests modified)",
    "016 [18:01:08.910] VERDICT: ZERO-COMPROMISE INVARIANT SATISFIED -> ACCEPT",
    "017 [18:01:09.002] LEDGER: Hash chain entry index=5 recorded (SHA-256 verified)",
  ]);

  useEffect(() => {
    if (paramProblem) {
      const match = MOCK_CATALOG.find(
        (p) => p.id.toLowerCase() === paramProblem.toLowerCase()
      );
      if (match) {
        setSelectedProblemId(match.id);
      }
    }
  }, [paramProblem]);

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    setSnippetMode("safe");
    setIteration(1);
    setHardenedCandidateCode(null);
    setIsPatchCardVisible(true);
    setToastMessage(`Loaded benchmark fixture ${id}: ${MOCK_CATALOG.find((p) => p.id === id)?.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunCode = () => {
    setIsProcessing(true);
    setPanelTab("logs");
    setTimeout(() => {
      setIsProcessing(false);
      setToastMessage("MicroVM sandbox executed successfully. Zero exit code.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 450);
  };

  // Module 5 #4: Staggered Gate Evaluation (100ms stagger)
  const handleAuditGauntlet = () => {
    setPanelTab("gauntlet");
    setGateEvaluationActive(true);
    setAnimatingGateIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAnimatingGateIndex(current);
      if (current >= 8) {
        clearInterval(interval);
        setGateEvaluationActive(false);
        setToastMessage("Gauntlet G0-G7 audit complete: Invariants evaluated.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    }, 100);
  };

  const handleSelfHeal = () => {
    setIsProcessing(true);
    setIsPatchCardVisible(true);
    setSnippetMode("safe");
    setPanelTab("gauntlet");
    setTimeout(() => {
      setIsProcessing(false);
      setToastMessage("NVIDIA Nemotron synthesized defensive patch. Review diff below.");
    }, 500);
  };

  const handleAcceptPatch = () => {
    setToastMessage("Patch accepted & committed to SHA-256 Ledger. Head updated to #5.");
    setTimeout(() => {
      router.push("/cockpit/TASK9142");
    }, 600);
  };

  // Module 5 #3: Truly Interactive Reject (Trigger Repair Cycle)
  const handleRejectPatch = () => {
    setIsRepairing(true);
    setToastMessage("Repairing (Iteration 2/3 via Nemotron-3.5-Lightning)...");

    setTimeout(() => {
      setIsRepairing(false);
      setIteration(2);

      // Append new counterexample feedback logs
      setCustomLogs((prev) => [
        ...prev,
        "018 [18:02:11.100] COUNTEREXAMPLE FEEDBACK: Candidate patch rejected by human reviewer for strict timeout assurance.",
        "019 [18:02:11.450] NEMOTRON-3.5-LIGHTNING: Tightening predicate filters and binding strict query timeout (250ms)...",
        "020 [18:02:12.600] SYNTHESIS: Iteration 2 Hardened Defensive Patch generated with validation checks.",
        "021 [18:02:12.890] GAUNTLET RE-RUN: 8/8 Gates PASS (Score: 0.99).",
      ]);

      // Set hardened candidate code with strict input validation and query timeout bound
      setHardenedCandidateCode(
        `${selectedProblem.safeFixSnippet}\n\n# ITERATION 2 (hardened): ${selectedProblem.probeMethod}\n# ${selectedProblem.safeReason}`
      );

      setSnippetMode("safe");
      setToastMessage(
        `Iteration 2 defensive patch synthesized for ${selectedProblem.id} (Score: 0.99).`
      );
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  // Determine candidate code to display
  let candidateDisplayCode = selectedProblem.safeFixSnippet;
  if (snippetMode === "bug") {
    candidateDisplayCode = selectedProblem.bugSnippet;
  } else if (snippetMode === "naive") {
    candidateDisplayCode = selectedProblem.naiveFixSnippet;
  } else if (snippetMode === "safe") {
    candidateDisplayCode = hardenedCandidateCode || selectedProblem.safeFixSnippet;
  }

  // Determine Gauntlet status based on snippetMode (Module 5 #2)
  const isBugMode = snippetMode === "bug";
  const isNaiveMode = snippetMode === "naive";
  const isSafeMode = snippetMode === "safe";

  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* 1. Toolbar Card */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: "12px" }}>
        <div className="row" style={{ gap: "14px", flexWrap: "wrap", justifyContent: "space-between" }}>
          {/* 19-Problem Benchmark select */}
          <div className="field" style={{ flex: 1, minWidth: "260px", gap: "5px" }}>
            <label htmlFor="benchmark-select">19-Problem Benchmark Fixture</label>
            <div
              className="input"
              style={{
                justifyContent: "space-between",
                height: "36px",
                position: "relative",
                padding: "0 10px",
              }}
            >
              <select
                id="benchmark-select"
                value={selectedProblemId}
                onChange={(e) => handleSelectProblem(e.target.value)}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                {MOCK_CATALOG.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}: {p.title} ({p.domain})
                  </option>
                ))}
              </select>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedProblem.id}: {selectedProblem.title} ({selectedProblem.domain})
              </span>
              <svg className="i" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Bug Snippet / Naive AI Patch / Safe Fix segmented control (Module 5 #2) */}
          <div className="seg" style={{ marginTop: "17px", cursor: "pointer" }}>
            <span
              className={snippetMode === "bug" ? "on" : ""}
              onClick={() => setSnippetMode("bug")}
            >
              Bug Snippet
            </span>
            <span
              className={snippetMode === "naive" ? "on" : ""}
              onClick={() => setSnippetMode("naive")}
            >
              Naive AI Patch
            </span>
            <span
              className={snippetMode === "safe" ? "on" : ""}
              onClick={() => setSnippetMode("safe")}
            >
              Safe Fix
            </span>
          </div>

          {/* Action Buttons: Run Code, Audit Gauntlet, Self-Heal */}
          <div className="row" style={{ marginTop: "17px", gap: "8px" }}>
            <button
              type="button"
              className="btn sec"
              onClick={handleRunCode}
              disabled={isProcessing || isRepairing}
            >
              <svg className="i" viewBox="0 0 24 24">
                <polygon points="6 3 20 12 6 21" />
              </svg>
              Run Code
            </button>
            <button
              type="button"
              className="btn sec"
              onClick={handleAuditGauntlet}
              disabled={isProcessing || isRepairing}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Audit Gauntlet
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleSelfHeal}
              disabled={isProcessing || isRepairing}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
              </svg>
              Self-Heal (Nemotron)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Problem Strip */}
      <div className="row" style={{ marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
        <span className="chip brand">{selectedProblem.id}</span>
        <b style={{ fontSize: "13.5px" }}>{selectedProblem.title}</b>
        <span
          style={{
            color: "var(--ink2)",
            fontSize: "12px",
            flex: 1,
            minWidth: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          · {selectedProblem.summary}
        </span>
        <span className="chip fail">
          Impact: {selectedProblem.realWorldImpact || "High production severity"}
        </span>
        <span className="chip">Truth Rank {selectedProblem.truthRank || 1}</span>
      </div>

      {/* 3. Patch Proposal Card */}
      {isPatchCardVisible && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: "12px",
            borderColor: isRepairing
              ? "var(--warn)"
              : isSafeMode
              ? "color-mix(in srgb, var(--pass) 40%, var(--line))"
              : isNaiveMode
              ? "color-mix(in srgb, var(--fail) 40%, var(--line))"
              : "var(--line)",
            background: isRepairing
              ? "color-mix(in srgb, var(--warn) 5%, var(--surface))"
              : isSafeMode
              ? "color-mix(in srgb, var(--pass) 3%, var(--surface))"
              : isNaiveMode
              ? "color-mix(in srgb, var(--fail) 3%, var(--surface))"
              : "var(--surface)",
            transition: "all 150ms ease",
          }}
        >
          <div className="row" style={{ flexWrap: "wrap", gap: "10px" }}>
            <span style={{ color: isSafeMode ? "var(--pass)" : "var(--brand)" }}>
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
              </svg>
            </span>
            <b style={{ fontSize: "13.5px" }}>
              {isRepairing
                ? "Repairing (Iteration 2/3 via Nemotron-3.5-Lightning)..."
                : iteration === 2
                ? "Iteration 2 — Hardened Defensive Patch Proposal (Score: 0.99)"
                : isSafeMode
                ? "Nemotron Defensive Patch Proposal (Split-Screen Unified Diff)"
                : isNaiveMode
                ? "Naive AI Speedup Patch (Unsafe Shortcut)"
                : "Baseline Vulnerable Implementation"}
            </b>

            <span className={`chip ${isSafeMode ? "pass" : isNaiveMode ? "fail" : "brand"}`}>
              {iteration === 2 ? "Score: 0.99" : isSafeMode ? "Score: 0.96" : isNaiveMode ? "Score: 0.42" : "Baseline"}
            </span>

            <span style={{ marginLeft: "auto" }} className="row">
              <button
                type="button"
                className="btn sm"
                onClick={handleAcceptPatch}
                disabled={isRepairing || !isSafeMode}
              >
                <svg className="i" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Accept Patch &amp; Commit to Ledger
              </button>
              <button
                type="button"
                className="btn sm danger"
                onClick={handleRejectPatch}
                disabled={isRepairing}
              >
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {isRepairing ? "Repairing..." : "Reject (Trigger Repair Cycle)"}
              </button>
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => setIsPatchCardVisible(false)}
              >
                Close
              </button>
            </span>
          </div>

          <div className="sub" style={{ marginTop: "6px", fontSize: "12px" }}>
            {isRepairing
              ? "Synthesizing hardened defensive patch with parameter validation and query bounds..."
              : iteration === 2
              ? "Iteration 2: Enforced strict tenant identity context validation and 250ms execution timeout bound."
              : isSafeMode
              ? "Transformed N+1 iterative queries into 1 SQL JOIN query via joinedload(); eliminated SQL injection risk."
              : isNaiveMode
              ? "Replaced queries with naive cache/concatenation; rejected by security gate for cross-tenant data leak."
              : "Baseline code exhibits 5,001 SQL queries and unparameterized query vulnerability."}
          </div>
        </div>
      )}

      {/* 4. Split Diff & Responsive Right Panel (Module 5 #1: Fixed Overflow) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(360px, 420px)",
          alignItems: "start",
          gap: "14px",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Left Column: Monaco Split Diff View (min-w-0 ensures no horizontal blowout) */}
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              border: "1px solid var(--line)",
              borderRadius: "8px",
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            {/* Baseline Column */}
            <div
              className="code"
              style={{
                border: 0,
                borderRadius: 0,
                borderRight: "1px solid var(--line)",
                overflowX: "auto",
              }}
            >
              <div className="bar">Baseline · {selectedProblem.id}</div>
              {selectedProblem.bugSnippet.split("\n").map((line, i) => (
                <div className="ln" key={i}>
                  <s>{i + 1}</s>
                  <em>{line || " "}</em>
                </div>
              ))}
            </div>

            {/* Candidate Column */}
            <div className="code" style={{ border: 0, borderRadius: 0, overflowX: "auto" }}>
              <div className="bar">
                {isRepairing
                  ? "Synthesizing Iteration 2..."
                  : iteration === 2
                  ? "Candidate (Iteration 2 Hardened)"
                  : isSafeMode
                  ? "Candidate · nemotron-3.5-lightning"
                  : isNaiveMode
                  ? "Candidate · naive AI patch"
                  : "Baseline Code"}
              </div>

              {candidateDisplayCode.split("\n").map((line, i) => {
                const tone =
                  snippetMode === "naive"
                    ? " del"
                    : snippetMode === "safe" || iteration === 2
                    ? " add"
                    : "";
                return (
                  <div className={`ln${tone}`} key={i}>
                    <s>{i + 1}</s>
                    <em>{line || " "}</em>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Tabs (Logs, Gauntlet, Ledger) - Clean names, zero cutoff (Module 5 #1) */}
        <div
          className="card"
          style={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* Tabs row: Clean names that fit perfectly */}
          <div className="tabs" style={{ margin: 0, padding: "0 6px", display: "flex", gap: "4px" }}>
            <div
              className={`tab ${panelTab === "logs" ? "on" : ""}`}
              onClick={() => setPanelTab("logs")}
              style={{ padding: "0 8px", fontSize: "11.5px", cursor: "pointer", flex: 1, textAlign: "center" }}
            >
              Logs
            </div>
            <div
              className={`tab ${panelTab === "gauntlet" ? "on" : ""}`}
              onClick={() => setPanelTab("gauntlet")}
              style={{ padding: "0 8px", fontSize: "11.5px", cursor: "pointer", flex: 1.4, textAlign: "center" }}
            >
              Gauntlet (G0-G7)
            </div>
            <div
              className={`tab ${panelTab === "ledger" ? "on" : ""}`}
              onClick={() => setPanelTab("ledger")}
              style={{ padding: "0 8px", fontSize: "11.5px", cursor: "pointer", flex: 1, textAlign: "center" }}
            >
              Ledger
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: "14px", overflowY: "auto", maxHeight: "480px" }}>
            {/* TAB: GAUNTLET (G0-G7) */}
            {panelTab === "gauntlet" && (
              <div>
                {/* Zero-Compromise Verdict Card */}
                <div
                  style={{
                    border: `1px solid ${
                      isSafeMode
                        ? "color-mix(in srgb, var(--pass) 40%, var(--line))"
                        : isNaiveMode
                        ? "color-mix(in srgb, var(--fail) 40%, var(--line))"
                        : "var(--line)"
                    }`,
                    borderRadius: "8px",
                    padding: "10px 12px",
                    background: isSafeMode
                      ? "color-mix(in srgb, var(--pass) 5%, var(--surface))"
                      : isNaiveMode
                      ? "color-mix(in srgb, var(--fail) 5%, var(--surface))"
                      : "var(--surface2)",
                    marginBottom: "12px",
                  }}
                >
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <b
                      style={{
                        font: "700 12px var(--f-mono)",
                        color: isSafeMode ? "var(--pass)" : isNaiveMode ? "var(--fail)" : "var(--ink)",
                      }}
                    >
                      {isSafeMode
                        ? "VERDICT: ACCEPT (8/8 PASSED)"
                        : isNaiveMode
                        ? "VERDICT: REJECTED (G1/G2 FAILED)"
                        : "VERDICT: FAIL (RED PROVEN)"}
                    </b>
                    <span className={`chip ${isSafeMode ? "pass" : "fail"}`}>
                      {isSafeMode ? "Invariant Met" : "Rejected"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px",
                      marginTop: "8px",
                      fontSize: "11.5px",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--ink2)" }}>DB Queries:</span>{" "}
                      <b>{isSafeMode ? "1 statement" : "5,001 statements"}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink2)" }}>p95 Latency:</span>{" "}
                      <b>{isSafeMode ? "12 ms" : "428 ms"}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink2)" }}>Security Invariant:</span>{" "}
                      <b style={{ color: isSafeMode ? "var(--pass)" : "var(--fail)" }}>
                        {isSafeMode ? "0 Regressions" : "IDOR / SQLi Leak"}
                      </b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink2)" }}>Speedup:</span>{" "}
                      <b>{isSafeMode ? "+74.2%" : "0.0%"}</b>
                    </div>
                  </div>
                </div>

                {/* Staggered Gates G0-G7 List (Module 5 #4) */}
                <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "8px" }}>
                  Gate Verification Breakdown:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { id: "G0", name: "Pre-gate AST scan", pass: true, desc: "Zero banned imports, lockfile intact" },
                    { id: "G1", name: "Unit regression tests", pass: isSafeMode, desc: isSafeMode ? "28/28 unit tests passed" : "Regressions detected" },
                    { id: "G2", name: "Exploit Oracle Re-Execution", pass: isSafeMode, desc: isSafeMode ? "Injection payload blocked" : "Failed exploit test" },
                    { id: "G3", name: "Identity Preservation", pass: isSafeMode, desc: "tenant_id predicate guaranteed" },
                    { id: "G4", name: "Concurrency safety", pass: true, desc: "0 lost updates, 12ms event loop lag" },
                    { id: "G5", name: "Performance Speedup", pass: isSafeMode, desc: isSafeMode ? "+74.2% above 5% noise ceiling" : "Below performance threshold" },
                    { id: "G6", name: "Memory & Descriptors", pass: true, desc: "tracemalloc delta 1.2MB < 20MB limit" },
                    { id: "G7", name: "Workspace hygiene", pass: true, desc: "Zero tests modified, read-only paths" },
                  ].map((gate, i) => {
                    const isEvaluated = animatingGateIndex > i;
                    const isGatePass = gate.pass;

                    return (
                      <div
                        key={gate.id}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "5px",
                          border: "1px solid var(--line)",
                          background: "var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          opacity: isEvaluated ? 1 : 0.3,
                          transition: "opacity 120ms ease",
                        }}
                      >
                        <div>
                          <b className="mono" style={{ fontSize: "11px", color: "var(--brand)", marginRight: "6px" }}>
                            {gate.id}
                          </b>
                          <span style={{ fontSize: "11.5px" }}>{gate.name}</span>
                        </div>
                        <span
                          className={`chip ${isEvaluated && isGatePass ? "pass" : isEvaluated ? "fail" : ""}`}
                          style={{ fontSize: "9.5px", height: "18px", padding: "0 6px" }}
                        >
                          {!isEvaluated ? "EVALUATING…" : isGatePass ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: SANDBOX LOGS */}
            {panelTab === "logs" && (
              <div
                className="mono"
                style={{
                  background: "var(--term-bg, #12151F)",
                  color: "#E2E7F5",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "10.5px",
                  lineHeight: 1.55,
                  minHeight: "260px",
                }}
              >
                {customLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}

            {/* TAB: EVIDENCE LEDGER */}
            {panelTab === "ledger" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="eyebrow" style={{ fontSize: "10px" }}>Sealed Hash Chain</div>
                {MOCK_LEDGER_CHAIN.slice(0, 4).map((b) => (
                  <div
                    key={b.index}
                    style={{
                      padding: "8px 10px",
                      border: "1px solid var(--line)",
                      borderRadius: "6px",
                      background: "var(--surface2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                      <span className="mono">BLOCK #{b.index}</span>
                      <span className="mono" style={{ color: "var(--pass)" }}>VERIFIED</span>
                    </div>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--ink2)", marginTop: "2px" }}>
                      {b.entry_hash.slice(0, 24)}…
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "20px", textAlign: "center" }}>
          Loading Studio Environment...
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
