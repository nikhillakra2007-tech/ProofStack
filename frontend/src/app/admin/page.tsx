"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  Server, Cpu, Activity, ShieldAlert, CheckCircle2, 
  ArrowRight, Sliders, RefreshCw, AlertCircle, Play, Database 
} from "lucide-react";

export default function AdminRolePage() {
  const { user } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [rateLimit, setRateLimit] = useState(120);
  const [microVmPool, setMicroVmPool] = useState(16);
  const [isRestarting, setIsRestarting] = useState(false);

  const runners = [
    { id: "runner-us-east-1a", type: "Isolated Container", status: "Active", load: "14%", memory: "1.2 GB / 8 GB" },
    { id: "runner-us-east-1b", type: "Isolated Container", status: "Active", load: "28%", memory: "2.4 GB / 8 GB" },
    { id: "runner-eu-west-1a", type: "Isolated Container", status: "Active", load: "08%", memory: "0.9 GB / 8 GB" },
    { id: "runner-local-dev", type: "Local Process Sandbox", status: "Ready", load: "05%", memory: "0.5 GB / 8 GB" },
  ];

  const handleRestartPool = () => {
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Role Header Banner */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-400 font-semibold">
              <Server className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • OPERATIONS ADMIN CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              DevSecOps Infrastructure &amp; Sandbox Pool Governance
            </h1>
            <p className="text-[var(--ink-body)] text-xs sm:text-sm max-w-2xl leading-relaxed">
              Assigned to <strong>Marcus Vance (Ops Admin)</strong>. Ephemeral sandbox runners, host hardware telemetry probes, and CI/CD webhook dispatchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigateWithCurtain("/dast", "DAST Sandbox")}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>DAST Runner Pool</span>
            </button>
            <button
              onClick={() => navigateWithCurtain("/findings", "Security Findings")}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] transition-all flex items-center gap-2"
            >
              <span>Findings Triage</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Infrastructure Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Active Sandbox Runners</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">4 / 4</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Ephemeral isolated pools</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Host Hardware Probe</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">NVIDIA NVML</div>
            <div className="text-[11px] text-[var(--ink-muted)]">RTX 3050 GPU detected</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Rate Limiting Threshold</div>
            <div className="text-2xl font-bold font-mono text-indigo-400">{rateLimit} req/m</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Leaky bucket limiter</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">Noise Gating (rel_mad)</div>
            <div className="text-2xl font-bold font-mono text-amber-400">0.03 &lt; 0.10</div>
            <div className="text-[11px] text-[var(--ink-muted)]">Statistical stability stable</div>
          </div>
        </div>

        {/* Runner Pools Explorer */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--ink)]">
                Ephemeral Execution Sandbox Runners
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Isolated environments executing untrusted candidate patches and adversarial DAST probes.
              </p>
            </div>

            <button
              onClick={handleRestartPool}
              disabled={isRestarting}
              className="px-4 py-2 rounded-xl bg-[var(--bg)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRestarting ? "animate-spin" : ""}`} />
              <span>{isRestarting ? "Cycling Sandboxes..." : "Cycle Sandbox Pool"}</span>
            </button>
          </div>

          <div className="divide-y divide-[var(--line)] font-mono text-xs">
            {runners.map((r) => (
              <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{r.id}</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">{r.type}</div>
                </div>

                <div className="flex items-center gap-6 text-[11px]">
                  <div>
                    <span className="text-[var(--ink-muted)]">Memory: </span>
                    <span className="text-[var(--ink)]">{r.memory}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ink-muted)]">Load: </span>
                    <span className="text-emerald-400 font-bold">{r.load}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
