"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  FileCode,
} from "lucide-react";
import FAQSection from "./FAQSection";

export default function CoreProductSections() {
  // Interactive DAST Probe Vector in Capabilities
  const [selectedVector, setSelectedVector] = useState<number>(0);
  const [isProbeRunning, setIsProbeRunning] = useState<boolean>(false);
  const [probeResultVisible, setProbeResultVisible] = useState<boolean>(true);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const DAST_VECTORS = [
    {
      cwe: "CWE-639",
      name: "IDOR / BOLA Authorization Bypass",
      severity: "CRITICAL",
      cvss: 9.1,
      endpoint: "/api/v1/workspaces/{org_id}/billing",
      desc: "Simulates tenant privilege escalation across isolated organization data structures.",
      curlCmd:
        "curl -i -X GET https://sandbox.proofstack.internal/api/v1/workspaces/ws_org_victim_8819/billing \\\n  -H 'Authorization: Bearer attacker_token_tenant_4401' \\\n  -H 'X-ProofStack-Probe: CWE-639-ACTIVE'",
      responseBefore:
        "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"tenant_id\": \"org_victim_8819\",\n  \"plan\": \"enterprise_annual\",\n  \"invoice_token\": \"inv_sec_88921a\"\n}",
      responseAfter:
        "HTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{\n  \"error\": \"Tenant authorization mismatch\",\n  \"audit_ref\": \"SEAL-SHA256-88a29b\",\n  \"violation\": \"IDOR_ATTEMPT_RECORDED\"\n}",
    },
    {
      cwe: "CWE-89",
      name: "SQL Injection Ingress",
      severity: "HIGH",
      cvss: 8.4,
      endpoint: "/api/v1/audit/logs?filter={payload}",
      desc: "Injects dynamic parameterized probes to verify sanitization at database boundary.",
      curlCmd:
        "curl -i -X GET 'https://sandbox.proofstack.internal/api/v1/audit/logs?filter=%27%20OR%20%271%27=%271' \\\n  -H 'Authorization: Bearer dev_session_token_1802'",
      responseBefore:
        "HTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  {\"id\": 1, \"user\": \"admin@root\", \"action\": \"AUTH_KEY_ROTATED\"},\n  {\"id\": 2, \"user\": \"system@db\", \"action\": \"SUPER_TENANT_DUMP\"}\n]",
      responseAfter:
        "HTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  /* Safe parameterized match: 0 rows found matching exact literal tag */\n]",
    },
    {
      cwe: "CWE-918",
      name: "Server-Side Request Forgery (SSRF)",
      severity: "CRITICAL",
      cvss: 8.9,
      endpoint: "/api/v1/webhooks/test",
      desc: "Fuzzes URL schemes against link-local addresses (169.254.169.254, internal VPC subnets).",
      curlCmd:
        "curl -i -X POST https://sandbox.proofstack.internal/api/v1/webhooks/test \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"target\": \"http://169.254.169.254/latest/meta-data/\"}'",
      responseBefore:
        "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nami-id\ninstance-type\niam/security-credentials/internal-role",
      responseAfter:
        "HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{\n  \"error\": \"ProhibitedTargetException: Destination matches loopback or cloud metadata CIDR\",\n  \"blocked_ip\": \"169.254.169.254\"\n}",
    },
  ];

  const currentVector = DAST_VECTORS[selectedVector];

  const handleRunProbe = () => {
    setIsProbeRunning(true);
    setProbeResultVisible(false);
    setTimeout(() => {
      setIsProbeRunning(false);
      setProbeResultVisible(true);
    }, 550);
  };

  const handleCopyCurl = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div style={{ width: "100%", background: "var(--bg)" }}>
      {/* =========================================================================
          SECTION 2 — CORE CAPABILITIES (3 High-Assurance Pillars)
      ========================================================================= */}
      <section
        id="capabilities"
        style={{
          padding: "72px 24px 64px",
          maxWidth: "1280px",
          margin: "0 auto",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div className="scroll-reveal" style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 44px" }}>
          <div
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--heading-secondary)",
              marginBottom: "10px",
            }}
          >
            Core Capabilities · Architectural Breakdown
          </div>
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)",
              margin: "0 0 14px 0",
            }}
          >
            <span>Engineered for verification,</span>{" "}
            <span className="headline-accent">not speculation.</span>
          </h2>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--ink2)",
              margin: 0,
            }}
          >
            Static analysis tools often produce high rates of false positives.
            ProofStack confirms vulnerabilities by replaying dynamic exploit probes
            in isolated containers and verifying fixes against deterministic compiler
            gates before merging.
          </p>
        </div>

        {/* 3 Coordinated Capability Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "20px",
          }}
        >
          {/* Capability 1: Interactive DAST Probing Lab (Span 7 cols) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface)",
              borderRadius: "16px",
              border: "1px solid var(--line)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="lg:col-span-7 scroll-reveal scroll-reveal-stagger-1 card-interactive-hover"
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "var(--surface-green)",
                  color: "var(--heading-primary)",
                  fontSize: "11px",
                  fontFamily: "var(--f-mono)",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                <Terminal size={13} style={{ color: "var(--brand)" }} />
                Live Exploit Testing
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontFamily: "var(--f-display)",
                  fontWeight: 600,
                  color: "var(--heading-primary)",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.015em",
                }}
              >
                12-Vector Dynamic DAST Probing
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--ink2)",
                  lineHeight: 1.5,
                  margin: "0 0 16px 0",
                }}
              >
                Before proposing a fix, ProofStack dispatches exploit payloads
                against ephemeral container targets to confirm the vulnerability is
                actively reachable.
              </p>

              {/* Vector Selector Pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                {DAST_VECTORS.map((v, i) => (
                  <button
                    key={v.cwe}
                    type="button"
                    onClick={() => {
                      setSelectedVector(i);
                      setProbeResultVisible(true);
                    }}
                    style={{
                      fontFamily: "var(--f-mono)",
                      fontSize: "11px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: selectedVector === i ? "var(--surface-green)" : "var(--bg)",
                      color: selectedVector === i ? "var(--heading-primary)" : "var(--ink2)",
                      border: `1px solid ${selectedVector === i ? "var(--brand)" : "var(--line)"}`,
                      fontWeight: selectedVector === i ? 600 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {v.cwe} ({v.severity})
                  </button>
                ))}
              </div>

              {/* Terminal Execution Box */}
              <div
                style={{
                  background: "var(--term-bg, #0B110F)",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                  padding: "12px 14px",
                  fontFamily: "var(--f-mono)",
                  fontSize: "11.5px",
                  lineHeight: 1.55,
                  color: "var(--term-ink, #D7E5E0)",
                  position: "relative",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", color: "var(--term-mute)", textTransform: "uppercase" }}>
                    Ephemeral Probing Sandbox · {currentVector.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCurl(currentVector.curlCmd)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--term-mute)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                    }}
                  >
                    {copiedCurl ? <Check size={11} style={{ color: "var(--brand)" }} /> : <Copy size={11} />}
                    <span>{copiedCurl ? "Copied" : "Copy curl"}</span>
                  </button>
                </div>
                <pre style={{ margin: "0 0 10px 0", whiteSpace: "pre-wrap", color: "var(--brand)" }}>
                  {currentVector.curlCmd}
                </pre>

                {/* Probe Result Toggle */}
                {isProbeRunning ? (
                  <div style={{ color: "var(--warn)", fontStyle: "italic", fontSize: "11px" }}>
                    Executing containerized HTTP exploit probe... (284ms)
                  </div>
                ) : probeResultVisible ? (
                  <div style={{ borderTop: "1px solid #23352E", paddingTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "10px" }}>
                      <span style={{ color: "var(--term-fail)" }}>[BASELINE: EXPLOITED]</span>
                      <span style={{ color: "var(--term-pass)" }}>[REMEDIATED: 403 FORBIDDEN]</span>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#52B788", fontSize: "10.5px" }}>
                      {currentVector.responseAfter}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <button
                type="button"
                onClick={handleRunProbe}
                disabled={isProbeRunning}
                className="btn-pill-primary"
                style={{ height: "34px", padding: "0 16px", fontSize: "12px" }}
              >
                <RefreshCw size={12} className={isProbeRunning ? "animate-spin" : ""} />
                <span>{isProbeRunning ? "Probing Target..." : "Replay Live Probe"}</span>
              </button>

              <Link
                href="/dast"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--heading-primary)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                <span>Launch Full DAST Sandbox</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Capability 2: 8-Gate Interlock (Span 5 cols) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface)",
              borderRadius: "16px",
              border: "1px solid var(--line)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="lg:col-span-5 scroll-reveal scroll-reveal-stagger-2 card-interactive-hover"
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "var(--surface-green)",
                  color: "var(--heading-primary)",
                  fontSize: "11px",
                  fontFamily: "var(--f-mono)",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                <FileCheck2 size={13} style={{ color: "var(--brand)" }} />
                Compiler &amp; Test Verification
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontFamily: "var(--f-display)",
                  fontWeight: 600,
                  color: "var(--heading-primary)",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.015em",
                }}
              >
                8-Gate Deterministic Interlock
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--ink2)",
                  lineHeight: 1.5,
                  margin: "0 0 16px 0",
                }}
              >
                Generative models propose candidate patches, but deterministic gates
                decide. Every proposed diff must pass AST syntax compilation, Ruff
                linting, negative exploit replays, and unit test suites.
              </p>

              {/* Checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { name: "Gate 1: AST Syntax Validator", desc: "Python 3.12 grammar compile", time: "12ms" },
                  { name: "Gate 2: Ruff Strict Style Checker", desc: "Zero formatting regressions", time: "24ms" },
                  { name: "Gate 3: Negative DAST Replay", desc: "Original exploit fails cleanly", time: "110ms" },
                  { name: "Gate 4: Pytest Unit Regression Suite", desc: "100% test cases pass", time: "240ms" },
                  { name: "Gate 5: HMAC-SHA256 Merkle Seal", desc: "Signed block appended", time: "6ms" },
                ].map((gate) => (
                  <div
                    key={gate.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: "6px",
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      fontSize: "11.5px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <CheckCircle2 size={13} style={{ color: "var(--brand)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--heading-primary)" }}>{gate.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--ink3)" }}>{gate.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "10.5px", color: "var(--ink3)" }}>
                      {gate.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "18px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
              <Link
                href="/cockpit/TASK9142"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--heading-primary)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                <span>Inspect Verification Matrix in Cockpit</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Capability 3: Cryptographic Ledger (Span 12 cols, Compact Banner) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface)",
              borderRadius: "16px",
              border: "1px solid var(--line)",
              padding: "24px 28px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
            className="lg:col-span-12 scroll-reveal scroll-reveal-stagger-3 card-interactive-hover"
          >
            <div style={{ maxWidth: "720px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "var(--surface-green)",
                  color: "var(--heading-primary)",
                  fontSize: "11px",
                  fontFamily: "var(--f-mono)",
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                <Lock size={13} style={{ color: "var(--brand)" }} />
                Tamper-Evident History
              </div>
              <h3
                style={{
                  fontSize: "19px",
                  fontFamily: "var(--f-display)",
                  fontWeight: 600,
                  color: "var(--heading-primary)",
                  margin: "0 0 6px 0",
                }}
              >
                Cryptographic Evidence Ledger (HMAC-SHA256)
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--ink2)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Every verification verdict and patch diff is hashed into an append-only
                ledger. Any retroactive tampering invalidates downstream block hashes
                and flags the change immediately.
              </p>
            </div>

            <Link
              href="/ledger"
              className="btn-pill-secondary"
              style={{ height: "40px", padding: "0 20px", fontSize: "13px" }}
            >
              <span>Verify Ledger Audit Trail</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — PRODUCT WORKFLOW (4 Concise Steps)
      ========================================================================= */}
      <section
        id="workflow"
        style={{
          padding: "72px 24px 64px",
          maxWidth: "1280px",
          margin: "0 auto",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div className="scroll-reveal" style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 40px" }}>
          <div
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--heading-secondary)",
              marginBottom: "10px",
            }}
          >
            Remediation Workflow · Step-by-Step
          </div>
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)",
              margin: "0 0 14px 0",
            }}
          >
            <span>From vulnerability alert to verified pull request.</span>
          </h2>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--ink2)",
              margin: 0,
            }}
          >
            An end-to-end pipeline designed to reproduce vulnerabilities, synthesize targeted fixes, and verify code safety deterministically.
          </p>
        </div>

        {/* 4 Pipeline Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {[
            {
              step: "01",
              title: "Taint & Alert Ingestion",
              desc: "AST parsers map control flow graphs to identify vulnerable taint sinks from incoming SAST alerts.",
              snippetLabel: "AST PARSER",
              snippet: "sink: cursor.execute(query)\ntype: TaintSink.SQL_RAW",
            },
            {
              step: "02",
              title: "Dynamic Exploit Probe",
              desc: "Replays targeted HTTP probes against isolated test containers to verify exploitability.",
              snippetLabel: "PROBE PAYLOAD",
              snippet: "curl -i GET /workspaces/8819 \\\n  -H 'X-Probe: IDOR-TEST'",
            },
            {
              step: "03",
              title: "Constrained Patch Synthesis",
              desc: "NVIDIA Nemotron generates scoped candidate diffs restricted to the affected statement.",
              snippetLabel: "AST DIFF ENGINE",
              snippet: "+ if tenant != session.tenant:\n+     raise Forbidden(403)",
            },
            {
              step: "04",
              title: "Deterministic Gate Verification",
              desc: "Runs compiler checks, linter rules, negative exploit replays, and signs the verification ledger.",
              snippetLabel: "LEDGER SEAL",
              snippet: "SEAL-SHA256-c77a9142\nVERDICT: 8/8 PASS",
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className={`scroll-reveal scroll-reveal-stagger-${index + 1} card-interactive-hover`}
              style={{
                background: "var(--surface)",
                borderRadius: "14px",
                border: "1px solid var(--line)",
                padding: "20px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--surface-green)",
                    position: "absolute",
                    top: "14px",
                    right: "18px",
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </div>

                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "7px",
                    background: "var(--surface-green)",
                    color: "var(--heading-primary)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "12px",
                    fontWeight: 700,
                    fontSize: "12px",
                    fontFamily: "var(--f-mono)",
                  }}
                >
                  {item.step}
                </div>

                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--heading-primary)",
                    margin: "0 0 6px 0",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.5,
                    color: "var(--ink2)",
                    margin: "0 0 14px 0",
                  }}
                >
                  {item.desc}
                </p>
              </div>

              {/* Visual Micro-Snippet */}
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  padding: "7px 9px",
                  fontFamily: "var(--f-mono)",
                  fontSize: "10px",
                  lineHeight: 1.45,
                }}
              >
                <div
                  style={{
                    color: "var(--ink3)",
                    fontSize: "8.5px",
                    fontWeight: 700,
                    marginBottom: "3px",
                  }}
                >
                  {item.snippetLabel}
                </div>
                <pre style={{ margin: 0, color: "var(--heading-primary)", whiteSpace: "pre-wrap" }}>
                  {item.snippet}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ========================================================================= */}
      <FAQSection />

      {/* =========================================================================
          SECTION 5 — FINAL CALL TO ACTION & TRUST INVARIANTS
      ========================================================================= */}
      <section
        id="cockpit"
        style={{
          padding: "64px 24px 80px",
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        <div
          className="scroll-reveal"
          style={{
            background: "var(--surface-green)",
            borderRadius: "20px",
            border: "1px solid var(--line)",
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Trust Guarantee Badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--heading-primary)",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} style={{ color: "var(--brand)" }} />
              Deterministic Compiler Gate
            </span>
            <span
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--heading-primary)",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} style={{ color: "var(--brand)" }} />
              Zero LLM Commits Policy
            </span>
            <span
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--heading-primary)",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} style={{ color: "var(--brand)" }} />
              HMAC-SHA256 Merkle Provenance
            </span>
          </div>

          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)",
              margin: "0 0 14px 0",
            }}
          >
            Ready to inspect verified security evidence?
          </h2>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--ink2)",
              maxWidth: "600px",
              margin: "0 auto 28px",
            }}
          >
            Launch the remediation cockpit to inspect real findings, run containerized
            DAST reproductions, or sign in with any of the 4 pre-configured evaluation personas.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/cockpit/TASK9142"
              className="btn-pill-primary"
              style={{
                height: "44px",
                padding: "0 26px",
                fontSize: "14px",
              }}
            >
              <span>Open Remediation Cockpit</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/login"
              className="btn-pill-secondary"
              style={{
                height: "44px",
                padding: "0 22px",
                fontSize: "14px",
              }}
            >
              <span>Sign In with Evaluation Persona</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER (Semgrep-Style Minimalist Editorial)
      ========================================================================= */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--surface)",
          padding: "48px 24px 36px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "36px",
            marginBottom: "36px",
          }}
        >
          {/* Col 1: Identity */}
          <div style={{ gridColumn: "span 1" }}>
            <Link href="#hero" style={{ textDecoration: "none", display: "inline-block", marginBottom: "12px" }}>
              <BrandLogo size="md" showTagline={true} />
            </Link>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--ink3)",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: "280px",
              }}
            >
              Autonomous DevSecOps verification engine combining adversarial DAST probing
              with an 8-gate deterministic interlock and HMAC-SHA256 evidence ledger.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--heading-primary)",
                marginBottom: "12px",
              }}
            >
              Platform
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <Link href="/cockpit/TASK9142" style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }} className="hover:underline">
                  Remediation Cockpit
                </Link>
              </li>
              <li>
                <Link href="/studio" style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }} className="hover:underline">
                  Custom Rule Studio
                </Link>
              </li>
              <li>
                <Link href="/dast" style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }} className="hover:underline">
                  Live DAST Probing
                </Link>
              </li>
              <li>
                <Link href="/ledger" style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }} className="hover:underline">
                  Evidence Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Audit */}
          <div>
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--heading-primary)",
                marginBottom: "12px",
              }}
            >
              Security & Trust
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><span style={{ fontSize: "12.5px", color: "var(--ink2)" }}>8 Deterministic Gates</span></li>
              <li><span style={{ fontSize: "12.5px", color: "var(--ink2)" }}>HMAC-SHA256 Merkle Chain</span></li>
              <li><span style={{ fontSize: "12.5px", color: "var(--ink2)" }}>Zero LLM Commits Policy</span></li>
              <li><span style={{ fontSize: "12.5px", color: "var(--ink2)" }}>Python 3.11/3.12 Sandboxes</span></li>
            </ul>
          </div>

          {/* Col 4: Demo Access */}
          <div>
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--heading-primary)",
                marginBottom: "12px",
              }}
            >
              Demo Access
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <Link href="/login" style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }} className="hover:underline">
                  Sign In (Judge Personas)
                </Link>
              </li>
              <li>
                <Link href="/settings" style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }} className="hover:underline">
                  System Settings
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/nikhillakra2007-tech/something"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12.5px", color: "var(--ink2)", textDecoration: "none" }}
                  className="hover:underline"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            paddingTop: "20px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "11.5px",
            color: "var(--ink3)",
          }}
        >
          <div>
            © {new Date().getFullYear()} ProofStack (NVIDIA MODEL Project). All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "14px" }}>
            <span>NVIDIA Nemotron 70B Powered</span>
            <span>·</span>
            <span>Light, Dark &amp; System Adaptive</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
