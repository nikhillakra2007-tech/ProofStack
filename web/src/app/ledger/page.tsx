"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MOCK_MERKLE_CHAIN } from "@/lib/mockData";
import { 
  Link as LinkIcon, ShieldCheck, AlertOctagon, 
  RefreshCw, CheckCircle2, Lock, Cpu, Download 
} from "lucide-react";

export default function LedgerPage() {
  const [chain, setChain] = useState(MOCK_MERKLE_CHAIN);
  const [isTampered, setIsTampered] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleTamper = () => {
    setIsTampered(true);
  };

  const handleReset = () => {
    setVerifying(true);
    setTimeout(() => {
      setIsTampered(false);
      setVerifying(false);
    }, 700);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-2">
              <LinkIcon className="w-3.5 h-3.5" />
              CRYPTOGRAPHIC PROOF LOG
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              SHA-256 Merkle Audit Ledger
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Immutable append-only ledger recording all AST patch syntheses, DAST assault probe runs, and gate approvals for non-repudiation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={isTampered ? handleReset : handleTamper}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                isTampered
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
              }`}
            >
              {isTampered ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Chain Integrity</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Simulate Malicious Tampering</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Root Hash Banner */}
        <div className={`mb-8 p-6 rounded-2xl border transition-all ${
          isTampered
            ? "bg-red-950/20 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
            : "bg-slate-900/60 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                Current Merkle Root State
              </div>
              <div className={`text-base md:text-lg font-bold truncate ${isTampered ? "text-red-400" : "text-emerald-400"}`}>
                {isTampered ? "0xINVALID_ROOT_CORRUPTED_NONCE_FAIL" : "0x9e8a7c2b5d4f1092a837c4e5f6120489"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                isTampered 
                  ? "bg-red-500/20 text-red-300 border border-red-500" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
              }`}>
                {isTampered ? "TAMPER DETECTED: INVALID" : "CRYPTOGRAPHICALLY ATTESTED"}
              </span>
            </div>
          </div>
        </div>

        {/* Chain Block Explorer */}
        <div className="space-y-4">
          {chain.map((block, index) => {
            const isCorruptedBlock = isTampered && index === 3;

            return (
              <div
                key={block.block}
                className={`p-5 rounded-2xl border font-mono text-xs transition-all ${
                  isCorruptedBlock
                    ? "bg-red-950/30 border-red-500 shadow-lg text-red-200"
                    : isTampered && index > 3
                    ? "bg-slate-950/40 border-red-900/40 opacity-60 text-slate-400"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                      BLOCK #{block.block}
                    </span>
                    <span className="text-white font-bold">{block.action}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">{block.timestamp}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500">Block SHA-256: </span>
                    <span className={isCorruptedBlock ? "text-red-400 font-bold" : "text-slate-300"}>
                      {isCorruptedBlock ? "0xTAMPERED_HASH_BYTE_MISMATCH" : block.hash}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Parent Hash: </span>
                    <span className="text-slate-400">{block.parentHash}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Author: {block.author}</span>
                  <span className={isCorruptedBlock ? "text-red-400 font-bold" : "text-emerald-400 flex items-center gap-1"}>
                    {isCorruptedBlock ? (
                      <>❌ Nonce Invalid</>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Attested
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
