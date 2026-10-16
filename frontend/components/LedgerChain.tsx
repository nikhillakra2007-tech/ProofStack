"use client";

import { useState } from "react";
import { LedgerEntry, api } from "@/lib/api";

interface LedgerChainProps {
  entries: LedgerEntry[];
  runId: string;
}

export function LedgerChain({ entries, runId }: LedgerChainProps) {
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; head_hash: string | null } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await api.verifyLedger(runId);
      setVerifyResult(result);
    } catch {
      setVerifyResult({ valid: false, head_hash: null });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Evidence Ledger</h2>
        <button
          onClick={handleVerify}
          disabled={verifying || entries.length === 0}
          className="badge badge-focus hover:opacity-80 disabled:opacity-50"
        >
          {verifying ? "Verifying..." : "Verify Chain"}
        </button>
      </div>
      {verifyResult && (
        <div className={`mb-2 p-2 rounded-sm text-sm ${verifyResult.valid ? "bg-ps-seated/10 text-ps-seated" : "bg-ps-breach/10 text-ps-breach"}`}>
          {verifyResult.valid ? `Valid chain, head: ${verifyResult.head_hash?.slice(0, 16)}...` : "Chain verification FAILED"}
        </div>
      )}
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {entries.map((e) => (
          <div key={e.sequence_number} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-ps-ink-2 w-8">#{e.sequence_number}</span>
            <span className="badge badge-focus">{e.event_type}</span>
            <span className="text-ps-ink-2">{e.entry_hash.slice(0, 12)}...</span>
          </div>
        ))}
        {entries.length === 0 && <p className="text-ps-ink-2 text-sm">No ledger entries yet.</p>}
      </div>
    </div>
  );
}
