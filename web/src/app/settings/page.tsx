"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Settings, Cpu, Shield, Key, Save, CheckCircle2, 
  ToggleLeft, ToggleRight, Radio, RefreshCw 
} from "lucide-react";

export default function SettingsPage() {
  const [model, setModel] = useState("nvidia/llama-3.1-nemotron-70b-instruct");
  const [temperature, setTemperature] = useState(0.1);
  const [airGapped, setAirGapped] = useState(true);
  const [autoApply, setAutoApply] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
              <Settings className="w-3.5 h-3.5" />
              SYSTEM POLICIES
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Platform Configuration
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure Nemotron inference engines, Gate strictness, and air-gapped isolation modes.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-2"
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
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Inference &amp; Grammar Synthesis Engine</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1.5">Model Architecture</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="nvidia/llama-3.1-nemotron-70b-instruct">
                    nvidia/llama-3.1-nemotron-70b-instruct (Recommended - AST Optimized)
                  </option>
                  <option value="nvidia/nemotron-4-340b-instruct">
                    nvidia/nemotron-4-340b-instruct (Extreme Depth / Enterprise)
                  </option>
                  <option value="meta/llama-3.3-70b-instruct">
                    meta/llama-3.3-70b-instruct (Fallback)
                  </option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Synthesis Temperature (Deterministic Low Variance):</span>
                  <span className="text-cyan-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Security & Isolation Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Isolation &amp; Gate Policies</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Air-Gapped Local Inference</div>
                  <div className="text-xs text-slate-400">Zero external network requests; models execute entirely within VPC boundaries.</div>
                </div>
                <button
                  onClick={() => setAirGapped(!airGapped)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${airGapped ? "bg-cyan-500" : "bg-slate-800"}`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${airGapped ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                <div>
                  <div className="text-sm font-medium text-white">Autonomous Pull Request Sign-off</div>
                  <div className="text-xs text-slate-400">Automatically approve PRs if all 8 Sentinel Gates pass with zero regressions.</div>
                </div>
                <button
                  onClick={() => setAutoApply(!autoApply)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${autoApply ? "bg-cyan-500" : "bg-slate-800"}`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${autoApply ? "translate-x-7" : "translate-x-1"}`}
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
