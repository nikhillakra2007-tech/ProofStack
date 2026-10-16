"use client";

import { useState } from "react";
import { LedgerEntry, api } from "@/lib/api";

interface LedgerChainProps {
  entries: LedgerEntry[];
  runId: string;
}

export function LedgerChain({ entries, runId }: LedgerChainProps) {
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    head_hash: string | null;
    reason: string | null;
    entry_count: number;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyLedger(runId);
      setVerifyResult(res);
    } catch (err: unknown) {
      setVerifyResult({
        valid: false,
        head_hash: null,
        reason: err instanceof Error ? err.message : "Verification request failed",
        entry_count: entries.length,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ps-rule">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">Evidence Ledger</span>
          <span className="text-[11px] text-ps-ink-2 font-mono">SHA-256 Hash-Chain</span>
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying || entries.length === 0}
          className="badge badge-focus hover:opacity-90 disabled:opacity-50 text-xs py-1 px-3 cursor-pointer font-medium"
        >
          {verifying ? "Verifying Hash-Chain..." : "🔐 Verify Hash-Chain Integrity"}
        </button>
      </div>

      {/* Verification Feedback */}
      {verifyResult && (
        <div
          className={`p-2.5 rounded-sm text-xs font-mono border ${
            verifyResult.valid
              ? "bg-ps-seated/10 border-ps-seated/30 text-ps-seated"
              : "bg-ps-breach/10 border-ps-breach/30 text-ps-breach"
          }`}
        >
          {verifyResult.valid ? (
            <div>
              <div className="font-bold">✓ Hash-Chain Integrity Verified Passed</div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {verifyResult.entry_count} entries verified against genesis. Head: {verifyResult.head_hash}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold">✗ Ledger Integrity Check FAILED</div>
              <div className="text-[11px] opacity-90 mt-0.5">
                Failure: {verifyResult.reason || "Hash mismatch or broken previous link detected."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chain Stream */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <p className="text-xs text-ps-ink-2 italic py-4 text-center">No ledger entries recorded yet.</p>
        ) : (
          entries.map((entry) => {
            const isSelected = selectedEntry?.sequence_number === entry.sequence_number;
            return (
              <div
                key={entry.sequence_number}
                onClick={() => setSelectedEntry(isSelected ? null : entry)}
                className={`p-2 rounded-sm border cursor-pointer font-mono text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? "border-ps-focus bg-ps-paper"
                    : "border-ps-rule bg-ps-sheet hover:bg-ps-paper/50"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-ps-ink-2 font-bold w-7">#{entry.sequence_number}</span>
                  <span className="badge badge-focus text-[10px] py-0">{entry.event_type}</span>
                  <span className="text-[11px] text-ps-ink truncate max-w-[140px] sm:max-w-[200px]">
                    hash: {entry.entry_hash.slice(0, 12)}...
                  </span>
                </div>
                <div className="text-[10px] text-ps-ink-2 whitespace-nowrap pl-2">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Entry Detail Modal / Box */}
      {selectedEntry && (
        <div className="p-3 bg-ps-paper rounded-sm border border-ps-rule space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-ps-rule pb-1.5">
            <span className="font-bold text-ps-ink">
              Entry #{selectedEntry.sequence_number} — {selectedEntry.event_type}
            </span>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-ps-ink-2 hover:text-ps-ink text-xs"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ps-ink-2">
            <div>
              <span className="font-semibold block">Entry Hash:</span>
              <span className="break-all text-ps-ink">{selectedEntry.entry_hash}</span>
            </div>
            <div>
              <span className="font-semibold block">Previous Hash:</span>
              <span className="break-all text-ps-ink">{selectedEntry.previous_hash}</span>
            </div>
          </div>
          <div>
            <span className="font-semibold block text-[11px] text-ps-ink-2 mb-1">Payload Content:</span>
            <pre className="bg-ps-sheet p-2 rounded-sm border border-ps-rule max-h-48 overflow-y-auto text-[11px] text-ps-ink whitespace-pre-wrap">
              {JSON.stringify(selectedEntry.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
