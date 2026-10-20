"use client";

import React from "react";
import { Terminal, Cpu, Github, ExternalLink } from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";

export const Footer: React.FC = () => {
  const { navigateWithCurtain } = useCurtain();

  return (
    <footer className="border-t border-[#515A47]/40 bg-[#0E120D] text-[#9E9889] text-xs py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & status */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <BrandLogo size="md" showWordmark={true} showSubtitle={true} />
          <p className="text-[#9E9889] text-center md:text-left max-w-sm">
            Autonomous AST security verification, exploit oracle sandboxes, and SHA-256 Merkle audit chains.
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#D7BE82]">
            <span className="w-2 h-2 rounded-full bg-[#D7BE82] inline-block animate-pulse" />
            <span>FastAPI Backend Active (Port 8000) • Nemotron 70B Online</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
          <button
            onClick={() => navigateWithCurtain("/cockpit")}
            className="hover:text-[#D7BE82] transition-colors"
          >
            Cockpit
          </button>
          <button
            onClick={() => navigateWithCurtain("/studio")}
            className="hover:text-[#D7BE82] transition-colors"
          >
            Studio
          </button>
          <button
            onClick={() => navigateWithCurtain("/findings")}
            className="hover:text-[#D7BE82] transition-colors"
          >
            Findings
          </button>
          <button
            onClick={() => navigateWithCurtain("/dast")}
            className="hover:text-[#D7BE82] transition-colors"
          >
            DAST Sandbox
          </button>
          <button
            onClick={() => navigateWithCurtain("/ledger")}
            className="hover:text-[#D7BE82] transition-colors"
          >
            Merkle Ledger
          </button>
          <button
            onClick={() => navigateWithCurtain("/login")}
            className="hover:text-[#FDFBF7] transition-colors text-[#D7BE82] font-bold"
          >
            Sign In / Switch Role
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#1C241B] flex flex-col md:flex-row items-center justify-between text-[#736E62] text-[11px] gap-4">
        <div>&copy; {new Date().getFullYear()} Sentinel Gate Core Engineering. Deterministic Defense Platform.</div>
        <div className="flex items-center gap-4">
          <span>SHA-256 Verified</span>
          <span>•</span>
          <span>Zero-Day Resistant</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
