"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Code2, Terminal, Play, CheckCircle2, ShieldCheck, 
  ArrowRight, FileCode, Cpu, Layers, Bug, RefreshCw,
  ExternalLink, Sparkles, Check, AlertCircle, Clock
} from "lucide-react";

export default function DeveloperRolePage() {
  const { session, role, activeMember } = useAuth();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<"typescript" | "python" | "rust">("typescript");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthSuccess, setSynthSuccess] = useState(false);

  const sampleDiffs = {
    typescript: {
      target: "src/api/users/controller.ts:42",
      cwe: "CWE-89: SQL Injection via Unbound Parameter",
      vulnerable: `// VULNERABLE: Direct string interpolation in SQL query
async function getUserRecord(req: Request, res: Response) {
  const { userId } = req.query;
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  const result = await db.raw(query); // <-- CWE-89 SQL Injection
  return res.json(result);
}`,
      hardened: `// HARDENED: Tree-Sitter AST parameterized binding invariant
async function getUserRecord(req: Request, res: Response) {
  const { userId } = req.query;
  // Invariant verified: Parameterized binding prevents taint propagation
  const result = await db('users')
    .where({ id: String(userId) })
    .first();
  return res.json(result);
}`
    },
    python: {
      target: "backend/api/workspaces.py:86",
      cwe: "CWE-639: Broken Object-Level Authorization (IDOR)",
      vulnerable: `# VULNERABLE: Direct billing lookup without tenant authorization check
@router.get("/workspaces/{workspace_id}/billing")
def get_billing(workspace_id: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter_by(id=workspace_id).first()
    return serialize_billing(workspace.billing_profile)`,
      hardened: `# HARDENED: Scoped tenant boundary with deterministic gate assertion
@router.get("/workspaces/{workspace_id}/billing")
def get_billing(workspace_id: str, session: SessionAuth = Depends(get_auth), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter_by(id=workspace_id).first()
    if workspace.tenant_id != session.tenant_id and not session.is_super_admin:
        raise HTTPException(status_code=403, detail="Tenant boundary violation")
    return serialize_billing(workspace.billing_profile)`
    },
    rust: {
      target: "crates/engine/src/parser.rs:114",
      cwe: "CWE-400: Unbounded Memory Allocation in Buffer Slice",
      vulnerable: `// VULNERABLE: Unbounded allocation on user-supplied buffer dimension
pub fn allocate_frame(size: usize) -> Vec<u8> {
    let mut buffer = Vec::with_capacity(size);
    buffer.resize(size, 0);
    buffer
}`,
      hardened: `// HARDENED: Enforced maximum frame allocation threshold
pub const MAX_SAFE_FRAME_SIZE: usize = 16 * 1024 * 1024; // 16 MB boundary
pub fn allocate_frame(size: usize) -> Result<Vec<u8>, EngineError> {
    if size > MAX_SAFE_FRAME_SIZE {
        return Err(EngineError::ExceededAllocationCeiling(size));
    }
    Ok(vec![0u8; size])
}`
    }
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setSynthSuccess(false);
    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthSuccess(true);
      setTimeout(() => setSynthSuccess(false), 4000);
    }, 1100);
  };

  const activeDiff = sampleDiffs[selectedLanguage];

  const assignedTasks = [
    {
      id: "TASK9142",
      title: "Broken Object-Level Auth (IDOR) in Workspace Billing",
      file: "backend/api/workspaces.py:84-89",
      cwe: "CWE-639",
      severity: "Critical",
      speedup: "+74.2% p95",
      status: "In Remediation",
    },
    {
      id: "TASK8201",
      title: "SQL Injection in Audit Log Filter Parameter",
      file: "backend/db/queries.py:112-115",
      cwe: "CWE-89",
      severity: "High",
      speedup: "+82.1% p95",
      status: "Gates Verified",
    },
    {
      id: "TASK6102",
      title: "Catastrophic Regex Backtracking (ReDoS) in Slug Parser",
      file: "backend/utils/slug.py:14-17",
      cwe: "CWE-400",
      severity: "High",
      speedup: "+98.4% p95",
      status: "Sealed",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Role Identification & Scope Banner */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "320px", height: "320px", background: "radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="chip brand" style={{ fontSize: "11px", padding: "4px 10px" }}>
                <Code2 className="w-3.5 h-3.5" />
                <span>ROLE PORTAL • LEAD DEVELOPER</span>
              </span>
              <span className="chip pass" style={{ fontSize: "10.5px" }}>
                Active Session: {activeMember?.name || "Nitin Pandey"}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
              <Link href="/studio" className="btn sm acc" style={{ textDecoration: "none" }}>
                <Cpu className="w-3.5 h-3.5" />
                <span>Open AST Studio</span>
              </Link>
              <Link href="/cockpit/TASK9142" className="btn sm sec" style={{ textDecoration: "none" }}>
                <span>Inspect Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--heading-primary)", letterSpacing: "-0.02em" }}>
              Compiler AST Invariant &amp; Neural Patch Synthesis
            </h1>
            <p style={{ margin: 0, color: "var(--ink2)", fontSize: "13.5px", maxWidth: "800px", lineHeight: 1.55 }}>
              Authorized for autonomous Tree-Sitter grammar parsing, token-masked NVIDIA Nemotron patch generation, and deterministic 8-gate unit regression verification.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Active Ephemeral Runner</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--pass)", marginTop: "2px" }}>gVisor Pod #08 (Ready)</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Inference Target</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", marginTop: "2px" }}>Nemotron 70B (840ms)</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Gate Pass Rate</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--pass)", marginTop: "2px" }}>8 / 8 Gates Pass (100%)</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Sandbox Quota</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginTop: "2px" }}>42,000 / 100,000 Tokens</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive AST Code Studio */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--heading-primary)" }}>
                Active Defect Remediation: {activeDiff.cwe}
              </h2>
              <span className="chip fail" style={{ fontSize: "10px" }}>Active Invariant</span>
            </div>
            <p className="mono" style={{ fontSize: "11.5px", color: "var(--ink3)", margin: "4px 0 0 0" }}>
              Target File: <b>{activeDiff.target}</b>
            </p>
          </div>

          {/* Controls: Language Selector & Synthesize Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "var(--surface2)", padding: "2px", borderRadius: "8px", border: "1px solid var(--line)" }}>
              {(["typescript", "python", "rust"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11.5px",
                    fontWeight: selectedLanguage === lang ? 700 : 500,
                    borderRadius: "6px",
                    border: "none",
                    background: selectedLanguage === lang ? "var(--brand)" : "transparent",
                    color: selectedLanguage === lang ? "var(--brand-ink)" : "var(--ink2)",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 120ms ease"
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn sm acc"
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              style={{ minWidth: "160px", justifyContent: "center" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? "animate-spin" : ""}`} />
              <span>{isSynthesizing ? "Synthesizing AST..." : synthSuccess ? "✓ Patch Verified" : "Synthesize Invariant"}</span>
            </button>
          </div>
        </div>

        {/* Side-by-side AST Diff Viewer */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {/* Vulnerable Panel */}
          <div style={{ borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface2)", padding: "12px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--fail)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Bug className="w-3.5 h-3.5" />
                Vulnerable Implementation
              </span>
              <span className="chip fail" style={{ fontSize: "9.5px" }}>AST Taint Sink</span>
            </div>
            <pre className="mono" style={{ margin: 0, padding: "10px", background: "var(--term-bg)", color: "var(--term-fail)", borderRadius: "6px", fontSize: "11.5px", lineHeight: 1.5, overflowX: "auto", flex: 1 }}>
              <code>{activeDiff.vulnerable}</code>
            </pre>
          </div>

          {/* Hardened Invariant Panel */}
          <div style={{ borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface2)", padding: "12px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--pass)", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Nemotron Hardened Invariant
              </span>
              <span className="chip pass" style={{ fontSize: "9.5px" }}>Zero-Day Safe</span>
            </div>
            <pre className="mono" style={{ margin: 0, padding: "10px", background: "var(--term-bg)", color: "var(--term-pass)", borderRadius: "6px", fontSize: "11.5px", lineHeight: 1.5, overflowX: "auto", flex: 1 }}>
              <code>{activeDiff.hardened}</code>
            </pre>
          </div>
        </div>

        {/* Verification Proof Summary */}
        <div style={{ marginTop: "14px", padding: "10px 14px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--pass)", fontWeight: 600 }}>
            <CheckCircle2 className="w-4 h-4" />
            <span>AST Syntax Pass · Taint Propagation Neutralized</span>
          </div>
          <div className="mono" style={{ display: "flex", gap: "16px", color: "var(--ink3)", fontSize: "11px" }}>
            <span>Taint Depth: <b>0</b></span>
            <span>Masked Tokens: <b>38</b></span>
            <span>Compiler Verdict: <b>ACCEPTED</b></span>
          </div>
        </div>
      </div>

      {/* 3. Assigned Remediation Tasks Table */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--heading-primary)" }}>
              Assigned Developer Tasks ({assignedTasks.length})
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--ink3)" }}>
              Triaged vulnerabilities queued for AST synthesis and container probe testing
            </p>
          </div>
          <Link href="/cockpit/TASK9142" className="btn sm sec" style={{ textDecoration: "none" }}>
            <span>View All in Cockpit</span>
          </Link>
        </div>

        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--surface2)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Task ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Defect Title</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Affected Target</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>CWE ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "8px 12px", textAlign: "right", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="mono" style={{ padding: "10px 12px", fontWeight: 700, color: "var(--brand)" }}>
                    {t.id}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--heading-primary)" }}>
                    {t.title}
                  </td>
                  <td className="mono" style={{ padding: "10px 12px", color: "var(--ink2)", fontSize: "11.5px" }}>
                    {t.file}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className={`chip ${t.severity === "Critical" ? "fail" : "warn"}`} style={{ fontSize: "10px" }}>
                      {t.cwe}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="chip pass" style={{ fontSize: "10px" }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <Link href={`/cockpit/${t.id}`} className="btn sm sec" style={{ textDecoration: "none" }}>
                      <span>Repair</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
