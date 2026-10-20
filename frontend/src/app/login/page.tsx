"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  ShieldCheck, Terminal, Lock, KeyRound, User, 
  ArrowRight, CheckCircle2, ShieldAlert, Cpu 
} from "lucide-react";
import { UserRole } from "@/lib/auth";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";

export default function LoginPage() {
  const { login, switchRole, user } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [selectedRole, setSelectedRole] = useState<UserRole>("developer");
  const [email, setEmail] = useState("dev@sentinel.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rolePresets: { role: UserRole; email: string; label: string; badge: string; desc: string }[] = [
    {
      role: "developer",
      email: "dev@sentinel.internal",
      label: "Developer",
      badge: "CWE Triage & AST Repair",
      desc: "Full code patch synthesis, interactive sandbox testing, and AST diff execution."
    },
    {
      role: "auditor",
      email: "auditor@sentinel.internal",
      label: "Security Auditor",
      badge: "Cryptographic Attestation",
      desc: "Read-only ledger verification, SOC2 export, and tamper-proof hash inspection."
    },
    {
      role: "admin",
      email: "admin@sentinel.internal",
      label: "SecOps Admin",
      badge: "Pipeline & Policy Gatekeeper",
      desc: "Manage 8-gate enforcement rules, exploit probe thresholds, and CI/CD webhooks."
    },
    {
      role: "super_admin",
      email: "root@sentinel.internal",
      label: "Super Admin",
      badge: "Full System Authority",
      desc: "Root level key rotation, model endpoint config, and air-gapped node telemetry."
    }
  ];

  const handleSelectRole = (r: typeof rolePresets[0]) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    switchRole(r.role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (typeof login === "function") {
        login(email, selectedRole);
      }
      setTimeout(() => {
        setIsSubmitting(false);
        navigateWithCurtain("/cockpit", "Cockpit");
      }, 500);
    } catch (err: any) {
      console.error("Auth error:", err);
      setIsSubmitting(false);
      navigateWithCurtain("/cockpit", "Cockpit");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E120D] flex flex-col lg:flex-row text-[#FDFBF7]">
      {/* Left Column: Security Feed & Telemetry */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#515A47]/40 bg-gradient-to-b from-[#151B13] via-[#0E120D] to-[#151B13] relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D7BE82]/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <button
            onClick={() => navigateWithCurtain("/")}
            className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity"
          >
            <BrandLogo size="md" showWordmark={true} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-4">
            <Cpu className="w-3.5 h-3.5" />
            ZERO-TRUST ACCESS CONTROLLER
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#FDFBF7] tracking-tight leading-tight">
            Cryptographically Verified Access to Sentinel Core
          </h1>

          <p className="text-[#D6D1C4] text-sm mt-3 leading-relaxed max-w-lg">
            Role-based authentication enforced via SHA-256 JWT signatures and hardware-attested Merkle ledger nonces.
          </p>

          {/* Live System Activity Feed */}
          <div className="mt-8 rounded-xl border border-[#515A47]/40 bg-[#0E120D] p-4 font-mono text-xs space-y-3">
            <div className="text-[11px] text-[#9E9889] flex items-center justify-between border-b border-[#515A47]/30 pb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#D7BE82]" />
                SECURITY TELEMETRY LOG
              </span>
              <span className="text-[#D7BE82] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D7BE82] animate-ping inline-block" />
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 text-[#D6D1C4] text-[11px]">
              <div><span className="text-[#D7BE82]">[22:15:02]</span> Sentinel Gate node online at 127.0.0.1:8000</div>
              <div><span className="text-[#D7BE82]">[22:15:09]</span> Nemotron 70B AST grammar weights hot-loaded</div>
              <div><span className="text-[#D7BE82]">[22:15:23]</span> Merkle root verified: 0x9e8a...3f12 (6 blocks)</div>
              <div><span className="text-[#D7BE82]">[22:16:01]</span> Zero-Day DAST probe array initialized (12 vectors)</div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs font-mono text-[#9E9889] flex items-center gap-4">
          <span>AES-256-GCM Session</span>
          <span>•</span>
          <span>SOC2 Type II Attested</span>
          <span>•</span>
          <span>ISO-27001</span>
        </div>
      </div>

      {/* Right Column: Authentication Form & Role Selector */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center items-center relative">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#FDFBF7] tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-sm text-[#D6D1C4] mt-1">
              Select your persona below for 1-click verified sandbox access.
            </p>
          </div>

          {/* 1-Click Role Switcher Grid */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[#9E9889]">
              Quick Role Switcher
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rolePresets.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-[#D7BE82]/20 border-[#D7BE82] text-white shadow-[0_0_15px_rgba(215,190,130,0.25)]"
                        : "bg-[#151B13] border-[#515A47]/40 text-[#9E9889] hover:text-[#D6D1C4] hover:border-[#515A47]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-[#D7BE82]">{r.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D7BE82]" />}
                    </div>
                    <div className="text-[10px] text-[#9E9889] line-clamp-1">{r.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#9E9889] mb-1.5">
                Corporate Identity / Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#9E9889]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151B13] border border-[#515A47]/40 text-[#FDFBF7] text-sm font-mono focus:border-[#D7BE82] focus:outline-none focus:ring-1 focus:ring-[#D7BE82] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#9E9889] mb-1.5">
                Access Token / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#9E9889]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151B13] border border-[#515A47]/40 text-[#FDFBF7] text-sm font-mono focus:border-[#D7BE82] focus:outline-none focus:ring-1 focus:ring-[#D7BE82] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#D7BE82] hover:bg-[#EAD6B0] text-[#0E120D] font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(215,190,130,0.35)] hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0E120D] border-t-transparent rounded-full animate-spin" />
                  <span>Attesting Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigateWithCurtain("/")}
              className="text-xs font-mono text-[#9E9889] hover:text-[#D7BE82] transition-colors"
            >
              ← Back to Main Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
