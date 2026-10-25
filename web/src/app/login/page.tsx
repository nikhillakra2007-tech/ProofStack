"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/dashboard";

  const { loginAs, setSessionData } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Tab mode: 'judge' | 'signin' | 'recovery'
  const [activeTab, setActiveTab] = useState<"judge" | "signin" | "recovery">("judge");

  // Sign in form state
  const [email, setEmail] = useState<string>("operator@perfproof.internal");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSsoLoading, setIsSsoLoading] = useState<boolean>(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

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
          <div className="brand" style={{ padding: 0 }}>
            <div className="logo">
              <svg
                style={{ width: "18px", height: "18px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}
                viewBox="0 0 24 24"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <b style={{ fontSize: "16px", color: "var(--side-ink)" }}>ProofStack</b>
              <span style={{ fontSize: "11px", color: "var(--side-mute)" }}>Autonomous Verification Engine</span>
            </div>
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
              BLUEPRINT SPEC · ZERO-COMPROMISE
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
              Deterministic verification for software performance and safety. Competing AI patches are isolated, tested against exploit oracles, and sealed in an append-only ledger.
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
                <b>Zero-Compromise Invariants:</b> Gates G0–G7 eliminate functional regressions, SQLi shortcuts, and race locks.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ color: "#6FD39B", marginTop: "2px", flexShrink: 0 }}>
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--side-ink)" }}>
                <b>Cryptographic Evidence Ledger:</b> Every microVM run is chained in an immutable SHA-256 Merkle log.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ color: "#6FD39B", marginTop: "2px", flexShrink: 0 }}>
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--side-ink)" }}>
                <b>NVIDIA Nemotron 3 on Nebius:</b> Self-healing patches synthesized with sub-second feedback loops.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mono" style={{ fontSize: "11px", color: "var(--side-mute)", marginTop: "24px" }}>
          Nebius Token Factory · NVIDIA Nemotron 3 · ProofStack Engine
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
            <button
              type="button"
              className="iconbtn"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
              style={{ width: "30px", height: "30px" }}
            >
              {resolvedTheme === "light" ? (
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
                  <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
                  <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
                </svg>
              )}
            </button>
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
              Judge Access ⚡
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
              Sign In
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
              Reset Key / MFA
            </button>
          </div>

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

          {/* TAB 1: JUDGE 1-CLICK DEMO ACCESS (Blueprint Page 11) */}
          {activeTab === "judge" && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  Hackathon Judge 1-Click Access
                </h2>
                <div style={{ fontSize: "12.5px", color: "var(--ink2)" }}>
                  Click any role persona to enter the platform instantly with configured RBAC permissions:
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
                  Sign in with Operator Key
                </h2>
                <div style={{ fontSize: "12.5px", color: "var(--ink2)" }}>
                  Authenticate to your assigned tenant boundary:
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
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Operator Key / Password</label>
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
                      Forgot key?
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
                {isLoading ? "Verifying signature…" : "Continue with Operator Key"}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  className="btn sec sm"
                  disabled={isSsoLoading || isPasskeyLoading || isLoading}
                  onClick={handleSsoSignIn}
                  style={{ justifyContent: "center", fontSize: "12px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {isSsoLoading ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      Okta Handshake...
                    </>
                  ) : (
                    <>
                      <span>🔑</span>
                      Continue with SSO
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn sec sm"
                  disabled={isSsoLoading || isPasskeyLoading || isLoading}
                  onClick={handlePasskeySignIn}
                  style={{ justifyContent: "center", fontSize: "12px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {isPasskeyLoading ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      Enclave Touch...
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

          {/* TAB 3: RESET KEY & 6-DIGIT MFA (Blueprint Page 12) */}
          {activeTab === "recovery" && (
            <form onSubmit={handleRecoverySubmit}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  Reset Key &amp; Session Recovery
                </h2>
                <div style={{ fontSize: "12.5px", color: "var(--ink2)" }}>
                  Rotate compromised operator key using MFA recovery token:
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
                {isLoading ? "Verifying MFA Token…" : "Rotate Operator Key & Enter"}
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
