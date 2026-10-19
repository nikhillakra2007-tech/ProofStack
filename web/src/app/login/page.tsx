"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES, TENANT_UUID } from "@/lib/roles";
import { UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, setSessionData } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [selectedRole, setSelectedRole] = useState<UserRole>("super_admin");
  const [email, setEmail] = useState<string>(ROLES.super_admin.email);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState<boolean>(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(ROLES[role].email);
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const def = ROLES[selectedRole];
      setSessionData({
        userId: `usr_${def.role}`,
        tenantId: def.tenantUuid,
        email: email,
        role: def.role,
        token: `jwt_rs256_${def.role}_token`,
        canOverridePolicy: def.canOverridePolicy,
      });
      // Everyone lands on Dashboard ( / ) as specified in PDF p. 12
      router.push("/");
    }, 450);
  };

  return (
    <div
      className="ps nosidebar app-frame"
      style={{
        display: "grid",
        gridTemplateColumns: "640px 1fr",
        width: "100%",
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Left 640px Brand Panel (PDF pp. 13-14 #1) */}
      <section
        style={{
          background: "var(--side)",
          color: "var(--side-ink)",
          padding: "44px 56px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRight: "1px solid var(--side-line)",
          overflowY: "auto",
        }}
      >
        {/* Brand Header */}
        <div className="brand" style={{ padding: 0 }}>
          <div className="logo">
            <svg className="i" viewBox="0 0 24 24">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <b>ProofStack</b>
            <span>Autonomous DevSecOps Engine</span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ marginTop: "72px" }}>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>
            Cockpit
          </div>
          <h1
            style={{
              font: "600 58px/1.04 var(--f-display)",
              letterSpacing: "-.02em",
              margin: "14px 0 18px",
            }}
          >
            ProofStack
            <br />
            Cockpit
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.55,
              color: "var(--side-mute)",
              maxWidth: "430px",
              margin: 0,
            }}
          >
            Autonomous DevSecOps Studio &amp; Self-Healing Verification Engine
          </p>
        </div>

        {/* Evidence Chain Art (decorative, aria-hidden) */}
        <div
          aria-hidden="true"
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            paddingBottom: "6px",
            paddingTop: "24px",
          }}
        >
          {/* Block #0 */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                border: "1px solid var(--side-line)",
                borderRadius: "8px",
                padding: "9px 12px",
                width: "360px",
                background: "color-mix(in srgb, var(--side-ink) 5%, transparent)",
              }}
            >
              <div
                className="row"
                style={{
                  font: "600 10px var(--f-mono)",
                  letterSpacing: ".12em",
                  color: "var(--side-mute)",
                }}
              >
                <span>BLOCK #0</span>
                <span style={{ marginLeft: "auto", color: "var(--term-pass, #6FD39B)" }}>
                  VERIFIED
                </span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "11px",
                  color: "var(--side-ink)",
                  opacity: 0.85,
                  marginTop: "4px",
                  letterSpacing: ".02em",
                }}
              >
                8f4b238e89c132890dbaf423a8e9e19d7010a3952f01…
              </div>
            </div>
          </div>
          <div style={{ width: "1px", height: "14px", background: "var(--side-line)", marginLeft: "40px" }} />

          {/* Block #1 */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                border: "1px solid var(--side-line)",
                borderRadius: "8px",
                padding: "9px 12px",
                width: "360px",
                background: "color-mix(in srgb, var(--side-ink) 5%, transparent)",
              }}
            >
              <div
                className="row"
                style={{
                  font: "600 10px var(--f-mono)",
                  letterSpacing: ".12em",
                  color: "var(--side-mute)",
                }}
              >
                <span>BLOCK #1</span>
                <span style={{ marginLeft: "auto", color: "var(--term-pass, #6FD39B)" }}>
                  VERIFIED
                </span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "11px",
                  color: "var(--side-ink)",
                  opacity: 0.85,
                  marginTop: "4px",
                  letterSpacing: ".02em",
                }}
              >
                318cb92931ea789dcba2891901a8df9038ba1c890123…
              </div>
            </div>
          </div>
          <div style={{ width: "1px", height: "14px", background: "var(--side-line)", marginLeft: "40px" }} />

          {/* Block #2 */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                border: "1px solid var(--side-line)",
                borderRadius: "8px",
                padding: "9px 12px",
                width: "360px",
                background: "color-mix(in srgb, var(--side-ink) 5%, transparent)",
              }}
            >
              <div
                className="row"
                style={{
                  font: "600 10px var(--f-mono)",
                  letterSpacing: ".12em",
                  color: "var(--side-mute)",
                }}
              >
                <span>BLOCK #2</span>
                <span style={{ marginLeft: "auto", color: "var(--term-pass, #6FD39B)" }}>
                  VERIFIED
                </span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "11px",
                  color: "var(--side-ink)",
                  opacity: 0.85,
                  marginTop: "4px",
                  letterSpacing: ".02em",
                }}
              >
                45a89df0123bc8901923891023890192389012389012…
              </div>
            </div>
          </div>
          <div style={{ width: "1px", height: "14px", background: "var(--side-line)", marginLeft: "40px" }} />

          {/* Block #3 */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                border: "1px solid var(--side-line)",
                borderRadius: "8px",
                padding: "9px 12px",
                width: "360px",
                background: "color-mix(in srgb, var(--side-ink) 5%, transparent)",
              }}
            >
              <div
                className="row"
                style={{
                  font: "600 10px var(--f-mono)",
                  letterSpacing: ".12em",
                  color: "var(--side-mute)",
                }}
              >
                <span>BLOCK #3</span>
                <span style={{ marginLeft: "auto", color: "var(--term-pass, #6FD39B)" }}>
                  VERIFIED
                </span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "11px",
                  color: "var(--side-ink)",
                  opacity: 0.85,
                  marginTop: "4px",
                  letterSpacing: ".02em",
                }}
              >
                e8901238901238901238901238901238901238901238…
              </div>
            </div>
          </div>
          <div style={{ width: "1px", height: "14px", background: "var(--side-line)", marginLeft: "40px" }} />

          {/* Block #4 */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                border: "1px solid var(--side-line)",
                borderRadius: "8px",
                padding: "9px 12px",
                width: "360px",
                background: "color-mix(in srgb, var(--side-ink) 5%, transparent)",
              }}
            >
              <div
                className="row"
                style={{
                  font: "600 10px var(--f-mono)",
                  letterSpacing: ".12em",
                  color: "var(--side-mute)",
                }}
              >
                <span>BLOCK #4</span>
                <span style={{ marginLeft: "auto", color: "var(--term-pass, #6FD39B)" }}>
                  VERIFIED
                </span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "11px",
                  color: "var(--side-ink)",
                  opacity: 0.85,
                  marginTop: "4px",
                  letterSpacing: ".02em",
                }}
              >
                d9012389012389012389012389012389012389012389…
              </div>
            </div>
          </div>
        </div>

        <div
          className="mono"
          style={{
            fontSize: "10.5px",
            color: "var(--side-mute)",
            marginTop: "22px",
            letterSpacing: ".04em",
          }}
        >
          SHA-256 hash chain · every verdict is append-only
        </div>
      </section>

      {/* Right Judge Access Panel (PDF pp. 13-14 #4-#9) */}
      <section
        style={{
          padding: "44px 70px 0",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "var(--bg)",
          overflowY: "auto",
        }}
      >
        {/* Top controls: Back to Public Site + Sun/Moon toggle */}
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="btn sm sec"
            onClick={() => router.push("/home")}
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px" }}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Public Site
          </button>
          <div className="row" style={{ gap: "10px" }}>
            <button
              type="button"
              className="iconbtn"
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              style={{ cursor: "pointer" }}
            >
              {resolvedTheme === "light" ? (
                <svg className="i" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="i" viewBox="0 0 24 24">
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
        </div>

        {/* Central Sign-in Box */}
        <div
          style={{
            margin: "auto 0",
            maxWidth: "560px",
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "20px 0",
          }}
        >
          {/* Eyebrow Badges */}
          <div className="row" style={{ marginBottom: "6px" }}>
            <span className="chip brand">
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Judge Access Panel (1-Click)
            </span>
            <span
              className="chip"
              onClick={() => setIsRbacModalOpen(true)}
              style={{
                cursor: "pointer",
                borderColor: "var(--brand)",
                color: "var(--brand)",
                background: "color-mix(in srgb, var(--brand) 8%, var(--surface))",
                fontWeight: 600,
              }}
              title="Click to view full 4-Tier RBAC Matrix"
            >
              Pre-Seeded RBAC Matrix ↗
            </span>
          </div>

          <h2
            className="disp"
            style={{
              fontSize: "30px",
              fontWeight: 600,
              margin: "14px 0 6px",
              letterSpacing: "-.01em",
            }}
          >
            Sign in
          </h2>
          <p style={{ margin: "0 0 18px", color: "var(--ink2)", fontSize: "13.5px" }}>
            Select a verified role to authenticate instantly with dedicated workspaces and permissions:
          </p>

          <form onSubmit={handleAuthenticate}>
            {/* 4 Role Selection Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {/* 1. Super Admin */}
              <div
                onClick={() => handleRoleSelect("super_admin")}
                style={{
                  border:
                    selectedRole === "super_admin"
                      ? "1px solid var(--brand)"
                      : "1px solid var(--line)",
                  boxShadow:
                    selectedRole === "super_admin"
                      ? "inset 0 0 0 1px var(--brand)"
                      : "none",
                  background:
                    selectedRole === "super_admin"
                      ? "color-mix(in srgb, var(--brand) 6%, var(--surface))"
                      : "var(--surface)",
                  borderRadius: "9px",
                  padding: "12px 14px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  transition: "all 120ms ease-out",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border:
                      selectedRole === "super_admin"
                        ? "1.6px solid var(--brand)"
                        : "1.6px solid var(--ink3)",
                    marginTop: "2px",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                  }}
                >
                  {selectedRole === "super_admin" && (
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--brand)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row">
                    <b style={{ fontSize: "14px" }}>Super Admin</b>
                    <span className="chip mono" style={{ textTransform: "none" }}>
                      super_admin
                    </span>
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        color: "var(--ink2)",
                      }}
                    >
                      /cockpit/TASK9142
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "3px" }}>
                    Full control plane: token budgets, microVM telemetry, policy overrides disabled
                  </div>
                </div>
              </div>

              {/* 2. Admin */}
              <div
                onClick={() => handleRoleSelect("admin")}
                style={{
                  border:
                    selectedRole === "admin"
                      ? "1px solid var(--brand)"
                      : "1px solid var(--line)",
                  boxShadow:
                    selectedRole === "admin"
                      ? "inset 0 0 0 1px var(--brand)"
                      : "none",
                  background:
                    selectedRole === "admin"
                      ? "color-mix(in srgb, var(--brand) 6%, var(--surface))"
                      : "var(--surface)",
                  borderRadius: "9px",
                  padding: "12px 14px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  transition: "all 120ms ease-out",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border:
                      selectedRole === "admin"
                        ? "1.6px solid var(--brand)"
                        : "1.6px solid var(--ink3)",
                    marginTop: "2px",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                  }}
                >
                  {selectedRole === "admin" && (
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--brand)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row">
                    <b style={{ fontSize: "14px" }}>Admin</b>
                    <span className="chip mono" style={{ textTransform: "none" }}>
                      admin
                    </span>
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        color: "var(--ink2)",
                      }}
                    >
                      /control-plane
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "3px" }}>
                    Management access: token budget allocation, microVM telemetry, findings triage; locked gates active
                  </div>
                </div>
              </div>

              {/* 3. Lead Developer */}
              <div
                onClick={() => handleRoleSelect("developer")}
                style={{
                  border:
                    selectedRole === "developer"
                      ? "1px solid var(--brand)"
                      : "1px solid var(--line)",
                  boxShadow:
                    selectedRole === "developer"
                      ? "inset 0 0 0 1px var(--brand)"
                      : "none",
                  background:
                    selectedRole === "developer"
                      ? "color-mix(in srgb, var(--brand) 6%, var(--surface))"
                      : "var(--surface)",
                  borderRadius: "9px",
                  padding: "12px 14px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  transition: "all 120ms ease-out",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border:
                      selectedRole === "developer"
                        ? "1.6px solid var(--brand)"
                        : "1.6px solid var(--ink3)",
                    marginTop: "2px",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                  }}
                >
                  {selectedRole === "developer" && (
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--brand)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row">
                    <b style={{ fontSize: "14px" }}>Lead Developer</b>
                    <span className="chip mono" style={{ textTransform: "none" }}>
                      developer
                    </span>
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        color: "var(--ink2)",
                      }}
                    >
                      /studio
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "3px" }}>
                    Task creation, patch verification, DAST scanning, and sandbox execution
                  </div>
                </div>
              </div>

              {/* 4. Security Auditor */}
              <div
                onClick={() => handleRoleSelect("auditor")}
                style={{
                  border:
                    selectedRole === "auditor"
                      ? "1px solid var(--brand)"
                      : "1px solid var(--line)",
                  boxShadow:
                    selectedRole === "auditor"
                      ? "inset 0 0 0 1px var(--brand)"
                      : "none",
                  background:
                    selectedRole === "auditor"
                      ? "color-mix(in srgb, var(--brand) 6%, var(--surface))"
                      : "var(--surface)",
                  borderRadius: "9px",
                  padding: "12px 14px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  transition: "all 120ms ease-out",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border:
                      selectedRole === "auditor"
                        ? "1.6px solid var(--brand)"
                        : "1.6px solid var(--ink3)",
                    marginTop: "2px",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                  }}
                >
                  {selectedRole === "auditor" && (
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--brand)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row">
                    <b style={{ fontSize: "14px" }}>Security Auditor</b>
                    <span className="chip mono" style={{ textTransform: "none" }}>
                      auditor
                    </span>
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        color: "var(--ink2)",
                      }}
                    >
                      /ledger
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "3px" }}>
                    Read-only ledger verification and tamper audit inspection
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant Boundary & Principal Identity Fields */}
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "12px", marginTop: "20px" }}>
              <div className="field">
                <div className="row" style={{ justifyContent: "space-between", marginBottom: "4px" }}>
                  <label>TENANT BOUNDARY (UUID)</label>
                  <span className="chip mono" style={{ fontSize: "10px", color: "var(--brand)" }}>
                    {ROLES[selectedRole].tenantName}
                  </span>
                </div>
                <div className="input mono" style={{ background: "var(--surface2)", gap: "10px" }}>
                  <svg className="i" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span style={{ fontWeight: 600, color: "var(--ink)", letterSpacing: ".02em" }}>
                    {ROLES[selectedRole].tenantUuid}
                  </span>
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label htmlFor="principal-email">PRINCIPAL IDENTITY (EMAIL)</label>
                  <div className="input focus" style={{ padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 12px", width: "100%", height: "100%" }}>
                      <svg className="i" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="principal-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          flex: 1,
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          fontSize: "13.5px",
                          color: "var(--ink)",
                          fontFamily: "var(--f-ui)",
                          fontWeight: 500,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>ASSIGNED ROLE</label>
                  <div
                    className="input"
                    style={{
                      justifyContent: "space-between",
                      cursor: "default",
                      background: "var(--surface)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ROLES[selectedRole].roleTitle}
                    </span>
                    <svg className="i" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Authenticate Button (42px height, exact text: Authenticate →) */}
            <button
              type="submit"
              className="btn lg"
              disabled={isLoading}
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "20px",
                cursor: isLoading ? "wait" : "pointer",
              }}
            >
              {isLoading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  Authenticate &nbsp;
                  <svg className="i" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Locked Decision D13 notice (PDF p. 13 #9) */}
          <div
            className="row"
            style={{
              marginTop: "14px",
              fontSize: "12px",
              color: "var(--ink2)",
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              <b style={{ color: "var(--ink)" }}>Locked Decision D13:</b> Cross-tenant access strictly returns HTTP 404.
            </span>
          </div>
        </div>

        {/* Footer line */}
        <div
          className="foot"
          style={{
            margin: "0 -70px",
            borderTop: "1px solid var(--line)",
            background: "var(--bg)",
          }}
        >
          <span>ProofStack v1.0</span>
          <span className="sp">Nemotron-3 Super 120B · Nebius Token Factory</span>
        </div>

        {/* RBAC Comparison Matrix Modal */}
        {isRbacModalOpen && (
          <div
            className="scrim"
            onClick={() => setIsRbacModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              display: "grid",
              placeItems: "center",
              zIndex: 100,
              padding: "20px",
            }}
          >
            <div
              className="card"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "840px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "24px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
            >
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div className="eyebrow" style={{ color: "var(--brand)" }}>
                    Enterprise Governance
                  </div>
                  <h2 className="disp" style={{ fontSize: "22px", margin: "4px 0" }}>
                    4-Tier Role-Based Access Control (RBAC) Matrix
                  </h2>
                  <p style={{ margin: 0, color: "var(--ink2)", fontSize: "12.5px" }}>
                    Strict isolation boundaries and operational capabilities across all pre-seeded enterprise personas
                  </p>
                </div>
                <button
                  type="button"
                  className="iconbtn"
                  onClick={() => setIsRbacModalOpen(false)}
                  aria-label="Close modal"
                >
                  <svg className="i" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="t" style={{ width: "100%", fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th>CAPABILITY / PRIVILEGE</th>
                      <th>SUPER ADMIN</th>
                      <th>ADMIN</th>
                      <th>LEAD DEVELOPER</th>
                      <th>SECURITY AUDITOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Tenant Scope</b></td>
                      <td><span className="chip brand">Global Root</span></td>
                      <td><span className="chip">Operations</span></td>
                      <td><span className="chip">Sandbox</span></td>
                      <td><span className="chip">Compliance</span></td>
                    </tr>
                    <tr>
                      <td><b>Tenant UUID</b></td>
                      <td className="mono" style={{ fontSize: "10px" }}>8f4b238e...</td>
                      <td className="mono" style={{ fontSize: "10px" }}>4a9c712b...</td>
                      <td className="mono" style={{ fontSize: "10px" }}>9c2e601f...</td>
                      <td className="mono" style={{ fontSize: "10px" }}>2d7b194a...</td>
                    </tr>
                    <tr>
                      <td><b>Primary Route</b></td>
                      <td className="mono">/cockpit/TASK9142</td>
                      <td className="mono">/control-plane</td>
                      <td className="mono">/studio</td>
                      <td className="mono">/ledger</td>
                    </tr>
                    <tr>
                      <td><b>Studio &amp; Code Execution</b></td>
                      <td style={{ color: "var(--pass)" }}>✓ Full execution</td>
                      <td style={{ color: "var(--pass)" }}>✓ Full execution</td>
                      <td style={{ color: "var(--pass)" }}>✓ Full execution</td>
                      <td style={{ color: "var(--fail)" }}>✗ View-only / Denied</td>
                    </tr>
                    <tr>
                      <td><b>Live DAST Scanner Probing</b></td>
                      <td style={{ color: "var(--pass)" }}>✓ Active scans</td>
                      <td style={{ color: "var(--pass)" }}>✓ Active scans</td>
                      <td style={{ color: "var(--pass)" }}>✓ Active scans</td>
                      <td style={{ color: "var(--fail)" }}>✗ View-only</td>
                    </tr>
                    <tr>
                      <td><b>Emergency Policy Override</b></td>
                      <td style={{ color: "var(--pass)" }}>✓ Enabled</td>
                      <td style={{ color: "var(--fail)" }}>✗ Locked (Admin)</td>
                      <td style={{ color: "var(--fail)" }}>✗ Locked</td>
                      <td style={{ color: "var(--fail)" }}>✗ Locked</td>
                    </tr>
                    <tr>
                      <td><b>Adversarial Tamper Simulation</b></td>
                      <td style={{ color: "var(--pass)" }}>✓ Enabled</td>
                      <td style={{ color: "var(--ink2)" }}>— Disabled</td>
                      <td style={{ color: "var(--ink2)" }}>— Disabled</td>
                      <td style={{ color: "var(--pass)" }}>✓ Enabled</td>
                    </tr>
                    <tr>
                      <td><b>Token Budget Quota</b></td>
                      <td className="mono">120,000 / Unlimited</td>
                      <td className="mono">50,000 / Manage</td>
                      <td className="mono">80,000 / Task</td>
                      <td className="mono">30,000 / Audit</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px", gap: "8px" }}>
                <button
                  type="button"
                  className="btn sec"
                  onClick={() => setIsRbacModalOpen(false)}
                >
                  Close Matrix
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
