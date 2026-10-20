"use client";

import React from "react";
import { Check, X, Shield, Sparkles, Scale, AlertTriangle } from "lucide-react";

interface ComparisonRow {
  capability: string;
  category: string;
  sentinelGate: { supported: boolean; detail: string };
  legacySast: { supported: boolean; detail: string };
  probabilisticAi: { supported: boolean; detail: string };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    capability: "Hallucination Resistance",
    category: "Correctness",
    sentinelGate: { supported: true, detail: "100% Invariant Checked (AST Tree-Sitter Mask)" },
    legacySast: { supported: false, detail: "Cannot generate code (detection only)" },
    probabilisticAi: { supported: false, detail: "High hallucination risk (syntax & logical breaks)" },
  },
  {
    capability: "Adversarial DAST Sandbox",
    category: "Exploit Verification",
    sentinelGate: { supported: true, detail: "12 Ephemeral OWASP Attack Probes" },
    legacySast: { supported: false, detail: "Static RegEx pattern matching only" },
    probabilisticAi: { supported: false, detail: "Zero runtime sandbox execution" },
  },
  {
    capability: "Cryptographic Merkle Proof",
    category: "Auditability",
    sentinelGate: { supported: true, detail: "SHA-256 Ledger + Ed25519 Sign-off" },
    legacySast: { supported: false, detail: "Plaintext scan PDF reports" },
    probabilisticAi: { supported: false, detail: "None (Unverified Git commit)" },
  },
  {
    capability: "Autonomous Mean Time to Fix",
    category: "Productivity",
    sentinelGate: { supported: true, detail: "3.8 Seconds Autonomous MTTR" },
    legacySast: { supported: false, detail: "4.2 Days (Manual Dev Backlog)" },
    probabilisticAi: { supported: false, detail: "Manual prompt engineering & review" },
  },
  {
    capability: "Zero-Day Bypass Rate",
    category: "Security",
    sentinelGate: { supported: true, detail: "0.00% Compiler Invariant Guarantee" },
    legacySast: { supported: false, detail: "High false positives & false negatives" },
    probabilisticAi: { supported: false, detail: "Unpredictable security regressions" },
  },
  {
    capability: "Deterministic CI/CD Integration",
    category: "DevOps",
    sentinelGate: { supported: true, detail: "Native GitHub Action / GitLab runner gate" },
    legacySast: { supported: true, detail: "Slow 15-minute blocking pipeline" },
    probabilisticAi: { supported: false, detail: "IDE plugin only, lacks pipeline gate" },
  },
];

export function ComparisonMatrix() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-4">
          <Scale className="w-3.5 h-3.5" />
          <span>TECHNICAL SUPERIORITY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FDFBF7] tracking-tight">
          Deterministic AST vs Alternative Approaches
        </h2>
        <p className="text-[#9E9889] text-base sm:text-lg mt-4 leading-relaxed">
          Why leading security teams replace legacy scanners and probabilistic LLM copilots with deterministic compiler invariants.
        </p>
      </div>

      <div className="rounded-2xl border border-[#515A47]/60 bg-[#151B13]/80 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#515A47]/60 bg-[#0E120D]">
                <th className="p-4 sm:p-5 font-mono text-[#D6D1C4] text-xs font-bold uppercase tracking-wider w-1/3">
                  Capability / Guarantee
                </th>
                <th className="p-4 sm:p-5 font-mono text-[#D7BE82] text-xs font-bold uppercase tracking-wider bg-[#D7BE82]/10 border-x border-[#D7BE82]/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D7BE82]" />
                    <span>Sentinel Gate</span>
                  </div>
                </th>
                <th className="p-4 sm:p-5 font-mono text-[#9E9889] text-xs font-bold uppercase tracking-wider">
                  Legacy SAST (Sonar/Snyk)
                </th>
                <th className="p-4 sm:p-5 font-mono text-[#9E9889] text-xs font-bold uppercase tracking-wider">
                  Probabilistic Copilots
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#515A47]/30 font-sans">
              {COMPARISON_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#1C241B]/50 transition-colors duration-150"
                >
                  <td className="p-4 sm:p-5 font-medium text-[#FDFBF7]">
                    <div className="font-bold text-sm text-[#FDFBF7]">{row.capability}</div>
                    <div className="text-[11px] font-mono text-[#9E9889] mt-0.5">{row.category}</div>
                  </td>

                  {/* Sentinel Gate Column */}
                  <td className="p-4 sm:p-5 bg-[#D7BE82]/5 border-x border-[#D7BE82]/20 font-medium">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#D7BE82] flex items-center justify-center text-[#0E120D] shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-[#FDFBF7] font-semibold text-xs leading-relaxed">
                        {row.sentinelGate.detail}
                      </span>
                    </div>
                  </td>

                  {/* Legacy SAST Column */}
                  <td className="p-4 sm:p-5 text-[#9E9889]">
                    <div className="flex items-start gap-2">
                      {row.legacySast.supported ? (
                        <div className="w-4 h-4 rounded-full bg-[#515A47] flex items-center justify-center text-[#FDFBF7] shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#7A4419]/40 flex items-center justify-center text-[#D6D1C4] shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-[#9E9889]" />
                        </div>
                      )}
                      <span className="text-xs leading-relaxed">{row.legacySast.detail}</span>
                    </div>
                  </td>

                  {/* Probabilistic Copilots Column */}
                  <td className="p-4 sm:p-5 text-[#9E9889]">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#7A4419]/40 flex items-center justify-center text-[#D6D1C4] shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-[#9E9889]" />
                      </div>
                      <span className="text-xs leading-relaxed">{row.probabilisticAi.detail}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
