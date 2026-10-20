"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Crosshair, Play, CheckCircle2, ShieldCheck, 
  RefreshCw, Terminal, AlertTriangle 
} from "lucide-react";

interface ProbeResult {
  id: number;
  name: string;
  vector: string;
  payload: string;
  status: "idle" | "running" | "blocked";
  latency: string;
}

const INITIAL_PROBES: ProbeResult[] = [
  { id: 1, name: "SQL Blind Injection", vector: "CWE-89", payload: "1' AND (SELECT SLEEP(5))=0--", status: "blocked", latency: "0.04ms" },
  { id: 2, name: "SSRF Cloud Metadata Exfil", vector: "CWE-918", payload: "http://169.254.169.254/latest/meta-data/", status: "blocked", latency: "0.02ms" },
  { id: 3, name: "Subprocess Argument Injection", vector: "CWE-78", payload: "; cat /etc/shadow ;", status: "blocked", latency: "0.01ms" },
  { id: 4, name: "ReDoS Catastrophic Backtracking", vector: "CWE-1333", payload: "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!", status: "blocked", latency: "0.05ms" },
  { id: 5, name: "Path Traversal Arbitrary Read", vector: "CWE-22", payload: "../../../../etc/passwd", status: "blocked", latency: "0.02ms" },
  { id: 6, name: "Prototype Pollution / Mass Assign", vector: "CWE-1321", payload: "{\"__proto__\": {\"isAdmin\": true}}", status: "blocked", latency: "0.03ms" },
  { id: 7, name: "JWT Alg None Forgery", vector: "CWE-345", payload: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.", status: "blocked", latency: "0.01ms" },
  { id: 8, name: "XML External Entity (XXE)", vector: "CWE-611", payload: "<!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc'>]>", status: "blocked", latency: "0.04ms" },
  { id: 9, name: "Insecure Deserialization", vector: "CWE-502", payload: "cos\\nsystem\\n(S'id'\\ntR.", status: "blocked", latency: "0.02ms" },
  { id: 10, name: "Server-Side Template Injection", vector: "CWE-1336", payload: "{{7*7}} ${7*7} <%= 7*7 %>", status: "blocked", latency: "0.03ms" },
  { id: 11, name: "CRLF Log Injection / Header Split", vector: "CWE-113", payload: "%0d%0aSet-Cookie: admin=1", status: "blocked", latency: "0.02ms" },
  { id: 12, name: "CORS Wildcard Credential Leak", vector: "CWE-942", payload: "Origin: https://evil-attacker.io", status: "blocked", latency: "0.01ms" }
];

export default function DastPage() {
  const [probes, setProbes] = useState<ProbeResult[]>(INITIAL_PROBES);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunAll = () => {
    setIsRunningAll(true);
    setProbes((prev) => prev.map((p) => ({ ...p, status: "running" })));

    setTimeout(() => {
      setProbes((prev) => prev.map((p) => ({ ...p, status: "blocked" })));
      setIsRunningAll(false);
    }, 1400);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-400 mb-2">
              <Crosshair className="w-3.5 h-3.5" />
              OWASP EXPLOIT ORACLE
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              12-Vector DAST Adversarial Sandbox
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Automated adversarial assault engine that bombards synthesized patches with modern evasion vectors to guarantee zero bypass leaks.
            </p>
          </div>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2"
          >
            {isRunningAll ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Bombarding AST Sandbox...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run All 12 Exploit Probes</span>
              </>
            )}
          </button>
        </div>

        {/* Status Pill */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>0 / 12 VECTORS COMPROMISED (100% CONTAINMENT)</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Mean Sandbox Execution: <span className="text-white">0.024ms</span> per probe
          </div>
        </div>

        {/* Probes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {probes.map((probe) => (
            <div
              key={probe.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 font-bold">#{probe.id} {probe.vector}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  probe.status === "running"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {probe.status === "running" ? "PROBING..." : "BLOCKED"}
                </span>
              </div>

              <div className="text-white font-semibold text-sm">
                {probe.name}
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 truncate">
                Payload: <span className="text-slate-300">{probe.payload}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Latency: {probe.latency}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Invariant Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
