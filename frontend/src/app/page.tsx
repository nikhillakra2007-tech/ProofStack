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
  CheckCircle2, Copy, Check, Sparkles, Binary, Lock,
  Users, Key, Server, FileCheck
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

  const roleCards = [
    {
      title: "Lead Developer",
      path: "/developer",
      badge: "AST Invariants",
      color: "var(--azure)",
      accentBorder: "rgba(56, 189, 248, 0.4)",
      desc: "Deep compiler AST inspection, Tree-Sitter grammar syntax validation, and side-by-side patch diff analysis.",
      features: ["Tree-Sitter Syntax Tree", "Zero AST Bypass Invariants", "Direct Patch Sign-Off"],
      icon: Terminal,
    },
    {
      title: "Security Auditor",
      path: "/auditor",
      badge: "Merkle Chains",
      color: "var(--gold)",
      accentBorder: "rgba(245, 158, 11, 0.4)",
      desc: "SHA-256 cryptographic parent hash verification, live adversary tamper injection, and exportable audit packs.",
      features: ["Tamper Proof Chain", "Live Adversary Injection", "Cryptographic Signatures"],
      icon: Shield,
    },
    {
      title: "Operations Admin",
      path: "/admin",
      badge: "gVisor microVMs",
      color: "var(--emerald)",
      accentBorder: "rgba(16, 185, 129, 0.4)",
      desc: "Control ephemeral gVisor microVM execution sandboxes, NVIDIA H100 GPU cluster quotas, and CI/CD webhooks.",
      features: ["gVisor Ephemeral Pools", "NVIDIA H100 GPU Quotas", "Webhook Dispatchers"],
      icon: Server,
    },
    {
      title: "SuperAdmin (CISO)",
      path: "/ciso",
      badge: "Zero-Trust Posture",
      color: "var(--violet)",
      accentBorder: "rgba(168, 85, 247, 0.4)",
      desc: "Enterprise SOC2 Type II, FedRAMP, and ISO 27001 compliance controls with dual-key emergency override gates.",
      features: ["SOC2 / FedRAMP Posture", "Dual-Key Override Gate", "HSM Root Attestation"],
      icon: Lock,
    },
  ];

  return (
    <>
      {/* Boot sequence runs once on initial visit */}
      {!bootFinished && <BootSequence onComplete={() => setBootFinished(true)} />}

      <MainLayout>
        {/* Ambient Top Glow in Cyber Multi-Colors */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-3xl pointer-events-none -z-10"
          style={{
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.08) 40%, transparent 70%)"
          }}
        />

        {/* ======================================================== */}
        {/* 1. HERO SECTION                                          */}
        {/* ======================================================== */}
        <section className="pt-20 pb-14 px-4 max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-6 transition-all"
            style={{
              background: "var(--line)",
              border: "1px solid var(--line-strong)",
              color: "var(--primary)",
              boxShadow: "0 0 24px var(--primary-glow)",
            }}
          >
            <Shield className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            <span>NVIDIA NEMOTRON 70B • DETERMINISTIC DEFENSE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]"
            style={{ color: "var(--ink)" }}
          >
            Autonomous AST Patching with{" "}
            <span className="text-gradient">
              Zero-Day Exploit Oracles
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed"
            style={{ color: "var(--ink-body)" }}
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
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
              style={{
                background: "var(--primary)",
                color: "#030712",
                boxShadow: "0 0 25px var(--primary-glow)",
              }}
            >
              <span>Launch Remediation Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line-strong)",
                color: "var(--ink)",
              }}
            >
              <Play className="w-4 h-4 fill-current" style={{ color: "var(--primary)" }} />
              <span>Watch Interactive Walkthrough</span>
            </a>
          </motion.div>

          {/* Quick Telemetry KPI Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 inline-grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl backdrop-blur-md font-mono text-left shadow-lg border"
            style={{
              background: "var(--surface-raised)",
              borderColor: "var(--line)",
            }}
          >
            <div className="px-3 border-r" style={{ borderColor: "var(--line)" }}>
              <div className="text-xl font-bold" style={{ color: "var(--azure)" }}>0.00%</div>
              <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>AST Bypass Vector</div>
            </div>
            <div className="px-3 border-r" style={{ borderColor: "var(--line)" }}>
              <div className="text-xl font-bold" style={{ color: "var(--emerald)" }}>3.8s</div>
              <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Mean Triage Speed</div>
            </div>
            <div className="px-3 border-r" style={{ borderColor: "var(--line)" }}>
              <div className="text-xl font-bold" style={{ color: "var(--gold)" }}>12/12</div>
              <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>OWASP DAST Probes</div>
            </div>
            <div className="px-3">
              <div className="text-xl font-bold" style={{ color: "var(--violet)" }}>SHA-256</div>
              <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Immutable Ledger</div>
            </div>
          </motion.div>
        </section>

        {/* ======================================================== */}
        {/* 2. DEDICATED ROLE WORKSPACES - 4 OPERATOR ROLES         */}
        {/* ======================================================== */}
        <section className="mb-20 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-2"
              style={{
                background: "var(--line)",
                color: "var(--primary)",
                border: "1px solid var(--line-strong)",
              }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Multi-Persona Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
              Four Dedicated Role Workspaces
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto mt-2" style={{ color: "var(--ink-body)" }}>
              Every operator has an isolated security primitive. Choose your role portal to inspect AST invariants, audit Merkle chains, configure microVM pools, or review zero-trust compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {roleCards.map((rc) => {
              const IconComponent = rc.icon;
              return (
                <div
                  key={rc.path}
                  className="rounded-2xl p-6 flex flex-col justify-between border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--line)",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${rc.color}15`,
                          border: `1px solid ${rc.accentBorder}`,
                          color: rc.color,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          background: `${rc.color}15`,
                          color: rc.color,
                          border: `1px solid ${rc.accentBorder}`,
                        }}
                      >
                        {rc.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors" style={{ color: "var(--ink)" }}>
                      {rc.title}
                    </h3>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--ink-body)" }}>
                      {rc.desc}
                    </p>

                    <div className="space-y-1.5 mb-6">
                      {rc.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-[11px] font-mono" style={{ color: "var(--ink-muted)" }}>
                          <span style={{ color: rc.color }}>•</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateWithCurtain(rc.path, `${rc.title} Workspace`)}
                    className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150"
                    style={{
                      background: "var(--line)",
                      border: "1px solid var(--line-strong)",
                      color: "var(--ink)",
                    }}
                  >
                    <span>Enter {rc.title.split(" ")[0]} Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: rc.color }} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. INTERACTIVE DEMO VIDEO PLAYER                         */}
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
        {/* 4. LIVE AST VERIFICATION TERMINAL                        */}
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
        {/* 5. FOUR-STAGE DEFENSE PIPELINE                           */}
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
        {/* 6. REAL-TIME THREAT RADAR & ATTACK INTERCEPTOR           */}
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
        {/* 7. THREE DEFENSE PILLARS (BENTO GRID)                    */}
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
        {/* 8. ENTERPRISE ROI & RESILIENCE CALCULATOR                */}
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
        {/* 9. COMPETITIVE COMPARISON MATRIX                         */}
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
        {/* 10. TECHNICAL FAQ ACCORDION                              */}
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
        {/* 11. HIGH-CONVERTING ENTERPRISE CTA SECTION               */}
        {/* ======================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="py-16 px-4 max-w-5xl mx-auto"
        >
          <div
            className="rounded-3xl border p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl"
            style={{
              background: "var(--surface)",
              borderColor: "var(--line-strong)",
            }}
          >
            {/* Ambient Multi-Color Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] blur-3xl pointer-events-none"
              style={{
                background: "radial-gradient(circle, var(--primary-glow) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)"
              }}
            />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex justify-center mb-2">
                <BrandLogo size="lg" showWordmark={true} />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto" style={{ color: "var(--ink)" }}>
                Ready to Eliminate 100% of LLM Hallucinated Security Patches?
              </h2>

              <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--ink-body)" }}>
                Deploy Sentinel Gate directly into your CI/CD pipeline or run locally against your production repositories with zero configuration drift.
              </p>

              {/* 1-Click Install Command Pill */}
              <div
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner max-w-md w-full justify-between"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  color: "var(--primary)",
                }}
              >
                <span className="truncate">$ curl -fsSL https://get.sentinelgate.dev | bash</span>
                <button
                  onClick={handleCopyCli}
                  className="p-1.5 rounded-md transition-colors shrink-0"
                  style={{
                    background: "var(--surface)",
                    color: "var(--ink)",
                  }}
                  title="Copy installation command"
                >
                  {copiedCli ? (
                    <Check className="w-3.5 h-3.5" style={{ color: "var(--emerald)" }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    background: "var(--primary)",
                    color: "#030712",
                    boxShadow: "0 0 25px var(--primary-glow)",
                  }}
                >
                  <span>Launch Remediation Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateWithCurtain("/login", "Authentication")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    color: "var(--ink)",
                  }}
                >
                  <Lock className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  <span>Access Authentication & Roles</span>
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-xs" style={{ color: "var(--ink-muted)" }}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--emerald)" }} />
                  SOC2 Type II Attested
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--azure)" }} />
                  Hardware Security Module Signed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--violet)" }} />
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
