"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Binary, Shield, CheckCircle2, AlertTriangle, 
  Download, ArrowRight, Lock, Key, FileCheck, RefreshCw,
  ExternalLink, ShieldAlert, Award
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
  const { session, activeMember } = useAuth();
  const [tamperTriggered, setTamperTriggered] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const initialBlocks: MerkleBlock[] = [
    {
      blockNumber: 9482,
      timestamp: "2026-10-28 17:41:04 UTC",
      remediationTarget: "CWE-639 (IDOR Tenant Isolation Invariant)",
      blockHash: "0x4e8a1d2f9b8c3a7e6d5f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
      prevHash: "0x3f7b0c1e8a9d2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      status: "verified",
      signer: "Ed25519-HSM#4019",
    },
    {
      blockNumber: 9481,
      timestamp: "2026-10-28 16:18:12 UTC",
      remediationTarget: "CWE-89 (SQL Injection Parameterized Binding)",
      blockHash: "0x3f7b0c1e8a9d2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      prevHash: "0x2e6a9d0f7b8c1e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
      status: "verified",
      signer: "Ed25519-HSM#4019",
    },
    {
      blockNumber: 9480,
      timestamp: "2026-10-28 14:04:55 UTC",
      remediationTarget: "CWE-918 (SSRF Egress DNS Rebinding Guard)",
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
                ? "0xDEADBEEF_TAMPER_DETECTED_HASH_CHAIN_BROKEN_AT_BLOCK_9481"
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Role Identification Banner */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "320px", height: "320px", background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="chip brand" style={{ fontSize: "11px", padding: "4px 10px" }}>
                <Binary className="w-3.5 h-3.5" />
                <span>ROLE PORTAL • SECURITY AUDITOR</span>
              </span>
              <span className="chip pass" style={{ fontSize: "10.5px" }}>
                Signer: {activeMember?.name || "Elena Rostova"} (Ed25519-HSM#4019)
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleExportAuditPack}
                className="btn sm acc"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadSuccess ? "Audit Pack Exported!" : "Export Cryptographic Audit"}</span>
              </button>
              <Link href="/ledger" className="btn sm sec" style={{ textDecoration: "none" }}>
                <span>Ledger Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--heading-primary)", letterSpacing: "-0.02em" }}>
              Cryptographic Assurance &amp; SHA-256 Merkle Ledger Audit
            </h1>
            <p style={{ margin: 0, color: "var(--ink2)", fontSize: "13.5px", maxWidth: "800px", lineHeight: 1.55 }}>
              Authorized for mathematical proof of remediation, hardware Ed25519 non-repudiation seals, and automated SOC 2 / FedRAMP audit trail validation.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Current Block Height</div>
              <div className="mono" style={{ fontSize: "14px", fontWeight: 700, color: "var(--heading-primary)", marginTop: "2px" }}>#9482 SEALED</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Chain Health</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: tamperTriggered ? "var(--fail)" : "var(--pass)", marginTop: "2px" }}>
                {tamperTriggered ? "❌ Chain Broken (Block #9481)" : "✓ 100% Cryptographically Valid"}
              </div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Attestation Hardware</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", marginTop: "2px" }}>YubiHSM2 Root Vault #04</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Compliance Mapping</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginTop: "2px" }}>SOC 2 · FedRAMP · ISO 27001</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Merkle Chain Inspector & Adversary Bit-Flip Simulator */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--heading-primary)" }}>
                Cryptographic Block Trail &amp; Tamper Verification
              </h2>
              <span className={`chip ${tamperTriggered ? "fail" : "pass"}`} style={{ fontSize: "10px" }}>
                {tamperTriggered ? "Tamper Detected" : "Append-Only Chain"}
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--ink3)" }}>
              Every remediation outcome is canonicalized into JSON, hashed with SHA-256, and linked via parent hash pointers
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateTamper}
            className={`btn sm ${tamperTriggered ? "danger" : "sec"}`}
            style={{ minWidth: "210px", justifyContent: "center" }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{tamperTriggered ? "Reset Tamper Injection" : "Simulate Adversary Bit-Flip"}</span>
          </button>
        </div>

        {/* Tamper Alert Callout if triggered */}
        {tamperTriggered && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid var(--fail)", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <ShieldAlert className="w-5 h-5" style={{ color: "var(--fail)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <b style={{ color: "var(--fail)", fontSize: "13px" }}>AUTOMATIC DEPLOYMENT QUARANTINE TRIGGERED</b>
              <p style={{ margin: "3px 0 0 0", color: "var(--ink)", fontSize: "12px", lineHeight: 1.5 }}>
                Adversary modified bytecode in Block #9481. Merkle root signature invalidated: calculated hash does not match stored block pointer. Downstream CI/CD merge gates have been halted.
              </p>
            </div>
          </div>
        )}

        {/* Blocks List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {blocks.map((b) => (
            <div
              key={b.blockNumber}
              style={{
                borderRadius: "8px",
                padding: "12px 16px",
                background: b.status === "tampered" ? "rgba(239, 68, 68, 0.06)" : "var(--surface2)",
                border: b.status === "tampered" ? "1px solid var(--fail)" : "1px solid var(--line)",
                transition: "all 120ms ease"
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)" }}>
                    Block #{b.blockNumber}
                  </span>
                  <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--heading-primary)" }}>
                    {b.remediationTarget}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={`chip ${b.status === "tampered" ? "fail" : "pass"}`} style={{ fontSize: "9.5px" }}>
                    {b.status === "tampered" ? "Tamper Detected" : "Cryptographically Verified"}
                  </span>
                  <span className="mono" style={{ fontSize: "10.5px", color: "var(--ink3)" }}>
                    {b.timestamp}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "6px", fontSize: "11px" }}>
                <div className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--ink3)" }}>Current Hash: </span>
                  <span style={{ color: b.status === "tampered" ? "var(--fail)" : "var(--ink)", fontWeight: 600 }}>{b.blockHash}</span>
                </div>
                <div className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--ink3)" }}>Parent Hash: </span>
                  <span style={{ color: "var(--ink2)" }}>{b.prevHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Formal Compliance & Governance Mapping */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0", color: "var(--heading-primary)" }}>
          Enterprise Governance &amp; Compliance Assertions
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <b style={{ fontSize: "13px", color: "var(--heading-primary)" }}>SOC 2 Type II Compliance</b>
              <span className="chip pass" style={{ fontSize: "9.5px" }}>Active</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--ink2)", lineHeight: 1.5 }}>
              Security &amp; Confidentiality: All patch authorizations are mathematically sealed with non-repudiation timestamps.
            </p>
          </div>

          <div style={{ padding: "12px", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <b style={{ fontSize: "13px", color: "var(--heading-primary)" }}>FedRAMP High Mapping</b>
              <span className="chip pass" style={{ fontSize: "9.5px" }}>Enforced</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--ink2)", lineHeight: 1.5 }}>
              Boundary Protection &amp; Incident Response: Ephemeral container sandboxes isolate dynamic exploit probe replays.
            </p>
          </div>

          <div style={{ padding: "12px", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <b style={{ fontSize: "13px", color: "var(--heading-primary)" }}>ISO/IEC 27001 Cryptographic Controls</b>
              <span className="chip pass" style={{ fontSize: "9.5px" }}>Verified</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--ink2)", lineHeight: 1.5 }}>
              Annex A.10 Cryptography: SHA-256 Merkle chain guarantees tamper detection and irreversible provenance tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
