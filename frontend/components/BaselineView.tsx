"use client";

import { Baseline } from "@/lib/api";

interface BaselineViewProps {
  baseline: Baseline[];
  taskThreshold?: number;
}

export function BaselineView({ baseline, taskThreshold = 0.1 }: BaselineViewProps) {
  if (baseline.length === 0) {
    return (
      <div className="panel border border-ps-rule bg-ps-sheet">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ps-ink-2 mb-2">1. Baseline & Noise Profile</h2>
        <p className="text-xs text-ps-ink-2 italic">Awaiting baseline measurement execution...</p>
      </div>
    );
  }

  const b = baseline[0];
  const isStable = b.stability_assessment === "STABLE";
  const medianMs = b.median_ns ? b.median_ns / 1_000_000 : null;

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ps-rule">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">1. Baseline & Noise Profile</span>
          <span className="text-[11px] text-ps-ink-2 font-mono">Empirical Reproducibility</span>
        </div>
        <span
          className={`badge ${
            isStable ? "badge-seated" : "badge-breach"
          } font-mono text-xs`}
        >
          {b.stability_assessment || "MEASURING"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-ps-paper p-2 rounded-sm border border-ps-rule">
          <span className="text-ps-ink-2 block font-mono text-[11px]">Median Latency</span>
          <span className="font-mono font-bold text-sm text-ps-ink">
            {medianMs !== null ? `${medianMs.toFixed(3)} ms` : "..."}
          </span>
        </div>

        <div className="bg-ps-paper p-2 rounded-sm border border-ps-rule">
          <span className="text-ps-ink-2 block font-mono text-[11px]">Relative MAD</span>
          <span
            className={`font-mono font-bold text-sm ${
              b.rel_mad !== null && b.rel_mad <= taskThreshold ? "text-ps-seated" : "text-ps-breach"
            }`}
          >
            {b.rel_mad !== null ? b.rel_mad.toFixed(4) : "..."}
          </span>
          <span className="text-[10px] text-ps-ink-2 block">max: {taskThreshold}</span>
        </div>

        <div className="bg-ps-paper p-2 rounded-sm border border-ps-rule">
          <span className="text-ps-ink-2 block font-mono text-[11px]">Sample Count</span>
          <span className="font-mono font-bold text-sm text-ps-ink">{b.sample_count} runs</span>
          <span className="text-[10px] text-ps-ink-2 block">warmup purged</span>
        </div>

        <div className="bg-ps-paper p-2 rounded-sm border border-ps-rule">
          <span className="text-ps-ink-2 block font-mono text-[11px]">Execution Sandbox</span>
          <span className="font-mono font-bold text-xs truncate block text-ps-ink">
            {b.execution_backend || "local"}
          </span>
          <span className="text-[10px] text-ps-ink-2 block">rev: {b.source_revision.slice(0, 8)}</span>
        </div>
      </div>

      {/* Variance Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-ps-ink-2 mb-1">
          <span>Variance Gate (rel_MAD &le; {taskThreshold})</span>
          <span>{isStable ? "Acceptable empirical jitter" : "High noise threshold exceeded"}</span>
        </div>
        <div className="w-full bg-ps-paper h-2 rounded-full overflow-hidden border border-ps-rule relative">
          <div
            className={`h-full ${isStable ? "bg-ps-seated" : "bg-ps-breach"}`}
            style={{ width: `${Math.min(100, ((b.rel_mad || 0) / (taskThreshold * 2)) * 100)}%` }}
          />
          {/* Threshold marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-ps-ink z-10" title="Threshold: 0.10" />
        </div>
      </div>
    </div>
  );
}
