"use client";

import React from "react";
import { Terminal, Cpu, Shield, Lock, Layers } from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";

export const Footer: React.FC = () => {
  const { navigateWithCurtain } = useCurtain();

  return (
    <footer
      className="border-t py-14 px-6 transition-colors duration-200"
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
        color: "var(--ink-muted)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        {/* Brand & status */}
        <div className="flex flex-col items-start gap-3 max-w-sm">
          <BrandLogo size="md" showWordmark={true} showSubtitle={true} />
          <p className="text-xs leading-relaxed text-[var(--ink-body)]">
            Autonomous AST invariant verification, 12-vector exploit oracles, and SHA-256 immutable Merkle audit ledger for enterprise engineering teams.
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--primary)] mt-1">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] inline-block animate-pulse" />
            <span>FastAPI Core Online • NVIDIA Nemotron 70B Active</span>
          </div>
        </div>

        {/* 4 Dedicated Roles Column */}
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
            Role Workspaces
          </div>
          <button
            onClick={() => navigateWithCurtain("/developer", "Lead Developer")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--azure)] transition-colors"
          >
            • Lead Developer (/developer)
          </button>
          <button
            onClick={() => navigateWithCurtain("/auditor", "Security Auditor")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--gold)] transition-colors"
          >
            • Security Auditor (/auditor)
          </button>
          <button
            onClick={() => navigateWithCurtain("/admin", "Operations Admin")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--emerald)] transition-colors"
          >
            • Operations Admin (/admin)
          </button>
          <button
            onClick={() => navigateWithCurtain("/ciso", "SuperAdmin (CISO)")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--violet)] transition-colors"
          >
            • SuperAdmin CISO (/ciso)
          </button>
        </div>

        {/* Platform Primitives Links */}
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
            Platform Engine
          </div>
          <button
            onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--primary)] transition-colors"
          >
            Remediation Cockpit
          </button>
          <button
            onClick={() => navigateWithCurtain("/studio", "AST Studio")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--primary)] transition-colors"
          >
            AST Invariant Studio
          </button>
          <button
            onClick={() => navigateWithCurtain("/findings", "Security Findings")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--primary)] transition-colors"
          >
            CVE Triage & Findings
          </button>
          <button
            onClick={() => navigateWithCurtain("/dast", "DAST Sandbox")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--primary)] transition-colors"
          >
            Exploit Oracle Sandbox
          </button>
          <button
            onClick={() => navigateWithCurtain("/ledger", "Merkle Ledger")}
            className="text-left text-[var(--ink-body)] hover:text-[var(--primary)] transition-colors"
          >
            SHA-256 Merkle Ledger
          </button>
          <button
            onClick={() => navigateWithCurtain("/login", "Authentication")}
            className="text-left text-[var(--primary)] font-bold hover:underline transition-colors mt-1"
          >
            Operator Sign In / Auth &rarr;
          </button>
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between text-xs gap-4"
        style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}
      >
        <div>&copy; {new Date().getFullYear()} Sentinel Gate Core Engineering. High-Assurance AI Security.</div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-[var(--emerald)]">✓ SHA-256 Cryptographically Bound</span>
          <span>•</span>
          <span className="text-[var(--azure)]">Zero AST Bypass</span>
          <span>•</span>
          <span className="text-[var(--violet)]">SOC2 Attested</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
