"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  ShieldCheck, Terminal, Lock, KeyRound, User, 
  ArrowRight, CheckCircle2, ShieldAlert, Cpu, 
  Code2, Binary, Server, Award, Sparkles 
} from "lucide-react";
import { UserRole } from "@/lib/auth";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [selectedRole, setSelectedRole] = useState<UserRole>("developer");
  const [email, setEmail] = useState("dev@sentinel.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rolePresets = [
    {
      role: "developer" as UserRole,
      route: "/developer",
      label: "Lead Developer",
      persona: "Alex Chen (Staff Dev)",
      badge: "AST Invariant & Patch Synthesis",
      desc: "Synthesize AST-masked patches, view side-by-side AST diffs, and inspect Tree-Sitter compiler trees.",
      icon: <Code2 className="w-5 h-5 text-emerald-400" />,
      color: "emerald",
      badgeColor: "#10B981",
    },
    {
      role: "auditor" as UserRole,
      route: "/auditor",
      label: "Security Auditor",
      persona: "Elena Rostova (Lead Auditor)",
      badge: "Cryptographic Attestation",
      desc: "Verify SHA-256 Merkle chain integrity, run live adversary tamper tests, and export compliance audit packs.",
      icon: <Binary className="w-5 h-5 text-cyan-400" />,
      color: "cyan",
      badgeColor: "#38BDF8",
    },
    {
      role: "admin" as UserRole,
      route: "/admin",
      label: "Operations Admin",
      persona: "Marcus Vance (Ops Admin)",
      badge: "Sandbox & MicroVM Pools",
      desc: "Manage gVisor sandbox runners, monitor H100 inference quotas, and dispatch CI/CD webhooks.",
      icon: <Server className="w-5 h-5 text-indigo-400" />,
      color: "indigo",
      badgeColor: "#818CF8",
    },
    {
      role: "super_admin" as UserRole,
      route: "/ciso",
      label: "SuperAdmin (CISO)",
      persona: "Dr. Sarah Lin (CISO)",
      badge: "Executive Zero-Trust Posture",
      desc: "Rotate HSM root signing keys, govern release policies, and arm emergency dual-key overrides.",
      icon: <Award className="w-5 h-5 text-amber-400" />,
      color: "amber",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col lg:flex-row">
      {/* Left Column: Visual System & Telemetry */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--line)] bg-[var(--surface)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-fawn/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <button
            onClick={() => navigateWithCurtain("/", "Sentinel Gate")}
            className="flex items-center gap-3 mb-10 hover:opacity-85 transition-opacity"
          >
            <BrandLogo size="md" showWordmark={true} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fawn/10 border border-fawn/30 text-xs font-mono text-fawn mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>ZERO-TRUST ROLE-BASED ACCESS GATEWAY</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Cryptographically Verified Access to Sentinel Core
          </h1>

          <p className="text-[var(--ink-body)] text-sm mt-3 leading-relaxed max-w-lg">
            Choose your operator role below for instant authenticated access to your dedicated portal, or log in with corporate enterprise credentials.
          </p>

          {/* 4 Role Showcase Preview Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {rolePresets.map((r) => (
              <div
                key={r.role}
                onClick={() => handle1ClickRoleLogin(r)}
                className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] hover:border-fawn/50 cursor-pointer transition-all space-y-1.5 hover:scale-[1.02] shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.icon}
                    <span className="font-bold text-[var(--ink)]">{r.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-fawn" />
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
          <div>Ed25519 HSM Key Attested</div>
        </div>
      </div>

      {/* Right Column: Interactive Role Selector & Form */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex items-center justify-center bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Select Your Operator Portal
            </h2>
            <p className="text-sm text-[var(--ink-body)] mt-1">
              Click any role for instant verified access, or submit credentials.
            </p>
          </div>

          {/* 1-Click Role Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Assigned Security Personas
            </label>
            <div className="grid grid-cols-2 gap-2.5">
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
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-fawn/15 border-fawn text-[var(--ink)] shadow-md"
                        : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-fawn">{r.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-fawn" />}
                    </div>
                    <div className="text-[10px] text-[var(--ink-muted)] truncate">{r.persona}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1.5">
                Operator Identity / Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--ink-muted)]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-sm font-mono focus:border-fawn focus:outline-none focus:ring-1 focus:ring-fawn transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1.5">
                Cryptographic Key / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--ink-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-sm font-mono focus:border-fawn focus:outline-none focus:ring-1 focus:ring-fawn transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-fawn hover:opacity-90 text-black font-mono font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Attesting HSM Nonce...</span>
                </>
              ) : (
                <>
                  <span>Enter {rolePresets.find((p) => p.role === selectedRole)?.label} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigateWithCurtain("/", "Sentinel Gate")}
              className="text-xs font-mono text-[var(--ink-muted)] hover:text-fawn transition-colors"
            >
              ← Return to Main Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
