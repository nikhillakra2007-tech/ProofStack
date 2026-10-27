"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  FileCode2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Search,
  Filter,
  Check,
  Cpu,
} from "lucide-react";

export interface FindingItem {
  id: string;
  taskId: string;
  cwe: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  cvss: number;
  file: string;
  lines: string;
  rule: string;
  summary: string;
  exploitEvidence: string;
  patchDiff: {
    del: string;
    add: string[];
  };
  gates: {
    ast: boolean;
    style: boolean;
    dast: boolean;
    regression: boolean;
    ledger: boolean;
  };
  ledgerHash: string;
}

const SAMPLE_FINDINGS: FindingItem[] = [
  {
    id: "f-1",
    taskId: "TASK-9142",
    cwe: "CWE-639",
    title: "Broken Object-Level Auth (IDOR) in Workspace Billing",
    severity: "CRITICAL",
    cvss: 9.1,
    file: "backend/api/workspaces.py",
    lines: "84-89",
    rule: "rules.python.tenant_isolation",
    summary: "Endpoint permitted foreign tenant JWT to read serialized billing invoices by parameter manipulation.",
    exploitEvidence: "Active DAST probe: GET /api/v1/workspaces/ws_org_victim_8819/billing succeeded with tenant_4401 token (HTTP 200). Post-remediation: HTTP 403 Forbidden.",
    patchDiff: {
      del: "-86      return serialize_billing(workspace.billing_profile) # No tenant check",
      add: [
        "+86      if workspace.tenant_id != session.tenant_id and not session.is_super_admin:",
        "+87          audit_log.record_violation(session.user_id, 'IDOR_ATTEMPT', workspace_id)",
        "+88          raise HTTPException(status_code=403, detail='Tenant mismatch')",
        "+89      return serialize_billing(workspace.billing_profile)",
      ],
    },
    gates: { ast: true, style: true, dast: true, regression: true, ledger: true },
    ledgerHash: "c77a9142f9b88201a04d5e8932fc9019b8423",
  },
  {
    id: "f-2",
    taskId: "TASK-8201",
    cwe: "CWE-89",
    title: "SQL Injection in Audit Log Filter Parsing",
    severity: "HIGH",
    cvss: 8.4,
    file: "backend/db/queries.py",
    lines: "112-115",
    rule: "rules.sql.parameterized_queries",
    summary: "Raw SQL query string interpolation allowed malicious filter parameter to extract system users.",
    exploitEvidence: "Active DAST probe: GET /audit/logs?filter=' OR '1'='1 extracted 84 foreign system audit events. Post-remediation: query parameterized safely.",
    patchDiff: {
      del: "-113     query = f\"SELECT * FROM audit_logs WHERE tag = '{filter_str}'\"",
      add: [
        "+113     query = 'SELECT * FROM audit_logs WHERE tag = :filter_tag'",
        "+114     return db.execute_parameterized(query, {'filter_tag': filter_str})",
      ],
    },
    gates: { ast: true, style: true, dast: true, regression: true, ledger: true },
    ledgerHash: "a49102c77dfb890123ee90918c7283401fa91",
  },
  {
    id: "f-3",
    taskId: "TASK-7419",
    cwe: "CWE-918",
    title: "Server-Side Request Forgery via Outbound Webhook",
    severity: "CRITICAL",
    cvss: 8.9,
    file: "backend/webhooks/fetcher.py",
    lines: "45-51",
    rule: "rules.network.dns_rebinding_guard",
    summary: "URL validator checked IP once but didn't pin connection, allowing DNS rebinding to 169.254.169.254.",
    exploitEvidence: "Active DAST probe: Dispatched rebinding payload to internal cloud metadata service. Post-remediation: IP strictly pinned before socket connect.",
    patchDiff: {
      del: "-48      resp = requests.post(webhook_url, json=payload, timeout=5)",
      add: [
        "+48      resolved_ip = dns_safe_resolve(webhook_url.hostname)",
        "+49      if is_private_or_metadata_ip(resolved_ip): raise SecurityViolation()",
        "+50      resp = pinned_http_post(resolved_ip, webhook_url, json=payload)",
      ],
    },
    gates: { ast: true, style: true, dast: true, regression: true, ledger: true },
    ledgerHash: "88a29b719401928374e62810a083bf23910c7",
  },
  {
    id: "f-4",
    taskId: "TASK-6102",
    cwe: "CWE-400",
    title: "ReDoS Catastrophic Backtracking in Slug Parser",
    severity: "HIGH",
    cvss: 7.8,
    file: "backend/utils/slug.py",
    lines: "14-17",
    rule: "rules.regex.linear_time_ast",
    summary: "Overlapping repetition regex (a+)+ caused 100% CPU lockup on 28-character craft payload.",
    exploitEvidence: "Active DAST probe: Dispatched canary string causing 14,200ms thread hang. Post-remediation: Linear O(n) regex execution in 0.04ms.",
    patchDiff: {
      del: "-14      URL_PATTERN = re.compile(r\"^([a-zA-Z0-9]+)+$\")",
      add: [
        "+14      URL_PATTERN = re.compile(r\"^[a-zA-Z0-9]+$\")",
      ],
    },
    gates: { ast: true, style: true, dast: true, regression: true, ledger: true },
    ledgerHash: "51892019b88201a04d5e8932fc9019b8423a0",
  },
];

export default function HeroShowcaseTriad() {
  const [selectedFindingId, setSelectedFindingId] = useState<string>("f-1");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const selectedFinding =
    SAMPLE_FINDINGS.find((f) => f.id === selectedFindingId) || SAMPLE_FINDINGS[0];

  const filteredFindings = SAMPLE_FINDINGS.filter((f) => {
    if (filterSeverity !== "ALL" && f.severity !== filterSeverity) return false;
    if (
      searchQuery &&
      !f.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !f.cwe.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !f.file.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1240px",
        margin: "0 auto",
      }}
    >
      {/* Outer Framing Container with Warm & Green Subtle Tints */}
      <div
        style={{
          background: "var(--surface-green, #E8F1EE)",
          borderRadius: "20px",
          padding: "16px",
          border: "1px solid var(--line, #DCE3E0)",
          boxShadow: "0 24px 60px -16px rgba(23, 46, 39, 0.10)",
        }}
      >
        {/* Top Control & Identity Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px 14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5534B" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#DFA030" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#57AB5A" }} />
            </div>
            <span
              style={{
                fontFamily: "var(--f-mono, monospace)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--heading-primary, #344E48)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>proofstack-cockpit.local</span>
              <span style={{ color: "var(--ink3, #71807A)" }}>/</span>
              <span style={{ color: "var(--brand-deep, #167A58)" }}>
                continuous-verification-feed
              </span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontFamily: "var(--f-mono, monospace)",
                color: "var(--heading-primary, #344E48)",
                background: "var(--surface, #FFFFFF)",
                padding: "3px 10px",
                borderRadius: "9999px",
                border: "1px solid var(--line, #DCE3E0)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--brand, #20C9A6)",
                }}
              />
              Ephemeral Pod: Ready
            </span>

            <Link
              href="/cockpit/TASK9142"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11.5px",
                fontFamily: "var(--f-ui, sans-serif)",
                fontWeight: 600,
                color: "var(--heading-primary, #344E48)",
                textDecoration: "none",
                background: "var(--surface, #FFFFFF)",
                padding: "3px 10px",
                borderRadius: "9999px",
                border: "1px solid var(--line, #DCE3E0)",
              }}
              className="hover:underline"
            >
              <span>Open in Full Cockpit</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            TRIAD PANELS CONTAINER: 3 Coordinated Layered Panels Side by Side
        ========================================================================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "14px",
            alignItems: "stretch",
          }}
        >
          {/* ---------------------------------------------------------------------
              PANEL 1 (LEFT): Security Overview & Verification Posture
          --------------------------------------------------------------------- */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "14px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "18px 18px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="lg:col-span-3"
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--heading-secondary, #5E7D73)",
                  }}
                >
                  Posture & Health
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "#E8F1EE",
                    color: "#167A58",
                    fontWeight: 700,
                  }}
                >
                  8/8 PASS
                </span>
              </div>

              {/* KPI Score Block */}
              <div
                style={{
                  background: "var(--surface2, #F1F4F0)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "16px",
                  border: "1px solid var(--line-subtle, #EDF2F0)",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--ink3, #71807A)" }}>
                  Zero-Hallucination Rate
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontFamily: "var(--f-display)",
                    fontWeight: 600,
                    color: "var(--heading-primary, #344E48)",
                    lineHeight: 1.15,
                    margin: "2px 0",
                  }}
                >
                  100.0%
                </div>
                <div style={{ fontSize: "11px", color: "var(--brand-deep, #167A58)", fontWeight: 500 }}>
                  Deterministic AST validation verified
                </div>
              </div>

              {/* Severity Counts Breakdown */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--heading-primary, #344E48)",
                    marginBottom: "8px",
                  }}
                >
                  Active Severity Triage
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11.5px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "rgba(180, 35, 24, 0.05)",
                    }}
                  >
                    <span style={{ color: "#B42318", fontWeight: 600 }}>Critical (CVSS &gt; 8.5)</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontWeight: 700, color: "#B42318" }}>3</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11.5px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "rgba(154, 103, 0, 0.06)",
                    }}
                  >
                    <span style={{ color: "#9A6700", fontWeight: 600 }}>High (CVSS 7.0–8.4)</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontWeight: 700, color: "#9A6700" }}>4</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11.5px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "rgba(22, 122, 88, 0.06)",
                    }}
                  >
                    <span style={{ color: "#167A58", fontWeight: 600 }}>Remediated &amp; Sealed</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontWeight: 700, color: "#167A58" }}>8</span>
                  </div>
                </div>
              </div>

              {/* Interlock Checklist */}
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--heading-primary, #344E48)",
                    marginBottom: "8px",
                  }}
                >
                  System Invariants
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--ink2, #42534E)" }}>
                    <Check size={12} style={{ color: "var(--brand, #20C9A6)", strokeWidth: 3 }} />
                    <span>AST Syntax Invariant</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--ink2, #42534E)" }}>
                    <Check size={12} style={{ color: "var(--brand, #20C9A6)", strokeWidth: 3 }} />
                    <span>Dynamic DAST Assertion</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--ink2, #42534E)" }}>
                    <Check size={12} style={{ color: "var(--brand, #20C9A6)", strokeWidth: 3 }} />
                    <span>HMAC-SHA256 Merkle Chain</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid var(--line-subtle, #EDF2F0)",
                fontSize: "10.5px",
                fontFamily: "var(--f-mono)",
                color: "var(--ink3, #71807A)",
              }}
            >
              Chain Root: 88a29b...142f9b
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              PANEL 2 (CENTER — PRIMARY FOCAL POINT): Findings Explorer
          --------------------------------------------------------------------- */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "14px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "18px 20px",
              boxShadow: "0 12px 32px rgba(23, 46, 39, 0.05)",
              display: "flex",
              flexDirection: "column",
            }}
            className="lg:col-span-5"
          >
            {/* Explorer Header & Search Filter */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "var(--f-mono, monospace)",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--heading-primary, #344E48)",
                    }}
                  >
                    Findings Explorer
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--f-mono)",
                      fontSize: "10px",
                      background: "var(--surface-green, #E8F1EE)",
                      color: "var(--heading-primary, #344E48)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {filteredFindings.length} Active
                  </span>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {["ALL", "CRITICAL", "HIGH"].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFilterSeverity(sev)}
                      style={{
                        fontFamily: "var(--f-mono)",
                        fontSize: "9.5px",
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        border: "1px solid var(--line, #DCE3E0)",
                        background:
                          filterSeverity === sev
                            ? "var(--heading-primary, #344E48)"
                            : "var(--surface, #FFFFFF)",
                        color:
                          filterSeverity === sev ? "#FFFFFF" : "var(--ink2, #42534E)",
                        cursor: "pointer",
                      }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input Box */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "var(--bg, #FAFAFA)",
                  border: "1px solid var(--line, #DCE3E0)",
                  borderRadius: "7px",
                  padding: "5px 10px",
                }}
              >
                <Search size={13} style={{ color: "var(--ink3, #71807A)" }} />
                <input
                  type="text"
                  placeholder="Filter by CWE, file path, or rule name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "11.5px",
                    fontFamily: "var(--f-ui, sans-serif)",
                    color: "var(--ink, #263A35)",
                    width: "100%",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Finding Rows List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflowY: "auto",
                maxHeight: "340px",
              }}
            >
              {filteredFindings.map((finding) => {
                const isSelected = finding.id === selectedFinding.id;
                const isCrit = finding.severity === "CRITICAL";

                return (
                  <div
                    key={finding.id}
                    onClick={() => setSelectedFindingId(finding.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${isSelected ? "var(--heading-primary, #344E48)" : "var(--line, #DCE3E0)"}`,
                      background: isSelected
                        ? "var(--surface-green, #E8F1EE)"
                        : "var(--surface, #FFFFFF)",
                      cursor: "pointer",
                      transition: "all 140ms ease",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontFamily: "var(--f-mono)",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1.5px 5px",
                            borderRadius: "3px",
                            background: isCrit ? "#FDF0EE" : "rgba(154, 103, 0, 0.08)",
                            color: isCrit ? "#B42318" : "#9A6700",
                          }}
                        >
                          {finding.cwe} · {finding.cvss}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--f-mono)",
                            fontSize: "10.5px",
                            color: "var(--ink3, #71807A)",
                          }}
                        >
                          {finding.taskId}
                        </span>
                      </div>

                      <span
                        style={{
                          fontFamily: "var(--f-mono)",
                          fontSize: "9.5px",
                          fontWeight: 700,
                          color: "#167A58",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Check size={11} />
                        SEALED
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "var(--heading-primary, #344E48)",
                        lineHeight: 1.3,
                        marginBottom: "4px",
                      }}
                    >
                      {finding.title}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "10.5px",
                        fontFamily: "var(--f-mono)",
                        color: "var(--ink3, #71807A)",
                      }}
                    >
                      <span>{finding.file}:{finding.lines}</span>
                      <span style={{ color: "var(--brand-deep, #167A58)" }}>
                        {finding.rule}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              PANEL 3 (RIGHT): Contextual Evidence & Remediation Workflow
          --------------------------------------------------------------------- */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "14px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "18px 20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="lg:col-span-4"
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--heading-secondary, #5E7D73)",
                  }}
                >
                  Evidence &amp; Remediation
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    color: "var(--heading-primary, #344E48)",
                    background: "var(--surface2, #F1F4F0)",
                    padding: "2px 7px",
                    borderRadius: "4px",
                  }}
                >
                  <Cpu size={11} />
                  Nemotron 70B
                </span>
              </div>

              {/* Exploit Evidence Box */}
              <div
                style={{
                  background: "var(--surface2, #F1F4F0)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "12px",
                  border: "1px solid var(--line-subtle, #EDF2F0)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--ink3, #71807A)",
                    marginBottom: "3px",
                  }}
                >
                  EXPLOIT PROBE ORACLE
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--ink2, #42534E)", lineHeight: 1.45 }}>
                  {selectedFinding.exploitEvidence}
                </div>
              </div>

              {/* AST Unified Diff Preview */}
              <div style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--ink3, #71807A)",
                    marginBottom: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>SYNTHESIZED AST DIFF</span>
                  <span style={{ color: "var(--brand-deep, #167A58)" }}>100% Gated</span>
                </div>

                <div
                  style={{
                    background: "var(--bg, #FAFAFA)",
                    border: "1px solid var(--line, #DCE3E0)",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    fontFamily: "var(--f-mono)",
                    fontSize: "11px",
                    lineHeight: 1.55,
                    overflowX: "auto",
                  }}
                >
                  <div style={{ color: "#B42318", background: "rgba(180, 35, 24, 0.08)", padding: "1px 4px" }}>
                    {selectedFinding.patchDiff.del}
                  </div>
                  {selectedFinding.patchDiff.add.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        color: "#167A58",
                        background: "rgba(22, 122, 88, 0.08)",
                        padding: "1px 4px",
                        fontWeight: 600,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* 8-Gate Checkpoints Miniature */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "6px",
                  fontSize: "10.5px",
                  fontFamily: "var(--f-mono)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#167A58" }}>
                  <CheckCircle2 size={11} /> AST Syntax Pass
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#167A58" }}>
                  <CheckCircle2 size={11} /> Linter Clean
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#167A58" }}>
                  <CheckCircle2 size={11} /> DAST Replay Pass
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#167A58" }}>
                  <CheckCircle2 size={11} /> Merkle Chained
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid var(--line-subtle, #EDF2F0)",
              }}
            >
              <Link
                href={`/cockpit/${selectedFinding.taskId.replace("-", "")}`}
                className="btn-pill-primary"
                style={{
                  width: "100%",
                  height: "36px",
                  fontSize: "12.5px",
                  justifyContent: "center",
                }}
              >
                <span>Inspect in Remediation Cockpit</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
