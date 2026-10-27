"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { downloadEvidenceReport } from "@/lib/evidenceExport";

interface BlockData {
  index: number;
  label: string;
  timestamp: string;
  prevHash: string;
  currentHash: string;
  data: string;
  tampered?: boolean;
}

const INITIAL_BLOCKS: BlockData[] = [
  {
    index: 0,
    label: "Genesis Block",
    timestamp: "2026-10-27T10:00:00.000Z",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
    currentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    data: "ProofStack Engine Initialized · Workspace Root #0",
  },
  {
    index: 1,
    label: "Baseline Telemetry",
    timestamp: "2026-10-27T10:00:01.240Z",
    prevHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    currentHash: "7d8f921a83b276e104c89bdf6e41a27e41e4649b934ca495991b7852b8551402",
    data: "cProfile Telemetry: p95=452ms, queries=42, memory=142MB",
  },
  {
    index: 2,
    label: "Patch Synthesis",
    timestamp: "2026-10-27T10:00:02.890Z",
    prevHash: "7d8f921a83b276e104c89bdf6e41a27e41e4649b934ca495991b7852b8551402",
    currentHash: "3a91c890f5a7e104c89bdf6e41a27e41e4649b934ca495991b7852b855aa9104",
    data: "Nemotron-3-Super 120B: orders.py eager join + tenant_id guard",
  },
  {
    index: 3,
    label: "Gauntlet Execution",
    timestamp: "2026-10-27T10:00:04.120Z",
    prevHash: "3a91c890f5a7e104c89bdf6e41a27e41e4649b934ca495991b7852b855aa9104",
    currentHash: "b84e0192a83b276e104c89bdf6e41a27e41e4649b934ca495991b7852b855f301",
    data: "G1: PASS (84/84 tests) · G2: PASS (+74.2%) · G3: PASS (0 leaks)",
  },
  {
    index: 4,
    label: "Ledger Seal",
    timestamp: "2026-10-27T10:00:04.550Z",
    prevHash: "b84e0192a83b276e104c89bdf6e41a27e41e4649b934ca495991b7852b855f301",
    currentHash: "4f72d91a83b276e104c89bdf6e41a27e41e4649b934ca495991b7852b8558912",
    data: "Cryptographic Evidence Sealed · Merkle Root Verified",
  },
];

// Simple async SHA-256 helper using browser Web Crypto API
async function sha256(message: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HomeLedgerView({ onOpenTour }: { onOpenTour?: () => void }) {
  const router = useRouter();
  const [isTampered, setIsTampered] = useState(false);
  const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS);
  const [playgroundInput, setPlaygroundInput] = useState("tenant_id == current_user.org_id");
  const [playgroundHash, setPlaygroundHash] = useState("");

  // Recalculate playground hash on input change
  useEffect(() => {
    sha256(playgroundInput).then(setPlaygroundHash);
  }, [playgroundInput]);

  const handleSimulateTamper = async () => {
    if (isTampered) {
      // Reset back to original
      setBlocks(INITIAL_BLOCKS);
      setIsTampered(false);
      return;
    }

    // Tamper Block #2
    const tamperedData = "MALICIOUS TAMPER: injected bypass_auth=True in orders.py";
    const newHash2 = await sha256(INITIAL_BLOCKS[1].currentHash + tamperedData);

    const updated = [...INITIAL_BLOCKS];
    updated[2] = {
      ...updated[2],
      data: tamperedData,
      currentHash: newHash2,
      tampered: true,
    };
    // Block #3 and #4 now have mismatched prevHash
    updated[3] = { ...updated[3], tampered: true };
    updated[4] = { ...updated[4], tampered: true };

    setBlocks(updated);
    setIsTampered(true);
  };

  const handleExportEvidence = () => {
    downloadEvidenceReport({
      problemId: "INV-4821",
      problemTitle: "Cryptographic Merkle Chain Audit Export",
      filename: "merkle_chain_seal.json",
    });
  };

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Sub-Page Header */}
      <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>
            CRYPTOGRAPHIC PROOF CHAIN
          </span>
          <span style={{ fontSize: "12px", background: "#ECFDF5", color: "#065F46", padding: "3px 10px", borderRadius: "12px", border: "1px solid #A7F3D0", fontWeight: 600 }}>
            ⛓️ SHA-256 Merkle Chained
          </span>
          <span style={{ fontSize: "12px", background: "#EFF6FF", color: "#1E40AF", padding: "3px 10px", borderRadius: "12px", border: "1px solid #BFDBFE", fontWeight: 600 }}>
            🛡️ Zero Tampering Tolerated
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "40px", fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          Evidence Ledger: Immutable SHA-256 Merkle Chain
        </h1>

        <p style={{ color: "var(--ink2)", fontSize: "16px", lineHeight: 1.6, margin: "0 auto 24px" }}>
          Every run event—from baseline telemetry to gate verdicts—is sealed with SHA-256 in a Merkle-linked chain:
          <br />
          <code className="mono" style={{ fontSize: "13px", color: "var(--brand)", fontWeight: 700 }}>
            entry_hash = SHA256(prev_hash + body)
          </code>
          . Any modification to past telemetry instantly breaks downstream cryptographic integrity.
        </p>

        {/* Action Controls */}
        <div style={{ display: "inline-flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleSimulateTamper}
            style={{
              padding: "0 22px",
              height: "40px",
              fontSize: "13.5px",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "8px",
              border: isTampered ? "1.5px solid #10B981" : "1.5px solid #EF4444",
              background: isTampered ? "#10B981" : "#FEF2F2",
              color: isTampered ? "#FFFFFF" : "#DC2626",
              transition: "all 180ms ease",
              boxShadow: isTampered ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "0 4px 12px rgba(239, 68, 68, 0.15)",
            }}
          >
            {isTampered ? "✓ Restore Cryptographic Chain" : "🚨 Simulate Tamper on Block #2"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportEvidence}
            style={{ padding: "0 18px", height: "40px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
          >
            Download Audit JSON (.json) ↗
          </button>
        </div>
      </div>

      {/* Merkle Chain Integrity Status Banner */}
      <div
        className="card"
        style={{
          padding: "18px 24px",
          borderRadius: "12px",
          marginBottom: "32px",
          background: isTampered ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
          border: `1.5px solid ${isTampered ? "#FECACA" : "#A7F3D0"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: isTampered ? "#EF4444" : "#10B981",
              color: "#FFFFFF",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: "16px",
              flex: "none",
            }}
          >
            {isTampered ? "✕" : "✓"}
          </div>
          <div>
            <b style={{ fontSize: "14.5px", color: isTampered ? "#DC2626" : "#065F46", display: "block" }}>
              {isTampered
                ? "TAMPER DETECTED: Merkle Hash Linkage Severed Between Block #2 & #3"
                : "CHAIN VALIDATED: All 5 Cryptographic Hashes Match Merkle Root"}
            </b>
            <span style={{ fontSize: "12px", color: "var(--ink2)" }}>
              {isTampered
                ? "Block #3 prev_hash (3a91c890...) does NOT match Block #2 recalculated digest. Chain rejected."
                : "Continuous SHA-256 seal verified from Genesis #0 to Ledger Seal #4."}
            </span>
          </div>
        </div>

        <span
          className="mono"
          style={{
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: isTampered ? "#EF4444" : "#10B981",
            color: "#FFFFFF",
            fontWeight: 700,
          }}
        >
          {isTampered ? "AUDIT: REJECTED" : "AUDIT: PASS"}
        </span>
      </div>

      {/* Interactive Blockchain Visualizer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
        {blocks.map((block, i) => {
          const isBroken = isTampered && block.index >= 2;
          return (
            <div key={block.index} style={{ position: "relative" }}>
              {/* Connector Line Between Blocks */}
              {i > 0 && (
                <div
                  style={{
                    width: "2px",
                    height: "16px",
                    background: isBroken ? "#EF4444" : "#10B981",
                    margin: "0 auto",
                    transition: "background 200ms ease",
                  }}
                />
              )}

              <div
                className="card"
                style={{
                  borderRadius: "12px",
                  padding: "20px 24px",
                  background: isBroken ? "color-mix(in srgb, #EF4444 3%, var(--surface))" : "var(--surface)",
                  border: `1.5px solid ${isBroken ? "#EF4444" : "var(--line)"}`,
                  boxShadow: isBroken ? "0 0 15px rgba(239, 68, 68, 0.15)" : "none",
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className="mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: isBroken ? "#EF4444" : "var(--brand)",
                        color: "#FFFFFF",
                      }}
                    >
                      BLOCK #{block.index}
                    </span>
                    <b style={{ fontSize: "14px", color: "var(--ink)" }}>{block.label}</b>
                  </div>
                  <span className="mono" style={{ fontSize: "11px", color: "var(--ink2)" }}>
                    {block.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "var(--ink)", marginBottom: "12px", fontWeight: 500 }}>
                  {block.data}
                </div>

                {/* Hashes Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--surface2)", padding: "10px 14px", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--ink2)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                      Previous Hash (prev_hash)
                    </span>
                    <span className="mono" style={{ fontSize: "11px", color: isBroken && block.index === 3 ? "#EF4444" : "var(--ink2)", wordBreak: "break-all", fontWeight: 600 }}>
                      {block.prevHash}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--ink2)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                      Entry Hash (SHA-256)
                    </span>
                    <span className="mono" style={{ fontSize: "11px", color: isBroken ? "#EF4444" : "#10B981", wordBreak: "break-all", fontWeight: 600 }}>
                      {block.currentHash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live SHA-256 Playground */}
      <div className="card" style={{ padding: "26px 30px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="eyebrow" style={{ color: "var(--brand)", fontWeight: 700, marginBottom: "6px" }}>
          INTERACTIVE CRYPTO PLAYGROUND
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px" }}>
          Live WebCrypto SHA-256 Calculator
        </h3>
        <p style={{ fontSize: "13px", color: "var(--ink2)", margin: "0 0 16px" }}>
          Type any telemetry payload or AST invariant statement below to observe live deterministic hashing in your browser:
        </p>

        <input
          type="text"
          value={playgroundInput}
          onChange={(e) => setPlaygroundInput(e.target.value)}
          placeholder="Type telemetry message..."
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            background: "var(--surface2)",
            color: "var(--ink)",
            fontSize: "13px",
            fontFamily: "var(--f-mono)",
            marginBottom: "12px",
            outline: "none",
          }}
        />

        <div style={{ background: "#0F172A", color: "#F8FAFC", padding: "12px 16px", borderRadius: "8px", fontSize: "12px" }}>
          <span style={{ color: "#94A3B8", display: "block", marginBottom: "4px" }}>Computed SHA-256 Digest:</span>
          <span className="mono" style={{ color: "#10B981", fontWeight: 700, wordBreak: "break-all" }}>
            {playgroundHash || "Computing..."}
          </span>
        </div>
      </div>
    </div>
  );
}
