"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileCode, Cpu, ShieldAlert, Binary, CheckCircle2, 
  ArrowRight, Sparkles, Terminal, Lock, Zap, Layers 
} from "lucide-react";

interface PipelineStep {
  id: string;
  stepNum: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  specs: { label: string; value: string }[];
  codeSnippet: string;
  badge: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingest",
    stepNum: "01",
    title: "AST Parsing & Graph Projection",
    tagline: "Compiler-Level Code Understanding",
    description: "Sentinel Gate uses Tree-Sitter grammars to transform raw source files into comprehensive Abstract Syntax Trees and control-flow reachability graphs, identifying exact taint sinks.",
    icon: <FileCode className="w-5 h-5 text-[#D7BE82]" />,
    badge: "Tree-Sitter AST v0.22",
    specs: [
      { label: "Grammar Depth", value: "Full CST + AST" },
      { label: "Reachability", value: "Inter-procedural" },
      { label: "Taint Tracking", value: "Source-to-Sink" },
    ],
    codeSnippet: `// 01: Invariant Extraction
const ast = parser.parse(sourceCode);
const taintPath = ControlFlow.traceTaint({
  source: req.body.userInput,
  sink: db.queryRaw,
  invariants: ["SQL_PARAMETRIZED", "NO_RAW_CONCAT"]
});`,
  },
  {
    id: "nemotron",
    stepNum: "02",
    title: "NVIDIA Nemotron 70B Synthesis",
    tagline: "Grammar-Constrained Patch Generation",
    description: "Instead of unconstrained probabilistic text generation, Nemotron 70B operates with strict AST node token masks, generating patches that are mathematically guaranteed to parse cleanly.",
    icon: <Cpu className="w-5 h-5 text-[#D7BE82]" />,
    badge: "Nemotron-Ultra-70B",
    specs: [
      { label: "Token Masking", value: "AST Grammar Validated" },
      { label: "Hallucination Rate", value: "0.00% (Constrained)" },
      { label: "Inference Time", value: "840ms on H100" },
    ],
    codeSnippet: `// 02: Nemotron 70B AST Remediation
const patch = await nemotron.synthesizeAST({
  astTarget: taintPath.targetNode,
  remediationRule: "BIND_QUERY_PARAMETERS",
  enforceGrammar: true
});
// Resulting AST Node replaces raw concatenation with prepared statement`,
  },
  {
    id: "dast",
    stepNum: "03",
    title: "Adversarial DAST Sandbox",
    tagline: "12 Automated Exploit Attack Probes",
    description: "Every synthesized patch is hot-loaded into an ephemeral microVM sandbox and hammered with 12 dynamic attack payloads including SQLi, prototype pollution, and timing oracles.",
    icon: <ShieldAlert className="w-5 h-5 text-[#D7BE82]" />,
    badge: "12/12 OWASP Probes",
    specs: [
      { label: "Sandbox Isolation", value: "gVisor MicroVM" },
      { label: "Attack Payloads", value: "12 Exploit Oracles" },
      { label: "Regression Check", value: "Unit Tests Preserved" },
    ],
    codeSnippet: `// 03: Ephemeral Sandbox Verification
const result = await DASTSandbox.executeExploitSuite({
  patchDiff: patch.unifiedDiff,
  vectors: ["SQLI_BLIND", "STACK_SMASH", "PROTOTYPE_POLLUTION"]
});
assert(result.allPassed === true, "Patch rejected: exploit succeeded");`,
  },
  {
    id: "ledger",
    stepNum: "04",
    title: "Merkle Ledger Attestation",
    tagline: "Cryptographic Evidence Stamping",
    description: "Once all AST invariants and DAST probes pass, Sentinel Gate signs the verification metadata with a hardware key and seals it onto an immutable SHA-256 Merkle chain.",
    icon: <Binary className="w-5 h-5 text-[#D7BE82]" />,
    badge: "SHA-256 Immutable",
    specs: [
      { label: "Proof Type", value: "Merkle Inclusion Proof" },
      { label: "Signature", value: "Ed25519 Hardware Seal" },
      { label: "Audit Compliance", value: "SOC2 / FedRAMP Ready" },
    ],
    codeSnippet: `// 04: Merkle Chain Committal
const block = await MerkleLedger.commit({
  patchHash: sha256(patch.code),
  testSuiteEvidence: result.evidenceHash,
  signerRole: "STAFF_AUDITOR",
  timestamp: Date.now()
});
// Ledger Block #9482 sealed permanently`,
  },
];

export function DefensePipeline() {
  const [activeTab, setActiveTab] = useState(0);
  const activeStep = PIPELINE_STEPS[activeTab];

  return (
    <section id="pipeline" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>FOUR-STAGE DETERMINISTIC LIFECYCLE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FDFBF7] tracking-tight">
          How Sentinel Gate Defends Code
        </h2>
        <p className="text-[#9E9889] text-base sm:text-lg mt-4 leading-relaxed">
          From unverified vulnerability to cryptographically signed deployment in under 4 seconds without human bottleneck.
        </p>
      </div>

      {/* Pipeline Navigation Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeTab;
          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(idx)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#1E261B] border-[#D7BE82] shadow-[0_0_20px_rgba(215,190,130,0.2)]"
                  : "bg-[#151B13]/60 border-[#515A47]/40 hover:border-[#515A47] hover:bg-[#151B13]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    isActive
                      ? "bg-[#D7BE82] text-[#0E120D]"
                      : "bg-[#515A47]/30 text-[#9E9889]"
                  }`}
                >
                  {step.stepNum}
                </span>
                <span className="text-[11px] font-mono text-[#9E9889]">
                  {step.badge}
                </span>
              </div>
              <div
                className={`font-bold text-sm tracking-tight ${
                  isActive ? "text-[#FDFBF7]" : "text-[#D6D1C4]"
                }`}
              >
                {step.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Interactive Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[#515A47]/60 bg-gradient-to-b from-[#151B13] to-[#0E120D] p-6 lg:p-8 overflow-hidden shadow-2xl relative"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D7BE82]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Step Details Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D7BE82]/15 border border-[#D7BE82]/40 flex items-center justify-center">
                  {activeStep.icon}
                </div>
                <div>
                  <div className="text-xs font-mono text-[#D7BE82] tracking-wider uppercase">
                    Stage {activeStep.stepNum} Execution
                  </div>
                  <h3 className="text-2xl font-bold text-[#FDFBF7]">
                    {activeStep.title}
                  </h3>
                </div>
              </div>

              <p className="text-[#D6D1C4] text-base leading-relaxed">
                {activeStep.description}
              </p>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {activeStep.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0E120D] border border-[#515A47]/40"
                  >
                    <div className="text-[10px] font-mono text-[#9E9889] uppercase">
                      {spec.label}
                    </div>
                    <div className="text-xs font-bold font-mono text-[#D7BE82] mt-1">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveTab((prev) => (prev + 1) % PIPELINE_STEPS.length)}
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#D7BE82] hover:text-[#EAD6B0] transition-colors"
                >
                  <span>Advance to Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code / Terminal Sandbox Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-[#515A47]/60 bg-[#0E120D] overflow-hidden shadow-inner">
                <div className="px-4 py-3 bg-[#151B13] border-b border-[#515A47]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7A4419]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D7BE82]/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#515A47]" />
                    <span className="font-mono text-xs text-[#9E9889] ml-2">
                      stage_{activeStep.stepNum}_verification.ts
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#D7BE82]">
                    <CheckCircle2 className="w-3 h-3 text-[#D7BE82]" />
                    <span>SYNTAX VERIFIED</span>
                  </div>
                </div>

                <div className="p-4 font-mono text-xs overflow-x-auto text-[#D6D1C4] leading-relaxed">
                  <pre>{activeStep.codeSnippet}</pre>
                </div>

                <div className="px-4 py-2 bg-[#151B13]/80 border-t border-[#515A47]/30 flex items-center justify-between text-[11px] font-mono text-[#9E9889]">
                  <span>Execution Target: H100 GPU Cluster</span>
                  <span className="text-[#D7BE82]">Confidence: 99.98%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
