"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import ScrollReveal from "@/components/animations/ScrollReveal";

const ROLE_UI: Record<UserRole, { title: string; desc: string; route: string; no: string }> = {
  super_admin: { title: "Super Admin", desc: "Full control plane, token budgets, policy override", route: "/cockpit/TASK9142", no: "01" },
  admin: { title: "Admin", desc: "Team quotas, microVM telemetry, findings triage", route: "/control-plane", no: "02" },
  developer: { title: "Lead Developer", desc: "Studio, patch synthesis, DAST scanning", route: "/studio", no: "03" },
  auditor: { title: "Security Auditor", desc: "Read-only ledger verification, tamper audit", route: "/ledger", no: "04" },
};

export default function LoginPage() {
  const router = useRouter();
  const { setSessionData } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [role, setRole] = useState<UserRole>("super_admin");
  const [email, setEmail] = useState(ROLES.super_admin.email);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

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
    }, 500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <ScrollReveal />

      {/* ===== LEFT: hero-style brand ===== */}
      <section style={{ position: "relative", background: "#050504", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "calc(40 * var(--u)) calc(48 * var(--u))", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ width: "min(60vh,60vw)", height: "min(60vh,60vw)", borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, rgba(233,229,218,.16) 0%, rgba(142,90,54,.14) 40%, rgba(5,5,4,0) 70%)", animation: "markSpin 24s cubic-bezier(.45,0,.55,1) infinite" }} />
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span style={{ fontSize: "14px", letterSpacing: ".04em" }}>ProofStack</span>
        </div>

        <div style={{ position: "relative" }}>
          <div className={`hero__kicker ${ready ? "is-in" : ""}`} style={ready ? undefined : { opacity: 0 }}>
            <span className={ready ? "is-in" : ""}>Judge Access · 2026</span>
          </div>
          <h1 className="hero__title" style={{ fontSize: "clamp(calc(38 * var(--u)), 5.4vw, calc(70 * var(--u)))" }}>
            <span className="ln"><span className={`ln__in ${ready ? "is-in" : ""}`} style={{ "--li": 0 } as React.CSSProperties}>Verify.</span></span>
            <span className="ln"><span className={`ln__in ${ready ? "is-in" : ""}`} style={{ "--li": 1 } as React.CSSProperties}>Protect.</span></span>
            <span className="ln"><span className={`ln__in ${ready ? "is-in" : ""}`} style={{ "--li": 2 } as React.CSSProperties}>Prove.</span></span>
          </h1>
          <p className={`hero__sub ${ready ? "is-in" : ""}`}>
            Deterministic code decides. The model only proposes.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <div className="label is-muted" style={{ marginBottom: "calc(18 * var(--u))" }}>Evidence chain</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "calc(10 * var(--u))" }}>
            {["8f4b238e89c13289…", "318cb92931ea789d…", "45a89df0123bc890…"].map((h, i) => (
              <div key={h} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(233,229,218,.24)", paddingTop: "calc(12 * var(--u))", fontSize: "calc(11.5 * var(--u))" }} data-rv>
                <span style={{ color: "var(--ink2)", letterSpacing: ".08em" }}>BLOCK {i}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--ink3)" }}>{h}</span>
                <span style={{ color: "var(--pass)", fontSize: "calc(10 * var(--u))", letterSpacing: ".1em" }}>SEALED</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RIGHT: form ===== */}
      <section style={{ display: "flex", flexDirection: "column", padding: "calc(40 * var(--u)) calc(48 * var(--u)) 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="link-arrow" style={{ fontSize: "calc(12.5 * var(--u))", paddingBottom: "calc(6 * var(--u))" }} onClick={() => router.push("/home")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Public site
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{ color: "var(--ink2)" }}>
            {resolvedTheme === "light" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.9" y1="4.9" x2="6.3" y2="6.3" /><line x1="17.7" y1="17.7" x2="19.1" y2="19.1" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.9" y1="19.1" x2="6.3" y2="17.7" /><line x1="17.7" y1="6.3" x2="19.1" y2="4.9" /></svg>
            )}
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "calc(470 * var(--u))", width: "100%", margin: "0 auto" }}>
          <div className="label" data-rv>Sign in</div>
          <h2 className="h-xl" data-rv style={{ marginTop: "calc(16 * var(--u))" }}>
            Choose your workspace.
          </h2>
          <p className="prose" data-rv style={{ marginTop: "calc(24 * var(--u))", maxWidth: "40em" }}>
            Every role is pre-seeded with a tenant boundary and its own permission set.
          </p>

          <form onSubmit={submit} style={{ marginTop: "calc(40 * var(--u))" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "calc(8 * var(--u))" }}>
              {(Object.keys(ROLE_UI) as UserRole[]).map((r) => {
                const ui = ROLE_UI[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => pick(r)}
                    data-rv
                    style={{
                      display: "grid",
                      gridTemplateColumns: "calc(38 * var(--u)) minmax(0,1fr) auto",
                      alignItems: "center",
                      gap: "calc(14 * var(--u))",
                      textAlign: "left",
                      padding: "calc(16 * var(--u)) calc(18 * var(--u))",
                      background: active ? "var(--surface)" : "transparent",
                      border: `1px solid ${active ? "var(--ink3)" : "var(--line)"}`,
                      transition: "border-color .35s var(--ease), background .35s var(--ease)",
                    }}
                  >
                    <span style={{ fontSize: "calc(12 * var(--u))", color: "var(--ink2)", letterSpacing: ".08em" }}>{ui.no}</span>
                    <span>
                      <span style={{ display: "block", fontSize: "calc(15 * var(--u))", fontWeight: 400 }}>{ui.title}</span>
                      <span style={{ display: "block", marginTop: "calc(4 * var(--u))", fontSize: "calc(12.5 * var(--u))", color: "var(--ink2)" }}>{ui.desc}</span>
                    </span>
                    <span style={{ fontSize: "calc(11.5 * var(--u))", color: "var(--ink3)", fontFamily: "'JetBrains Mono', monospace" }}>{ui.route}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "calc(32 * var(--u))", display: "flex", flexDirection: "column", gap: "calc(20 * var(--u))" }}>
              <div>
                <div className="label is-muted" style={{ fontSize: "calc(11 * var(--u))", marginBottom: "calc(8 * var(--u))" }}>Tenant boundary (UUID)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "calc(12 * var(--u)) calc(14 * var(--u))", border: "1px solid var(--line)", background: "var(--surface)", fontFamily: "'JetBrains Mono', monospace", fontSize: "calc(12 * var(--u))" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  {ROLES[role].tenantUuid}
                </div>
              </div>

              <div>
                <div className="label is-muted" style={{ fontSize: "calc(11 * var(--u))", marginBottom: "calc(8 * var(--u))" }}>Principal identity</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 calc(14 * var(--u))", height: "calc(44 * var(--u))", border: "1px solid var(--line)", background: "var(--surface)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: "calc(13.5 * var(--u))", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "calc(36 * var(--u))",
                width: "100%",
                padding: "calc(16 * var(--u)) calc(24 * var(--u))",
                background: "var(--ink)",
                color: "var(--bg)",
                fontSize: "calc(14 * var(--u))",
                fontWeight: 500,
                letterSpacing: ".04em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "opacity .3s, transform .3s var(--ease)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Authenticating…" : "Authenticate"}
              {!loading && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}
            </button>

            <p style={{ marginTop: "calc(20 * var(--u))", fontSize: "calc(12 * var(--u))", color: "var(--ink3)", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Locked Decision D13 — cross-tenant access returns HTTP 404.
            </p>
          </form>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlock: "calc(16 * var(--u))", borderTop: "1px solid var(--line)", fontSize: "calc(11 * var(--u))", color: "var(--ink3)" }}>
          <span>ProofStack v1.0</span>
          <span>Nemotron-3 Super 120B · Nebius Token Factory</span>
        </div>
      </section>
    </div>
  );
}
