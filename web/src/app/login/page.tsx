"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import BrandLogo from "@/components/common/BrandLogo";

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

  // 1-Click Judge Access
  const handleJudgeAccess = (role: UserRole) => {
    setIsLoading(true);
    loginAs(role);
    setNotice(`Signed in as ${ROLES[role].label}. Launching workspace…`);

    const dest =
      redirectParam !== "/dashboard"
        ? redirectParam
        : role === "developer"
        ? "/studio"
        : role === "auditor"
        ? "/findings"
        : role === "admin"
        ? "/catalog"
        : "/dashboard";

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
        router.push(redirectParam !== "/dashboard" ? redirectParam : "/dashboard");
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
        router.push(redirectParam !== "/dashboard" ? redirectParam : "/studio");
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

          <div style={{ marginTop: "32px" }}>
            <span
              className="chip brand"
              style={{
                fontSize: "10.5px",
                padding: "3px 8px",
                letterSpacing: ".04em",
                borderRadius: "14px",
                marginBottom: "12px",
                display: "inline-block",
              }}
            >
              EVALUATION &amp; WORKSPACE GATEWAY
            </span>
            <h1
              style={{
                fontFamily: "var(--f-display)",
                fontSize: "38px",
                lineHeight: 1.1,
                letterSpacing: "-.02em",
                margin: "0 0 12px 0",
                color: "var(--side-ink)",
              }}
            >
              Every patch ships with proof.
            </h1>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
                color: "var(--side-mute)",
                margin: 0,
                maxWidth: "460px",
              }}
            >
              Deterministic verification for software security. Candidate AI repairs
              are tested against live container exploit probes and verified across
              8 compiler and test gates.
            </p>
          </div>

          {/* Compact Live Proof Card (INV-4821) */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "9px",
              background: "color-mix(in srgb, var(--side-ink) 5%, transparent)",
              border: "1px solid var(--side-line)",
              marginTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--side-ink)" }}>
                INV-4821 · orders.py:get_orders
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#6FD39B",
                  background: "#163124",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  border: "1px solid #234E39",
                }}
              >
                ✓ ACCEPTED · 3/3 GATES PASSED
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <b style={{ fontSize: "19px", color: "var(--term-pass, #6FD39B)" }}>4.8x faster</b>
              <span className="mono" style={{ fontSize: "11px", color: "var(--side-mute)" }}>
                428 ms → 89 ms (+74.2% ΔPerf)
              </span>
            </div>
            <div className="mono" style={{ fontSize: "10.5px", color: "var(--side-mute)", marginTop: "4px" }}>
              joinedload eager queries · identity predicates preserved · 0 regressions
            </div>
          </div>

          {/* 3 Concise Trust Points */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ color: "#6FD39B", marginTop: "2px", flexShrink: 0 }}>
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--side-ink)" }}>
                <b>Deterministic Gates:</b> Automated checks verify syntax correctness, zero linter regressions, and passing test suites.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ color: "#6FD39B", marginTop: "2px", flexShrink: 0 }}>
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--side-ink)" }}>
                <b>Cryptographic Ledger:</b> Every test verdict and patch diff is hashed into an HMAC-SHA256 audit record.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ color: "#6FD39B", marginTop: "2px", flexShrink: 0 }}>
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--side-ink)" }}>
                <b>NVIDIA Nemotron 70B:</b> Contextual security patches scoped strictly to the affected code statement.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mono" style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "24px" }}>
          NVIDIA Nemotron 70B · ProofStack Verification Engine
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
                        Studio &amp; Retest
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Studio →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    Split-diff Monaco inspection, live custom code edits, and rootless microVM execution.
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
                        Findings &amp; Ledger
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Findings →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    Live DAST findings, OWASP automated checks, tamper testing, and cryptographic verification.
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
                        Catalog &amp; Quotas
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
                      Enter Catalog →
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
                    19-Problem benchmark catalog, test suites, token budget allocation, and policy enforcement.
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
                    Complete platform control plane: microVM telemetry, emergency policy overrides, and fleet health.
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
