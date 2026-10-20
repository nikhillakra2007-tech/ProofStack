"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Cpu, Crosshair, Link as LinkIcon, ShieldCheck, 
  Terminal, Activity, Sparkles, ArrowRight, Lock, 
  RefreshCw, CheckCircle2, AlertOctagon 
} from "lucide-react";

export const BentoPillars: React.FC = () => {
  const [tamperTested, setTamperTested] = useState(false);
  const [activeProbe, setActiveProbe] = useState(0);

  const probes = [
    { name: "SQL Blind Time-Delay Probe", payload: "1' AND SLEEP(5)--", result: "BLOCKED (0.04ms)" },
    { name: "SSRF Cloud Metadata Exfil", payload: "http://169.254.169.254/latest/meta-data", result: "PIN_FAIL (Non-Routable)" },
    { name: "Subprocess Argument Injection", payload: "; rm -rf / ;", result: "AST_REJECT (Argv Locked)" },
    { name: "Prototype Pollution / Mass Assign", payload: '{"__proto__": {"admin": true}}', result: "SCHEMA_ENFORCE (400 Bad Req)" }
  ];

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D7BE82]" />
          ARCHITECTURE FOUNDATION
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#FDFBF7]">
          Three Deterministic Defense Pillars
        </h2>
        <p className="text-[#D6D1C4] text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Unlike raw LLM wrappers that emit unverified code snippets, Sentinel Gate combines AST compiler invariants, sandboxed DAST exploits, and cryptographic audit proofs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Neural Nemotron AST Engine */}
        <div className="relative rounded-2xl border border-[#515A47]/40 bg-[#151B13]/80 p-6 md:p-8 flex flex-col justify-between hover:border-[#D7BE82]/50 transition-all duration-300 group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D7BE82]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#D7BE82]/10 border border-[#D7BE82]/30 flex items-center justify-center text-[#D7BE82] mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D7BE82] font-semibold">Pillar I</span>
              <span className="text-xs text-[#515A47]">•</span>
              <span className="text-xs font-mono text-[#9E9889]">NVIDIA Nemotron 70B</span>
            </div>

            <h3 className="text-xl font-bold text-[#FDFBF7] mb-3">
              Neural AST Synthesis
            </h3>
            
            <p className="text-sm text-[#D6D1C4] leading-relaxed mb-6">
              Synthesizes zero-regression patches parsed directly into Abstract Syntax Tree invariants. Bypasses naive string replaces to enforce structural grammar safety.
            </p>
          </div>

          <div className="rounded-xl border border-[#515A47]/40 bg-[#0E120D]/80 p-4 font-mono text-xs text-[#D6D1C4] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#9E9889] border-b border-[#515A47]/40 pb-2">
              <span>AST GRAMMAR PARSER</span>
              <span className="text-[#D7BE82]">INVARIANT LOCK</span>
            </div>
            <div className="text-[#D7BE82]">stmt: Call(Name(&quot;execute&quot;))</div>
            <div className="text-[#9E9889] text-[11px] pl-2 border-l border-[#D7BE82]/40">
              ➜ Transformed: stmt.where(bindparam)
            </div>
            <div className="text-[11px] text-[#D7BE82] flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CWE-89 Grammar Rule Enforced</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Exploit Oracle DAST Probes */}
        <div className="relative rounded-2xl border border-[#515A47]/40 bg-[#151B13]/80 p-6 md:p-8 flex flex-col justify-between hover:border-[#7A4419]/60 transition-all duration-300 group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7A4419]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-xl bg-[#7A4419]/15 border border-[#7A4419]/40 flex items-center justify-center text-[#E9B086] mb-6 group-hover:scale-110 transition-transform">
              <Crosshair className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E9B086] font-semibold">Pillar II</span>
              <span className="text-xs text-[#515A47]">•</span>
              <span className="text-xs font-mono text-[#9E9889]">12 DAST Sandboxes</span>
            </div>

            <h3 className="text-xl font-bold text-[#FDFBF7] mb-3">
              Exploit Oracle Sandbox
            </h3>

            <p className="text-sm text-[#D6D1C4] leading-relaxed mb-6">
              Every synthesized patch is subjected to simulated zero-day assault vectors before code merge. If an adversarial probe slips through, the patch is discarded and resynthesized.
            </p>
          </div>

          {/* Interactive DAST Probe Box */}
          <div className="rounded-xl border border-[#515A47]/40 bg-[#0E120D]/80 p-4 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#9E9889] border-b border-[#515A47]/40 pb-2 mb-2">
              <span>DAST PROBE TESTER</span>
              <button
                onClick={() => setActiveProbe((prev) => (prev + 1) % probes.length)}
                className="text-[#E9B086] hover:text-[#D7BE82] text-[11px] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Next Probe
              </button>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-[#FDFBF7] font-semibold truncate">{probes[activeProbe].name}</div>
              <div className="text-[11px] text-[#9E9889] truncate bg-[#151B13] p-1.5 rounded border border-[#515A47]/30">
                Payload: {probes[activeProbe].payload}
              </div>
              <div className="text-[11px] text-[#D7BE82] font-bold flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D7BE82]" />
                <span>Result: {probes[activeProbe].result}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Cryptographic Merkle Ledger */}
        <div className="relative rounded-2xl border border-[#515A47]/40 bg-[#151B13]/80 p-6 md:p-8 flex flex-col justify-between hover:border-[#D7BE82]/50 transition-all duration-300 group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#515A47]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-xl bg-[#515A47]/20 border border-[#515A47]/40 flex items-center justify-center text-[#D7BE82] mb-6 group-hover:scale-110 transition-transform">
              <LinkIcon className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D7BE82] font-semibold">Pillar III</span>
              <span className="text-xs text-[#515A47]">•</span>
              <span className="text-xs font-mono text-[#9E9889]">SHA-256 Merkle Chain</span>
            </div>

            <h3 className="text-xl font-bold text-[#FDFBF7] mb-3">
              Immutable Audit Ledger
            </h3>

            <p className="text-sm text-[#D6D1C4] leading-relaxed mb-6">
              Cryptographically chains every scan, invariant test, and remediation decision into an append-only ledger. Guarantees SOC2 and ISO-27001 non-repudiation.
            </p>
          </div>

          {/* Interactive Tamper Simulator */}
          <div className="rounded-xl border border-[#515A47]/40 bg-[#0E120D]/80 p-4 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#9E9889] border-b border-[#515A47]/40 pb-2 mb-2">
              <span>CHAIN INTEGRITY</span>
              <button
                onClick={() => setTamperTested(!tamperTested)}
                className="text-[#D7BE82] hover:text-[#FDFBF7] text-[11px] flex items-center gap-1"
              >
                {tamperTested ? "Reset Chain" : "Simulate Tamper"}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-[#9E9889] truncate">
                Root: <span className="text-[#D7BE82]">0x9e8a...3f12</span>
              </div>
              <div className={`p-2 rounded border text-[11px] transition-colors ${
                tamperTested 
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : "bg-[#D7BE82]/10 border-[#D7BE82]/30 text-[#D7BE82]"
              }`}>
                {tamperTested ? (
                  <div className="flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>HASH_MISMATCH: Block #4 corrupt! Chain broken.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D7BE82] shrink-0" />
                    <span>6/6 Blocks Valid • Nonce Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoPillars;
