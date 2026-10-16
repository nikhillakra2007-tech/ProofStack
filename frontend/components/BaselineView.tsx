"use client";

import { Baseline } from "@/lib/api";

export function BaselineView({ baseline }: { baseline: Baseline[] }) {
  if (baseline.length === 0) {
    return (
      <div className="panel">
        <h2 className="text-lg font-semibold mb-2">Baseline</h2>
        <p className="text-ps-ink-2 text-sm">Waiting for baseline...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="text-lg font-semibold mb-2">Baseline & Profile</h2>
      <div className="space-y-2">
        {baseline.map((b) => (
          <div key={b.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span className={`glyph ${b.stability_assessment === "STABLE" ? "glyph-seated" : "glyph-hold"}`} />
              <span className="font-mono text-xs">{b.source_revision.slice(0, 8)}</span>
              <span className="badge badge-focus">{b.stability_assessment || "MEASURING"}</span>
            </div>
            <div className="text-ps-ink-2 text-xs mt-1">
              {b.sample_count} samples | median: {b.median_ns ? `${(b.median_ns / 1e6).toFixed(2)}ms` : "..."} |
              rel_MAD: {b.rel_mad?.toFixed(4) || "..."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
