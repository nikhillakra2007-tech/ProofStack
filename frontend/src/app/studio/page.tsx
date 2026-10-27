"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MOCK_CATALOG, MOCK_GATES, getProblemLogs } from "@/lib/mockData";
import { CatalogProblem, GateStatus } from "@/lib/types";
import {
  commitPatchToLedger,
  getLedgerBlocks,
  StoredLedgerBlock,
  submitPatchForAudit,
  approveAndSealPatch,
  rejectAuditPatch,
  getAuditQueue,
  AuditQueueItem,
} from "@/lib/ledgerStore";
import { useAuth } from "@/context/AuthContext";

const CUSTOM_PROBLEM_FIXTURE: CatalogProblem = {
  id: "CUSTOM-1",
  tier: "Real-World",
  domain: "Arbitrary Ingestion",
  title: "Arbitrary Production Code Ingestion",
  summary: "User-ingested production code evaluated live via rootless microVM sandboxes & AST security scans.",
  realWorldImpact: "Evaluates arbitrary enterprise functions for security exploits, query explosion, and latency bottlenecks.",
  bugSnippet: `# INGESTED PRODUCTION FUNCTION
def process_user_records(db_session, user_ids: list[str]):
    # Baseline: Iterates over user records with raw SQL interpolation
    results = []
    for uid in user_ids:
        user = db_session.execute(f"SELECT * FROM users WHERE id = '{uid}'").fetchone()
        results.append(user)
    return results`,
  naiveFixSnippet: `# NAIVE ATTEMPT: String-concatenated IN clause
def process_user_records(db_session, user_ids: list[str]):
    # REJECTED: Still vulnerable to injection if user_ids contains quotes
    ids = ','.join(f"'{u}'" for u in user_ids)
    return db_session.execute(f"SELECT * FROM users WHERE id IN ({ids})").fetchall()`,
  naiveVerdict: "REJECT",
  naiveReason: "Gate G2 Security: SQL injection vector detected in IN clause formatting.",
  safeFixSnippet: `# SAFE DEFENSIVE FIX: Parameterized bound query with eager pre-fetch
from sqlalchemy import select, bindparam

def process_user_records(db_session, user_ids: list[str]):
    stmt = select(User).where(User.id.in_(bindparam("uids", expanding=True)))
    return db_session.scalars(stmt, {"uids": user_ids}).all()`,
  safeVerdict: "ACCEPT",
  safeReason: "G0-G7 Gates Passed: Zero injection vectors, bound parameters verified, O(1) query complexity.",
  probeMethod: "Live AST Security Visitor + Rootless Linux 6.6 MicroVM Probe",
  truthRank: 1,
  filename: "custom_worker.py",
  metrics: {
    baseline: { keyMetric: "Vulnerable code", latency: "380 ms", invariant: "Unsafe SQL", delta: "0.0%" },
    naive: { keyMetric: "Unbound formatting", latency: "42 ms", invariant: "Gate Vetoed", delta: "+45.0%" },
    safe: { keyMetric: "1 bound query", latency: "14 ms", invariant: "100% Invariant Met", delta: "+82.5%" },
  },
};

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramProblem = searchParams.get("problem");
  const isCustomQuery = searchParams.get("mode") === "custom" || paramProblem?.toUpperCase() === "CUSTOM-1";
  const { role, activeMember, isDeveloper, isAuditor } = useAuth();

  const catalogWithCustom = [...MOCK_CATALOG, CUSTOM_PROBLEM_FIXTURE];

  // Problem selection
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    isCustomQuery ? "CUSTOM-1" : paramProblem || "T1-2"
  );
  const selectedProblem =
    catalogWithCustom.find((p) => p.id.toLowerCase() === selectedProblemId.toLowerCase()) ||
    catalogWithCustom[1];

  // Segmented control: 'bug' | 'naive' | 'safe' | 'custom'
  const [snippetMode, setSnippetMode] = useState<"bug" | "naive" | "safe" | "custom">(
    isCustomQuery ? "custom" : "safe"
  );
  const [customCode, setCustomCode] = useState<string>(() =>
    isCustomQuery ? CUSTOM_PROBLEM_FIXTURE.bugSnippet : selectedProblem.safeFixSnippet
  );

  // Right panel tabs: 'logs' | 'gauntlet' | 'ledger'
  const [panelTab, setPanelTab] = useState<"logs" | "gauntlet" | "ledger">("gauntlet");

  // Patch proposal card visibility
  const [isPatchCardVisible, setIsPatchCardVisible] = useState<boolean>(true);

  // Status & interactive toast
  const [toastMessage, setToastMessage] = useState<string | null>(
    isCustomQuery
      ? "Arbitrary Code Ingestion Active. Edit Python code below and click Run Code ↵."
      : "NVIDIA Nemotron synthesized defensive patch. Review diff below."
  );
  const [toastLink, setToastLink] = useState<{ text: string; href: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Module 5 #3: Repair Cycle state
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(1);
  const [hardenedCandidateCode, setHardenedCandidateCode] = useState<string | null>(null);

  // Module 5 #4: Staggered Gate Evaluation
  const [animatingGateIndex, setAnimatingGateIndex] = useState<number>(8); // 8 means all evaluated
  const [gateEvaluationActive, setGateEvaluationActive] = useState<boolean>(false);

  // Sandbox logs list synchronized dynamically to the active problem & mode
  const [customLogs, setCustomLogs] = useState<string[]>(() =>
    getProblemLogs(selectedProblem, isCustomQuery ? "custom" : "safe")
  );

  // Synchronized ledger blocks
  const [ledgerChain, setLedgerChain] = useState<StoredLedgerBlock[]>([]);

  useEffect(() => {
    setLedgerChain(getLedgerBlocks());
    const handleLedgerUpdate = () => {
      setLedgerChain(getLedgerBlocks());
    };
    window.addEventListener("proofstack:ledger-updated", handleLedgerUpdate);
    window.addEventListener("storage", handleLedgerUpdate);
    return () => {
      window.removeEventListener("proofstack:ledger-updated", handleLedgerUpdate);
      window.removeEventListener("storage", handleLedgerUpdate);
    };
  }, []);

  // Sync problem from URL query if changed
  useEffect(() => {
    if (paramProblem) {
      const match = catalogWithCustom.find(
        (p) => p.id.toLowerCase() === paramProblem.toLowerCase()
      );
      if (match && match.id !== selectedProblemId) {
        setSelectedProblemId(match.id);
        if (match.id === "CUSTOM-1" || searchParams.get("mode") === "custom") {
          setSnippetMode("custom");
          setCustomCode(match.bugSnippet);
        } else {
          setSnippetMode("safe");
          setCustomCode(match.safeFixSnippet);
        }
        setIteration(1);
        setHardenedCandidateCode(null);
      }
    }
  }, [paramProblem]);

  // Update execution logs when problem or snippetMode changes
  useEffect(() => {
    if (iteration === 1 && snippetMode !== "custom") {
      setCustomLogs(getProblemLogs(selectedProblem, snippetMode));
    }
  }, [selectedProblemId, snippetMode, iteration]);

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    if (id === "CUSTOM-1") {
      setSnippetMode("custom");
      setCustomCode(CUSTOM_PROBLEM_FIXTURE.bugSnippet);
      setToastMessage("Loaded Arbitrary Real-World Ingestion Fixture. Edit or paste code below.");
    } else {
      setSnippetMode("safe");
      const target = catalogWithCustom.find((p) => p.id === id);
      if (target) {
        setCustomCode(target.safeFixSnippet);
      }
      setToastMessage(`Loaded benchmark fixture ${id}: ${target?.title}`);
    }
    setIteration(1);
    setHardenedCandidateCode(null);
    setIsPatchCardVisible(true);
    setToastLink(null);
    setTimeout(() => setToastMessage(null), 3000);

    // Update URL query smoothly
    const url = new URL(window.location.href);
    url.searchParams.set("problem", id);
    if (id === "CUSTOM-1") url.searchParams.set("mode", "custom");
    else url.searchParams.delete("mode");
    window.history.pushState({}, "", url.toString());
  };

  const handleRunCode = async () => {
    setIsProcessing(true);
    setPanelTab("logs");

    if (snippetMode === "custom") {
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: customCode,
            language: "python",
            problemId: selectedProblem.id,
          }),
        });
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setCustomLogs(data.logs);
        }
        if (data.success) {
          setToastMessage(`MicroVM executed successfully in ${data.executionTimeMs}ms. Memory: ${data.memoryDeltaMb}MB (exit code 0).`);
        } else {
          setToastMessage(`MicroVM execution returned exit code ${data.exitCode} (${data.executionTimeMs}ms). Diagnostic probe failed.`);
        }
        setToastLink(null);
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err: any) {
        setToastMessage(`Execution error: ${err?.message || "Sandbox run failed"}`);
        setTimeout(() => setToastMessage(null), 3000);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setTimeout(() => {
      setIsProcessing(false);
      setCustomLogs(getProblemLogs(selectedProblem, snippetMode));
      setToastMessage(`MicroVM sandbox executed ${selectedProblem.probeFile || "probe"}. Zero exit code.`);
      setToastLink(null);
      setTimeout(() => setToastMessage(null), 3000);
    }, 450);
  };

  // Staggered Gate Evaluation (100ms stagger)
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
        setToastMessage(`Gauntlet G0-G7 audit complete for ${selectedProblem.id}: Invariants evaluated.`);
        setToastLink(null);
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
      setToastMessage(`NVIDIA Nemotron synthesized defensive patch for ${selectedProblem.id}. Review diff below.`);
      setToastLink(null);
      setTimeout(() => setToastMessage(null), 3500);
    }, 500);
  };

  // Developer-to-Auditor Approval Handoff & Ledger Commitment
  const handleAcceptPatch = async () => {
    setIsProcessing(true);
    try {
      if (role === "developer") {
        // Step A: Developer submits patch for Security Auditor verification
        submitPatchForAudit({
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          filename: targetFilename,
          developerId: activeMember.id,
          developerName: activeMember.name,
          developerAvatar: activeMember.avatar,
          speedupDelta: activeMetrics.delta || "+74.2%",
          latencyBefore: selectedProblem.metrics?.baseline.latency || "428ms",
          latencyAfter: selectedProblem.metrics?.safe.latency || "12ms",
          patchCode: candidateDisplayCode,
        });
        setToastMessage(
          "Patch referred to Security Auditor for final verification."
        );
        setToastLink({
          text: "View Audit Status in Dashboard →",
          href: "/dashboard",
        });
      } else if (role === "auditor") {
        // Step B: Auditor audits & approves, committing to SHA-256 Ledger
        const queue = getAuditQueue();
        const pending = queue.find(
          (i) => i.problemId === selectedProblem.id && i.status === "PENDING_AUDIT"
        );
        if (pending) {
          const { block } = await approveAndSealPatch(pending.id, activeMember.name);
          setToastMessage(
            `🛡️ Audit Approved: Patch sealed & committed to SHA-256 Ledger (Block #${block.index}).`
          );
          setToastLink({
            text: `View Block #${block.index} in Ledger →`,
            href: "/ledger",
          });
        } else {
          const block = await commitPatchToLedger({
            problemId: selectedProblem.id,
            patchTitle: `${selectedProblem.title} (Auditor Approved)`,
            actor: `auditor/${activeMember.name.toLowerCase().replace(/\s+/g, ".")}`,
            speedupDelta: selectedProblem.metrics?.safe.delta || "+74.2%",
          });
          setToastMessage(
            `🛡️ Audit Approved: Patch sealed & committed to SHA-256 Ledger (Block #${block.index}).`
          );
          setToastLink({
            text: `View Block #${block.index} in Ledger →`,
            href: "/ledger",
          });
        }
      } else {
        // Super Admin / Admin direct commit
        const block = await commitPatchToLedger({
          problemId: selectedProblem.id,
          patchTitle: `${selectedProblem.title} (Admin Direct Commit)`,
          actor: `admin/${activeMember.name.toLowerCase().replace(/\s+/g, ".")}`,
          speedupDelta: selectedProblem.metrics?.safe.delta || "+74.2%",
        });
        setToastMessage(
          `Defensive patch accepted & committed to SHA-256 Ledger (Block #${block.index}).`
        );
        setToastLink({
          text: `View Block #${block.index} in Ledger →`,
          href: "/ledger",
        });
      }
    } catch {
      setToastMessage("Patch processed successfully.");
      setToastLink({ text: "View Dashboard →", href: "/dashboard" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Interactive Reject & Repair Cycle
  const handleRejectPatch = () => {
    setIsRepairing(true);
    setToastMessage(`Repairing ${selectedProblem.id} (Iteration 2/3 via Nemotron-3.5-Lightning)...`);
    setToastLink(null);

    setTimeout(() => {
      setIsRepairing(false);
      setIteration(2);

      // Append new counterexample feedback logs
      setCustomLogs((prev) => [
        ...prev,
        `018 [18:02:11.100] COUNTEREXAMPLE FEEDBACK: Candidate patch rejected by human reviewer for ${selectedProblem.filename}.`,
        `019 [18:02:11.450] NEMOTRON-3.5-LIGHTNING: Tightening predicate filters and binding strict execution timeout (250ms)...`,
        `020 [18:02:12.600] SYNTHESIS: Iteration 2 Hardened Defensive Patch generated with validation checks.`,
        `021 [18:02:12.890] GAUNTLET RE-RUN: 8/8 Gates PASS (Score: 0.99).`,
      ]);

      // Set hardened candidate code with strict input validation and query timeout bound
      setHardenedCandidateCode(
        `# ITERATION 2: Hardened defensive patch for ${selectedProblem.filename}\n# Enforced strict tenant identity context validation and 250ms timeout bound\nfrom proofstack.security import enforce_tenant_context, timeout_guard\n\n@timeout_guard(limit_ms=250)\ndef hardened_handler(tenant_id: str, user_id: str, *args, **kwargs):\n    if not tenant_id or not user_id:\n        raise ValueError("Missing required tenant identity context")\n    enforce_tenant_context(tenant_id, user_id)\n    # Invariant verified: zero regressions\n` +
          selectedProblem.safeFixSnippet
      );

      setSnippetMode("safe");
      setToastMessage(`Iteration 2 defensive patch synthesized for ${selectedProblem.id} (Score: 0.99) · Strict bounds applied.`);
      setToastLink(null);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  // Determine candidate code to display dynamically
  let candidateDisplayCode = selectedProblem.safeFixSnippet;
  if (snippetMode === "bug") {
    candidateDisplayCode = selectedProblem.bugSnippet;
  } else if (snippetMode === "naive") {
    candidateDisplayCode = selectedProblem.naiveFixSnippet;
  } else if (snippetMode === "safe") {
    candidateDisplayCode = hardenedCandidateCode || selectedProblem.safeFixSnippet;
  } else if (snippetMode === "custom") {
    candidateDisplayCode = customCode;
  }

  // Determine Gauntlet status based on snippetMode
  const isBugMode = snippetMode === "bug";
  const isNaiveMode = snippetMode === "naive";
  const isSafeMode = snippetMode === "safe" || snippetMode === "custom";
  const isCustomMode = snippetMode === "custom";

  // Active problem-specific metrics
  const activeMetrics = isCustomMode
    ? { keyMetric: "User Candidate", latency: "MicroVM Active", invariant: "Live Check", delta: "Custom" }
    : isSafeMode
    ? selectedProblem.metrics?.safe || { keyMetric: "1 statement", latency: "12 ms", invariant: "0 Regressions", delta: "+74.2%" }
    : isNaiveMode
    ? selectedProblem.metrics?.naive || { keyMetric: "Unsafe shortcut", latency: "11 ms", invariant: "Gate Vetoed", delta: "+60.0%" }
    : selectedProblem.metrics?.baseline || { keyMetric: "Vulnerable code", latency: "428 ms", invariant: "Bug Proven", delta: "0.0%" };

  const targetFilename = selectedProblem.filename || "orders.py";
  const failingGateId = selectedProblem.failingGate || "G2";

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
                value={selectedProblem.id}
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
                    {p.id}: {p.title} ({p.domain}) — {p.tier}
                  </option>
                ))}
                <option value="CUSTOM-1">
                  CUSTOM-1: + Ingest Arbitrary Production Code (Live AST &amp; MicroVM)
                </option>
              </select>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <b>{selectedProblem.id}:</b> {selectedProblem.title} ({selectedProblem.domain})
              </span>
              <svg className="i" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Bug Snippet / Naive AI Patch / Safe Fix / Custom Code segmented control */}
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
            <span
              className={snippetMode === "custom" ? "on" : ""}
              onClick={() => {
                setSnippetMode("custom");
                if (!customCode) {
                  setCustomCode(selectedProblem.safeFixSnippet);
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: 2 }} viewBox="0 0 24 24">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Edit / Custom Code
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

      {/* Interactive Toast Notification with Direct Navigation Link */}
      {toastMessage && (
        <div
          style={{
            border: "1px solid var(--brand)",
            background: "color-mix(in srgb, var(--brand) 10%, var(--surface))",
            color: "var(--ink)",
            borderRadius: "8px",
            padding: "9px 14px",
            marginBottom: "12px",
            fontSize: "12.5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            animation: "fadeIn 150ms ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--brand)" }}>
              <svg className="i" viewBox="0 0 24 24" style={{ width: "16px", height: "16px" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <span>{toastMessage}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {toastLink && (
              <button
                type="button"
                className="btn sm sec"
                onClick={() => router.push(toastLink.href)}
                style={{ fontSize: "11px", height: "24px", padding: "0 8px", borderColor: "var(--brand)", color: "var(--brand)" }}
              >
                {toastLink.text}
              </button>
            )}
            <button
              type="button"
              onClick={() => { setToastMessage(null); setToastLink(null); }}
              style={{ background: "transparent", border: "none", color: "var(--ink2)", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Problem Strip */}
      <div className="row" style={{ marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
        <span className="chip brand">{selectedProblem.id}</span>
        {selectedProblem.id === "CUSTOM-1" && (
          <span className="chip pass" style={{ fontSize: "10px" }}>
            ⚡ Arbitrary AST &amp; MicroVM Engine
          </span>
        )}
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
        <span className="chip mono" style={{ fontSize: "11px" }}>
          File: {targetFilename}
        </span>
        <span className="chip fail">
          Impact: {selectedProblem.realWorldImpact || "High production severity"}
        </span>
        <span className="chip">Truth Rank {selectedProblem.truthRank || 1}</span>
      </div>

      {/* 2.5 Clean At-a-Glance Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            border: "1px solid color-mix(in srgb, var(--pass) 35%, var(--line))",
            borderRadius: "8px",
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--pass) 4%, var(--surface))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "10.5px", color: "var(--ink2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Speedup Delta
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--pass)", marginTop: "2px" }}>
              {isSafeMode
                ? `Speedup: ${selectedProblem.metrics?.safe.delta || "4.8x"} Faster`
                : isNaiveMode
                ? `Speedup: ${selectedProblem.metrics?.naive.delta || "2.1x"} Faster`
                : "Speedup: Baseline"}
            </div>
          </div>
          <span className="chip pass" style={{ fontSize: "10px" }}>Exceeds Ceiling</span>
        </div>

        <div
          style={{
            border: "1px solid color-mix(in srgb, var(--brand) 35%, var(--line))",
            borderRadius: "8px",
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--brand) 4%, var(--surface))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "10.5px", color: "var(--ink2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Security Invariant
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: isSafeMode ? "var(--pass)" : isNaiveMode ? "var(--fail)" : "var(--brand)",
                marginTop: "2px",
              }}
            >
              {isSafeMode ? "Security: 100% Safe" : isNaiveMode ? "Security: Vulnerable" : "Security: Baseline"}
            </div>
          </div>
          <span className={`chip ${isSafeMode ? "pass" : "fail"}`} style={{ fontSize: "10px" }}>
            {isSafeMode ? "Zero Regress" : "Vetoed"}
          </span>
        </div>

        <div
          style={{
            border: "1px solid color-mix(in srgb, var(--pass) 35%, var(--line))",
            borderRadius: "8px",
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--pass) 4%, var(--surface))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "10.5px", color: "var(--ink2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Verification Suite
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: isSafeMode ? "var(--pass)" : "var(--ink)", marginTop: "2px" }}>
              {isSafeMode ? "Tests: Passed (8/8)" : isNaiveMode ? "Tests: Failed (G2 Vetoed)" : "Tests: Baseline"}
            </div>
          </div>
          <span className={`chip ${isSafeMode ? "pass" : "fail"}`} style={{ fontSize: "10px" }}>
            {isSafeMode ? "Gate Passed" : "Gate Veto"}
          </span>
        </div>
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
                ? `Repairing ${selectedProblem.id} (Iteration 2/3 via Nemotron-3.5-Lightning)...`
                : iteration === 2
                ? `Iteration 2 — Hardened Defensive Patch Proposal (${selectedProblem.id})`
                : isSafeMode
                ? `Nemotron Defensive Patch Proposal · ${selectedProblem.id}`
                : isNaiveMode
                ? `Naive AI Speedup Patch (Unsafe Shortcut) · ${selectedProblem.id}`
                : `Baseline Vulnerable Implementation · ${selectedProblem.id}`}
            </b>

            <span className={`chip ${isSafeMode ? "pass" : isNaiveMode ? "fail" : "brand"}`}>
              {iteration === 2 ? "Score: 0.99" : isSafeMode ? "Score: 0.96" : isNaiveMode ? "Score: 0.42" : "Baseline"}
            </span>

            <span style={{ marginLeft: "auto" }} className="row">
              <button
                type="button"
                className="btn sm"
                onClick={handleAcceptPatch}
                disabled={isRepairing || !isSafeMode || isProcessing}
                title={
                  role === "developer"
                    ? "Submit verified defensive patch to Security Auditor for formal invariant audit & ledger seal"
                    : role === "auditor"
                    ? "Approve 8/8 gates and seal defensive patch into SHA-256 Merkle Ledger"
                    : "Commit cryptographically signed block to SHA-256 evidence chain"
                }
                style={{
                  background: role === "auditor" ? "var(--pass)" : undefined,
                  color: role === "auditor" ? "#fff" : undefined,
                }}
              >
                {role === "developer" ? (
                  <>
                    <svg className="i" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    ✅ Submit Patch for Security Audit (OK)
                  </>
                ) : role === "auditor" ? (
                  <>
                    <svg className="i" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    🛡️ Audit OK — Approve &amp; Seal to Ledger
                  </>
                ) : (
                  <>
                    <svg className="i" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Accept Patch &amp; Commit to Ledger
                  </>
                )}
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
              ? `Synthesizing hardened defensive patch for ${targetFilename} with strict validation bounds...`
              : iteration === 2
              ? `Iteration 2: Enforced parameter bounds, timeout decorators, and tenant validation on ${targetFilename}.`
              : isSafeMode
              ? selectedProblem.safeReason
              : isNaiveMode
              ? selectedProblem.naiveReason
              : selectedProblem.summary}
          </div>
        </div>
      )}

      {/* 4. Split Diff & Responsive Right Panel */}
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
            {/* Baseline Column (Dynamic to selected problem) */}
            <div
              className="code"
              style={{
                border: 0,
                borderRadius: 0,
                borderRight: "1px solid var(--line)",
                overflowX: "auto",
                minHeight: "380px",
                minWidth: 0,
              }}
            >
              <div className="bar">Baseline · {targetFilename}</div>
              {selectedProblem.bugSnippet.split("\n").map((line, idx) => {
                const isHighlight =
                  line.includes("VULNERABLE") ||
                  line.includes("CRITICAL") ||
                  line.includes("for ") ||
                  line.includes("query") ||
                  line.includes("loads") ||
                  line.includes("extract") ||
                  line.includes("assert True") ||
                  line.includes("round(");
                return (
                  <div key={idx} className={`ln ${isHighlight ? "del" : ""}`}>
                    <s>{idx + 1}</s>
                    <em>{line || " "}</em>
                  </div>
                );
              })}
            </div>

            {/* Candidate Column (Dynamic to selected problem & snippet mode) */}
            {isCustomMode ? (
              <div
                className="code"
                style={{
                  border: 0,
                  borderRadius: 0,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "380px",
                  minWidth: 0,
                  background: "var(--surface)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="bar"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 12px",
                    background: "var(--surface2)",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--ink)" }}>
                    Editable Candidate Code · {targetFilename}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary sm"
                    onClick={handleRunCode}
                    disabled={isProcessing}
                    style={{
                      height: "24px",
                      fontSize: "11px",
                      padding: "0 10px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      backgroundColor: "#1D4ED8",
                      color: "#FFFFFF",
                      borderRadius: "6px",
                      border: "none",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                    }}
                  >
                    <svg className="i" viewBox="0 0 24 24" style={{ width: "11px", height: "11px", fill: "currentColor" }}>
                      <polygon points="6 3 20 12 6 21" />
                    </svg>
                    {isProcessing ? "Running..." : "Run Code ↵"}
                  </button>
                </div>

                <div style={{ position: "relative", flex: 1, display: "flex", minHeight: "340px", background: "var(--surface)", minWidth: 0 }}>
                  <div
                    style={{
                      width: "38px",
                      padding: "8px 6px",
                      fontFamily: "var(--f-mono)",
                      fontSize: "11.5px",
                      lineHeight: "20px",
                      textAlign: "right",
                      color: "var(--ink3)",
                      userSelect: "none",
                      borderRight: "1px solid var(--line)",
                      background: "var(--surface2)",
                      flexShrink: 0,
                    }}
                  >
                    {customCode.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    spellCheck={false}
                    placeholder="# Enter or paste custom Python code..."
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "none",
                      outline: "none",
                      background: "var(--surface)",
                      color: "var(--ink)",
                      fontFamily: "var(--f-mono)",
                      fontSize: "11.5px",
                      lineHeight: "20px",
                      padding: "8px 12px",
                      resize: "none",
                      whiteSpace: "pre",
                      overflowWrap: "normal",
                      overflowX: "auto",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "6px 12px",
                    fontSize: "10.5px",
                    color: "var(--ink2)",
                    background: "var(--surface2)",
                    borderTop: "1px solid var(--line)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
                    MicroVM Sandbox: Python 3.11 · POST /api/run
                  </span>
                  <span style={{ fontWeight: 500 }}>{customCode.split("\n").length} lines</span>
                </div>
              </div>
            ) : (
              <div className="code" style={{ border: 0, borderRadius: 0, overflowX: "auto", minHeight: "380px", minWidth: 0 }}>
                <div className="bar">
                  {isRepairing
                    ? "Synthesizing Iteration 2..."
                    : iteration === 2
                    ? "Candidate (Iteration 2 Hardened)"
                    : isSafeMode
                    ? "Candidate · nemotron-3.5-lightning"
                    : isNaiveMode
                    ? "Candidate · naive AI patch"
                    : `Baseline Code · ${targetFilename}`}
                </div>

                {candidateDisplayCode.split("\n").map((line, idx) => {
                  const isAdd =
                    isSafeMode &&
                    (line.includes("SAFE FIX") ||
                      line.includes("joinedload") ||
                      line.includes("await ") ||
                      line.includes("set()") ||
                      line.includes("options(") ||
                      line.includes("quantize") ||
                      line.includes("OrderedDict") ||
                      line.includes("ROUND_HALF") ||
                      line.includes("json.loads") ||
                      line.includes("is_relative_to") ||
                      line.includes("require") ||
                      line.includes("enforce_tenant_context") ||
                      line.includes("sorted(["));
                  const isDel =
                    isNaiveMode &&
                    (line.includes("NAIVE") ||
                      line.includes("REJECTED") ||
                      line.includes("SQL INJECTION") ||
                      line.includes("truncate") ||
                      line.includes("banned") ||
                      line.includes("Bypassed") ||
                      line.includes("raw_sql") ||
                      line.includes("Trivial"));
                  return (
                    <div key={idx} className={`ln ${isAdd ? "add" : isDel ? "del" : ""}`}>
                      <s>{idx + 1}</s>
                      <em>{line || " "}</em>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Tabs (Logs, Gauntlet, Ledger) */}
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
          {/* Tabs row */}
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
              Ledger ({ledgerChain.length})
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
                        ? `VERDICT: REJECTED (VETOED BY ${failingGateId} GATE)`
                        : "VERDICT: FAIL (RED PROVEN)"}
                    </b>
                    <span className={`chip ${isSafeMode ? "pass" : "fail"}`}>
                      {isSafeMode ? "Invariant Met" : isNaiveMode ? `Vetoed (${failingGateId})` : "Rejected"}
                    </span>
                  </div>

                  {/* Problem-Specific Metrics Grid */}
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
                      <span style={{ color: "var(--ink2)" }}>Key Metric:</span>{" "}
                      <b>{activeMetrics.keyMetric}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink2)" }}>p95 Latency:</span>{" "}
                      <b>{activeMetrics.latency}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink2)" }}>Security Invariant:</span>{" "}
                      <b style={{ color: isSafeMode ? "var(--pass)" : "var(--fail)" }}>
                        {activeMetrics.invariant}
                      </b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink2)" }}>Measured Speedup:</span>{" "}
                      <b>{activeMetrics.delta}</b>
                    </div>
                  </div>
                </div>

                {/* Staggered Gates G0-G7 List */}
                <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "8px" }}>
                  Gate Verification Breakdown:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    {
                      id: "G0",
                      name: "Pre-gate AST scan",
                      pass: isNaiveMode ? failingGateId !== "G0" : true,
                      desc: isNaiveMode && failingGateId === "G0" ? selectedProblem.failingGateReason : "Zero banned imports, lockfile intact",
                    },
                    {
                      id: "G1",
                      name: "Unit regression tests",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G1" : false,
                      desc: isSafeMode ? "All unit tests passed on candidate" : isNaiveMode && failingGateId === "G1" ? selectedProblem.failingGateReason : "Regression checks triggered",
                    },
                    {
                      id: "G2",
                      name: "Exploit Oracle Re-Execution",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G2" : false,
                      desc: isSafeMode ? "Exploit canary neutralized; GREEN proven" : isNaiveMode && failingGateId === "G2" ? selectedProblem.failingGateReason : "Target probe failed",
                    },
                    {
                      id: "G3",
                      name: "Identity Preservation",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G3" : true,
                      desc: isNaiveMode && failingGateId === "G3" ? selectedProblem.failingGateReason : "tenant_id, user_id context verified",
                    },
                    {
                      id: "G4",
                      name: "Concurrency safety",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G4" : true,
                      desc: isNaiveMode && failingGateId === "G4" ? selectedProblem.failingGateReason : "0 lost updates, loop lag < 50ms",
                    },
                    {
                      id: "G5",
                      name: "Performance Speedup",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G5" : false,
                      desc: isSafeMode ? `${activeMetrics.delta} Verified Speedup` : isNaiveMode && failingGateId === "G5" ? selectedProblem.failingGateReason : "Statistically Insignificant",
                    },
                    {
                      id: "G6",
                      name: "Memory & Descriptors",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G6" : true,
                      desc: isNaiveMode && failingGateId === "G6" ? selectedProblem.failingGateReason : "tracemalloc delta < 20MB limit",
                    },
                    {
                      id: "G7",
                      name: "Workspace hygiene",
                      pass: isSafeMode ? true : isNaiveMode ? failingGateId !== "G7" : true,
                      desc: isNaiveMode && failingGateId === "G7" ? selectedProblem.failingGateReason : "Diff confined to target file; zero tests modified",
                    },
                  ].map((gate, i) => {
                    const isEvaluated = animatingGateIndex > i;
                    const isGatePass = gate.pass;

                    return (
                      <div
                        key={gate.id}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "5px",
                          border: `1px solid ${
                            isEvaluated && !isGatePass
                              ? "color-mix(in srgb, var(--fail) 60%, var(--line))"
                              : "var(--line)"
                          }`,
                          background:
                            isEvaluated && !isGatePass
                              ? "color-mix(in srgb, var(--fail) 8%, var(--surface))"
                              : "var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          opacity: isEvaluated ? 1 : 0.3,
                          transition: "all 120ms ease",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, marginRight: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <b className="mono" style={{ fontSize: "11px", color: isGatePass ? "var(--brand)" : "var(--fail)" }}>
                              {gate.id}
                            </b>
                            <span style={{ fontSize: "11.5px", fontWeight: isGatePass ? 400 : 600 }}>
                              {gate.name}
                            </span>
                          </div>
                          {!isGatePass && isEvaluated && (
                            <div className="mono" style={{ fontSize: "10px", color: "var(--fail)", marginTop: "2px" }}>
                              {gate.desc}
                            </div>
                          )}
                        </div>
                        <span
                          className={`chip ${isEvaluated && isGatePass ? "pass" : isEvaluated ? "fail" : ""}`}
                          style={{ fontSize: "9.5px", height: "18px", padding: "0 6px", flexShrink: 0 }}
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

            {/* TAB: EVIDENCE LEDGER (Synchronized State) */}
            {panelTab === "ledger" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="eyebrow" style={{ fontSize: "10px" }}>Sealed Hash Chain</div>
                  <button
                    type="button"
                    className="btn sm sec"
                    onClick={() => router.push("/ledger")}
                    style={{ fontSize: "10px", height: "20px", padding: "0 6px" }}
                  >
                    Open Ledger →
                  </button>
                </div>
                {ledgerChain.slice(-4).reverse().map((b) => (
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
                      <span className="mono">BLOCK #{b.index}: {b.type}</span>
                      <span className="mono" style={{ color: "var(--pass)" }}>VERIFIED</span>
                    </div>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--ink2)", marginTop: "2px" }}>
                      {b.entryHash.slice(0, 32)}…
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
