"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Settings, Cpu, Shield, Key, Save, CheckCircle2, 
  ToggleLeft, ToggleRight, Radio, RefreshCw, KeyRound, Server
} from "lucide-react";

export default function SettingsPage() {
  const [model, setModel] = useState("nvidia/llama-3.1-nemotron-70b-instruct");
  const [temperature, setTemperature] = useState(0.1);
  const [tauNoise, setTauNoise] = useState(0.10);
  const [localFallback, setLocalFallback] = useState(true);
  const [humanReviewRequired, setHumanReviewRequired] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-2 font-semibold">
              <Settings className="w-3.5 h-3.5" />
              <span>SECURITY POLICIES & ENGINE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)]">
              Platform &amp; Model Configuration
            </h1>
            <p className="text-xs text-[var(--ink-body)] mt-1">
              Configure NVIDIA Nemotron parameters, statistical noise gating thresholds, and local execution fallbacks.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Model Engine Section */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] border-b border-[var(--line)] pb-3">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Inference &amp; Grammar Synthesis Engine</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[var(--ink-muted)] block mb-1.5 uppercase tracking-wider text-[11px]">
                  Model Architecture (NVIDIA Nemotron)
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] focus:border-emerald-400 focus:outline-none"
                >
                  <option value="nvidia/llama-3.1-nemotron-70b-instruct">
                    nvidia/llama-3.1-nemotron-70b-instruct (Verified - AST Token Constrained)
                  </option>
                  <option value="nvidia/nemotron-3-super-120b">
                    nvidia/nemotron-3-super-120b (Deep Hypothesis Generation)
                  </option>
                  <option value="nvidia/nemotron-3.5-lightning">
                    nvidia/nemotron-3.5-lightning (Fast Patch Synthesis)
                  </option>
                  <option value="local-rule-engine">
                    deterministic-local-rule-engine (Offline Fallback)
                  </option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[var(--ink-muted)] mb-1">
                  <span>Synthesis Temperature (Deterministic Low Variance):</span>
                  <span className="text-emerald-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.4"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[var(--ink-muted)] mb-1">
                  <span>Statistical Noise Gate Threshold (tau_noise):</span>
                  <span className="text-cyan-400 font-bold">{tauNoise.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.25"
                  step="0.01"
                  value={tauNoise}
                  onChange={(e) => setTauNoise(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">
                  If median absolute deviation (rel_mad) exceeds tau_noise, benchmarks halt as INCONCLUSIVE.
                </div>
              </div>
            </div>
          </div>

          {/* Security & Isolation Section */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] border-b border-[var(--line)] pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Deterministic Policy Controls</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[var(--ink)]">Honest Local Fallback Mode</div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Automatically operate using local deterministic rules when cloud credentials are unset.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalFallback(!localFallback)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${localFallback ? "bg-emerald-500" : "bg-[var(--line)]"}`}
                  aria-label="Toggle honest local fallback mode"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${localFallback ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                <div>
                  <div className="font-bold text-[var(--ink)]">Mandatory Human Review Gate</div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Require developer sign-off before candidate patches can be merged to main.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHumanReviewRequired(!humanReviewRequired)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${humanReviewRequired ? "bg-emerald-500" : "bg-[var(--line)]"}`}
                  aria-label="Toggle mandatory human review gate"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${humanReviewRequired ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
