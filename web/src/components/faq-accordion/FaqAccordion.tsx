"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does Sentinel Gate differ from Copilot or standard LLM auto-fixes?",
    a: "Standard LLM tools output probabilistic text completions without structural awareness. Sentinel Gate compiles code into an Abstract Syntax Tree (AST), generates mathematically constrained invariants, subjects candidate patches to 12 automated DAST attack probes, and signs off only when zero bypasses exist."
  },
  {
    q: "What happens if a generated patch breaks functional unit tests?",
    a: "Gate #6 runs a regression test matrix and behavioral fuzzing. If any existing unit test or business logic assertion fails, the candidate patch is immediately aborted and fed back into Nemotron with the trace diagnostics for iterative refinement."
  },
  {
    q: "How is the cryptographic Merkle Ledger verified by SOC2 and ISO auditors?",
    a: "Every scan, vulnerability report, and remediation commit produces a cryptographically signed SHA-256 block linked to the previous block's hash. Auditors can run one single CLI command (`sentinel verify-ledger`) to verify root hash integrity across millions of commits in sub-second time."
  },
  {
    q: "Can Sentinel Gate run in air-gapped or VPC on-prem environments?",
    a: "Yes. Sentinel Gate offers self-hosted deployment on NVIDIA DGX / TensorRT-LLM nodes without any outbound internet access or telemetry exfiltration. All model weights and sandboxes run strictly within your security perimeter."
  },
  {
    q: "Which languages and frameworks are supported out-of-the-box?",
    a: "Python (FastAPI, Django, Flask, SQLAlchemy), TypeScript/JavaScript (Next.js, Express, NestJS), Go, Rust, and Java (Spring Boot). Custom AST grammar plugins can be authored in minutes using our declarative policy SDK."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          ARCHITECTURE FAQ
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#FDFBF7] tracking-tight">
          Frequently Answered Questions
        </h2>
        <p className="text-[#D6D1C4] text-sm mt-2">
          Everything you need to know about deterministic AST patch synthesis and security verification.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? "border-[#D7BE82]/50 bg-[#151B13] shadow-[0_0_20px_rgba(215,190,130,0.12)]" 
                  : "border-[#515A47]/40 bg-[#0E120D]/80 hover:border-[#515A47]"
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
              >
                <span className={`font-semibold text-sm md:text-base ${isOpen ? "text-[#D7BE82]" : "text-[#FDFBF7]"}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#D7BE82]" : "text-[#9E9889]"
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 pt-2 text-sm text-[#D6D1C4] leading-relaxed border-t border-[#515A47]/30">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqAccordion;
