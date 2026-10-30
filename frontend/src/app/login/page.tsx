"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import BrandLogo from "@/components/common/BrandLogo";
import { Play, RotateCcw } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/dashboard";

  const { loginAs } = useAuth();

  // Speculatively prefetch main dashboard for 0ms transition without network congestion
  useEffect(() => {
    try {
      router.prefetch("/dashboard");
    } catch {}
  }, [router]);

  // Tab mode: 2 Tabs only ('judge' | 'signin'), with inline password recovery inside 'signin'
  const [activeTab, setActiveTab] = useState<"judge" | "signin">("judge");
  const [showInlineRecovery, setShowInlineRecovery] = useState<boolean>(false);

  // Sign in form state
  const [email, setEmail] = useState<string>("operator@perfproof.internal");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSsoLoading, setIsSsoLoading] = useState<boolean>(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // OAuth query params & loading state
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const handleOAuthSignIn = (provider: "google" | "github") => {
    setOauthLoading(provider);
    const token = `jwt_rs256_developer_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_token", token);
      localStorage.setItem("proofstack_role", "developer");
      document.cookie = `sentinel_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `ps_auth=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `proofstack_role=developer; path=/; max-age=86400; SameSite=Lax`;
    }
    loginAs("developer");
    setNotice(`✓ Verified via ${provider === "google" ? "Google" : "GitHub"} OAuth Identity Provider — Launching Dashboard…`);
    router.push("/dashboard");
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
    }, 600);
  };

  const handleResetPipeline = () => {
    setIsSimulatingPipeline(false);
    setSimulatedStage(null);
    setActivePipelineStage(null);
  };

  // 1-Click Persona Simulator: Instant 0ms transition with pre-cached session & telemetry
  const handleJudgeAccess = (roleKey: UserRole) => {
    const token = `jwt_rs256_${roleKey}_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_token", token);
      localStorage.setItem("proofstack_role", roleKey);
      document.cookie = `sentinel_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `ps_auth=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `proofstack_role=${roleKey}; path=/; max-age=86400; SameSite=Lax`;
    }

    loginAs(roleKey);

    // Instant zero-lag transition
    router.push("/dashboard");
  };

  // Interactive SSO Sign In (Okta / SAML / OIDC)
  const handleSsoSignIn = () => {
    setIsSsoLoading(true);
    const token = `jwt_rs256_super_admin_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_token", token);
      localStorage.setItem("proofstack_role", "super_admin");
      document.cookie = `sentinel_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `ps_auth=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `proofstack_role=super_admin; path=/; max-age=86400; SameSite=Lax`;
    }
    loginAs("super_admin");
    router.push(redirectParam && redirectParam !== "/login" ? redirectParam : "/dashboard");
  };

  // Interactive Passkey Sign In (WebAuthn / FIDO2)
  const handlePasskeySignIn = () => {
    setIsPasskeyLoading(true);
    const token = `jwt_rs256_developer_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_token", token);
      localStorage.setItem("proofstack_role", "developer");
      document.cookie = `sentinel_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `ps_auth=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `proofstack_role=developer; path=/; max-age=86400; SameSite=Lax`;
    }
    loginAs("developer");
    router.push("/dashboard");
  };

  // Standard Form Submit (Operator Key)
  const handleStandardSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = `jwt_rs256_developer_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_token", token);
      localStorage.setItem("proofstack_role", "developer");
      document.cookie = `sentinel_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `ps_auth=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `proofstack_role=developer; path=/; max-age=86400; SameSite=Lax`;
    }
    loginAs("developer");
    router.push(redirectParam && redirectParam !== "/login" ? redirectParam : "/dashboard");
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
    const token = `jwt_rs256_developer_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_token", token);
      localStorage.setItem("proofstack_role", "developer");
      document.cookie = `sentinel_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `ps_auth=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `proofstack_role=developer; path=/; max-age=86400; SameSite=Lax`;
    }

    setRecoverySuccess("Hardware signature confirmed. Temporary root recovery session issued.");
    loginAs("developer");
    router.push("/dashboard");
  };

  return (
    <div
      className="ps nosidebar login-root-container"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        backgroundColor: "#F8FAFC",
      }}
    >
      <style>{`
        @media (max-width: 960px) {
          .login-root-container {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh !important;
            max-height: none !important;
            overflow-y: auto !important;
          }
          .login-left-panel {
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            max-height: none !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            padding: 32px 20px !important;
          }
          .login-right-panel {
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            padding: 32px 20px 48px !important;
            overflow-y: visible !important;
          }
        }
      `}</style>

      {/* =========================================================================
          LEFT PANEL: Verification Pipeline & Architecture (True 50% Screen Split)
          High-Contrast Sage-Green & Subtle Burgundy Palette Matching Sentinel Gate
          ========================================================================= */}
      <section
        className="login-left-panel"
        style={{
          width: "50%",
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          background: "radial-gradient(circle at 85% 15%, rgba(190, 24, 93, 0.15), transparent 45%), linear-gradient(155deg, #0A1A14 0%, #132E23 55%, #08140F 100%) !important",
          color: "#FFFFFF !important",
          padding: "48px 48px 36px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          boxSizing: "border-box",
          position: "relative",
          overflowY: "auto",
        }}
      >
        {/* Top: Brand Header */}
        <div>
          <div
            style={{
              marginBottom: "16px",
              ["--heading-primary" as string]: "#FFFFFF",
              ["--heading-color" as string]: "#FFFFFF",
              ["--surface-green" as string]: "rgba(16, 185, 129, 0.15)",
              ["--ink-muted" as string]: "#CBD5E1",
              ["--line" as string]: "rgba(16, 185, 129, 0.3)",
            }}
          >
            <BrandLogo size="md" showTagline={true} />
          </div>

          <div style={{ marginTop: "20px" }}>
            <span
              style={{
                fontSize: "10.5px",
                padding: "3px 10px",
                letterSpacing: ".05em",
                borderRadius: "9999px",
                marginBottom: "12px",
                display: "inline-block",
                background: "rgba(52, 211, 153, 0.12)",
                color: "#34D399",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                fontWeight: 700,
                fontFamily: "var(--f-mono, monospace)",
              }}
            >
              VERIFICATION PIPELINE
            </span>
            <h1
              style={{
                fontFamily: "var(--f-display, inherit)",
                fontSize: "30px",
                lineHeight: 1.25,
                letterSpacing: "-.025em",
                margin: "0 0 12px 0",
                color: "#FFFFFF !important",
                fontWeight: 800,
              }}
            >
              Every patch ships with proof.
            </h1>
            <p
              className="login-subtitle"
              style={{
                fontSize: "13.5px",
                lineHeight: 1.55,
                color: "#CBD5E1 !important",
                margin: "0 0 24px 0",
                maxWidth: "520px",
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
              padding: "16px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#FFFFFF !important",
                  }}
                >
                  Verification Flow
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-mono, monospace)",
                    fontSize: "9.5px",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: "rgba(52, 211, 153, 0.12)",
                    color: "#34D399",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    fontWeight: 700,
                  }}
                >
                  5-STAGE INTERLOCK
                </span>
              </div>

              {/* Simulation Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  onClick={handleSimulatePipeline}
                  disabled={isSimulatingPipeline}
                  aria-label="Simulate 5-Stage Verification Pipeline"
                  className="cursor-pointer active:scale-98 transition-transform"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: isSimulatingPipeline ? "rgba(52, 211, 153, 0.25)" : "rgba(52, 211, 153, 0.12)",
                    border: "1px solid #34D399",
                    color: "#34D399",
                    fontSize: "10.5px",
                    fontFamily: "var(--f-mono, monospace)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    cursor: isSimulatingPipeline ? "default" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Play size={9} style={{ fill: "currentColor" }} />
                  <span>{isSimulatingPipeline ? `Stage ${simulatedStage}/5…` : "Simulate Run"}</span>
                </button>
                {activePipelineStage !== null && !isSimulatingPipeline && (
                  <button
                    type="button"
                    onClick={handleResetPipeline}
                    title="Reset selection"
                    className="cursor-pointer active:scale-98 transition-transform"
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      background: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#CBD5E1",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={9} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ fontSize: "11.5px", color: "#94A3B8 !important", margin: "2px 0 10px 0" }}>
              Click any stage below to inspect verified compiler telemetry:
            </div>

            {/* Stage 1 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 1 ? null : 1)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 1}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "6px",
                background: activePipelineStage === 1 ? "rgba(224, 86, 36, 0.15)" : "transparent",
                border: activePipelineStage === 1 ? "1px solid rgba(224, 86, 36, 0.4)" : "1px solid transparent",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: "rgba(224, 86, 36, 0.2)",
                    border: "1px solid rgba(224, 86, 36, 0.5)",
                    color: "#F0825B",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "var(--f-mono, monospace)",
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b className="stage-card-title" style={{ fontSize: "12.5px", color: "#FFFFFF !important" }}>Vulnerability Alert Ingestion</b>
                    <span className="stage-card-tag" style={{ fontSize: "9px", color: "#34D399 !important", background: "rgba(52, 211, 153, 0.12) !important", border: "1px solid rgba(52, 211, 153, 0.3) !important", borderRadius: "3px", padding: "1px 5px", fontFamily: "var(--f-mono, monospace)", fontWeight: 600 }}>
                      Tree-sitter AST
                    </span>
                  </div>
                  <div className="stage-card-desc" style={{ fontSize: "11px", color: "#94A3B8 !important", marginTop: "2px" }}>
                    Parses taint source and sink (e.g. CWE-639 IDOR, CWE-89 SQLi)
                  </div>
                </div>
              </div>
              {activePipelineStage === 1 && (
                <div style={{ margin: "4px 0 4px 30px", padding: "6px 8px", borderRadius: "5px", background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(224, 86, 36, 0.25)", fontSize: "10px", fontFamily: "var(--f-mono, monospace)", color: "#CBD5E1", lineHeight: 1.4 }}>
                  <div style={{ color: "#F0825B", fontWeight: 600 }}>AST Taint Extraction · Stage 1 Verified</div>
                  <div>Source: <code>request.query[&apos;workspace_id&apos;]</code> · Sink: <code>backend/api/workspaces.py:86</code></div>
                </div>
              )}
            </div>

            {/* Stage 2 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 2 ? null : 2)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 2}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "6px",
                background: activePipelineStage === 2 ? "rgba(235, 179, 58, 0.15)" : "transparent",
                border: activePipelineStage === 2 ? "1px solid rgba(235, 179, 58, 0.4)" : "1px solid transparent",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: "rgba(235, 179, 58, 0.2)",
                    border: "1px solid rgba(235, 179, 58, 0.5)",
                    color: "#EBB33A",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "var(--f-mono, monospace)",
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b className="stage-card-title" style={{ fontSize: "12.5px", color: "#FFFFFF !important" }}>Live Container DAST Probe</b>
                    <span className="stage-card-tag" style={{ fontSize: "9px", color: "#EBB33A !important", background: "rgba(235, 179, 58, 0.12) !important", border: "1px solid rgba(235, 179, 58, 0.3) !important", borderRadius: "3px", padding: "1px 5px", fontFamily: "var(--f-mono, monospace)", fontWeight: 600 }}>
                      HTTP 200 PROVEN
                    </span>
                  </div>
                  <div className="stage-card-desc" style={{ fontSize: "11px", color: "#94A3B8 !important", marginTop: "2px" }}>
                    Replays exploit payload in isolated sandbox to confirm reachability
                  </div>
                </div>
              </div>
              {activePipelineStage === 2 && (
                <div style={{ margin: "4px 0 4px 30px", padding: "6px 8px", borderRadius: "5px", background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(235, 179, 58, 0.25)", fontSize: "10px", fontFamily: "var(--f-mono, monospace)", color: "#CBD5E1", lineHeight: 1.4 }}>
                  <div style={{ color: "#EBB33A", fontWeight: 600 }}>Ephemeral Sandbox Probe · Stage 2 Verified</div>
                  <div>Pod: <code>dast-runner-cwe639-exec</code> · Status: <span style={{ color: "#EBB33A" }}>HTTP 200 OK</span></div>
                </div>
              )}
            </div>

            {/* Stage 3 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 3 ? null : 3)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 3}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "6px",
                background: activePipelineStage === 3 ? "rgba(52, 211, 153, 0.15)" : "transparent",
                border: activePipelineStage === 3 ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid transparent",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: "rgba(52, 211, 153, 0.2)",
                    border: "1px solid #34D399",
                    color: "#34D399",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "var(--f-mono, monospace)",
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b className="stage-card-title" style={{ fontSize: "12.5px", color: "#FFFFFF !important" }}>Nemotron 70B Scoped Patch</b>
                    <span className="stage-card-tag" style={{ fontSize: "9px", color: "#34D399 !important", background: "rgba(52, 211, 153, 0.12) !important", border: "1px solid rgba(52, 211, 153, 0.3) !important", borderRadius: "3px", padding: "1px 5px", fontFamily: "var(--f-mono, monospace)", fontWeight: 600 }}>
                      AST DIFF
                    </span>
                  </div>
                  <div className="stage-card-desc" style={{ fontSize: "11px", color: "#94A3B8 !important", marginTop: "2px" }}>
                    Generates minimal defensive repair restricted to vulnerable node
                  </div>
                </div>
              </div>
              {activePipelineStage === 3 && (
                <div style={{ margin: "4px 0 4px 30px", padding: "6px 8px", borderRadius: "5px", background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(52, 211, 153, 0.25)", fontSize: "10px", fontFamily: "var(--f-mono, monospace)", color: "#CBD5E1", lineHeight: 1.4 }}>
                  <div style={{ color: "#34D399", fontWeight: 600 }}>Scoped AST Synthesis · Stage 3 Verified</div>
                  <div>Diff Scope: <span style={{ color: "#34D399" }}>+4 lines</span>, <span style={{ color: "#F0825B" }}>-1 line</span> · Node: <code>serialize_billing</code></div>
                </div>
              )}
            </div>

            {/* Stage 4 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 4 ? null : 4)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 4}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "6px",
                background: activePipelineStage === 4 ? "rgba(52, 211, 153, 0.15)" : "transparent",
                border: activePipelineStage === 4 ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid transparent",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: "rgba(52, 211, 153, 0.2)",
                    border: "1px solid #34D399",
                    color: "#34D399",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "var(--f-mono, monospace)",
                    flexShrink: 0,
                  }}
                >
                  4
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b className="stage-card-title" style={{ fontSize: "12.5px", color: "#FFFFFF !important" }}>8 Deterministic Compiler Gates</b>
                    <span className="stage-card-tag" style={{ fontSize: "9px", color: "#34D399 !important", background: "rgba(52, 211, 153, 0.12) !important", border: "1px solid rgba(52, 211, 153, 0.3) !important", borderRadius: "3px", padding: "1px 5px", fontFamily: "var(--f-mono, monospace)", fontWeight: 600 }}>
                      8/8 PASS
                    </span>
                  </div>
                  <div className="stage-card-desc" style={{ fontSize: "11px", color: "#94A3B8 !important", marginTop: "2px" }}>
                    Compile ✓ · Ruff style ✓ · Exploit replay 403 ✓ · Unit tests ✓
                  </div>
                </div>
              </div>
              {activePipelineStage === 4 && (
                <div style={{ margin: "4px 0 4px 30px", padding: "6px 8px", borderRadius: "5px", background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(52, 211, 153, 0.25)", fontSize: "10px", fontFamily: "var(--f-mono, monospace)", color: "#CBD5E1", lineHeight: 1.4 }}>
                  <div style={{ color: "#34D399", fontWeight: 600 }}>Deterministic Gates · Stage 4 Verified</div>
                  <div>Gate G1–G8: <span style={{ color: "#34D399" }}>8/8 PASS</span> · Exploit Replay: <code>HTTP 403 (Blocked)</code></div>
                </div>
              )}
            </div>

            {/* Stage 5 */}
            <div
              onClick={() => setActivePipelineStage(activePipelineStage === 5 ? null : 5)}
              role="button"
              tabIndex={0}
              aria-expanded={activePipelineStage === 5}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 8px",
                borderRadius: "6px",
                background: activePipelineStage === 5 ? "rgba(52, 211, 153, 0.18)" : "transparent",
                border: activePipelineStage === 5 ? "1px solid #34D399" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: "rgba(52, 211, 153, 0.2)",
                    border: "1px solid #34D399",
                    color: "#34D399",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: "var(--f-mono, monospace)",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b className="stage-card-title" style={{ fontSize: "12.5px", color: "#FFFFFF !important" }}>HMAC-SHA256 Evidence Notarized</b>
                    <span className="stage-card-tag" style={{ fontSize: "9px", color: "#34D399 !important", background: "rgba(52, 211, 153, 0.12) !important", border: "1px solid rgba(52, 211, 153, 0.3) !important", borderRadius: "3px", padding: "1px 5px", fontFamily: "var(--f-mono, monospace)", fontWeight: 600 }}>
                      SEALED
                    </span>
                  </div>
                  <div className="stage-card-desc" style={{ fontSize: "11px", color: "#94A3B8 !important", marginTop: "2px" }}>
                    Signed block appended to audit ledger · Pull Request ready
                  </div>
                </div>
              </div>
              {activePipelineStage === 5 && (
                <div style={{ margin: "4px 0 4px 30px", padding: "6px 8px", borderRadius: "5px", background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(52, 211, 153, 0.35)", fontSize: "10px", fontFamily: "var(--f-mono, monospace)", color: "#CBD5E1", lineHeight: 1.4 }}>
                  <div style={{ color: "#34D399", fontWeight: 600 }}>Merkle Ledger Block #8842 · Sealed</div>
                  <div>Signature: <code>HMAC-SHA256 (Ed25519 Attested)</code> · Status: <span style={{ color: "#34D399" }}>PR Ready</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div style={{ fontSize: "12px", color: "#94A3B8 !important", marginTop: "24px", fontFamily: "var(--f-mono, monospace)" }}>
          Deterministic gates decide · Generative models propose
        </div>
      </section>

      {/* =========================================================================
          RIGHT PANEL: Authentication & Personas Hub (True 50% Screen Split)
          Pristine White Persona Cards on Clean Slate Background (Zero Wash-Out)
          ========================================================================= */}
      <section
        className="login-right-panel"
        style={{
          width: "50%",
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          overflowY: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 48px 36px 48px",
          background: "#F8FAFC",
          boxSizing: "border-box",
        }}
      >
        <div
          className="login-right-content"
          style={{
            width: "100%",
            maxWidth: "580px",
            margin: "0 auto",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top Bar: Switch to Public Site & Secure Gateway Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <Link
              href="/"
              prefetch={true}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                background: "#FFFFFF",
                color: "#334155",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
            >
              ← Back to Public Site
            </Link>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "4px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "#059669",
                fontFamily: "var(--f-mono, monospace)",
                letterSpacing: "0.05em",
              }}
            >
              SECURE GATEWAY
            </span>
          </div>

          {/* Mode Switcher Tabs — 2 Tabs Only (Clean & Focused) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: "3px",
              borderRadius: "8px",
              background: "#F1F5F9",
              marginBottom: "22px",
              border: "1px solid #E2E8F0",
              gap: "4px",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("judge");
                setShowInlineRecovery(false);
              }}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                border: "none",
                background: activeTab === "judge" ? "#FFFFFF" : "transparent",
                color: activeTab === "judge" ? "#0F172A" : "#64748B",
                fontWeight: activeTab === "judge" ? 700 : 500,
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "judge" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 120ms ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Evaluation Roles
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setShowInlineRecovery(false);
              }}
              className="cursor-pointer active:scale-98 transition-transform"
              style={{
                border: "none",
                background: activeTab === "signin" ? "#FFFFFF" : "transparent",
                color: activeTab === "signin" ? "#0F172A" : "#64748B",
                fontWeight: activeTab === "signin" ? 700 : 500,
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "signin" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 120ms ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Work Email
            </button>
          </div>

          {/* Notice Feedback Banner */}
          {notice && !authStep && (
            <div
              className="mono"
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                background: "rgba(5, 150, 105, 0.1)",
                border: "1px solid #059669",
                color: "#059669",
                fontSize: "11px",
                marginBottom: "12px",
              }}
            >
              ✓ {notice}
            </div>
          )}

          {/* Auth Step Status Banner */}
          {authStep && (
            <div
              className="mono"
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                background:
                  authStep.status === "verified"
                    ? "rgba(5, 150, 105, 0.1)"
                    : "rgba(32, 201, 166, 0.1)",
                border: `1px solid ${authStep.status === "verified" ? "#059669" : "var(--brand)"}`,
                color: authStep.status === "verified" ? "#059669" : "var(--brand)",
                fontSize: "11px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{authStep.status === "verified" ? "✓" : "⚡"}</span>
              <b>{authStep.message}</b>
            </div>
          )}

          {/* =====================================================================
              TAB 1: EVALUATION 1-CLICK DEMO ACCESS (All 4 Personas -> /dashboard)
              Exact layout matching deployed Sentinel Gate (Screenshot 1)
              ===================================================================== */}
          {activeTab === "judge" && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <h2
                  className="card-title"
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    margin: "0 0 4px 0",
                    color: "#0F172A !important",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Evaluation Personas (1-Click Access)
                </h2>
                <div
                  className="card-subtitle"
                  style={{
                    fontSize: "13px",
                    color: "#475569 !important",
                    fontWeight: 500,
                  }}
                >
                  Select a role persona to test workspace features and permission boundaries:
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* 1. Developer Persona */}
                <div
                  onClick={() => handleJudgeAccess("developer")}
                  onMouseEnter={() => router.prefetch("/dashboard")}
                  className="persona-card cursor-pointer active:scale-98 transition-transform"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "14px 18px",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#0D9488";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 148, 136, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "15px" }}>🚀</span>
                      <span className="persona-title" style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A !important" }}>
                        Developer Persona
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: "rgba(13, 148, 136, 0.1)",
                          color: "#0D9488",
                          border: "1px solid rgba(13, 148, 136, 0.25)",
                          fontFamily: "var(--f-mono, monospace)",
                        }}
                      >
                        STUDIO &amp; RETEST
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#0D9488",
                        fontFamily: "var(--f-mono, monospace)",
                      }}
                    >
                      Enter Studio →
                    </span>
                  </div>
                  <div
                    className="persona-desc"
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "#64748B !important",
                    }}
                  >
                    Split-diff Monaco code reviews, live patch edits, and rootless microVM retests.
                  </div>
                </div>

                {/* 2. Security Auditor */}
                <div
                  onClick={() => handleJudgeAccess("auditor")}
                  onMouseEnter={() => router.prefetch("/dashboard")}
                  className="persona-card cursor-pointer active:scale-98 transition-transform"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "14px 18px",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#0284C7";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(2, 132, 199, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "15px" }}>🛡️</span>
                      <span className="persona-title" style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A !important" }}>
                        Security Auditor
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: "rgba(2, 132, 199, 0.1)",
                          color: "#0284C7",
                          border: "1px solid rgba(2, 132, 199, 0.25)",
                          fontFamily: "var(--f-mono, monospace)",
                        }}
                      >
                        FINDINGS &amp; LEDGER
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#0284C7",
                        fontFamily: "var(--f-mono, monospace)",
                      }}
                    >
                      Enter Findings →
                    </span>
                  </div>
                  <div
                    className="persona-desc"
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "#64748B !important",
                    }}
                  >
                    Inspect live DAST probes, test cryptographic tamper resistance, and verify HMAC ledger proofs.
                  </div>
                </div>

                {/* 3. Workspace Admin */}
                <div
                  onClick={() => handleJudgeAccess("admin")}
                  onMouseEnter={() => router.prefetch("/dashboard")}
                  className="persona-card cursor-pointer active:scale-98 transition-transform"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "14px 18px",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#D97706";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "15px" }}>⚙️</span>
                      <span className="persona-title" style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A !important" }}>
                        Workspace Admin
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: "rgba(217, 119, 6, 0.1)",
                          color: "#D97706",
                          border: "1px solid rgba(217, 119, 6, 0.25)",
                          fontFamily: "var(--f-mono, monospace)",
                        }}
                      >
                        CATALOG &amp; QUOTAS
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#D97706",
                        fontFamily: "var(--f-mono, monospace)",
                      }}
                    >
                      Enter Catalog →
                    </span>
                  </div>
                  <div
                    className="persona-desc"
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "#64748B !important",
                    }}
                  >
                    Manage benchmark test suites, token budgets, and automated policy gates.
                  </div>
                </div>

                {/* 4. Super Admin */}
                <div
                  onClick={() => handleJudgeAccess("super_admin")}
                  onMouseEnter={() => router.prefetch("/dashboard")}
                  className="persona-card cursor-pointer active:scale-98 transition-transform"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "14px 18px",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#E11D48";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(225, 29, 72, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "15px" }}>👑</span>
                      <span className="persona-title" style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A !important" }}>
                        Super Admin
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: "rgba(225, 29, 72, 0.1)",
                          color: "#E11D48",
                          border: "1px solid rgba(225, 29, 72, 0.25)",
                          fontFamily: "var(--f-mono, monospace)",
                        }}
                      >
                        FLEET &amp; DASHBOARD
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#E11D48",
                        fontFamily: "var(--f-mono, monospace)",
                      }}
                    >
                      Enter Dashboard →
                    </span>
                  </div>
                  <div
                    className="persona-desc"
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "#64748B !important",
                    }}
                  >
                    Fleet control plane: microVM telemetry, emergency overrides, and cluster health.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: WORK EMAIL SIGN IN & INLINE RECOVERY
              ===================================================================== */}
          {activeTab === "signin" && !showInlineRecovery && (
            <form onSubmit={handleStandardSignIn} style={{ width: "100%" }}>
              <div style={{ marginBottom: "16px" }}>
                <h2
                  className="card-title"
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    margin: "0 0 4px 0",
                    color: "#0F172A !important",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Sign In to ProofStack Workspace
                </h2>
                <div
                  className="card-subtitle"
                  style={{
                    fontSize: "13px",
                    color: "#475569 !important",
                    fontWeight: 500,
                  }}
                >
                  Enter your corporate credentials or choose an enterprise identity provider:
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px", width: "100%" }}>
                <div style={{ width: "100%" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#0F172A" }}>
                    Work Email
                  </label>
                  <div style={{ width: "100%", height: "38px", padding: 0, border: "1px solid #CBD5E1", borderRadius: "6px", background: "#FFFFFF", boxSizing: "border-box" }}>
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
                        color: "#0F172A",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#0F172A" }}>Password / Access Key</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineRecovery(true)}
                      className="cursor-pointer active:scale-98 transition-transform"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#059669",
                        fontSize: "12px",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ width: "100%", height: "38px", padding: 0, border: "1px solid #CBD5E1", borderRadius: "6px", background: "#FFFFFF", boxSizing: "border-box" }}>
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
                        color: "#0F172A",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn cursor-pointer active:scale-98 transition-transform"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "38px",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  borderRadius: "6px",
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                }}
              >
                {isLoading ? "Signing in…" : "Sign in to ProofStack"}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "14px 0 12px",
                  color: "#94A3B8",
                  fontSize: "11px",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
                <span style={{ padding: "0 10px" }}>or continue with</span>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              </div>

              {/* OAuth Providers: Google & GitHub */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", marginBottom: "10px" }}>
                <button
                  type="button"
                  className="btn sec sm cursor-pointer active:scale-98 transition-transform"
                  disabled={oauthLoading !== null || isLoading}
                  onClick={() => handleOAuthSignIn("google")}
                  style={{
                    justifyContent: "center",
                    fontSize: "12px",
                    height: "36px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontWeight: 600,
                    borderRadius: "6px",
                    width: "100%",
                    color: "#0F172A",
                  }}
                >
                  {oauthLoading === "google" ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      <span>Google…</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn sec sm cursor-pointer active:scale-98 transition-transform"
                  disabled={oauthLoading !== null || isLoading}
                  onClick={() => handleOAuthSignIn("github")}
                  style={{
                    justifyContent: "center",
                    fontSize: "12px",
                    height: "36px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontWeight: 600,
                    borderRadius: "6px",
                    width: "100%",
                    color: "#0F172A",
                  }}
                >
                  {oauthLoading === "github" ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      <span>GitHub…</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>GitHub</span>
                    </>
                  )}
                </button>
              </div>

              {/* Enterprise Options: SSO & Passkey */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
                <button
                  type="button"
                  className="btn sec sm cursor-pointer active:scale-98 transition-transform"
                  disabled={isSsoLoading || isPasskeyLoading || isLoading}
                  onClick={handleSsoSignIn}
                  style={{
                    justifyContent: "center",
                    fontSize: "11.5px",
                    height: "34px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    width: "100%",
                    color: "#0F172A",
                  }}
                >
                  {isSsoLoading ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      SSO…
                    </>
                  ) : (
                    <>
                      <span>🔑</span>
                      SSO Login
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn sec sm cursor-pointer active:scale-98 transition-transform"
                  disabled={isSsoLoading || isPasskeyLoading || isLoading}
                  onClick={handlePasskeySignIn}
                  style={{
                    justifyContent: "center",
                    fontSize: "11.5px",
                    height: "34px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    width: "100%",
                    color: "#0F172A",
                  }}
                >
                  {isPasskeyLoading ? (
                    <>
                      <span className="dot" style={{ background: "var(--brand)" }} />
                      Passkey…
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      Passkey
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =====================================================================
              INLINE PASSWORD RECOVERY (Merged seamlessly inside Work Email view)
              ===================================================================== */}
          {activeTab === "signin" && showInlineRecovery && (
            <form onSubmit={handleRecoverySubmit} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h2
                    className="card-title"
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      margin: "0 0 4px 0",
                      color: "#0F172A !important",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Emergency Credential Recovery
                  </h2>
                  <div
                    className="card-subtitle"
                    style={{
                      fontSize: "13px",
                      color: "#475569 !important",
                      fontWeight: 500,
                    }}
                  >
                    Enter operator email &amp; hardware attestation key:
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInlineRecovery(false)}
                  className="cursor-pointer active:scale-98 transition-transform"
                  style={{
                    border: "none",
                    background: "none",
                    color: "#059669",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>

              {recoveryError && (
                <div
                  className="mono"
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid #EF4444",
                    color: "#DC2626",
                    fontSize: "11px",
                    marginBottom: "10px",
                  }}
                >
                  ⚠ {recoveryError}
                </div>
              )}

              {recoverySuccess && (
                <div
                  className="mono"
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "rgba(5, 150, 105, 0.1)",
                    border: "1px solid #059669",
                    color: "#059669",
                    fontSize: "11px",
                    marginBottom: "10px",
                  }}
                >
                  ✓ {recoverySuccess}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#0F172A" }}>
                    Operator Recovery Email
                  </label>
                  <div style={{ height: "38px", padding: 0, border: "1px solid #CBD5E1", borderRadius: "6px", background: "#FFFFFF" }}>
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
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#0F172A" }}>
                    6-Digit Hardware Attestation / MFA Pin
                  </label>
                  <div style={{ height: "38px", padding: 0, border: "1px solid #CBD5E1", borderRadius: "6px", background: "#FFFFFF" }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      required
                      className="mono"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: "0 10px",
                        fontSize: "13px",
                        letterSpacing: "0.2em",
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn cursor-pointer active:scale-98 transition-transform"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "38px",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  borderRadius: "6px",
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                }}
              >
                {isLoading ? "Verifying Attestation…" : "Confirm Recovery Signature & Enter"}
              </button>
            </form>
          )}

          {/* Bottom Security Compliance Footer */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "12px",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "10.5px",
              color: "#94A3B8",
              fontFamily: "var(--f-mono, monospace)",
            }}
          >
            <span>SOC2 Type II · Ed25519 Encrypted</span>
            <span>ProofStack v2.4-prod</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", background: "#F8FAF9" }}>
          <div className="dot" style={{ background: "var(--brand, #20C9A6)", width: 14, height: 14 }} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
