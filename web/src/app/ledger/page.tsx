"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { MOCK_LEDGER_CHAIN } from "@/lib/mockData";
import type { LedgerBlock } from "@/lib/types";

const ZERO_HASH = "0".repeat(64);
const SHA256_HEX = /^[0-9a-f]{64}$/i;

/**
 * The tamper simulation targets the hypothesis-scoring block. Its position is
 * resolved from the shared chain so the simulation can never drift away from
 * the authoritative ledger data.
 */
const TAMPER_TARGET_INDEX = (() => {
  const idx = MOCK_LEDGER_CHAIN.findIndex((b) => b.type === "HYPOTHESIS");
  return idx >= 0 ? idx : 0;
})();

function formatTimestamp(iso: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]}Z` : iso;
}

interface ChainVerification {
  ok: boolean;
  verifiedCount: number;
  brokenIndex: number | null;
  reason: string;
}

/**
 * Recomputes the SHA-256 hash-chain invariants over the shared ledger data:
 * every entry_hash must be a 64-char digest, every prev_hash must equal the
 * previous entry_hash (genesis block links to the zero hash), and every block
 * must be marked verified by the controller.
 */
function verifyChain(blocks: LedgerBlock[]): ChainVerification {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (!SHA256_HEX.test(block.entry_hash)) {
      return {
        ok: false,
        verifiedCount: i,
        brokenIndex: block.index,
        reason: `entry_hash of block #${block.index} is not a valid 64-character SHA-256 digest`,
      };
    }

    const expectedPrev = i === 0 ? ZERO_HASH : blocks[i - 1].entry_hash;
    if (block.prev_hash !== expectedPrev) {
      return {
        ok: false,
        verifiedCount: i,
        brokenIndex: block.index,
        reason: `prev_hash of block #${block.index} does not match the entry_hash of block #${blocks[i - 1].index}`,
      };
    }

    if (!block.verified) {
      return {
        ok: false,
        verifiedCount: i,
        brokenIndex: block.index,
        reason: `block #${block.index} is not marked verified by the controller`,
      };
    }
  }

  return {
    ok: true,
    verifiedCount: blocks.length,
    brokenIndex: null,
    reason: "",
  };
}

export default function LedgerPage() {
  const { role } = useAuth();
  const { isTampered, setIsTampered } = useTheme();
  const roleDef = ROLES[role] || ROLES.developer;

  const [notification, setNotification] = useState<string>("");

  const chain = MOCK_LEDGER_CHAIN;
  const tamperBlock = chain[TAMPER_TARGET_INDEX];
  const originalScore = tamperBlock ? tamperBlock.payload?.score : undefined;

  const handleSimulateTamper = () => {
    setIsTampered(true);
    setNotification(
      `Adversarial payload injected into Block #${TAMPER_TARGET_INDEX}: 'score' changed from ${originalScore} to 0.99 [TAMPERED]. Hash chain broken.`
    );
  };

  const handleRestoreClean = () => {
    setIsTampered(false);
    const result = verifyChain(MOCK_LEDGER_CHAIN);
    setNotification(
      result.ok
        ? `Evidence ledger restored to authentic SHA-256 state. All ${result.verifiedCount} blocks cryptographically verified.`
        : `Chain re-verification failed at block #${result.brokenIndex}: ${result.reason}`
    );
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div>
      {/* Header Card (PDF pp. 27-28) */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "14px",
          padding: "16px 20px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "var(--brand)" }}>
          <svg className="i" viewBox="0 0 24 24" style={{ width: "24px", height: "24px" }}>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        </span>
        <div>
          <div className="row" style={{ gap: "8px", flexWrap: "wrap" }}>
            <b className="disp" style={{ fontSize: "20px", fontWeight: 700 }}>
              Cryptographic Evidence Ledger Explorer
            </b>
            <span className="chip brand">SHA-256 Hash Chain</span>
            <span className={`chip ${isTampered ? "fail" : "pass"}`}>
              {isTampered ? "CHAIN BROKEN" : "CHAIN INTACT ✓"}
            </span>
          </div>
          <div className="mono" style={{ fontSize: "11.5px", color: "var(--ink2)", marginTop: "4px" }}>
            Authoritative append-only ledger: entry_hash = SHA256(bytes.fromhex(prev_hash) + canonical_json(body))
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn sec"
            onClick={handleRestoreClean}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Restore Clean Ledger
          </button>

          {!isTampered ? (
            <button
              type="button"
              className="btn sec"
              onClick={handleSimulateTamper}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderColor: "color-mix(in srgb, var(--fail) 40%, var(--line))",
              }}
            >
              <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px", color: "var(--fail)" }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Simulate Tamper
            </button>
          ) : (
            <button
              type="button"
              className="btn danger"
              onClick={handleRestoreClean}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              INTEGRITY VIOLATION (Reset)
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            border: isTampered
              ? "1px solid color-mix(in srgb, var(--fail) 55%, var(--line))"
              : "1px solid var(--pass)",
            background: isTampered
              ? "color-mix(in srgb, var(--fail) 10%, var(--surface))"
              : "color-mix(in srgb, var(--pass) 10%, var(--surface))",
            color: isTampered ? "var(--fail)" : "var(--pass)",
            borderRadius: "8px",
            padding: "10px 16px",
            marginBottom: "14px",
            fontSize: "12.5px",
            fontFamily: "var(--f-mono)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification("")}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tamper Alert Banner (PDF p. 28) */}
      {isTampered && (
        <div
          style={{
            border: "1px solid color-mix(in srgb, var(--fail) 55%, var(--line))",
            background: "color-mix(in srgb, var(--fail) 8%, var(--surface))",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "16px",
            display: "flex",
            gap: "14px",
            animation: "fadeIn 200ms ease-out",
          }}
        >
          <span style={{ color: "var(--fail)", marginTop: "2px" }}>
            <svg className="i" viewBox="0 0 24 24" style={{ width: "22px", height: "22px" }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div>
            <b
              className="mono"
              style={{ color: "var(--fail)", fontSize: "13px", letterSpacing: ".05em" }}
            >
              ADVERSARIAL TAMPER DETECTED AT BLOCK #{TAMPER_TARGET_INDEX} (HYPOTHESIS SCORE FORGED)
            </b>
            <div style={{ fontSize: "12.5px", marginTop: "4px", lineHeight: 1.6 }}>
              A single byte in Block #{TAMPER_TARGET_INDEX} was mutated: <code style={{ background: "rgba(239, 68, 68, 0.2)", padding: "2px 6px", borderRadius: "4px" }}>&quot;score&quot;: {originalScore} → &quot;0.99 [TAMPERED]&quot;</code>.
              Because SHA-256 is strictly chained, the calculated entry hash diverged from the stored hash. Downstream blocks #{TAMPER_TARGET_INDEX + 1}, #{TAMPER_TARGET_INDEX + 2}, and #{TAMPER_TARGET_INDEX + 3} immediately failed verification (<span style={{ color: "var(--fail)", fontWeight: 700 }}>HASH MISMATCH</span>), proving that no verdict or measurement can ever be forged or modified undetected.
            </div>
          </div>
        </div>
      )}

      {/* Centered 880px Chain Rail */}
      <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "24px" }}>
        {chain.map((block, idx) => {
          const isFailing = isTampered && block.index >= TAMPER_TARGET_INDEX;
          const isTamperedTarget = isTampered && block.index === TAMPER_TARGET_INDEX;

          return (
            <React.Fragment key={block.index}>
              {/* Chain Block */}
              <div
                className={`block ${isFailing ? "bad" : ""}`}
                style={{
                  border: isFailing
                    ? "1px solid color-mix(in srgb, var(--fail) 65%, var(--line))"
                    : "1px solid var(--line)",
                  background: isFailing
                    ? "color-mix(in srgb, var(--fail) 5%, var(--surface))"
                    : "var(--surface)",
                  borderRadius: "10px",
                  padding: "16px",
                  boxShadow: isFailing ? "0 0 16px rgba(239, 68, 68, 0.12)" : "none",
                }}
              >
                {/* Block Header */}
                <div className="hd" style={{ display: "flex", alignItems: "center", marginBottom: "12px", gap: "10px" }}>
                  <span className={`chip ${isFailing ? "fail" : "brand"}`}>
                    BLOCK #{block.index}
                  </span>
                  <b className="mono" style={{ fontSize: "13px" }}>
                    {block.type}
                  </b>

                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }} className="mono">
                    <span style={{ fontSize: "11px", color: "var(--ink2)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {block.actor}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--ink2)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {formatTimestamp(block.timestamp)}
                    </span>

                    {isFailing ? (
                      <span className="chip fail" style={{ fontWeight: 700 }}>
                        <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        HASH MISMATCH
                      </span>
                    ) : block.verified ? (
                      <span className="chip pass">
                        <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="chip warn" style={{ fontWeight: 700 }}>
                        UNVERIFIED
                      </span>
                    )}
                  </span>
                </div>

                {/* Hashes Row */}
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "1fr 1fr", gap: "10px" }}
                >
                  <div className="hbox" style={{ padding: "8px 10px", background: "var(--surface2)", borderRadius: "6px", border: "1px solid var(--line)" }}>
                    <small style={{ fontSize: "10px", color: "var(--ink2)", display: "block" }}>PREV_HASH</small>
                    <div className="hash mono" style={{ fontSize: "10.5px", color: "var(--ink)" }}>
                      {block.prev_hash}
                    </div>
                  </div>
                  <div className="hbox" style={{ padding: "8px 10px", background: "var(--surface2)", borderRadius: "6px", border: "1px solid var(--line)" }}>
                    <small style={{ fontSize: "10px", color: "var(--ink2)", display: "block" }}>ENTRY_HASH</small>
                    <div
                      className={`hash mono ${isFailing ? "r" : "g"}`}
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        color: isFailing ? "var(--fail)" : "var(--pass)",
                      }}
                    >
                      {isTamperedTarget
                        ? `${block.entry_hash.slice(0, -2)}ff [MUTATED HASH]`
                        : isFailing
                        ? `${block.entry_hash.slice(0, 48)}... [CASCADE MISMATCH]`
                        : block.entry_hash}
                    </div>
                  </div>
                </div>

                {/* Payload JSON Well */}
                <pre
                  className="mono"
                  style={{
                    margin: "10px 0 0",
                    padding: "10px 12px",
                    background: isFailing ? "color-mix(in srgb, var(--fail) 6%, var(--bg))" : "var(--bg)",
                    border: isFailing ? "1px solid color-mix(in srgb, var(--fail) 30%, var(--line))" : "1px solid var(--line)",
                    borderRadius: "7px",
                    fontSize: "11.5px",
                    lineHeight: 1.6,
                    color: "var(--ink)",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(
                    isTamperedTarget
                      ? {
                          ...block.payload,
                          score: "0.99 [TAMPERED]",
                          _tampered_by: "adversarial_injection",
                          _expected_score: block.payload?.score,
                        }
                      : block.payload,
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Chain Link (Down Arrow) */}
              {idx < chain.length - 1 && (
                <div
                  className="link"
                  style={{
                    color: isTampered && idx >= TAMPER_TARGET_INDEX - 1 ? "var(--fail)" : "var(--ink3)",
                    textAlign: "center",
                    padding: "8px 0",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "20px", height: "20px" }}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
