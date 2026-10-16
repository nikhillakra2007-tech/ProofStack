"use client";

import { Gate } from "@/lib/api";

export function GateTable({ gates }: { gates: Gate[] }) {
  if (gates.length === 0) {
    return (
      <div className="panel">
        <h2 className="text-lg font-semibold mb-2">Verification Gates</h2>
        <p className="text-ps-ink-2 text-sm">Waiting for gates...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="text-lg font-semibold mb-2">Verification Gates</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ps-ink-2 border-b border-ps-rule">
            <th className="pb-1">Gate</th>
            <th className="pb-1">Family</th>
            <th className="pb-1">Status</th>
            <th className="pb-1">Probe</th>
          </tr>
        </thead>
        <tbody>
          {gates.map((g) => (
            <tr key={g.id} className="border-b border-ps-rule/50">
              <td className="py-1 font-mono text-xs">{g.gate_id}</td>
              <td className="py-1">{g.family}</td>
              <td className="py-1">
                <GateStatus status={g.status} />
              </td>
              <td className="py-1 font-mono text-xs">{g.probe_id || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GateStatus({ status }: { status: string }) {
  const color =
    status === "PASS" ? "text-ps-seated" :
    status === "FAIL" ? "text-ps-breach" :
    status === "INCONCLUSIVE" ? "text-ps-hold" :
    status === "NOT_APPLICABLE" ? "text-ps-ink-2" :
    "text-ps-notrun";
  return <span className={`badge ${color}`}>{status.replace(/_/g, " ")}</span>;
}
