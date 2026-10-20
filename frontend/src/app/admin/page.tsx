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
    { id: "runner-us-east-1a", type: "gVisor microVM", status: "Active", load: "14%", memory: "1.2 GB / 8 GB" },
    { id: "runner-us-east-1b", type: "gVisor microVM", status: "Active", load: "28%", memory: "2.4 GB / 8 GB" },
    { id: "runner-eu-west-1a", type: "gVisor microVM", status: "Active", load: "08%", memory: "0.9 GB / 8 GB" },
    { id: "runner-ap-northeast-1", type: "gVisor microVM", status: "Idle", load: "02%", memory: "0.4 GB / 8 GB" },
  ];

  const handleRestartPool = () => {
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
    }, 1200);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Role Header Banner */}
        <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-gradient-to-r from-surface via-bg to-surface p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-400">
              <Server className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • OPERATIONS ADMIN CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              DevSecOps Infrastructure & Sandbox Pool Governance
            </h1>
            <p className="text-ink-body text-sm max-w-2xl leading-relaxed">
              Assigned to <strong>Marcus Vance (Ops Admin)</strong>. Ephemeral microVM sandboxes, NVIDIA H100 inference quotas, and live CI/CD pipeline triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigateWithCurtain("/dast", "DAST Sandbox")}
              className="px-4 py-2.5 rounded-xl bg-fawn hover:opacity-90 text-black text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>DAST Runner Pool</span>
            </button>
            <button
              onClick={() => navigateWithCurtain("/findings", "Security Findings")}
              className="px-4 py-2.5 rounded-xl bg-surface hover:bg-card-bg border border-white/10 text-xs font-mono transition-all flex items-center gap-2"
            >
              <span>Findings Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Infrastructure Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Active MicroVMs</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">16 / 16</div>
            <div className="text-[11px] text-ink-muted">0 queued jobs</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">H100 GPU Quota</div>
            <div className="text-2xl font-bold font-mono text-fawn">78.4%</div>
            <div className="text-[11px] text-ink-muted">8.2k tokens/sec</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">DAST Probes Run</div>
            <div className="text-2xl font-bold font-mono text-azure">1,482</div>
            <div className="text-[11px] text-ink-muted">Today across 12 repos</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-surface space-y-1">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Mean Isolation Boot</div>
            <div className="text-2xl font-bold font-mono text-purple-400">180ms</div>
            <div className="text-[11px] text-ink-muted">gVisor runtime sandbox</div>
          </div>
        </div>

        {/* Main Admin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Runner Status Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Ephemeral Sandbox MicroVM Nodes
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Real-time containerized runners executing 12 DAST exploit suites.
                  </p>
                </div>

                <button
                  onClick={handleRestartPool}
                  disabled={isRestarting}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? "animate-spin" : ""}`} />
                  <span>Pool Health Check</span>
                </button>
              </div>

              <div className="divide-y divide-white/5 font-mono text-xs">
                {runners.map((r) => (
                  <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{r.id}</span>
                      </div>
                      <div className="text-[11px] text-ink-muted">{r.type}</div>
                    </div>

                    <div className="flex items-center gap-6 text-[11px]">
                      <div>
                        <span className="text-ink-muted">CPU Load: </span>
                        <span className="font-semibold text-fawn">{r.load}</span>
                      </div>
                      <div>
                        <span className="text-ink-muted">Memory: </span>
                        <span>{r.memory}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quota & Throttling Sliders */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-fawn font-mono">
                Resource Throttles & Quotas
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-ink-body">
                    <span>Token Ingestion Cap:</span>
                    <span className="font-bold text-fawn">{rateLimit} req/min</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full accent-fawn cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-ink-body">
                    <span>Sandbox Concurrency:</span>
                    <span className="font-bold text-fawn">{microVmPool} instances</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="2"
                    value={microVmPool}
                    onChange={(e) => setMicroVmPool(Number(e.target.value))}
                    className="w-full accent-fawn cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-card-bg border border-white/10 space-y-2 mt-4">
                  <div className="font-bold text-ink">CI/CD Webhook Status</div>
                  <div className="text-[11px] text-ink-muted leading-relaxed">
                    Connected to GitHub Actions & GitLab CI. Automatically dispatches verification runs upon pull requests.
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>2 Webhooks Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
