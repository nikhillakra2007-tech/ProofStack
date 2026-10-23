"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroTerminal } from "@/components/hero-terminal/HeroTerminal";
import { BentoPillars } from "@/components/bento-pillars/BentoPillars";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";
import { motion } from "framer-motion";
import { 
  ArrowRight, Shield, Cpu, CheckCircle2, 
  Lock, Terminal, Server, ShieldCheck, 
  Sparkles, LogIn
} from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";

export default function HomePage() {
  const { navigateWithCurtain } = useCurtain();

  return (
    <MainLayout>
      {/* Ambient Top Glow in Restrained Emerald / Cyan */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] blur-3xl pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 70%)"
        }}
      />

      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="pt-16 pb-12 px-4 max-w-6xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-6 transition-all"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            color: "var(--emerald)",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
          }}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>DETERMINISTIC CODE REMEDIATION & EXPLOIT ORACLE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] text-[var(--ink)]"
        >
          Find vulnerabilities. <br />
          <span className="text-gradient">Verify the fix.</span> Prove the result.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed text-[var(--ink-body)]"
        >
          Generative models propose speedups or candidate patches. Sentinel Gate transforms code into compiler AST invariants, subjects fixes to 12 adversarial DAST probes, and anchors every sign-off in an immutable HMAC-SHA256 ledger.
        </motion.p>

        {/* Primary Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={() => navigateWithCurtain("/login", "Sign In")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95"
            style={{
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)",
            }}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#preview"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--line-strong)] text-[var(--ink)] hover:border-emerald-500/60"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Inspect Live Verification Demo</span>
          </a>
        </motion.div>

        {/* System Architecture Telemetry Pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 inline-grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl backdrop-blur-md font-mono text-left shadow-lg border border-[var(--line)] bg-[var(--surface-raised)]"
        >
          <div className="px-3 border-r border-[var(--line)]">
            <div className="text-xl font-bold text-emerald-400">AST Invariant</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Compiler Taint Check</div>
          </div>
          <div className="px-3 border-r border-[var(--line)]">
            <div className="text-xl font-bold text-cyan-400">Nemotron 70B</div>
            <div className="text-[11px] text-[var(--ink-muted)]">NVIDIA / Local Fallback</div>
          </div>
          <div className="px-3 border-r border-[var(--line)]">
            <div className="text-xl font-bold text-amber-400">12 Probes</div>
            <div className="text-[11px] text-[var(--ink-muted)]">OWASP DAST Sandbox</div>
          </div>
          <div className="px-3">
            <div className="text-xl font-bold text-violet-400">HMAC-SHA256</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Tamper-Evident Ledger</div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. MEANINGFUL LIVE PRODUCT DEMO PREVIEW                  */}
      {/* ======================================================== */}
      <section id="preview" className="mb-16 scroll-mt-20">
        <HeroTerminal />
      </section>

      {/* ======================================================== */}
      {/* 3. FOUR PILLARS OF DEFENSE                               */}
      {/* ======================================================== */}
      <section id="pillars" className="mb-16 scroll-mt-20">
        <BentoPillars />
      </section>

      {/* ======================================================== */}
      {/* 4. CLEAN ACCESS CALL TO ACTION                           */}
      {/* ======================================================== */}
      <section className="py-12 px-4 max-w-5xl mx-auto mb-12">
        <div className="rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 70%)"
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex justify-center mb-1">
              <BrandLogo size="lg" showWordmark={true} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto text-[var(--ink)]">
              Deterministic Remediation for High-Assurance Code
            </h2>

            <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-[var(--ink-body)]">
              Sign in with your assigned operator clearance to access your tailored workspace, verify compiler AST invariants, and review cryptographic attestation records.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigateWithCurtain("/login", "Sign In")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95"
                style={{
                  boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)",
                }}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Operator Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[var(--ink-muted)]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Deterministic AST Invariants
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                12-Vector DAST Sandbox
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                HMAC-SHA256 Evidence Ledger
              </span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
