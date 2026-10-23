"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileCode, Cpu, ShieldAlert, Binary, CheckCircle2, 
  ArrowRight, Sparkles, RefreshCw, AlertOctagon, Terminal
} from "lucide-react";

export const BentoPillars: React.FC = () => {
  const [tamperTested, setTamperTested] = useState(false);

  return (
    <section id="pillars" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-3 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>CORE SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
          Four Pillars of Deterministic Defense
        </h2>
        <p className="text-[var(--ink-body)] text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Generative AI models propose patches, but compiler invariants, dynamic exploit sandboxes, and cryptographic ledgers decide what ships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pillar 1: Analysis */}
        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-200 group shadow-lg">
          <div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <FileCode className="w-5 h-5" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">Pillar 01</span>
              <span className="text-xs text-[var(--ink-muted)]">•</span>
              <span className="text-xs font-mono text-[var(--ink-muted)]">Tree-Sitter AST</span>
            </div>

            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">
              AST Invariant Analysis
            </h3>
            
            <p className="text-xs text-[var(--ink-body)] leading-relaxed mb-5">
              Parses code into concrete syntax trees. Traces exact taint sinks from user input to dangerous execution sinks before proposing fixes.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] text-[var(--ink-body)] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[var(--ink-muted)] border-b border-[var(--line)] pb-1.5">
              <span>TAINT SINK PROJECTION</span>
              <span className="text-emerald-400 font-bold">PARSED</span>
            </div>
            <div className="text-emerald-300">stmt: Call(db.execute)</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Boundary Predicate Set</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Remediation */}
        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-200 group shadow-lg">
          <div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <Cpu className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Pillar 02</span>
              <span className="text-xs text-[var(--ink-muted)]">•</span>
              <span className="text-xs font-mono text-[var(--ink-muted)]">NVIDIA Nemotron 70B</span>
            </div>

            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">
              Neural Patch Remediation
            </h3>

            <p className="text-xs text-[var(--ink-body)] leading-relaxed mb-5">
              Proposes candidate patches formatted to satisfy compiler grammar constraints. Operates via Nebius Token Factory or honest local rule engine fallback.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] text-[var(--ink-body)] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[var(--ink-muted)] border-b border-[var(--line)] pb-1.5">
              <span>SYNTHESIS CHANNEL</span>
              <span className="text-cyan-400 font-bold">ACTIVE</span>
            </div>
            <div className="text-cyan-300">Target: Prepared Statement</div>
            <div className="text-[10px] text-cyan-400 flex items-center gap-1 pt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Candidate Ready for Veto</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Adversarial Validation */}
        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-200 group shadow-lg">
          <div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">Pillar 03</span>
              <span className="text-xs text-[var(--ink-muted)]">•</span>
              <span className="text-xs font-mono text-[var(--ink-muted)]">12 DAST Probes</span>
            </div>

            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">
              Adversarial Validation
            </h3>

            <p className="text-xs text-[var(--ink-body)] leading-relaxed mb-5">
              Hot-loads candidate patches into isolated sandboxes and subjects them to 12 dynamic attack probes (IDOR, SQLi, SSRF). Exploit reproduction triggers immediate veto.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] text-[var(--ink-body)] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[var(--ink-muted)] border-b border-[var(--line)] pb-1.5">
              <span>EXPLOIT INTERLOCK</span>
              <span className="text-amber-400 font-bold">G4 GATE</span>
            </div>
            <div className="text-amber-300">P03 IDOR: Neutralized</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Veto Authority Active</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Auditable Evidence */}
        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col justify-between hover:border-violet-500/50 transition-all duration-200 group shadow-lg">
          <div>
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5">
              <Binary className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold">Pillar 04</span>
              <span className="text-xs text-[var(--ink-muted)]">•</span>
              <span className="text-xs font-mono text-[var(--ink-muted)]">HMAC-SHA256</span>
            </div>

            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">
              Auditable Evidence
            </h3>

            <p className="text-xs text-[var(--ink-body)] leading-relaxed mb-5">
              Cryptographic parent hash chaining seals every telemetry sample, model inference, and gate verdict into an append-only ledger for non-repudiation.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] text-[var(--ink-body)] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[var(--ink-muted)] border-b border-[var(--line)] pb-1.5">
              <span>PROOF LEDGER CHAIN</span>
              <button
                onClick={() => setTamperTested(!tamperTested)}
                className="text-[10px] text-violet-400 hover:text-violet-300 underline font-semibold"
              >
                {tamperTested ? "Reset" : "Test Tamper"}
              </button>
            </div>
            <div className={`text-[10px] truncate ${tamperTested ? "text-red-400 font-bold" : "text-violet-300"}`}>
              {tamperTested ? "ALERT: Parent Hash Mismatch" : "Head: 0x9e8a7c2b5d4f1092"}
            </div>
            <div className="text-[10px] flex items-center gap-1 pt-0.5">
              {tamperTested ? (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-red-400" />
                  Tamper Detected
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Chain Integrity Valid
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoPillars;
