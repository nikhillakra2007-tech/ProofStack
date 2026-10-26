"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { downloadEvidenceReport } from "@/lib/evidenceExport";
import { getLedgerBlocks, resetLedgerBlocks, StoredLedgerBlock } from "@/lib/ledgerStore";

export default function LedgerPage() {
  const { role } = useAuth();
  const { isTampered, setIsTampered } = useTheme();
  const roleDef = ROLES[role] || ROLES.developer;

  const [blocks, setBlocks] = useState<StoredLedgerBlock[]>([]);
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    setBlocks(getLedgerBlocks());
    const handleUpdate = () => {
      setBlocks(getLedgerBlocks());
    };
    window.addEventListener("proofstack:ledger-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("proofstack:ledger-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleSimulateTamper = () => {
    setIsTampered(true);
    setNotification("Adversarial payload injected into Block #2: 'score' changed from 0.96 to 0.99 [TAMPERED]. Hash chain broken.");
  };

  const handleRestoreClean = () => {
    setIsTampered(false);
    resetLedgerBlocks();
    setBlocks(getLedgerBlocks());
    setNotification("Evidence ledger restored to authentic SHA-256 state. All blocks cryptographically verified.");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleExportEvidence = () => {
    downloadEvidenceReport({
      ledgerBlocks: blocks,
    });
    setNotification("Downloaded ProofStack_Verification_Evidence_Report.md with SHA-256 Merkle chain.");
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
            onClick={handleExportEvidence}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Evidence (Markdown)
          </button>

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
              ADVERSARIAL TAMPER DETECTED AT BLOCK #2 (HYPOTHESIS SCORE FORGED)
            </b>
            <div style={{ fontSize: "12.5px", marginTop: "4px", lineHeight: 1.6 }}>
              A single byte in Block #2 was mutated: <code style={{ background: "rgba(239, 68, 68, 0.2)", padding: "2px 6px", borderRadius: "4px" }}>&quot;score&quot;: 0.96 → &quot;0.99 [TAMPERED]&quot;</code>.
              Because SHA-256 is strictly chained, the calculated entry hash diverged from the stored hash. Downstream blocks #3, #4, and #5 immediately failed verification (<span style={{ color: "var(--fail)", fontWeight: 700 }}>HASH MISMATCH</span>), proving that no verdict or measurement can ever be forged or modified undetected.
            </div>
          </div>
        </div>
      )}

      {/* Centered 880px Chain Rail */}
      <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "24px" }}>
        {blocks.map((block, idx) => {
          const isFailing = isTampered && block.index >= 2;
          const isTamperedTarget = isTampered && block.index === 2;

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
                      {block.time}
                    </span>

                    {isFailing ? (
                      <span className="chip fail" style={{ fontWeight: 700 }}>
                        <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        HASH MISMATCH
                      </span>
                    ) : (
                      <span className="chip pass">
                        <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Verified
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
                      {block.prevHash}
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
                        ? "45a89df0123bc890192389102389019238901238901238901234e890123890ff [MUTATED HASH]"
                        : isFailing
                        ? `${block.entryHash.slice(0, 48)}... [CASCADE MISMATCH]`
                        : block.entryHash}
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
                          _expected_score: 0.96,
                        }
                      : block.payload,
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Chain Link (Down Arrow) */}
              {idx < blocks.length - 1 && (
                <div
                  className="link"
                  style={{
                    color: isTampered && idx >= 1 ? "var(--fail)" : "var(--ink3)",
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
