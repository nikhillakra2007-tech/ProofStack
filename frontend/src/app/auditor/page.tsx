"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurtain } from "@/components/layout/CurtainTransition";
import { 
  Binary, Shield, CheckCircle2, AlertTriangle, 
  Download, ArrowRight, Lock, Key, FileCheck, RefreshCw 
} from "lucide-react";

interface MerkleBlock {
  blockNumber: number;
  timestamp: string;
  remediationTarget: string;
  blockHash: string;
  prevHash: string;
  status: "verified" | "tampered";
  signer: string;
}

export default function AuditorRolePage() {
  const { user } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [tamperTriggered, setTamperTriggered] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const initialBlocks: MerkleBlock[] = [
    {
      blockNumber: 9482,
      timestamp: "2026-10-20 22:41:04 UTC",
      remediationTarget: "CVE-2024-8921 (SQLi AST Invariant)",
      blockHash: "0x4e8a1d2f9b8c3a7e6d5f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
      prevHash: "0x3f7b0c1e8a9d2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      status: "verified",
      signer: "Ed25519-HSM#4019",
    },
    {
      blockNumber: 9481,
      timestamp: "2026-10-20 21:18:12 UTC",
      remediationTarget: "CWE-79 (DOM XSS Razor Template)",
      blockHash: "0x3f7b0c1e8a9d2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      prevHash: "0x2e6a9d0f7b8c1e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
      status: "verified",
      signer: "Ed25519-HSM#4019",
    },
    {
      blockNumber: 9480,
      timestamp: "2026-10-20 19:04:55 UTC",
      remediationTarget: "CWE-22 (Path Traversal Sandbox Escape)",
      blockHash: "0x2e6a9d0f7b8c1e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
      prevHash: "0x1d5f8c9e6a7b0c2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
      status: "verified",
      signer: "Ed25519-HSM#4019",
    },
  ];

  const [blocks, setBlocks] = useState<MerkleBlock[]>(initialBlocks);

  const handleSimulateTamper = () => {
    const nextState = !tamperTriggered;
    setTamperTriggered(nextState);

    setBlocks((prev) =>
      prev.map((b) =>
        b.blockNumber === 9481
          ? {
              ...b,
              status: nextState ? "tampered" : "verified",
              blockHash: nextState
                ? "0xDEADBEEF_HASH_MISMATCH_TAMPERED_BYTE_DETECTED"
                : "0x3f7b0c1e8a9d2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
            }
          : b
      )
    );
  };

  const handleExportAuditPack = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Role Header Banner */}
        <div
          className="rounded-2xl border p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line-strong)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(245, 158, 11, 0.12)" }}
          />

          <div className="space-y-3 relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase"
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                color: "var(--gold)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>ROLE PORTAL • SECURITY AUDITOR PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
              Cryptographic Assurance & SHA-256 Merkle Ledger
            </h1>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "var(--ink-body)" }}>
              Assigned to <strong>Elena Rostova (Lead Auditor)</strong>. Mathematical proof of remediation, Ed25519 non-repudiation seals, and automated SOC2 / FedRAMP compliance export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={handleExportAuditPack}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
              style={{
                background: "var(--gold)",
                color: "#030712",
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? "Audit Pack Exported!" : "Export Audit Pack"}</span>
            </button>
            <button
              onClick={() => navigateWithCurtain("/ledger", "Merkle Ledger")}
              className="px-4 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2"
              style={{
                background: "var(--line)",
                borderColor: "var(--line-strong)",
                color: "var(--ink)",
              }}
            >
              <span>Ledger Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Auditor Portal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Ledger Attestation Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="rounded-2xl border p-5 space-y-4 font-mono text-xs"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--line)" }}>
                <span className="font-bold uppercase tracking-wider" style={{ color: "var(--gold)" }}>
                  Cryptographic Parameters
                </span>
                <span style={{ color: "var(--ink-muted)" }}>SHA-256</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                  <div className="text-[10px] uppercase font-bold" style={{ color: "var(--ink-muted)" }}>ROOT MERKLE ROOT</div>
                  <div className="font-bold text-xs truncate mt-0.5" style={{ color: "var(--gold)" }}>
                    0x9482f3a8b2c91d4e5f60a1b2c3d4e5f6
                  </div>
                </div>

                <div className="p-3 rounded-xl border" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                  <div className="text-[10px] uppercase font-bold" style={{ color: "var(--ink-muted)" }}>ATTESTATION HARDWARE</div>
                  <div className="font-bold text-xs mt-0.5" style={{ color: "var(--ink)" }}>
                    YubiHSM2 Root Vault (Slot #04)
                  </div>
                </div>

                <div className="p-3 rounded-xl border" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                  <div className="text-[10px] uppercase font-bold" style={{ color: "var(--ink-muted)" }}>COMPLIANCE TARGETS</div>
                  <div className="font-bold text-xs mt-0.5" style={{ color: "var(--emerald)" }}>
                    SOC2 Type II • FedRAMP High • ISO 27001
                  </div>
                </div>
              </div>

              {/* Adversary Tamper Simulation Tool */}
              <div className="pt-2">
                <button
                  onClick={handleSimulateTamper}
                  className="w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border"
                  style={{
                    background: tamperTriggered ? "rgba(239, 68, 68, 0.15)" : "var(--line)",
                    borderColor: tamperTriggered ? "rgba(239, 68, 68, 0.5)" : "var(--line-strong)",
                    color: tamperTriggered ? "var(--rose)" : "var(--gold)",
                  }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {tamperTriggered ? "Reset Tamper Injection" : "Simulate Adversary Bit-Flip"}
                  </span>
                </button>
                <p className="text-[10px] text-center mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  Demonstrates instant release gate halt when byte tamper is detected on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Verified Audit Trail Blocks */}
          <div className="lg:col-span-8 space-y-6">
            <div
              className="rounded-2xl border p-6 space-y-4"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                    Cryptographic Block Trail
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                    Every patch outcome is linked via parent hash pointer.
                  </p>
                </div>
                <div className="text-xs font-mono flex items-center gap-1.5" style={{ color: "var(--gold)" }}>
                  <Lock className="w-3.5 h-3.5" />
                  <span>CHAIN LENGTH: 9482 BLOCKS</span>
                </div>
              </div>

              {/* Block List */}
              <div className="space-y-3 font-mono text-xs">
                {blocks.map((b) => (
                  <div
                    key={b.blockNumber}
                    className="p-4 rounded-xl border transition-all"
                    style={{
                      background: b.status === "tampered" ? "rgba(239, 68, 68, 0.1)" : "var(--bg)",
                      borderColor: b.status === "tampered" ? "rgba(239, 68, 68, 0.5)" : "var(--line)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 mb-2" style={{ borderColor: "var(--line)" }}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: "var(--gold)" }}>
                          Block #{b.blockNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--line)", color: "var(--ink-muted)" }}>
                          {b.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {b.status === "verified" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--emerald)" }} />
                            <span className="font-bold text-[11px]" style={{ color: "var(--emerald)" }}>HASH VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" style={{ color: "var(--rose)" }} />
                            <span className="font-bold text-[11px]" style={{ color: "var(--rose)" }}>INTEGRITY VIOLATION</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span style={{ color: "var(--ink-muted)" }}>Target: </span>
                        <span className="font-semibold" style={{ color: "var(--ink)" }}>{b.remediationTarget}</span>
                      </div>
                      <div className="truncate">
                        <span style={{ color: "var(--ink-muted)" }}>Block Hash: </span>
                        <span style={{ color: b.status === "tampered" ? "var(--rose)" : "var(--gold)" }}>
                          {b.blockHash}
                        </span>
                      </div>
                      <div className="truncate" style={{ color: "var(--ink-muted)" }}>
                        <span>Prev Hash: </span>
                        <span>{b.prevHash}</span>
                      </div>
                      <div className="text-[10px] pt-1" style={{ color: "var(--azure)" }}>
                        Signer: {b.signer} • Hardware-attested Merkle inclusion proof valid
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
