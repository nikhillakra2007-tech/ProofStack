"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Block {
  index: number;
  label: string;
  hash: string;
  prevHash: string;
  timestamp: string;
  event: string;
  payload: string;
  status: "sealed" | "head";
}

const BLOCKS: Block[] = [
  {
    index: 0,
    label: "Genesis Intake",
    hash: "8f4b238e89c13289a0b12c34d5e6f789",
    prevHash: "00000000000000000000000000000000",
    timestamp: "2026-10-20T14:02:11Z",
    event: "Task ingested from git commit 7a82b9",
    payload: "orders.py:get_orders · p95=428ms · 5,001 SQL queries",
    status: "sealed",
  },
  {
    index: 1,
    label: "Baseline Profile",
    hash: "318cb92931ea789d90e1f2a3b4c5d6e7",
    prevHash: "8f4b238e89c13289a0b12c34d5e6f789",
    timestamp: "2026-10-20T14:02:16Z",
    event: "pyperf execution verified against baseline",
    payload: "tau_noise=5.0% · CPU affinity pinned · 3 iterations",
    status: "sealed",
  },
  {
    index: 2,
    label: "Candidate Probing",
    hash: "45a89df0123bc890f1a2b3c4d5e6f789",
    prevHash: "318cb92931ea789d90e1f2a3b4c5d6e7",
    timestamp: "2026-10-20T14:02:25Z",
    event: "MicroVM sandbox execution completed",
    payload: "Candidate A: G2 FAIL (leak) · Candidate B: 8/8 PASS",
    status: "sealed",
  },
  {
    index: 3,
    label: "8-Gate Audit",
    hash: "e890123890123890a1b2c3d4e5f6a7b8",
    prevHash: "45a89df0123bc890f1a2b3c4d5e6f789",
    timestamp: "2026-10-20T14:02:28Z",
    event: "Zero-compromise invariant verification passed",
    payload: "G0-G7 verified · 0 IDOR · 0 memory leak · +74.2% perf",
    status: "sealed",
  },
  {
    index: 4,
    label: "Final Seal (Head)",
    hash: "d4e1529a1b2c3d4ea0b1c2d3e4f5a6b7",
    prevHash: "e890123890123890a1b2c3d4e5f6a7b8",
    timestamp: "2026-10-20T14:02:30Z",
    event: "Cryptographic seal applied to patch verdict",
    payload: "VERDICT=ACCEPT · Signed with ed25519 tenant key",
    status: "head",
  },
];

export default function LedgerVisual() {
  const [selectedBlock, setSelectedBlock] = useState<number>(4);
  const [isTampered, setIsTampered] = useState(false);

  const block = BLOCKS[selectedBlock];

  return (
    <div
      style={{
        marginTop: "calc(32 * var(--u))",
        width: "100%",
        padding: "calc(24 * var(--u))",
        borderRadius: "14px",
        border: "1px solid var(--line)",
        background: "rgba(18, 18, 16, 0.4)",
        backdropFilter: "blur(12px)",
      }}
      data-rv
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isTampered ? "var(--fail)" : "var(--pass)",
              boxShadow: `0 0 8px ${isTampered ? "var(--fail)" : "var(--pass)"}`,
            }}
          />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink2)" }}>
            Cryptographic SHA-256 Ledger Chain {isTampered ? "· [TAMPER DETECTED]" : "· [VALIDATED]"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsTampered(!isTampered)}
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: "11px",
            padding: "4px 12px",
            borderRadius: "6px",
            background: isTampered ? "rgba(194, 107, 94, 0.2)" : "rgba(255, 255, 255, 0.05)",
            color: isTampered ? "var(--fail)" : "var(--ink2)",
            border: `1px solid ${isTampered ? "var(--fail)" : "var(--line)"}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isTampered ? "Restore Valid Chain" : "Simulate Tamper on Block #2"}
        </button>
      </div>

      {/* Block Sequence Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {BLOCKS.map((b) => {
          const isSelected = selectedBlock === b.index;
          const isBroken = isTampered && b.index >= 2;

          return (
            <motion.div
              key={b.index}
              onClick={() => setSelectedBlock(b.index)}
              whileHover={{ y: -2 }}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: `1px solid ${
                  isBroken
                    ? "rgba(194, 107, 94, 0.5)"
                    : isSelected
                    ? "rgba(233, 229, 218, 0.4)"
                    : "var(--line)"
                }`,
                background: isBroken
                  ? "rgba(194, 107, 94, 0.08)"
                  : isSelected
                  ? "rgba(233, 229, 218, 0.08)"
                  : "rgba(10, 10, 9, 0.6)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "10.5px", color: isBroken ? "var(--fail)" : "var(--ink3)" }}>
                  BLOCK #{b.index}
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "9px",
                    color: isBroken ? "var(--fail)" : "var(--pass)",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: isBroken ? "rgba(194,107,94,0.15)" : "rgba(127,174,122,0.15)",
                  }}
                >
                  {isBroken ? "INVALID" : b.status === "head" ? "HEAD" : "SEALED"}
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                {b.label}
              </div>

              <div style={{ fontFamily: "var(--f-mono)", fontSize: "10px", color: "var(--ink3)" }}>
                {b.hash.slice(0, 12)}…
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Block Detail Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedBlock}-${isTampered}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: "calc(16 * var(--u))",
            padding: "16px 20px",
            borderRadius: "10px",
            background: "rgba(10, 10, 9, 0.8)",
            border: `1px solid ${isTampered && selectedBlock >= 2 ? "rgba(194, 107, 94, 0.4)" : "var(--line)"}`,
            fontFamily: "var(--f-mono)",
            fontSize: "11.5px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0, 1fr)", gap: "8px", rowGap: "8px", color: "var(--ink2)" }}>
            <span style={{ color: "var(--ink3)" }}>Current Hash:</span>
            <span style={{ color: isTampered && selectedBlock >= 2 ? "var(--fail)" : "var(--ink)", wordBreak: "break-all" }}>
              {isTampered && selectedBlock === 2 ? "DEADBEEF999999999999999999999999 [CORRUPTED]" : block.hash}
            </span>

            <span style={{ color: "var(--ink3)" }}>Previous Hash:</span>
            <span style={{ color: "var(--ink2)", wordBreak: "break-all" }}>{block.prevHash}</span>

            <span style={{ color: "var(--ink3)" }}>Timestamp:</span>
            <span style={{ color: "var(--ink)" }}>{block.timestamp}</span>

            <span style={{ color: "var(--ink3)" }}>Event Trigger:</span>
            <span style={{ color: "var(--ink)" }}>{block.event}</span>

            <span style={{ color: "var(--ink3)" }}>Payload:</span>
            <span style={{ color: "var(--pass)" }}>{block.payload}</span>
          </div>

          {isTampered && selectedBlock >= 2 && (
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(194, 107, 94, 0.3)", color: "var(--fail)", fontSize: "11px" }}>
              ⚠ Cryptographic alert: Block #{selectedBlock} previous hash does not match computed parent hash. Entire subsequent chain invalidated.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
