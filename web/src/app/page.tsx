"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BootSequence } from "@/components/boot-sequence/BootSequence";
import { DemoVideo } from "@/components/demo-video/DemoVideo";
import { HeroTerminal } from "@/components/hero-terminal/HeroTerminal";
import { DefensePipeline } from "@/components/defense-pipeline/DefensePipeline";
import { SentinelRadar } from "@/components/sentinel-radar/SentinelRadar";
import { BentoPillars } from "@/components/bento-pillars/BentoPillars";
import { ResilienceCalc } from "@/components/resilience-calc/ResilienceCalc";
import { ComparisonMatrix } from "@/components/comparison-matrix/ComparisonMatrix";
import { FaqAccordion } from "@/components/faq-accordion/FaqAccordion";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";
import { motion } from "framer-motion";
import { 
  ArrowRight, Play, Terminal, Shield, Cpu, 
  CheckCircle2, Copy, Check, Sparkles, Binary, Lock 
} from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";

export default function HomePage() {
  const [bootFinished, setBootFinished] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const { navigateWithCurtain } = useCurtain();

  const handleCopyCli = () => {
    navigator.clipboard.writeText("curl -fsSL https://get.sentinelgate.dev | bash");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <>
      {/* Boot sequence runs once on initial visit */}
      {!bootFinished && <BootSequence onComplete={() => setBootFinished(true)} />}

      <MainLayout>
        {/* Ambient Top Glow in Palette Colors */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#D7BE82]/15 via-[#7A4419]/10 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* ======================================================== */}
        {/* 1. HERO SECTION                                          */}
        {/* ======================================================== */}
        <section className="pt-24 pb-16 px-4 max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-6 shadow-[0_0_20px_rgba(215,190,130,0.2)]"
          >
            <Shield className="w-3.5 h-3.5 text-[#D7BE82]" />
            <span>NVIDIA NEMOTRON 70B • DETERMINISTIC DEFENSE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FDFBF7] max-w-5xl mx-auto leading-[1.1]"
          >
            Autonomous AST Patching with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D7BE82] via-[#E8CFA0] to-[#B86A2D]">
              Zero-Day Exploit Oracles
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[#D6D1C4] text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed"
          >
            Stop trusting unverified probabilistic code. Sentinel Gate transforms code directly into compiler AST invariants, subjects patches to 12 adversarial DAST probes, and records every sign-off onto an immutable SHA-256 Merkle chain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D7BE82] hover:bg-[#EAD6B0] text-[#0E120D] font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(215,190,130,0.35)] hover:scale-105 active:scale-95"
            >
              <span>Launch Remediation Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#151B13] hover:bg-[#1E261B] border border-[#515A47]/60 text-[#D6D1C4] font-mono font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:border-[#D7BE82]/40"
            >
              <Play className="w-4 h-4 text-[#D7BE82] fill-current" />
              <span>Watch Interactive Walkthrough</span>
            </a>
          </motion.div>

          {/* Quick Telemetry KPI Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 inline-grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#151B13]/70 border border-[#515A47]/40 backdrop-blur-md font-mono text-left shadow-lg"
          >
            <div className="px-3 border-r border-[#515A47]/40">
              <div className="text-xl font-bold text-[#D7BE82]">0.00%</div>
              <div className="text-[11px] text-[#9E9889]">AST Bypass Vector</div>
            </div>
            <div className="px-3 border-r border-[#515A47]/40">
              <div className="text-xl font-bold text-[#A9B79E]">3.8s</div>
              <div className="text-[11px] text-[#9E9889]">Mean Triage Speed</div>
            </div>
            <div className="px-3 border-r border-[#515A47]/40">
              <div className="text-xl font-bold text-[#E9B086]">12/12</div>
              <div className="text-[11px] text-[#9E9889]">OWASP DAST Probes</div>
            </div>
            <div className="px-3">
              <div className="text-xl font-bold text-[#FDFBF7]">SHA-256</div>
              <div className="text-[11px] text-[#9E9889]">Immutable Ledger</div>
            </div>
          </motion.div>
        </section>

        {/* ======================================================== */}
        {/* 2. INTERACTIVE DEMO VIDEO PLAYER                         */}
        {/* ======================================================== */}
        <motion.section
          id="interactive-demo"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <DemoVideo />
        </motion.section>

        {/* ======================================================== */}
        {/* 3. LIVE AST VERIFICATION TERMINAL                        */}
        {/* ======================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <HeroTerminal />
        </motion.section>

        {/* ======================================================== */}
        {/* 4. FOUR-STAGE DEFENSE PIPELINE                           */}
        {/* ======================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <DefensePipeline />
        </motion.section>

        {/* ======================================================== */}
        {/* 5. REAL-TIME THREAT RADAR & ATTACK INTERCEPTOR           */}
        {/* ======================================================== */}
        <motion.section
          id="threat-radar"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SentinelRadar />
        </motion.section>

        {/* ======================================================== */}
        {/* 6. THREE DEFENSE PILLARS (BENTO GRID)                    */}
        {/* ======================================================== */}
        <motion.section
          id="defense-pillars"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <BentoPillars />
        </motion.section>

        {/* ======================================================== */}
        {/* 7. ENTERPRISE ROI & RESILIENCE CALCULATOR                */}
        {/* ======================================================== */}
        <motion.section
          id="resilience-calc"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <ResilienceCalc />
        </motion.section>

        {/* ======================================================== */}
        {/* 8. COMPETITIVE COMPARISON MATRIX                         */}
        {/* ======================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <ComparisonMatrix />
        </motion.section>

        {/* ======================================================== */}
        {/* 9. TECHNICAL FAQ ACCORDION                               */}
        {/* ======================================================== */}
        <motion.section
          id="faq"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <FaqAccordion />
        </motion.section>

        {/* ======================================================== */}
        {/* 10. HIGH-CONVERTING ENTERPRISE CTA SECTION               */}
        {/* ======================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="py-20 px-4 max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-[#D7BE82]/40 bg-gradient-to-b from-[#1E261B] via-[#151B13] to-[#0E120D] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient Gold Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D7BE82]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex justify-center mb-2">
                <BrandLogo size="lg" showWordmark={true} />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FDFBF7] tracking-tight max-w-3xl mx-auto">
                Ready to Eliminate 100% of LLM Hallucinated Security Patches?
              </h2>

              <p className="text-[#D6D1C4] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Deploy Sentinel Gate directly into your CI/CD pipeline or run locally against your production repositories with zero configuration drift.
              </p>

              {/* 1-Click Install Command Pill */}
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0E120D] border border-[#515A47]/60 font-mono text-xs text-[#D7BE82] shadow-inner max-w-md w-full justify-between">
                <span className="truncate">$ curl -fsSL https://get.sentinelgate.dev | bash</span>
                <button
                  onClick={handleCopyCli}
                  className="p-1.5 rounded-md bg-[#151B13] hover:bg-[#1E261B] text-[#D6D1C4] hover:text-[#D7BE82] transition-colors shrink-0"
                  title="Copy installation command"
                >
                  {copiedCli ? (
                    <Check className="w-3.5 h-3.5 text-[#D7BE82]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D7BE82] hover:bg-[#EAD6B0] text-[#0E120D] font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(215,190,130,0.35)] hover:scale-105 active:scale-95"
                >
                  <span>Launch Remediation Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateWithCurtain("/login", "Authentication")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#151B13] hover:bg-[#1E261B] border border-[#515A47]/60 text-[#D6D1C4] font-mono font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:border-[#D7BE82]/40"
                >
                  <Lock className="w-4 h-4 text-[#D7BE82]" />
                  <span>Access Auditor Ledger</span>
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[#9E9889]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D7BE82]" />
                  SOC2 Type II Attested
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D7BE82]" />
                  Hardware Security Module Signed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D7BE82]" />
                  Zero Telemetry Ingestion
                </span>
              </div>
            </div>
          </div>
        </motion.section>
      </MainLayout>
    </>
  );
}
