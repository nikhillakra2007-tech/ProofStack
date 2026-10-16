"use client";

import { Gate } from "@/lib/api";

interface GateTableProps {
  gates: Gate[];
}

export function GateTable({ gates }: GateTableProps) {
  if (gates.length === 0) {
    return (
      <div className="panel border border-ps-rule bg-ps-sheet">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ps-ink-2 mb-2">Verification Gates (G0 &ndash; G7)</h2>
        <p className="text-xs text-ps-ink-2 italic">Awaiting gate evaluation results...</p>
      </div>
    );
  }

  const formatEvidence = (g: Gate) => {
    if (g.failure_reason) return g.failure_reason;
    if (!g.evidence) return "-";
    const ev = g.evidence;
    if (ev.speedup !== undefined) return `${Number(ev.speedup).toFixed(1)}x speedup`;
    if (ev.growth_ratio !== undefined) return `growth ratio: ${ev.growth_ratio}`;
    if (ev.reason !== undefined) return String(ev.reason);
    if (ev.tests_passed) return "Unit tests passed (differential equivalence verified)";
    if (ev.no_secrets) return "Clean supply chain (zero secret leaks)";
    if (ev.diff_size_ok) return "Integrity constraints met";
    return JSON.stringify(ev);
  };

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ps-rule">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">Verification Gates (G0 &ndash; G7)</span>
          <span className="text-[11px] text-ps-ink-2 font-mono">Authoritative Catalog</span>
        </div>
        <span className="text-xs text-ps-ink-2 font-mono">
          {gates.filter((g) => g.status === "PASS").length}/{gates.length} Passed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-ps-paper border-b border-ps-rule text-ps-ink-2 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-2 px-3">Gate</th>
              <th className="py-2 px-3">Family</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Requirement</th>
              <th className="py-2 px-3">Probe</th>
              <th className="py-2 px-3">Observation / Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ps-rule font-mono">
            {gates.map((g) => {
              const isPass = g.status === "PASS";
              const isFail = g.status === "FAIL";
              const isHeld = g.status === "INCONCLUSIVE";
              const isNA = g.status === "NOT_APPLICABLE";

              return (
                <tr key={g.id} className="hover:bg-ps-paper/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-ps-ink">{g.gate_id}</td>
                  <td className="py-2 px-3">
                    <span className="badge badge-focus text-[10px] py-0">{g.family}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`badge text-[10px] py-0 ${
                        isPass
                          ? "badge-seated"
                          : isFail
                          ? "badge-breach"
                          : isHeld
                          ? "badge-hold"
                          : isNA
                          ? "badge-notrun"
                          : "badge-notrun"
                      }`}
                    >
                      {g.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-ps-ink-2 text-[11px]">
                    {g.required ? "Mandatory" : "Optional"}
                  </td>
                  <td className="py-2 px-3 text-ps-focus font-bold">{g.probe_id || "-"}</td>
                  <td
                    className={`py-2 px-3 max-w-[280px] truncate ${
                      isFail ? "text-ps-breach font-bold" : "text-ps-ink"
                    }`}
                    title={formatEvidence(g)}
                  >
                    {formatEvidence(g)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
