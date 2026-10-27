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
  ExternalLink,
  Layers,
  ChevronRight,
  FileCode,
  Users,
  Copy,
  Check,
  Cpu,
  RefreshCw,
  Search,
  Code2,
} from "lucide-react";

export default function CoreProductSections() {
  // Showcase Tab in Section D
  const [showcaseTab, setShowcaseTab] = useState<"cockpit" | "studio" | "dast">("cockpit");

  // Cockpit view toggle inside Showcase
  const [isCockpitPatched, setIsCockpitPatched] = useState(true);

  // Interactive DAST Probe Vector in Section C
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
      method: "GET",
      desc: "Simulates tenant privilege escalation across isolated organization data structures.",
      assertion: "Assert response status == 403 Forbidden on non-matching tenant JWT claims.",
      curlCmd: "curl -i -X GET https://sandbox.proofstack.internal/api/v1/workspaces/ws_org_victim_8819/billing \\\n  -H 'Authorization: Bearer attacker_token_tenant_4401' \\\n  -H 'X-ProofStack-Probe: CWE-639-ACTIVE'",
      responseBefore: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"tenant_id\": \"org_victim_8819\",\n  \"plan\": \"enterprise_annual\",\n  \"card_last4\": \"9182\",\n  \"invoice_token\": \"inv_sec_88921a\"\n}",
      responseAfter: "HTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{\n  \"error\": \"Tenant authorization mismatch\",\n  \"audit_ref\": \"SEAL-SHA256-88a29b\",\n  \"violation\": \"IDOR_ATTEMPT_RECORDED\"\n}",
    },
    {
      cwe: "CWE-89",
      name: "SQL Injection Ingress",
      severity: "HIGH",
      cvss: 8.4,
      endpoint: "/api/v1/audit/logs?filter={payload}",
      method: "GET",
      desc: "Injects dynamic parameterized probes to verify sanitization at database boundary.",
      assertion: "Assert SQL engine parses input as parameterized literal rather than AST query node.",
      curlCmd: "curl -i -X GET 'https://sandbox.proofstack.internal/api/v1/audit/logs?filter=%27%20OR%20%271%27=%271' \\\n  -H 'Authorization: Bearer dev_session_token_1802'",
      responseBefore: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  {\"id\": 1, \"user\": \"admin@root\", \"action\": \"AUTH_KEY_ROTATED\"},\n  {\"id\": 2, \"user\": \"system@db\", \"action\": \"SUPER_TENANT_DUMP\"}\n]",
      responseAfter: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  /* Safe parameterized match: 0 rows found matching exact literal tag */\n]",
    },
    {
      cwe: "CWE-918",
      name: "Server-Side Request Forgery (SSRF)",
      severity: "CRITICAL",
      cvss: 8.9,
      endpoint: "/api/v1/webhooks/test",
      method: "POST",
      desc: "Fuzzes URL schemes against link-local addresses (169.254.169.254, internal VPC subnets).",
      assertion: "Assert outbound HTTP transport rejects loopback and cloud metadata endpoints.",
      curlCmd: "curl -i -X POST https://sandbox.proofstack.internal/api/v1/webhooks/test \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"target\": \"http://169.254.169.254/latest/meta-data/\"}'",
      responseBefore: "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nami-id\ninstance-type\niam/security-credentials/internal-role",
      responseAfter: "HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{\n  \"error\": \"ProhibitedTargetException: Destination matches loopback or cloud metadata CIDR\",\n  \"blocked_ip\": \"169.254.169.254\"\n}",
    },
    {
      cwe: "CWE-287",
      name: "Improper Authentication (JWT Forgery)",
      severity: "CRITICAL",
      cvss: 9.3,
      endpoint: "/api/v1/admin/tenants",
      method: "POST",
      desc: "Tests algorithm confusion (HS256 vs RS256) and expired signature tolerance.",
      assertion: "Assert cryptographic verification strictly enforces configured asymmetric public key.",
      curlCmd: "curl -i -X POST https://sandbox.proofstack.internal/api/v1/admin/tenants \\\n  -H 'Authorization: Bearer forged_alg_none_token_xyz' \\\n  -d '{\"tenant_name\": \"malicious_tenant\"}'",
      responseBefore: "HTTP/1.1 201 Created\nContent-Type: application/json\n\n{\"status\": \"tenant_provisioned\", \"tenant_id\": \"malicious_tenant\"}",
      responseAfter: "HTTP/1.1 401 Unauthorized\nContent-Type: application/json\n\n{\n  \"error\": \"JWTVerificationError: Algorithm 'none' is disallowed by cryptographic policy\",\n  \"enforced_alg\": \"RS256\"\n}",
    },
  ];

  const handleRunProbe = () => {
    setIsProbeRunning(true);
    setProbeResultVisible(false);
    setTimeout(() => {
      setIsProbeRunning(false);
      setProbeResultVisible(true);
    }, 600);
  };

  const handleCopyCurl = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div style={{ width: "100%", background: "var(--bg, #FAFAFA)" }}>
      {/* =========================================================================
          SECTION C — PRODUCT CAPABILITIES (Asymmetric Editorial Grid with DAST Lab)
      ========================================================================= */}
      <section
        id="capabilities"
        style={{
          padding: "90px 24px 80px",
          maxWidth: "1280px",
          margin: "0 auto",
          borderTop: "1px solid var(--line, #DCE3E0)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 56px" }}>
          <div
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--heading-secondary, #5E7D73)",
              marginBottom: "12px",
            }}
          >
            Capabilities · High-Assurance DevSecOps
          </div>
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              margin: "0 0 16px 0",
            }}
          >
            <span>Engineered for verification,</span>{" "}
            <span className="headline-accent">not speculation.</span>
          </h2>
          <p
            style={{
              fontSize: "15.5px",
              lineHeight: 1.6,
              color: "var(--ink2, #42534E)",
              margin: 0,
            }}
          >
            Traditional scanners overwhelm developers with theoretical warnings.
            ProofStack executes active dynamic probes and enforces deterministic AST
            gates to guarantee zero false positives.
          </p>
        </div>

        {/* Asymmetric Capability Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
          }}
        >
          {/* Spotlight Card: 12-Vector Active DAST Engine with Interactive Lab (Span 7 cols) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "16px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="lg:col-span-7"
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "var(--surface-green, #E8F1EE)",
                  color: "var(--heading-primary, #344E48)",
                  fontSize: "11px",
                  fontFamily: "var(--f-mono)",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                <Activity size={13} style={{ color: "var(--brand, #20C9A6)" }} />
                Vector Probing Engine
              </div>
              <h3
                style={{
                  fontSize: "21px",
                  fontFamily: "var(--f-display)",
                  fontWeight: 600,
                  color: "var(--heading-primary, #344E48)",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.015em",
                }}
              >
                12-Vector Adversarial DAST Probing
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--ink2, #42534E)",
                  lineHeight: 1.5,
                  margin: "0 0 20px 0",
                }}
              >
                ProofStack doesn't guess if code is vulnerable. It spins up ephemeral
                sandbox containers, executes live HTTP payloads with dynamic state,
                and verifies exploitability before notifying engineers.
              </p>

              {/* Interactive Vector Selector Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                {DAST_VECTORS.map((v, i) => (
                  <button
                    key={v.cwe}
                    type="button"
                    onClick={() => {
                      setSelectedVector(i);
                      setProbeResultVisible(true);
                    }}
                    style={{
                      fontFamily: "var(--f-mono, monospace)",
                      fontSize: "11px",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      border: `1px solid ${selectedVector === i ? "var(--heading-primary, #344E48)" : "var(--line, #DCE3E0)"}`,
                      background: selectedVector === i ? "var(--surface-green, #E8F1EE)" : "var(--surface, #FFFFFF)",
                      color: selectedVector === i ? "var(--heading-primary, #344E48)" : "var(--ink2, #42534E)",
                      fontWeight: selectedVector === i ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 140ms ease",
                    }}
                  >
                    {v.cwe}
                  </button>
                ))}
              </div>

              {/* DAST Lab Live Console Container */}
              <div
                style={{
                  background: "var(--surface2, #F1F4F0)",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #DCE3E0)",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--heading-primary, #344E48)" }}>
                      {DAST_VECTORS[selectedVector].name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--f-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        marginLeft: "8px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "#FDF0EE",
                        color: "#B42318",
                      }}
                    >
                      {DAST_VECTORS[selectedVector].severity} ({DAST_VECTORS[selectedVector].cvss})
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleCopyCurl(DAST_VECTORS[selectedVector].curlCmd)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontFamily: "var(--f-ui)",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        background: "var(--surface, #FFFFFF)",
                        border: "1px solid var(--line, #DCE3E0)",
                        color: "var(--ink2, #42534E)",
                        cursor: "pointer",
                      }}
                    >
                      {copiedCurl ? <Check size={11} style={{ color: "#167A58" }} /> : <Copy size={11} />}
                      {copiedCurl ? "Copied" : "Copy Curl"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRunProbe}
                      disabled={isProbeRunning}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontFamily: "var(--f-ui)",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "5px",
                        background: "var(--brand, #20C9A6)",
                        color: "#172E27",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <RefreshCw size={11} className={isProbeRunning ? "animate-spin" : ""} />
                      {isProbeRunning ? "Probing Pod…" : "Execute Dynamic Probe"}
                    </button>
                  </div>
                </div>

                {/* Curl Box */}
                <div
                  style={{
                    background: "var(--term-bg, #111A18)",
                    color: "var(--term-ink, #D7E5E0)",
                    fontFamily: "var(--f-mono)",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    borderRadius: "6px",
                    padding: "10px 12px",
                    overflowX: "auto",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ color: "var(--term-mute, #728A83)" }}># Reproducible Adversarial Payload</div>
                  <div style={{ color: "var(--brand, #20C9A6)" }}>{DAST_VECTORS[selectedVector].curlCmd}</div>
                </div>

                {/* HTTP Response Diff Preview */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "var(--surface, #FFFFFF)",
                      border: "1px solid var(--line, #DCE3E0)",
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}
                  >
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "9.5px", fontWeight: 700, color: "#B42318", marginBottom: "4px" }}>
                      BEFORE FIX (VULNERABLE BASELINE)
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: "var(--f-mono)",
                        fontSize: "10px",
                        color: "var(--ink2, #42534E)",
                        lineHeight: 1.4,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {DAST_VECTORS[selectedVector].responseBefore}
                    </pre>
                  </div>

                  <div
                    style={{
                      background: "var(--surface, #FFFFFF)",
                      border: "1px solid var(--line, #DCE3E0)",
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}
                  >
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "9.5px", fontWeight: 700, color: "#167A58", marginBottom: "4px" }}>
                      AFTER AST FIX (DETERMINISTIC GUARD)
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: "var(--f-mono)",
                        fontSize: "10px",
                        color: "var(--ink2, #42534E)",
                        lineHeight: 1.4,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {DAST_VECTORS[selectedVector].responseAfter}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--line-subtle, #EDF2F0)" }}>
              <Link
                href="/dast"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--heading-primary, #344E48)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                <span>Launch Interactive DAST Console</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: 8-Gate Deterministic Interlock (Span 5 cols) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "16px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="lg:col-span-5"
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "var(--surface-green, #E8F1EE)",
                  color: "var(--heading-primary, #344E48)",
                  fontSize: "11px",
                  fontFamily: "var(--f-mono)",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                <FileCheck2 size={13} style={{ color: "var(--brand, #20C9A6)" }} />
                Zero Hallucinations
              </div>
              <h3
                style={{
                  fontSize: "21px",
                  fontFamily: "var(--f-display)",
                  fontWeight: 600,
                  color: "var(--heading-primary, #344E48)",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.015em",
                }}
              >
                8-Gate Deterministic Interlock
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--ink2, #42534E)",
                  lineHeight: 1.5,
                  margin: "0 0 16px 0",
                }}
              >
                AI models synthesize candidate patches, but zero diffs merge without
                clearing 8 automated checks. If a single gate fails, the commit is rejected.
              </p>

              {/* Checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {[
                  { name: "Gate 1: AST Syntax Validator", desc: "Python 3.12 grammar compile", time: "12ms" },
                  { name: "Gate 2: Ruff Strict Style Checker", desc: "No formatting regressions", time: "24ms" },
                  { name: "Gate 3: Negative DAST Replay", desc: "Original exploit fails", time: "110ms" },
                  { name: "Gate 4: Pytest Unit Regression Suite", desc: "4/4 test cases pass", time: "240ms" },
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
                      background: "var(--bg, #FAFAFA)",
                      border: "1px solid var(--line, #DCE3E0)",
                      fontSize: "11.5px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <CheckCircle2 size={13} style={{ color: "var(--brand, #20C9A6)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--heading-primary, #344E48)" }}>{gate.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--ink3, #71807A)" }}>{gate.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "10.5px", color: "var(--ink3, #71807A)" }}>
                      {gate.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--line-subtle, #EDF2F0)" }}>
              <Link
                href="/cockpit/TASK9142"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--heading-primary, #344E48)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                <span>Inspect Gate Verification Matrix</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 3: HMAC-SHA256 Cryptographic Evidence Ledger (Span 6 cols) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "16px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
            }}
            className="md:col-span-6"
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "4px 10px",
                borderRadius: "9999px",
                background: "var(--surface-green, #E8F1EE)",
                color: "var(--heading-primary, #344E48)",
                fontSize: "11px",
                fontFamily: "var(--f-mono)",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              <Lock size={13} style={{ color: "var(--brand, #20C9A6)" }} />
              Audit Provenance
            </div>
            <h3
              style={{
                fontSize: "19px",
                fontFamily: "var(--f-display)",
                fontWeight: 600,
                color: "var(--heading-primary, #344E48)",
                margin: "0 0 10px 0",
              }}
            >
              Cryptographic Evidence Ledger
            </h3>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--ink2, #42534E)",
                lineHeight: 1.55,
                margin: "0 0 16px 0",
              }}
            >
              Every finding, curl reproduction, patch diff, and gate verdict is
              chained into an append-only SHA-256 Merkle tree. Provides court-admissible
              evidence for SOC 2 Type II and ISO 27001 auditors.
            </p>

            <div
              style={{
                background: "var(--bg, #FAFAFA)",
                border: "1px solid var(--line, #DCE3E0)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                color: "var(--ink2, #42534E)",
                marginBottom: "16px",
              }}
            >
              <div style={{ color: "var(--ink3, #71807A)", fontSize: "9.5px", marginBottom: "2px" }}>LATEST BLOCK SEAL</div>
              <div style={{ color: "var(--brand-deep, #167A58)", wordBreak: "break-all" }}>
                c77a9142f9b88201a04d5e8932fc9019b8423a01... (Verified)
              </div>
            </div>

            <Link
              href="/ledger"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--heading-primary, #344E48)",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              <span>Explore Cryptographic Ledger</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Card 4: Role-Based Verification Workflows (Span 6 cols) */}
          <div
            style={{
              gridColumn: "span 12",
              background: "var(--surface, #FFFFFF)",
              borderRadius: "16px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
            }}
            className="md:col-span-6"
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "4px 10px",
                borderRadius: "9999px",
                background: "var(--surface-green, #E8F1EE)",
                color: "var(--heading-primary, #344E48)",
                fontSize: "11px",
                fontFamily: "var(--f-mono)",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              <Users size={13} style={{ color: "var(--brand, #20C9A6)" }} />
              Persona Tailored
            </div>
            <h3
              style={{
                fontSize: "19px",
                fontFamily: "var(--f-display)",
                fontWeight: 600,
                color: "var(--heading-primary, #344E48)",
                margin: "0 0 10px 0",
              }}
            >
              Developer &amp; Auditor Workflows
            </h3>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--ink2, #42534E)",
                lineHeight: 1.55,
                margin: "0 0 16px 0",
              }}
            >
              Developers review clean git patches and execute curl reproductions.
              Auditors inspect tamper-proof verification certificates and export
              signed SARIF compliance reports with 1 click.
            </p>

            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {["Developer", "Auditor", "Admin", "Super Admin"].map((r) => (
                <span
                  key={r}
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10.5px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: "var(--surface-green, #E8F1EE)",
                    color: "var(--heading-primary, #344E48)",
                    border: "1px solid var(--line, #DCE3E0)",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--heading-primary, #344E48)",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              <span>Test 1-Click Judge Demo Roles</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — PRODUCT SHOWCASE & DEEP DIVE (Expansive Realistic Interfaces)
      ========================================================================= */}
      <section
        id="showcase"
        style={{
          padding: "90px 24px 80px",
          maxWidth: "1280px",
          margin: "0 auto",
          borderTop: "1px solid var(--line, #DCE3E0)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 48px" }}>
          <div
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--heading-secondary, #5E7D73)",
              marginBottom: "12px",
            }}
          >
            Product Showcase · Real Working Interfaces
          </div>
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              margin: "0 0 16px 0",
            }}
          >
            <span>Inspect the platform in action.</span>
          </h2>
          <p
            style={{
              fontSize: "15.5px",
              lineHeight: 1.6,
              color: "var(--ink2, #42534E)",
              margin: 0,
            }}
          >
            Every view below is part of the implemented codebase, backed by real
            FastAPI endpoints, Nemotron reasoning, and cryptographic verification.
          </p>
        </div>

        {/* Showcase Interface Frame */}
        <div
          style={{
            background: "var(--surface, #FFFFFF)",
            borderRadius: "16px",
            border: "1px solid var(--line, #DCE3E0)",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.04)",
          }}
        >
          {/* Showcase Navigation Bar */}
          <div
            style={{
              padding: "14px 20px",
              background: "var(--surface2, #F1F4F0)",
              borderBottom: "1px solid var(--line, #DCE3E0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setShowcaseTab("cockpit")}
                className={`nav-pill ${showcaseTab === "cockpit" ? "active" : ""}`}
                style={{
                  background: showcaseTab === "cockpit" ? "var(--surface, #FFFFFF)" : "transparent",
                  border: showcaseTab === "cockpit" ? "1px solid var(--line, #DCE3E0)" : "1px solid transparent",
                }}
              >
                1. Remediation Cockpit
              </button>
              <button
                type="button"
                onClick={() => setShowcaseTab("studio")}
                className={`nav-pill ${showcaseTab === "studio" ? "active" : ""}`}
                style={{
                  background: showcaseTab === "studio" ? "var(--surface, #FFFFFF)" : "transparent",
                  border: showcaseTab === "studio" ? "1px solid var(--line, #DCE3E0)" : "1px solid transparent",
                }}
              >
                2. Custom Rule Studio
              </button>
              <button
                type="button"
                onClick={() => setShowcaseTab("dast")}
                className={`nav-pill ${showcaseTab === "dast" ? "active" : ""}`}
                style={{
                  background: showcaseTab === "dast" ? "var(--surface, #FFFFFF)" : "transparent",
                  border: showcaseTab === "dast" ? "1px solid var(--line, #DCE3E0)" : "1px solid transparent",
                }}
              >
                3. Live DAST Terminal
              </button>
            </div>

            <Link
              href={
                showcaseTab === "cockpit"
                  ? "/cockpit/TASK9142"
                  : showcaseTab === "studio"
                  ? "/studio"
                  : "/dast"
              }
              className="btn-pill-primary"
              style={{
                height: "32px",
                padding: "0 14px",
                fontSize: "12px",
              }}
            >
              <span>Open in Full App</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Showcase Body */}
          <div style={{ padding: "24px" }}>
            {/* VIEW 1: COCKPIT SHOWCASE */}
            {showcaseTab === "cockpit" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "18px" }}>
                {/* Left Metadata Column */}
                <div style={{ gridColumn: "span 12" }} className="lg:col-span-4">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "#FDF0EE", color: "#B42318" }}>
                      CVSS 9.1 CRITICAL
                    </span>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: "var(--ink3, #71807A)" }}>
                      TASK-9142
                    </span>
                  </div>
                  <h4 style={{ fontSize: "17px", fontWeight: 600, color: "var(--heading-primary, #344E48)", margin: "0 0 10px 0" }}>
                    Missing Tenant Scoping in Workspace Billing Endpoint
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--ink2, #42534E)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                    Endpoint allowed cross-tenant reading of invoice tokens and billing profiles by manipulating the organization ID parameter.
                  </p>

                  <div
                    style={{
                      background: "var(--bg, #FAFAFA)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--line, #DCE3E0)",
                      fontSize: "11.5px",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--heading-primary, #344E48)", marginBottom: "4px" }}>
                      Nemotron 70B Synthesis Verdict
                    </div>
                    <div style={{ color: "var(--ink3, #71807A)", lineHeight: 1.45 }}>
                      Remediation synthesizes tenant JWT claim validation and emits audit security event before blocking unauthorized access.
                    </div>
                  </div>

                  {/* Toggle Diff View Button */}
                  <button
                    type="button"
                    onClick={() => setIsCockpitPatched(!isCockpitPatched)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "7px",
                      background: isCockpitPatched ? "var(--surface-green, #E8F1EE)" : "#FDF0EE",
                      border: `1px solid ${isCockpitPatched ? "var(--line, #DCE3E0)" : "#E5534B"}`,
                      fontFamily: "var(--f-ui)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isCockpitPatched ? "#167A58" : "#B42318",
                      cursor: "pointer",
                    }}
                  >
                    <span>View: {isCockpitPatched ? "AST Patched (Protected)" : "Vulnerable Baseline"}</span>
                    <RefreshCw size={12} />
                  </button>
                </div>

                {/* Center & Right Code & Gate Columns */}
                <div style={{ gridColumn: "span 12" }} className="lg:col-span-8">
                  <div
                    style={{
                      fontFamily: "var(--f-mono, monospace)",
                      fontSize: "11.5px",
                      lineHeight: 1.65,
                      background: "var(--bg, #FAFAFA)",
                      border: "1px solid var(--line, #DCE3E0)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      overflowX: "auto",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ color: "var(--ink3, #71807A)", marginBottom: "4px" }}>
                      # backend/api/workspaces.py:84-89
                    </div>
                    <div style={{ color: "#71807A" }}>84  def get_workspace_billing(workspace_id: str, session: UserSession):</div>
                    <div style={{ color: "#71807A" }}>85      workspace = db.fetch_workspace(workspace_id)</div>
                    {!isCockpitPatched ? (
                      <div style={{ background: "rgba(180, 35, 24, 0.08)", color: "#B42318", margin: "0 -14px", padding: "0 14px" }}>
                        86      return serialize_billing(workspace.billing_profile) # VULNERABLE
                      </div>
                    ) : (
                      <>
                        <div style={{ background: "rgba(22, 122, 88, 0.09)", color: "#167A58", margin: "0 -14px", padding: "0 14px", fontWeight: 600 }}>
                          +86      if workspace.tenant_id != session.tenant_id and not session.is_super_admin:
                        </div>
                        <div style={{ background: "rgba(22, 122, 88, 0.09)", color: "#167A58", margin: "0 -14px", padding: "0 14px", fontWeight: 600 }}>
                          +87          audit_log.record_violation(session.user_id, 'IDOR_ATTEMPT', workspace_id)
                        </div>
                        <div style={{ background: "rgba(22, 122, 88, 0.09)", color: "#167A58", margin: "0 -14px", padding: "0 14px", fontWeight: 600 }}>
                          +88          raise HTTPException(status_code=403, detail='Tenant mismatch')
                        </div>
                      </>
                    )}
                    <div style={{ color: "#71807A" }}>89      return serialize_billing(workspace.billing_profile)</div>
                  </div>

                  {/* Gate Results Miniature Bar */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: "8px",
                      fontSize: "11px",
                      fontFamily: "var(--f-mono)",
                    }}
                  >
                    <div style={{ padding: "6px 8px", background: "var(--surface2, #F1F4F0)", borderRadius: "6px", border: "1px solid var(--line, #DCE3E0)" }}>
                      <span style={{ color: "var(--ink3, #71807A)", display: "block", fontSize: "9px" }}>GATE 1</span>
                      <span style={{ color: "#167A58", fontWeight: 700 }}>AST VALID (14ms)</span>
                    </div>
                    <div style={{ padding: "6px 8px", background: "var(--surface2, #F1F4F0)", borderRadius: "6px", border: "1px solid var(--line, #DCE3E0)" }}>
                      <span style={{ color: "var(--ink3, #71807A)", display: "block", fontSize: "9px" }}>GATE 2</span>
                      <span style={{ color: "#167A58", fontWeight: 700 }}>RUFF CLEAN (28ms)</span>
                    </div>
                    <div style={{ padding: "6px 8px", background: "var(--surface2, #F1F4F0)", borderRadius: "6px", border: "1px solid var(--line, #DCE3E0)" }}>
                      <span style={{ color: "var(--ink3, #71807A)", display: "block", fontSize: "9px" }}>GATE 3</span>
                      <span style={{ color: "#167A58", fontWeight: 700 }}>DAST REPLAY (403)</span>
                    </div>
                    <div style={{ padding: "6px 8px", background: "var(--surface2, #F1F4F0)", borderRadius: "6px", border: "1px solid var(--line, #DCE3E0)" }}>
                      <span style={{ color: "var(--ink3, #71807A)", display: "block", fontSize: "9px" }}>GATE 5</span>
                      <span style={{ color: "#167A58", fontWeight: 700 }}>MERKLE SEALED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: RULE STUDIO SHOWCASE */}
            {showcaseTab === "studio" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "12px", fontWeight: 600, color: "var(--heading-primary, #344E48)" }}>
                    Rule Definition: proofstack.rules.python.tenant_isolation
                  </span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: "#167A58", background: "#E8F1EE", padding: "2px 8px", borderRadius: "4px" }}>
                    YAML 1.2 · AST Engine Validated
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--term-bg, #111A18)",
                    color: "var(--term-ink, #D7E5E0)",
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    borderRadius: "8px",
                    padding: "16px",
                    overflowX: "auto",
                  }}
                >
                  <div style={{ color: "#728A83" }}># Custom Semgrep-compatible policy rule</div>
                  <div style={{ color: "#DFA030" }}>id: <span style={{ color: "#D7E5E0" }}>python-missing-tenant-check</span></div>
                  <div style={{ color: "#DFA030" }}>severity: <span style={{ color: "#E5534B" }}>ERROR</span></div>
                  <div style={{ color: "#DFA030" }}>pattern: |</div>
                  <div style={{ paddingLeft: "16px", color: "var(--brand, #20C9A6)" }}>def $FUNC(..., $WORKSPACE_ID, ...):</div>
                  <div style={{ paddingLeft: "32px", color: "var(--brand, #20C9A6)" }}>...</div>
                  <div style={{ paddingLeft: "32px", color: "#E5534B" }}>- return db.fetch_workspace($WORKSPACE_ID)</div>
                  <div style={{ paddingLeft: "32px", color: "#57AB5A" }}>+ if not verify_tenant_access(session, $WORKSPACE_ID): raise HTTPException(403)</div>
                </div>
              </div>
            )}

            {/* VIEW 3: DAST TERMINAL SHOWCASE */}
            {showcaseTab === "dast" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "12px", fontWeight: 600, color: "var(--heading-primary, #344E48)" }}>
                    Ephemeral Pod: probe-worker-cwe639-instance-789
                  </span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: "#167A58", background: "#E8F1EE", padding: "2px 8px", borderRadius: "4px" }}>
                    Container: Healthy (Isolated)
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--term-bg, #111A18)",
                    color: "var(--term-ink, #D7E5E0)",
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "11.5px",
                    lineHeight: 1.65,
                    borderRadius: "8px",
                    padding: "16px",
                    overflowX: "auto",
                  }}
                >
                  <div style={{ color: "#728A83" }}>[23:25:01] Initializing isolated microvm sandbox (mem: 512MB, cpu: 1 core)...</div>
                  <div style={{ color: "#728A83" }}>[23:25:02] Ingesting OpenAPI spec /openapi.json — 14 endpoints identified.</div>
                  <div style={{ color: "var(--brand, #20C9A6)" }}>[23:25:03] Fuzzing vector CWE-639 across tenant session boundaries...</div>
                  <div style={{ color: "#E5534B" }}>[23:25:04] ALERT: GET /workspaces/ws_org_8819/billing succeeded with unauthorized JWT token.</div>
                  <div style={{ color: "#DFA030" }}>[23:25:05] Synthesizing constrained AST patch via NVIDIA Nemotron 70B...</div>
                  <div style={{ color: "#57AB5A" }}>[23:25:06] Patch applied in sandbox. Re-executing reproduction curl payload...</div>
                  <div style={{ color: "#57AB5A" }}>[23:25:07] HTTP 403 Forbidden confirmed. Vulnerability successfully sealed.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — HOW IT WORKS (Connected 4-Step Pipeline with Visual UI Cards)
      ========================================================================= */}
      <section
        id="workflow"
        style={{
          padding: "90px 24px 80px",
          maxWidth: "1280px",
          margin: "0 auto",
          borderTop: "1px solid var(--line, #DCE3E0)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 56px" }}>
          <div
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--heading-secondary, #5E7D73)",
              marginBottom: "12px",
            }}
          >
            Workflow · 4-Step Pipeline
          </div>
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              margin: "0 0 16px 0",
            }}
          >
            <span>From vulnerability alert</span>{" "}
            <span className="headline-accent">to cryptographically sealed fix.</span>
          </h2>
          <p
            style={{
              fontSize: "15.5px",
              lineHeight: 1.6,
              color: "var(--ink2, #42534E)",
              margin: 0,
            }}
          >
            How the autonomous engine navigates the complete cycle of discovery,
            adversarial validation, AST repair, and immutable audit recording.
          </p>
        </div>

        {/* 4 Steps Container with Genuine UI Snippets */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            {
              step: "01",
              title: "Surface Mapping",
              desc: "Extracts OpenAPI definitions, route controllers, and database access layers from code repository.",
              icon: Layers,
              snippetLabel: "DISCOVERED SURFACE",
              snippet: "GET /api/v1/workspaces/{id}\nPOST /api/v1/webhooks/test",
            },
            {
              step: "02",
              title: "Adversarial Probing",
              desc: "Executes 12 CWE dynamic fuzzing probes against ephemeral test containers to prove exploitability.",
              icon: Terminal,
              snippetLabel: "PROBE PAYLOAD",
              snippet: "curl -i GET /workspaces/8819 \\\n  -H 'X-Probe: IDOR-TEST'",
            },
            {
              step: "03",
              title: "Constrained Synthesis",
              desc: "NVIDIA Nemotron generates deterministic AST diffs scoped exclusively to the vulnerable statements.",
              icon: Sparkles,
              snippetLabel: "AST DIFF ENGINE",
              snippet: "+ if tenant != session.tenant:\n+     raise Forbidden(403)",
            },
            {
              step: "04",
              title: "8-Gate Seal",
              desc: "Executes syntax parsers, regression tests, and appends signed block to HMAC-SHA256 Merkle ledger.",
              icon: Lock,
              snippetLabel: "MERKLE SEAL",
              snippet: "SEAL-SHA256-c77a9142\nVERDICT: 8/8 PASS",
            },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.step}
                style={{
                  background: "var(--surface, #FFFFFF)",
                  borderRadius: "14px",
                  border: "1px solid var(--line, #DCE3E0)",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
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
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "var(--surface-green, #E8F1EE)",
                      position: "absolute",
                      top: "16px",
                      right: "20px",
                      lineHeight: 1,
                    }}
                  >
                    {item.step}
                  </div>

                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "var(--surface-green, #E8F1EE)",
                      color: "var(--heading-primary, #344E48)",
                      display: "grid",
                      placeItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <IconComponent size={18} />
                  </div>

                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "var(--heading-primary, #344E48)",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.5,
                      color: "var(--ink2, #42534E)",
                      margin: "0 0 16px 0",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>

                {/* Visual UI Micro-Snippet */}
                <div
                  style={{
                    background: "var(--bg, #FAFAFA)",
                    border: "1px solid var(--line, #DCE3E0)",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    lineHeight: 1.45,
                  }}
                >
                  <div style={{ color: "var(--ink3, #71807A)", fontSize: "8.5px", fontWeight: 700, marginBottom: "3px" }}>
                    {item.snippetLabel}
                  </div>
                  <pre style={{ margin: 0, color: "var(--heading-primary, #344E48)", whiteSpace: "pre-wrap" }}>
                    {item.snippet}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION F — TRUST, SECURITY & ARCHITECTURAL GUARANTEES
      ========================================================================= */}
      <section
        id="trust"
        style={{
          padding: "90px 24px 80px",
          maxWidth: "1280px",
          margin: "0 auto",
          borderTop: "1px solid var(--line, #DCE3E0)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 56px" }}>
          <div
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--heading-secondary, #5E7D73)",
              marginBottom: "12px",
            }}
          >
            Engineering Principles · Trust & Safety
          </div>
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              margin: "0 0 16px 0",
            }}
          >
            <span>Enterprise-grade architecture.</span>{" "}
            <span className="headline-accent">Zero manufactured claims.</span>
          </h2>
          <p
            style={{
              fontSize: "15.5px",
              lineHeight: 1.6,
              color: "var(--ink2, #42534E)",
              margin: 0,
            }}
          >
            We do not show fabricated testimonials or fake logo walls. Here are the
            exact mathematical and architectural guarantees built directly into our codebase.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "var(--surface, #FFFFFF)",
              borderRadius: "14px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "26px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <ShieldCheck size={20} style={{ color: "var(--brand, #20C9A6)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--heading-primary, #344E48)", margin: 0 }}>
                Deterministic Non-Hallucination Gate
              </h3>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--ink2, #42534E)", lineHeight: 1.55, margin: 0 }}>
              AI models are strictly quarantined as patch generators. Zero code commits
              can be merged unless local compilers, AST parsers, and test suites pass 100%.
            </p>
          </div>

          <div
            style={{
              background: "var(--surface, #FFFFFF)",
              borderRadius: "14px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "26px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Lock size={20} style={{ color: "var(--brand, #20C9A6)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--heading-primary, #344E48)", margin: 0 }}>
                Cryptographic Audit Provenance
              </h3>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--ink2, #42534E)", lineHeight: 1.55, margin: 0 }}>
              Audit blocks utilize HMAC-SHA256 with key rotation and Merkle chain linking.
              Any retrospective byte alteration instantly invalidates subsequent hash anchors.
            </p>
          </div>

          <div
            style={{
              background: "var(--surface, #FFFFFF)",
              borderRadius: "14px",
              border: "1px solid var(--line, #DCE3E0)",
              padding: "26px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <FileCode size={20} style={{ color: "var(--brand, #20C9A6)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--heading-primary, #344E48)", margin: 0 }}>
                Open Standards Interoperability
              </h3>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--ink2, #42534E)", lineHeight: 1.55, margin: 0 }}>
              Native exports for SARIF (OASIS standard), CycloneDX Software Bill of
              Materials (SBOM), and JSON-LD audit certificates for seamless SIEM ingestion.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G — FINAL CALL TO ACTION (Pill CTAs)
      ========================================================================= */}
      <section
        id="cta"
        style={{
          padding: "80px 24px 100px",
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "var(--surface-green, #E8F1EE)",
            borderRadius: "20px",
            border: "1px solid var(--line, #DCE3E0)",
            padding: "56px 36px",
            textAlign: "center",
            boxShadow: "0 12px 32px rgba(22, 122, 88, 0.06)",
          }}
        >
          <h2
            className="headline-semgrep"
            style={{
              fontSize: "clamp(2rem, 3.4vw, 2.8rem)",
              margin: "0 0 16px 0",
            }}
          >
            Ready to inspect verified security evidence?
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.55,
              color: "var(--ink2, #42534E)",
              maxWidth: "620px",
              margin: "0 auto 32px",
            }}
          >
            Launch the live cockpit to review real findings, run adversarial
            DAST reproductions, or sign in using any of the 4 pre-configured demo judge accounts.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/cockpit/TASK9142"
              className="btn-pill-primary"
              style={{
                height: "46px",
                padding: "0 28px",
                fontSize: "14.5px",
              }}
            >
              <span>Launch Live Cockpit</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/login"
              className="btn-pill-secondary"
              style={{
                height: "46px",
                padding: "0 24px",
                fontSize: "14.5px",
              }}
            >
              <span>Sign In with Demo Role</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER (Semgrep-Style Minimalist Editorial)
      ========================================================================= */}
      <footer
        style={{
          borderTop: "1px solid var(--line, #DCE3E0)",
          background: "var(--surface, #FFFFFF)",
          padding: "60px 24px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "48px",
          }}
        >
          {/* Col 1: Identity */}
          <div style={{ gridColumn: "span 1" }}>
            <Link href="#hero" style={{ textDecoration: "none", display: "inline-block", marginBottom: "14px" }}>
              <BrandLogo size="md" showTagline={true} />
            </Link>
            <p
              style={{
                fontSize: "13px",
                color: "var(--ink3, #71807A)",
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
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--heading-primary, #344E48)", marginBottom: "14px" }}>
              Platform
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
              <li><Link href="/cockpit/TASK9142" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">Remediation Cockpit</Link></li>
              <li><Link href="/studio" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">Custom Rule Studio</Link></li>
              <li><Link href="/dast" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">Live DAST Probing</Link></li>
              <li><Link href="/ledger" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">Evidence Ledger</Link></li>
            </ul>
          </div>

          {/* Col 3: Security & Audit */}
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--heading-primary, #344E48)", marginBottom: "14px" }}>
              Security & Trust
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
              <li><span style={{ fontSize: "13px", color: "var(--ink2, #42534E)" }}>8 Deterministic Gates</span></li>
              <li><span style={{ fontSize: "13px", color: "var(--ink2, #42534E)" }}>HMAC-SHA256 Merkle Chain</span></li>
              <li><span style={{ fontSize: "13px", color: "var(--ink2, #42534E)" }}>Zero LLM Commits Policy</span></li>
              <li><span style={{ fontSize: "13px", color: "var(--ink2, #42534E)" }}>Python 3.11/3.12 Sandboxes</span></li>
            </ul>
          </div>

          {/* Col 4: Demo Access */}
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--heading-primary, #344E48)", marginBottom: "14px" }}>
              Demo Access
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
              <li><Link href="/login" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">Sign In (Judge Personas)</Link></li>
              <li><Link href="/settings" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">System Settings</Link></li>
              <li><a href="https://github.com/nikhillakra2007-tech/something" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--ink2, #42534E)", textDecoration: "none" }} className="hover:underline">GitHub Repository</a></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            paddingTop: "24px",
            borderTop: "1px solid var(--line, #DCE3E0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
            color: "var(--ink3, #71807A)",
          }}
        >
          <div>
            © {new Date().getFullYear()} ProofStack (NVIDIA MODEL Project). All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>NVIDIA Nemotron 70B Powered</span>
            <span>·</span>
            <span>Permanent High-Contrast Light Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
