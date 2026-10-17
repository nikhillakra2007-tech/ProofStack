"use client";

import { Finding } from "@/lib/api";

interface Patch {
  id: string;
  cycle_number: number;
  validation_status: string | null;
  diff_text?: string;
  line_count: number;
  diff_sha256?: string;
  changed_files?: string[];
  review_status?: string | null;
}

interface PatchViewProps {
  patches: Patch[];
  findings: Finding[];
  onTriggerPatchProposal?: () => void;
  proposingPatch?: boolean;
}

export function PatchView({
  patches,
  findings,
  onTriggerPatchProposal,
  proposingPatch = false,
}: PatchViewProps) {
  if (patches.length === 0 && findings.length === 0) {
    return (
      <div className="panel border border-ps-rule bg-ps-sheet space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">3. Candidate Patch & Exploit Inspector</h2>
          {onTriggerPatchProposal && (
            <button
              onClick={onTriggerPatchProposal}
              disabled={proposingPatch}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded border border-ps-focus bg-ps-paper hover:bg-ps-focus/10 transition-colors"
            >
              {proposingPatch ? "Synthesizing..." : "Propose Remediation Patch"}
            </button>
          )}
        </div>
        <p className="text-xs text-ps-ink-2 italic">Awaiting candidate patch synthesis or DAST probe execution...</p>
      </div>
    );
  }

  const activePatch = patches[0];
  const exploitedFindings = findings.filter((f) => f.found);

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-ps-rule">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">3. Candidate Patch & Exploit Inspector</span>
          <span className="text-[11px] text-ps-ink-2 font-mono">AST & DAST Probes</span>
        </div>
        <div className="flex items-center gap-2">
          {activePatch && (
            <span className="badge badge-focus font-mono text-xs">
              Cycle {activePatch.cycle_number} ({activePatch.line_count} lines)
            </span>
          )}
          {onTriggerPatchProposal && (
            <button
              onClick={onTriggerPatchProposal}
              disabled={proposingPatch}
              className="px-2 py-0.5 text-[11px] font-mono rounded border border-ps-rule hover:bg-ps-focus/10 transition-colors"
              title="Synthesize new remediation patch cycle"
            >
              {proposingPatch ? "..." : "New Patch Cycle"}
            </button>
          )}
        </div>
      </div>

      {/* Exploit Breaches / Findings Banner */}
      {exploitedFindings.length > 0 && (
        <div className="p-3 bg-ps-breach/10 border border-ps-breach/30 rounded-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-ps-breach flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ps-breach animate-pulse" />
              DAST Exploit Proven in Candidate Patch
            </span>
            <span className="text-[11px] font-mono text-ps-breach font-bold">
              {exploitedFindings.length} Breach Detected
            </span>
          </div>

          {exploitedFindings.map((f) => {
            const metrics = f.metrics as Record<string, unknown> | undefined;
            const leaks = metrics?.leaks as Array<{ attacker: string; object: number; victim: string }> | undefined;
            return (
              <div key={f.id} className="text-xs font-mono bg-ps-paper/90 p-2 rounded-sm border border-ps-breach/20">
                <div className="flex items-center justify-between text-ps-ink">
                  <span className="font-bold text-ps-breach">{f.probe_id} — EXPLOIT_PROVEN</span>
                  <span className="text-[10px] text-ps-ink-2">fingerprint: {f.fingerprint || "auto"}</span>
                </div>
                {leaks && leaks.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="text-[11px] text-ps-ink-2">Data Leakage Trace:</div>
                    {leaks.map((leak, idx) => (
                      <div key={idx} className="text-[11px] text-ps-breach pl-2 border-l border-ps-breach">
                        Attacker &quot;{leak.attacker}&quot; successfully accessed Object #{leak.object} owned by &quot;{leak.victim}&quot;
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Code Diff Display */}
      {activePatch?.diff_text ? (
        <div>
          <div className="text-xs font-bold text-ps-ink-2 uppercase tracking-wide mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>Synthesized Candidate Diff</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                {activePatch.review_status || "AWAITING_VERIFICATION"}
              </span>
            </span>
            <span className="text-[11px] font-mono text-ps-ink-2">{activePatch.validation_status}</span>
          </div>
          <div className="bg-ps-paper p-3 rounded-sm border border-ps-rule overflow-x-auto font-mono text-xs max-h-72 overflow-y-auto">
            {activePatch.diff_text.split("\n").map((line, idx) => {
              const isAdd = line.startsWith("+") && !line.startsWith("+++");
              const isDel = line.startsWith("-") && !line.startsWith("---");
              const isHdr = line.startsWith("@@") || line.startsWith("---") || line.startsWith("+++");

              return (
                <div
                  key={idx}
                  className={`py-0.5 px-1 leading-5 ${
                    isAdd
                      ? "bg-ps-seated/15 text-ps-seated font-semibold"
                      : isDel
                      ? "bg-ps-breach/15 text-ps-breach line-through"
                      : isHdr
                      ? "text-ps-focus font-bold opacity-80"
                      : "text-ps-ink"
                  }`}
                >
                  {line || " "}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-ps-paper rounded-sm border border-ps-rule text-xs text-ps-ink-2 italic text-center">
          No diff text generated for this cycle.
        </div>
      )}
    </div>
  );
}
