"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  Code2, Terminal, Play, CheckCircle2, ShieldCheck, 
  ArrowRight, FileCode, Cpu, Layers, Bug, RefreshCw 
} from "lucide-react";

export default function DeveloperRolePage() {
  const { session, role, switchRole } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [selectedLanguage, setSelectedLanguage] = useState<"typescript" | "python" | "rust">("typescript");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const sampleDiff = {
    vulnerable: `// VULNERABLE: Direct string interpolation in SQL query
async function getUserRecord(req: Request, res: Response) {
  const { userId } = req.query;
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  const result = await db.raw(query); // <-- CWE-89 SQL Injection
  return res.json(result);
}`,
    hardened: `// HARDENED: Tree-Sitter AST parameterized binding invariant
async function getUserRecord(req: Request, res: Response) {
  const { userId } = req.query;
  // Invariant verified: Parameterized binding prevents taint propagation
  const result = await db('users')
    .where({ id: String(userId) })
    .first();
  return res.json(result);
}`,
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 1200);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Role Header Banner */}
        <div
          className="rounded-2xl border p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line-strong)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(56, 189, 248, 0.12)" }}
          />

          <div className="space-y-3 relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase"
              style={{
                background: "rgba(56, 189, 248, 0.12)",
                color: "var(--azure)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • LEAD DEVELOPER WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
              Compiler AST Invariant & Patch Synthesis Workspace
            </h1>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "var(--ink-body)" }}>
              Assigned to <strong>Alex Chen (Staff Dev)</strong>. Autonomous AST grammar parsing, token-masked neural patch generation, and isolated unit test verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigateWithCurtain("/studio", "AST Studio")}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
              style={{
                background: "var(--primary)",
                color: "#030712",
              }}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Open AST Studio</span>
            </button>
            <button
              onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
              className="px-4 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2"
              style={{
                background: "var(--line)",
                borderColor: "var(--line-strong)",
                color: "var(--ink)",
              }}
            >
              <span>Cockpit Diff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Developer Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Compiler Tree & Invariants */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="rounded-2xl border p-5 space-y-4"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--line)" }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "var(--azure)" }}>
                  Target AST Grammar
                </span>
                <span className="text-[11px] font-mono" style={{ color: "var(--ink-muted)" }}>
                  Tree-Sitter v0.22
                </span>
              </div>

              {/* Language Selector */}
              <div className="grid grid-cols-3 gap-2">
                {(["typescript", "python", "rust"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className="py-2 text-xs font-mono rounded-lg border transition-all capitalize"
                    style={{
                      background: selectedLanguage === lang ? "var(--azure)" : "var(--line)",
                      color: selectedLanguage === lang ? "#030712" : "var(--ink-body)",
                      borderColor: selectedLanguage === lang ? "var(--azure)" : "var(--line)",
                      fontWeight: selectedLanguage === lang ? 700 : 500,
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5 pt-2 font-mono text-xs">
                <div className="p-3 rounded-xl border space-y-1" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                  <div className="text-[10px] uppercase font-bold" style={{ color: "var(--ink-muted)" }}>AST Invariant Rule #1</div>
                  <div className="font-semibold" style={{ color: "var(--azure)" }}>NO_UNPARAMETRIZED_SINK</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-body)" }}>Guarantees query strings are compiled to static prepared templates.</div>
                </div>

                <div className="p-3 rounded-xl border space-y-1" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                  <div className="text-[10px] uppercase font-bold" style={{ color: "var(--ink-muted)" }}>AST Invariant Rule #2</div>
                  <div className="font-semibold" style={{ color: "var(--azure)" }}>TENANCY_FILTER_PRESERVED</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-body)" }}>Ensures tenant isolation predicates cannot be stripped by LLM.</div>
                </div>

                <div className="p-3 rounded-xl border space-y-1" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                  <div className="text-[10px] uppercase font-bold" style={{ color: "var(--ink-muted)" }}>AST Invariant Rule #3</div>
                  <div className="font-semibold" style={{ color: "var(--azure)" }}>SAFE_BUFFER_ALLOCATION</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-body)" }}>Enforces heap boundaries and limits maximum slice dimensions.</div>
                </div>
              </div>
            </div>

            {/* Quick Developer Telemetry */}
            <div
              className="rounded-2xl border p-5 space-y-3 font-mono text-xs"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="text-xs font-bold" style={{ color: "var(--ink)" }}>Dev Environment Health</div>
              <div className="flex justify-between py-1.5 border-b" style={{ borderColor: "var(--line)" }}>
                <span style={{ color: "var(--ink-muted)" }}>Active Runner:</span>
                <span style={{ color: "var(--emerald)" }}>gVisor MicroVM #08 (Idle)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b" style={{ borderColor: "var(--line)" }}>
                <span style={{ color: "var(--ink-muted)" }}>Model Endpoint:</span>
                <span style={{ color: "var(--azure)" }}>Nemotron 70B (840ms latency)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span style={{ color: "var(--ink-muted)" }}>Unit Test Coverage:</span>
                <span style={{ color: "var(--ink)" }}>98.4% (0 regressions)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Remediation Studio */}
          <div className="lg:col-span-8 space-y-6">
            <div
              className="rounded-2xl border p-6 space-y-6"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                    Active Defect Remediation: CVE-2024-8921 (SQLi)
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                    Target File: <code>src/api/users/controller.ts:42</code>
                  </p>
                </div>

                <button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing}
                  className="px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                  style={{
                    background: "var(--primary)",
                    color: "#030712",
                  }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? "animate-spin" : ""}`} />
                  <span>{isSynthesizing ? "Re-Synthesizing AST..." : "Re-Synthesize Invariant"}</span>
                </button>
              </div>

              {/* Side-by-side Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-red-400 border-b border-red-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5" />
                      Vulnerable Implementation
                    </span>
                    <span className="text-[10px] uppercase">AST Taint</span>
                  </div>
                  <pre className="font-mono text-xs text-red-400 leading-relaxed overflow-x-auto p-3 rounded-lg" style={{ background: "var(--bg)" }}>
                    <code>{sampleDiff.vulnerable}</code>
                  </pre>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Nemotron AST Invariant
                    </span>
                    <span className="text-[10px] uppercase">Zero-Day Safe</span>
                  </div>
                  <pre className="font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto p-3 rounded-lg" style={{ background: "var(--bg)" }}>
                    <code>{sampleDiff.hardened}</code>
                  </pre>
                </div>
              </div>

              {/* Invariant Verification Bar */}
              <div
                className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--line)",
                }}
              >
                <div className="flex items-center gap-2" style={{ color: "var(--emerald)" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold">AST Grammar Constraints Verified</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--ink-muted)" }}>
                  <span>AST Nodes: 184</span>
                  <span>Taint Depth: 0</span>
                  <span>Tokens Masked: 38</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
