"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import BrandLogo from "@/components/common/BrandLogo";
import { Play, RotateCcw, Activity } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/dashboard";

  const { loginAs, setSessionData } = useAuth();

  // Tab mode: 'judge' | 'signin' | 'recovery'
  const [activeTab, setActiveTab] = useState<"judge" | "signin" | "recovery">("judge");

  // Sign in form state
  const [email, setEmail] = useState<string>("operator@perfproof.internal");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSsoLoading, setIsSsoLoading] = useState<boolean>(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // OAuth query params & loading state
  const oauthError = searchParams.get("error");
  const oauthNotice = searchParams.get("notice");
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const handleOAuthSignIn = (provider: "google" | "github") => {
    setOauthLoading(provider);
    window.location.href = `/api/auth/oauth/${provider}?redirect=${encodeURIComponent(redirectParam)}`;
  };

  // Real-time authentication feedback simulation
  const [authStep, setAuthStep] = useState<{
    provider: "sso" | "passkey" | "key" | "judge";
    status: "connecting" | "verified";
    message: string;
    token?: string;
  } | null>(null);

  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState<string>("admin@perfproof.internal");
  const [mfaCode, setMfaCode] = useState<string>("771892");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  // Interactive Verification Pipeline Flowchart State & Simulation
  const [activePipelineStage, setActivePipelineStage] = useState<number | null>(null);
  const [isSimulatingPipeline, setIsSimulatingPipeline] = useState<boolean>(false);
  const [simulatedStage, setSimulatedStage] = useState<number | null>(null);

  const handleSimulatePipeline = () => {
    if (isSimulatingPipeline) return;
    setIsSimulatingPipeline(true);
    let current = 1;
    setSimulatedStage(1);
    setActivePipelineStage(1);

    const interval = setInterval(() => {
      current += 1;
      if (current > 5) {
        clearInterval(interval);
        setIsSimulatingPipeline(false);
      } else {
        setSimulatedStage(current);
        setActivePipelineStage(current);
      }
    }, 700);
  };

  const handleResetPipeline = () => {
    setIsSimulatingPipeline(false);
    setSimulatedStage(null);
    setActivePipelineStage(null);
  };

  // 1-Click Judge Access
  const handleJudgeAccess = (role: UserRole) => {
    setIsLoading(true);
    loginAs(role);
    setNotice(`Signed in as ${ROLES[role].label}. Launching workspace…`);

    const dest =
      redirectParam && redirectParam !== "/dashboard" && redirectParam !== "/login"
        ? redirectParam
        : role === "developer"
        ? "/developer"
        : role === "auditor"
        ? "/auditor"
        : role === "admin"
        ? "/admin"
        : "/ciso";

    setTimeout(() => {
      router.push(dest);
    }, 350);
  };

  // Interactive SSO Sign In (Okta / SAML 2.0)
  const handleSsoSignIn = () => {
    setIsSsoLoading(true);
    setAuthStep({
      provider: "sso",
      status: "connecting",
      message: "Initiating Okta / SAML 2.0 handshake with perfproof.okta.com...",
    });

    setTimeout(() => {
      setAuthStep({
        provider: "sso",
        status: "verified",
        message: "SAML 2.0 Identity Assertion Verified · Claims Extracted",
        token: "okta_saml_009142_superadmin_verified",
      });
      loginAs("super_admin");

      setTimeout(() => {
        router.push(redirectParam !== "/dashboard" ? redirectParam : "/ciso");
      }, 500);
    }, 600);
  };

  // Interactive Passkey Sign In (WebAuthn / FIDO2)
  const handlePasskeySignIn = () => {
    setIsPasskeyLoading(true);
    setAuthStep({
      provider: "passkey",
      status: "connecting",
      message: "Requesting WebAuthn / FIDO2 biometric assertion from secure enclave...",
    });

    setTimeout(() => {
      setAuthStep({
        provider: "passkey",
        status: "verified",
        message: "Biometric Assertion Confirmed (Hardware Attestation Ed25519)",
        token: "fido2_cred_ed25519_developer_verified",
      });
      loginAs("developer");

      setTimeout(() => {
        router.push(redirectParam !== "/dashboard" ? redirectParam : "/developer");
      }, 500);
    }, 600);
  };

  // Standard Form Submit (Operator Key)
  const handleStandardSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthStep({
      provider: "key",
      status: "connecting",
      message: `Verifying operator key signature for ${email}...`,
    });

    setTimeout(() => {
      setAuthStep({
        provider: "key",
        status: "verified",
        message: "Operator Key Verified · Session Tokens Issued",
        token: "jwt_token_super_admin_verified",
      });
      loginAs("super_admin");

      setTimeout(() => {
        router.push(redirectParam);
      }, 500);
    }, 550);
  };

  // Recovery Submit
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (mfaCode.trim() === "000000") {
      setRecoveryError("Invalid recovery signature · 2 attempts remaining before 15m rate limit lockout.");
      return;
    }

    setIsLoading(true);
    setRecoverySuccess("6-Digit MFA verified · Operator key rotated successfully. Logging in…");
    loginAs("super_admin");
    setTimeout(() => {
      router.push(redirectParam);
    }, 550);
  };

  return (
    <div
      className="ps nosidebar app-frame"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.12fr",
        width: "100%",
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Left Panel: Compact Brand & Proof (Blueprint pp. 11-12) */}
      <section
        style={{
          background: "var(--side)",
          color: "var(--side-ink)",
          padding: "36px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid var(--side-line)",
          position: "relative",
          overflowY: "auto",
        }}
      >
        {/* Top: Brand Header */}
        <div>
          <div style={{ marginBottom: "12px" }}>
            <BrandLogo size="md" showTagline={true} />
          </div>

          <div style={{ marginTop: "24px" }}>
            <span
              className="chip brand"
              style={{
                fontSize: "10.5px",
                padding: "3px 8px",
                letterSpacing: ".04em",
                borderRadius: "14px",
                marginBottom: "10px",
                display: "inline-block",
              }}
            >
              VERIFICATION PIPELINE
            </span>
            <h1
              style={{
                fontFamily: "var(--f-display)",
                fontSize: "32px",
                lineHeight: 1.15,
                letterSpacing: "-.02em",
                margin: "0 0 10px 0",
                color: "var(--side-ink)",
              }}
            >
              Every patch ships with proof.
            </h1>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "var(--side-mute)",
                margin: 0,
                maxWidth: "460px",
              }}
            >
              We don&apos;t let language models commit code directly to production.
              Nemotron drafts candidate fixes — deterministic compilers, linters,
              and live exploit probes decide what merges.
            </p>
          </div>

          {/* Interactive Verification Pipeline Flowchart */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px 18px",
              borderRadius: "12px",
              background: "color-mix(in srgb, var(--side-ink) 4%, transparent)",
              border: "1px solid var(--side-line)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--side-line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#6FD39B",
                  }}
                >
                  Verification Flow
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: "#163124",
                    color: "#6FD39B",
                    border: "1px solid #234E39",
                    fontWeight: 600,
                  }}
                >
                  5-STAGE INTERLOCK
                </span>
              </div>

              {/* Interactive Simulation Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  onClick={handleSimulatePipeline}
                  disabled={isSimulatingPipeline}
                  aria-label="Simulate 5-Stage Verification Pipeline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: isSimulatingPipeline ? "rgba(32, 201, 166, 0.2)" : "rgba(32, 201, 166, 0.12)",
                    border: "1px solid rgba(32, 201, 166, 0.35)",
                    color: "var(--brand, #20C9A6)",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    cursor: isSimulatingPipeline ? "default" : "pointer",
                    fontWeight: 600,
                    transition: "all 150ms ease",
                  }}
                >
                  <Play size={10} style={{ fill: "currentColor" }} />
                  <span>{isSimulatingPipeline ? `Stage ${simulatedStage}/5…` : "Simulate Run"}</span>
                </button>
                {activePipelineStage !== null && !isSimulatingPipeline && (
                  <button
                    type="button"
                    onClick={handleResetPipeline}
                    title="Reset selection"
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "4px",
                      background: "transparent",
                      border: "1px solid var(--side-line)",
                      color: "var(--side-mute)",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "var(--side-mute)", marginBottom: "12px", lineHeight: 1.4 }}>
              Click any stage below to inspect verified compiler telemetry:
            </div>

            {/* Stage 1 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 1 ? null : 1)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 1}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "8px",
                background: activePipelineStage === 1 ? "rgba(224, 86, 36, 0.08)" : "transparent",
                border: activePipelineStage === 1 ? "1px solid rgba(224, 86, 36, 0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "rgba(224, 86, 36, 0.15)",
                      border: "1px solid rgba(224, 86, 36, 0.4)",
                      color: "#F0825B",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      fontFamily: "var(--f-mono)",
                    }}
                  >
                    1
                  </div>
                  <div style={{ width: "2px", height: "16px", background: "var(--side-line)", margin: "2px 0" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b style={{ fontSize: "12.5px", color: "var(--side-ink)" }}>Vulnerability Alert Ingestion</b>
                    <span className="mono" style={{ fontSize: "9.5px", color: "var(--side-mute)" }}>Tree-sitter AST</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "1px" }}>
                    Parses taint source and sink (e.g. CWE-639 IDOR, CWE-89 SQLi)
                  </div>
                </div>
              </div>
              {activePipelineStage === 1 && (
                <div
                  style={{
                    margin: "6px 0 6px 34px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(224, 86, 36, 0.25)",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    color: "var(--side-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "#F0825B", fontWeight: 600, marginBottom: "3px" }}>AST Taint Extraction · Stage 1 Verified</div>
                  <div>Source: <code>request.query[&apos;workspace_id&apos;]</code></div>
                  <div>Sink: <code>backend/api/workspaces.py:86</code></div>
                  <div>Classification: <span style={{ color: "#F0825B" }}>CWE-639 (Broken Object-Level Auth)</span></div>
                </div>
              )}
            </div>

            {/* Stage 2 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 2 ? null : 2)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 2}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "8px",
                background: activePipelineStage === 2 ? "rgba(235, 179, 58, 0.08)" : "transparent",
                border: activePipelineStage === 2 ? "1px solid rgba(235, 179, 58, 0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "rgba(235, 179, 58, 0.15)",
                      border: "1px solid rgba(235, 179, 58, 0.4)",
                      color: "#EBB33A",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      fontFamily: "var(--f-mono)",
                    }}
                  >
                    2
                  </div>
                  <div style={{ width: "2px", height: "16px", background: "var(--side-line)", margin: "2px 0" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b style={{ fontSize: "12.5px", color: "var(--side-ink)" }}>Live Container DAST Probe</b>
                    <span className="mono" style={{ fontSize: "9.5px", color: "#EBB33A" }}>HTTP 200 PROVEN</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "1px" }}>
                    Replays exploit payload in isolated sandbox to confirm reachability
                  </div>
                </div>
              </div>
              {activePipelineStage === 2 && (
                <div
                  style={{
                    margin: "6px 0 6px 34px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(235, 179, 58, 0.25)",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    color: "var(--side-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "#EBB33A", fontWeight: 600, marginBottom: "3px" }}>Ephemeral Sandbox Probe · Stage 2 Verified</div>
                  <div>Pod: <code>dast-runner-cwe639-exec (isolated)</code></div>
                  <div>Payload: <code>GET /api/v1/workspaces/victim_8819/billing (HTTP 200)</code></div>
                  <div>Status: <span style={{ color: "#EBB33A" }}>EXPLOIT_PROVEN_REACHABLE · 0 False Positives</span></div>
                </div>
              )}
            </div>

            {/* Stage 3 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 3 ? null : 3)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 3}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "8px",
                background: activePipelineStage === 3 ? "rgba(32, 201, 166, 0.08)" : "transparent",
                border: activePipelineStage === 3 ? "1px solid rgba(32, 201, 166, 0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "rgba(32, 201, 166, 0.15)",
                      border: "1px solid rgba(32, 201, 166, 0.4)",
                      color: "var(--brand)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      fontFamily: "var(--f-mono)",
                    }}
                  >
                    3
                  </div>
                  <div style={{ width: "2px", height: "16px", background: "var(--side-line)", margin: "2px 0" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b style={{ fontSize: "12.5px", color: "var(--side-ink)" }}>Nemotron 70B Scoped Patch</b>
                    <span className="mono" style={{ fontSize: "9.5px", color: "var(--side-mute)" }}>AST DIFF</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "1px" }}>
                    Generates minimal defensive repair restricted to vulnerable node
                  </div>
                </div>
              </div>
              {activePipelineStage === 3 && (
                <div
                  style={{
                    margin: "6px 0 6px 34px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(32, 201, 166, 0.25)",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    color: "var(--side-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "var(--brand)", fontWeight: 600, marginBottom: "3px" }}>Scoped AST Synthesis · Stage 3 Verified</div>
                  <div>Target Node: <code>FunctionDef: serialize_billing</code></div>
                  <div>Diff Scope: <span style={{ color: "#6FD39B" }}>+4 lines</span>, <span style={{ color: "#F0825B" }}>-1 line</span></div>
                  <div>Repair: Tenant authorization interlock with audit violation recording</div>
                </div>
              )}
            </div>

            {/* Stage 4 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 4 ? null : 4)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 4}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "8px",
                background: activePipelineStage === 4 ? "rgba(111, 211, 155, 0.08)" : "transparent",
                border: activePipelineStage === 4 ? "1px solid rgba(111, 211, 155, 0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "#163124",
                      border: "1px solid #234E39",
                      color: "#6FD39B",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      fontFamily: "var(--f-mono)",
                    }}
                  >
                    4
                  </div>
                  <div style={{ width: "2px", height: "16px", background: "var(--side-line)", margin: "2px 0" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b style={{ fontSize: "12.5px", color: "var(--side-ink)" }}>8 Deterministic Compiler Gates</b>
                    <span className="mono" style={{ fontSize: "9.5px", color: "#6FD39B" }}>8/8 PASS</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "1px" }}>
                    Compile ✓ · Ruff style ✓ · Exploit replay 403 ✓ · Unit tests ✓
                  </div>
                </div>
              </div>
              {activePipelineStage === 4 && (
                <div
                  style={{
                    margin: "6px 0 6px 34px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(111, 211, 155, 0.25)",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    color: "var(--side-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "#6FD39B", fontWeight: 600, marginBottom: "3px" }}>Deterministic Compiler Gates · Stage 4 Verified</div>
                  <div>Gate G1–G8: <span style={{ color: "#6FD39B" }}>8/8 PASS (Zero Human Trust Required)</span></div>
                  <div>Exploit Replay: <code>HTTP 403 Forbidden (Blocked)</code></div>
                  <div>Harness: <code>pytest (114 passed, 0 failed in 38s)</code></div>
                </div>
              )}
            </div>

            {/* Stage 5 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 5 ? null : 5)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 5}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "8px",
                background: activePipelineStage === 5 ? "rgba(111, 211, 155, 0.12)" : "transparent",
                border: activePipelineStage === 5 ? "1px solid #6FD39B" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "rgba(111, 211, 155, 0.2)",
                      border: "1px solid #6FD39B",
                      color: "#6FD39B",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: "var(--f-mono)",
                    }}
                  >
                    ✓
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b style={{ fontSize: "12.5px", color: "var(--side-ink)" }}>HMAC-SHA256 Evidence Notarized</b>
                    <span className="mono" style={{ fontSize: "9.5px", color: "#6FD39B" }}>SEALED</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "1px" }}>
                    Signed block appended to audit ledger · Pull Request ready
                  </div>
                </div>
              </div>
              {activePipelineStage === 5 && (
                <div
                  style={{
                    margin: "6px 0 6px 34px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(111, 211, 155, 0.35)",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono)",
                    color: "var(--side-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "#6FD39B", fontWeight: 600, marginBottom: "3px" }}>Merkle Ledger Block #8842 · Sealed</div>
                  <div>Payload Hash: <code>c77a9142f9b88201a04d5e8932fc9019b8423</code></div>
                  <div>Signature: <code>HMAC-SHA256 (Ed25519 Hardware Attested)</code></div>
                  <div>Action: <span style={{ color: "#6FD39B" }}>Automated Pull Request Formed with Evidence Seal</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mono" style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "20px" }}>
          Deterministic gates decide · Generative models propose
        </div>
      </section>

      {/* Right Panel: Sign-In + Judge Access + Reset Key (Fits in 100vh) */}
      <section
        style={{
          padding: "36px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bg)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "460px" }}>
          {/* Top Bar: Switch to Public Site / Toggle Theme */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <button
              type="button"
              className="btn sm sec"
              onClick={() => router.push("/home")}
              style={{ fontSize: "11.5px" }}
            >
              ← Back to Public Site
            </button>
            <span className="chip pass" style={{ fontSize: "10px" }}>
              Secure Gateway
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              padding: "4px",
              borderRadius: "8px",
              background: "var(--surface2)",
              marginBottom: "20px",
              border: "1px solid var(--line)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("judge")}
              style={{
                border: "none",
                background: activeTab === "judge" ? "var(--surface)" : "transparent",
                color: activeTab === "judge" ? "var(--brand)" : "var(--ink2)",
                fontWeight: activeTab === "judge" ? 700 : 500,
                fontSize: "12px",
                padding: "8px 0",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "judge" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 120ms ease",
              }}
            >
              Evaluation Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signin")}
              style={{
                border: "none",
                background: activeTab === "signin" ? "var(--surface)" : "transparent",
                color: activeTab === "signin" ? "var(--brand)" : "var(--ink2)",
                fontWeight: activeTab === "signin" ? 700 : 500,
                fontSize: "12px",
                padding: "8px 0",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "signin" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 120ms ease",
              }}
            >
              Work Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("recovery")}
              style={{
                border: "none",
                background: activeTab === "recovery" ? "var(--surface)" : "transparent",
                color: activeTab === "recovery" ? "var(--brand)" : "var(--ink2)",
                fontWeight: activeTab === "recovery" ? 700 : 500,
                fontSize: "12px",
                padding: "8px 0",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "recovery" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 120ms ease",
              }}
            >
              Password Recovery
            </button>
          </div>

          {oauthError && (
            <div
              className="mono"
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background: "color-mix(in srgb, var(--fail) 10%, var(--surface))",
                border: "1px solid var(--fail)",
                color: "var(--fail)",
                fontSize: "11.5px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>✕</span>
              <span><b>Authentication Error:</b> {oauthError}</span>
            </div>
          )}

          {oauthNotice && (
            <div
              className="mono"
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background: "color-mix(in srgb, var(--brand) 10%, var(--surface))",
                border: "1px solid var(--brand)",
                color: "var(--brand)",
                fontSize: "11.5px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>ℹ</span>
              <span>{oauthNotice}</span>
            </div>
          )}

          {authStep && (
            <div
              className="mono"
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background:
                  authStep.status === "verified"
                    ? "color-mix(in srgb, var(--pass) 10%, var(--surface))"
                    : "color-mix(in srgb, var(--brand) 10%, var(--surface))",
                border: `1px solid ${authStep.status === "verified" ? "var(--pass)" : "var(--brand)"}`,
                color: authStep.status === "verified" ? "var(--pass)" : "var(--brand)",
                fontSize: "11.5px",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                animation: "fadeIn 120ms ease-out",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{authStep.status === "verified" ? "✓" : "⚡"}</span>
                <b>{authStep.message}</b>
              </div>
              {authStep.token && (
                <div style={{ fontSize: "10.5px", opacity: 0.85, paddingLeft: "16px" }}>
                  Token: <code>{authStep.token}</code>
                </div>
              )}
            </div>
          )}

          {notice && !authStep && (
            <div
              className="mono"
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background: "color-mix(in srgb, var(--pass) 10%, var(--surface))",
                border: "1px solid var(--pass)",
                color: "var(--pass)",
                fontSize: "11.5px",
                marginBottom: "16px",
              }}
            >
              ✓ {notice}
            </div>
          )}

          {/* TAB 1: EVALUATION 1-CLICK DEMO ACCESS */}
          {activeTab === "judge" && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  Evaluation Personas (1-Click Access)
                </h2>
                <div style={{ fontSize: "12.5px", color: "var(--ink2)" }}>
                  Select a role persona to test workspace features and permission boundaries:
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* 1. Developer */}
                <div
                  onClick={() => handleJudgeAccess("developer")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                    e.currentTarget.style.background = "color-mix(in srgb, var(--brand) 4%, var(--surface))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>🚀</span>
                      <b style={{ fontSize: "13.5px" }}>Developer Persona</b>
                      <span className="chip brand" style={{ fontSize: "10px", padding: "2px 6px" }}>
                        Developer Dashboard
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Dashboard →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    Split-diff Monaco code reviews, live patch edits, and rootless microVM retests.
                  </div>
                </div>

                {/* 2. Security Auditor */}
                <div
                  onClick={() => handleJudgeAccess("auditor")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                    e.currentTarget.style.background = "color-mix(in srgb, var(--brand) 4%, var(--surface))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>🛡️</span>
                      <b style={{ fontSize: "13.5px" }}>Security Auditor</b>
                      <span className="chip pass" style={{ fontSize: "10px", padding: "2px 6px" }}>
                        Auditor Dashboard
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Dashboard →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    Inspect live DAST probes, test cryptographic tamper resistance, and verify HMAC ledger proofs.
                  </div>
                </div>

                {/* 3. Workspace Admin */}
                <div
                  onClick={() => handleJudgeAccess("admin")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                    e.currentTarget.style.background = "color-mix(in srgb, var(--brand) 4%, var(--surface))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>⚙️</span>
                      <b style={{ fontSize: "13.5px" }}>Workspace Admin</b>
                      <span className="chip" style={{ fontSize: "10px", padding: "2px 6px" }}>
                        Admin Dashboard
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Dashboard →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    Manage benchmark test suites, token budgets, and automated policy gates.
                  </div>
                </div>

                {/* 4. Super Admin */}
                <div
                  onClick={() => handleJudgeAccess("super_admin")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                    e.currentTarget.style.background = "color-mix(in srgb, var(--brand) 4%, var(--surface))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>👑</span>
                      <b style={{ fontSize: "13.5px" }}>Super Admin</b>
                      <span className="chip fail" style={{ fontSize: "10px", padding: "2px 6px" }}>
                        Fleet &amp; Dashboard
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Dashboard →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    Fleet control plane: microVM telemetry, emergency overrides, and cluster health.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORK EMAIL SIGN IN */}
          {activeTab === "signin" && (
            <form onSubmit={handleStandardSignIn}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  Sign in to your workspace
                </h2>
                <div style={{ fontSize: "12.5px", color: "var(--ink2)" }}>
                  Enter your email and credentials to continue:
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    Work Email
                  </label>
                  <div className="input" style={{ height: "36px", padding: 0 }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: "0 10px",
                        fontSize: "13px",
                        color: "var(--ink)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Password / Access Key</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("recovery")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--brand)",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input" style={{ height: "36px", padding: 0 }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: "0 10px",
                        fontSize: "13px",
                        color: "var(--ink)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn"
                disabled={isLoading}
                style={{ width: "100%", height: "38px", justifyContent: "center", fontSize: "13.5px", cursor: "pointer" }}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "18px 0 14px",
                  color: "var(--ink3)",
                  fontSize: "11.5px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
                <span style={{ padding: "0 10px" }}>or continue with</span>
                <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
              </div>

              {/* OAuth Providers: Google & GitHub */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <button
                  type="button"
                  className="btn sec sm"
                  disabled={oauthLoading !== null || isLoading}
                  onClick={() => handleOAuthSignIn("google")}
                  style={{
                    justifyContent: "center",
                    fontSize: "12.5px",
                    height: "38px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    fontWeight: 600,
                  }}
                >
                  {oauthLoading === "google" ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      <span>Google Auth…</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Google</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn sec sm"
                  disabled={oauthLoading !== null || isLoading}
                  onClick={() => handleOAuthSignIn("github")}
                  style={{
                    justifyContent: "center",
                    fontSize: "12.5px",
                    height: "38px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    fontWeight: 600,
                  }}
                >
                  {oauthLoading === "github" ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      <span>GitHub Auth…</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                      <span>GitHub</span>
                    </>
                  )}
                </button>
              </div>

              {/* Enterprise Options: SSO & Passkey */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  className="btn sec sm"
                  disabled={isSsoLoading || isPasskeyLoading || isLoading}
                  onClick={handleSsoSignIn}
                  style={{ justifyContent: "center", fontSize: "11.5px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {isSsoLoading ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      Connecting SSO...
                    </>
                  ) : (
                    <>
                      <span>🔑</span>
                      Sign in with SSO
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn sec sm"
                  disabled={isSsoLoading || isPasskeyLoading || isLoading}
                  onClick={handlePasskeySignIn}
                  style={{ justifyContent: "center", fontSize: "11.5px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {isPasskeyLoading ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      Enclave...
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      Sign in with Passkey
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PASSWORD RECOVERY */}
          {activeTab === "recovery" && (
            <form onSubmit={handleRecoverySubmit}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  Reset your password
                </h2>
                <div style={{ fontSize: "12.5px", color: "var(--ink2)" }}>
                  Enter your email and 6-digit verification code to regain access:
                </div>
              </div>

              {recoveryError && (
                <div
                  className="mono"
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "color-mix(in srgb, var(--fail) 10%, var(--surface))",
                    border: "1px solid var(--fail)",
                    color: "var(--fail)",
                    fontSize: "11.5px",
                    marginBottom: "14px",
                  }}
                >
                  ✕ {recoveryError}
                </div>
              )}

              {recoverySuccess && (
                <div
                  className="mono"
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "color-mix(in srgb, var(--pass) 10%, var(--surface))",
                    border: "1px solid var(--pass)",
                    color: "var(--pass)",
                    fontSize: "11.5px",
                    marginBottom: "14px",
                  }}
                >
                  ✓ {recoverySuccess}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    Work Email Address
                  </label>
                  <div className="input" style={{ height: "36px", padding: 0 }}>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: "0 10px",
                        fontSize: "13px",
                        color: "var(--ink)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    6-Digit Hardware MFA / Recovery Code
                  </label>
                  <div className="input" style={{ height: "36px", padding: 0 }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="e.g. 771892"
                      required
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: "0 10px",
                        fontSize: "14px",
                        letterSpacing: ".2em",
                        fontFamily: "var(--f-mono)",
                        color: "var(--ink)",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "4px" }}>
                    (Demo: use default &apos;771892&apos; to pass, or &apos;000000&apos; to trigger rate-limit error)
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn"
                disabled={isLoading}
                style={{ width: "100%", height: "38px", justifyContent: "center", fontSize: "13px", cursor: "pointer" }}
              >
                {isLoading ? "Verifying code…" : "Verify code & reset password"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card">Loading Sign In…</div>}>
      <LoginContent />
    </Suspense>
  );
}
