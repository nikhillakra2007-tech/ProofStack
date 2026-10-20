"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";

const ROLE_UI: Record<
  UserRole,
  { title: string; desc: string; route: string; no: string; color: string; icon: React.ReactNode }
> = {
  super_admin: {
    title: "Super Admin",
    desc: "Full control plane, token budgets, policy override",
    route: "/cockpit/TASK9142",
    no: "01",
    color: "#38BDF8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  admin: {
    title: "Admin",
    desc: "Team quotas, microVM telemetry, findings triage",
    route: "/control-plane",
    no: "02",
    color: "#818CF8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  developer: {
    title: "Lead Developer",
    desc: "Studio, patch synthesis, DAST scanning",
    route: "/studio",
    no: "03",
    color: "#10B981",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  auditor: {
    title: "Security Auditor",
    desc: "Read-only ledger verification, tamper audit",
    route: "/ledger",
    no: "04",
    color: "#F59E0B",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { setSessionData } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [role, setRole] = useState<UserRole>("super_admin");
  const [email, setEmail] = useState(ROLES.super_admin.email);
  const [loading, setLoading] = useState(false);

  const pick = (r: UserRole) => {
    setRole(r);
    setEmail(ROLES[r].email);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const def = ROLES[role];
      setSessionData({
        userId: `usr_${def.role}`,
        tenantId: def.tenantUuid,
        email,
        role: def.role,
        token: `jwt_rs256_${def.role}_token`,
        canOverridePolicy: def.canOverridePolicy,
      });
      router.push("/");
    }, 550);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        position: "relative",
        zIndex: 1,
        color: "var(--ink)",
      }}
    >
      {/* ===== LEFT: BRAND SHOWCASE WITH EVIDENCE CHAIN ===== */}
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(32px, 5vw, 64px)",
          borderRight: "1px solid var(--line)",
          background: "linear-gradient(135deg, rgba(14, 19, 31, 0.85) 0%, rgba(7, 9, 14, 0.95) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--brand), var(--accent))",
              display: "grid",
              placeItems: "center",
              color: "#07090E",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", display: "block" }}>
              ProofStack
            </span>
            <span style={{ fontSize: "10.5px", color: "var(--brand)", fontFamily: "var(--f-mono)", letterSpacing: "0.08em" }}>
              Autonomous Verification
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div style={{ margin: "clamp(40px, 8vh, 80px) 0" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "20px",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "var(--brand)",
              fontSize: "11px",
              fontFamily: "var(--f-mono)",
              letterSpacing: "0.08em",
              marginBottom: "18px",
            }}
          >
            JUDGE CONSOLE · 2026
          </span>

          <h1
            style={{
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "0 0 16px",
              color: "var(--ink)",
            }}
          >
            Verify. Protect. Prove.
          </h1>

          <p style={{ fontSize: "15px", color: "var(--ink2)", maxWidth: "440px", lineHeight: 1.6, margin: 0 }}>
            Deterministic code decides. The model only proposes. Every candidate patch is tested against 8 Zero-Compromise Invariants.
          </p>
        </div>

        {/* Live Cryptographic Hash Chain Preview */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)", letterSpacing: "0.1em" }}>
              CRYPTOGRAPHIC EVIDENCE ANCHOR
            </span>
            <span style={{ fontSize: "10px", fontFamily: "var(--f-mono)", color: "var(--pass)" }}>
              ● 5 BLOCKS SEALED
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { index: "04", label: "VERDICT SEAL", hash: "d4e1529a1b2c…", status: "HEAD" },
              { index: "03", label: "8-GATE AUDIT", hash: "e89012389012…", status: "SEALED" },
              { index: "02", label: "MICROVM PROBE", hash: "45a89df0123b…", status: "SEALED" },
            ].map((block) => (
              <div
                key={block.index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--line)",
                  fontSize: "11.5px",
                  fontFamily: "var(--f-mono)",
                }}
              >
                <span style={{ color: "var(--ink2)" }}>BLOCK #{block.index}</span>
                <span style={{ color: "var(--brand)" }}>{block.label}</span>
                <span style={{ color: "var(--ink3)" }}>{block.hash}</span>
                <span style={{ color: "var(--pass)", fontSize: "10px" }}>{block.status}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== RIGHT: AUTHENTICATION FORM & ROLE PICKER ===== */}
      <motion.section
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(32px, 5vw, 64px)",
          background: "rgba(7, 9, 14, 0.6)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Top Utility Links */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--ink2)",
              cursor: "pointer",
            }}
          >
            <span>←</span> Public Marketing Site
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink2)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {resolvedTheme === "light" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
              </svg>
            )}
          </button>
        </div>

        {/* Center Auth Card */}
        <div style={{ maxWidth: "480px", width: "100%", margin: "clamp(24px, 4vh, 48px) auto" }}>
          <div>
            <div className="label" style={{ color: "var(--brand)" }}>
              AUTHENTICATION
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, color: "var(--ink)", margin: "8px 0 6px", letterSpacing: "-0.02em" }}>
              Select your workspace role
            </h2>
            <p style={{ fontSize: "13px", color: "var(--ink2)", margin: 0 }}>
              Each role enforces an isolated tenant boundary and specific privileges.
            </p>
          </div>

          <form onSubmit={submit} style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Role Cards Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(Object.keys(ROLE_UI) as UserRole[]).map((r) => {
                const ui = ROLE_UI[r];
                const active = role === r;
                return (
                  <motion.button
                    key={r}
                    type="button"
                    onClick={() => pick(r)}
                    whileHover={{ x: 3 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: active ? "rgba(56, 189, 248, 0.08)" : "rgba(14, 19, 31, 0.6)",
                      border: `1px solid ${active ? "var(--brand)" : "var(--line)"}`,
                      boxShadow: active ? "0 0 16px rgba(56, 189, 248, 0.18)" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: active ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        color: active ? "var(--brand)" : "var(--ink2)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {ui.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 600, color: active ? "var(--ink)" : "var(--ink2)" }}>
                          {ui.title}
                        </span>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: "10px", color: "var(--ink3)" }}>
                          ({ui.no})
                        </span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--ink2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ui.desc}
                      </div>
                    </div>

                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: active ? "var(--brand)" : "var(--ink3)" }}>
                      {ui.route}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Tenant Boundary Details */}
            <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(14, 19, 31, 0.5)", border: "1px solid var(--line)", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink2)" }}>Tenant Boundary UUID:</span>
              <span style={{ fontFamily: "var(--f-mono)", color: "var(--brand)" }}>{ROLES[role].tenantUuid}</span>
            </div>

            {/* Email / Principal Input */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--f-mono)", color: "var(--ink3)", marginBottom: "6px" }}>
                PRINCIPAL IDENTITY
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  fontFamily: "var(--f-mono)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: "46px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--brand), var(--accent))",
                color: "#07090E",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(56, 189, 248, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Authorizing Identity…</span>
              ) : (
                <>
                  <span>Enter Workspace as {ROLE_UI[role].title}</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Meta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--ink3)", fontFamily: "var(--f-mono)" }}>
          <span>ProofStack v2.0 · Quantum Aurora</span>
          <span>NVIDIA Nemotron · Nebius Sandbox</span>
        </div>
      </motion.section>
    </div>
  );
}
