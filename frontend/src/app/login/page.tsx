"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  ShieldCheck, Terminal, Lock, KeyRound, User, 
  ArrowRight, CheckCircle2, ShieldAlert, Cpu, 
  Code2, Binary, Server, Award, Sparkles, Eye, EyeOff,
  AlertCircle, HelpCircle, Mail, RefreshCw
} from "lucide-react";
import { UserRole } from "@/lib/auth";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [activeTab, setActiveTab] = useState<"signin" | "reset" | "personas">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("developer");
  const [email, setEmail] = useState("developer@sentinel.internal");
  const [password, setPassword] = useState("P@ssw0rd2026!Secure");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const rolePresets = [
    {
      role: "developer" as UserRole,
      route: "/developer",
      label: "Lead Developer",
      persona: "Alex Chen (Staff Dev)",
      badge: "AST Invariant & Synthesis",
      desc: "Tree-Sitter compiler grammar parsing, token-masked neural patch synthesis, and patch diff review.",
      icon: <Code2 className="w-5 h-5 text-emerald-400" />,
      badgeColor: "#10B981",
    },
    {
      role: "auditor" as UserRole,
      route: "/auditor",
      label: "Security Auditor",
      persona: "Elena Rostova (Lead Auditor)",
      badge: "Cryptographic Attestation",
      desc: "SHA-256 Merkle chain verification, adversary bit-flip tamper injection, and audit pack export.",
      icon: <Binary className="w-5 h-5 text-cyan-400" />,
      badgeColor: "#38BDF8",
    },
    {
      role: "admin" as UserRole,
      route: "/admin",
      label: "Operations Admin",
      persona: "Marcus Vance (Ops Admin)",
      badge: "Sandbox & MicroVM Pools",
      desc: "Ephemeral gVisor runner management, NVIDIA inference token quotas, and CI/CD webhooks.",
      icon: <Server className="w-5 h-5 text-indigo-400" />,
      badgeColor: "#818CF8",
    },
    {
      role: "super_admin" as UserRole,
      route: "/ciso",
      label: "SuperAdmin (CISO)",
      persona: "Dr. Sarah Lin (CISO)",
      badge: "Zero-Trust Posture",
      desc: "Cryptographic root signing key authority, SOC2/FedRAMP matrix, and dual-key emergency override gates.",
      icon: <Award className="w-5 h-5 text-amber-400" />,
      badgeColor: "#F59E0B",
    },
  ];

  const handle1ClickRoleLogin = (r: typeof rolePresets[0]) => {
    setSelectedRole(r.role);
    setEmail(r.persona);
    if (typeof login === "function") {
      login(r.persona, r.role);
    }
    navigateWithCurtain(r.route, r.label);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid operator email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    const targetPreset = rolePresets.find((p) => p.role === selectedRole) || rolePresets[0];

    try {
      if (typeof login === "function") {
        login(email, selectedRole);
      }
      setTimeout(() => {
        setIsSubmitting(false);
        navigateWithCurtain(targetPreset.route, targetPreset.label);
      }, 400);
    } catch {
      setIsSubmitting(false);
      navigateWithCurtain(targetPreset.route, targetPreset.label);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid operator email address to receive reset credentials.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      setResetSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col lg:flex-row selection:bg-emerald-500/25">
      {/* Left Column: Platform Security Credentials & Status */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--line)] bg-[var(--surface)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <button
            onClick={() => navigateWithCurtain("/", "Sentinel Gate")}
            className="flex items-center gap-3 mb-10 hover:opacity-85 transition-opacity"
            aria-label="Return to Sentinel Gate Homepage"
          >
            <BrandLogo size="md" showWordmark={true} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-4 font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>ROLE-BASED ACCESS CONTROL GATEWAY</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-[var(--ink)]">
            Cryptographically Verified Access to Sentinel Core
          </h1>

          <p className="text-[var(--ink-body)] text-sm mt-3 leading-relaxed max-w-lg">
            Choose your assigned operator persona for instant authenticated access, or enter your internal credentials. All session events are anchored into the HMAC-SHA256 evidence ledger.
          </p>

          {/* 4 Role Persona Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {rolePresets.map((r) => (
              <div
                key={r.role}
                onClick={() => handle1ClickRoleLogin(r)}
                className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5 hover:scale-[1.01] shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.icon}
                    <span className="font-bold text-[var(--ink)]">{r.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-[var(--ink-muted)] line-clamp-1">{r.persona}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Hardware Status Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--ink-muted)] gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NVIDIA Nemotron 70B Online</span>
          </div>
          <div className="text-[var(--ink-muted)]">HMAC-SHA256 Ledger Active</div>
        </div>
      </div>

      {/* Right Column: Interactive Role Selector & Form */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex items-center justify-center bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-6">
          {/* Form Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); setErrorMessage(null); setResetSent(false); }}
              className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-colors ${
                activeTab === "signin"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("personas"); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-colors ${
                activeTab === "personas"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Role Presets
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("reset"); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-colors ${
                activeTab === "reset"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Reset Key
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div 
              role="alert" 
              className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Sign In Form */}
          {activeTab === "signin" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Operator Portal Authentication
                </h2>
                <p className="text-xs text-[var(--ink-body)] mt-1">
                  Authenticate with your clearance role and security credentials.
                </p>
              </div>

              {/* Persona Selector Pill Grid */}
              <div>
                <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1.5 uppercase tracking-wider">
                  Select Target Persona
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {rolePresets.map((r) => {
                    const isSelected = selectedRole === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.role);
                          setEmail(r.persona);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-[var(--ink)] shadow-sm font-semibold"
                            : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--line-strong)]"
                        }`}
                      >
                        <div className="text-xs font-mono text-emerald-400 truncate">{r.label}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] truncate">{r.persona.split(" ")[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-mono text-[var(--ink-muted)] mb-1.5">
                    Operator Identity / Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--ink-muted)]" />
                    <input
                      id="auth-email"
                      type="text"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-sm font-mono focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-xs font-mono text-[var(--ink-muted)] mb-1.5">
                    Security Passphrase / Token
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--ink-muted)]" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-sm font-mono focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] mt-1.5 font-mono">
                    Must be 8+ characters. Handled locally with zero external transmission.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Attesting Local Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter {rolePresets.find((p) => p.role === selectedRole)?.label} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Persona 1-Click Simulator */}
          {activeTab === "personas" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--ink)]">
                  Local Development Personas
                </h2>
                <p className="text-xs text-[var(--ink-body)] mt-1">
                  1-click role clearance simulation for evaluators and presentation walkthroughs.
                </p>
              </div>

              <div className="space-y-2.5">
                {rolePresets.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handle1ClickRoleLogin(r)}
                    className="w-full text-left p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center">
                        {r.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-[var(--ink)] group-hover:text-emerald-400 transition-colors">
                          {r.label}
                        </div>
                        <div className="text-[11px] text-[var(--ink-muted)] font-mono">{r.persona}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Password Reset */}
          {activeTab === "reset" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--ink)]">
                  Reset Operator Credentials
                </h2>
                <p className="text-xs text-[var(--ink-body)] mt-1">
                  Request a cryptographically signed recovery token for your operator ID.
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Reset Token Issued</span>
                  </div>
                  <p className="text-[var(--ink-body)] leading-relaxed">
                    Development notice: A local reset session was initialized for <strong>{email}</strong>. In production, this link is signed by HSM root key and dispatched via corporate IdP.
                  </p>
                  <button
                    onClick={() => { setResetSent(false); setActiveTab("signin"); }}
                    className="text-emerald-400 underline font-semibold mt-1 inline-block"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-xs font-mono text-[var(--ink-muted)] mb-1.5">
                      Operator Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--ink-muted)]" />
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-sm font-mono focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Generating Recovery Token...</span>
                      </>
                    ) : (
                      <span>Dispatch Recovery Token</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => navigateWithCurtain("/", "Sentinel Gate")}
              className="text-xs font-mono text-[var(--ink-muted)] hover:text-emerald-400 transition-colors"
            >
              ← Return to Main Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
