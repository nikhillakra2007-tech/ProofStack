"use client";

import React from "react";

export default function PhilosophyVisual() {
  return (
    <div
      style={{
        marginTop: "calc(36 * var(--u))",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        width: "100%",
      }}
      data-rv
    >
      {/* Box 1: Without ProofStack (The Risk) */}
      <div
        style={{
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid rgba(194, 107, 94, 0.25)",
          background: "linear-gradient(180deg, rgba(194, 107, 94, 0.05) 0%, rgba(14, 14, 12, 0.4) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fail)",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(194, 107, 94, 0.12)",
              border: "1px solid rgba(194, 107, 94, 0.25)",
            }}
          >
            Unverified AI Workflow
          </span>
          <span style={{ fontSize: "12px", color: "var(--fail)" }}>High Risk</span>
        </div>

        <h3 style={{ fontSize: "16px", fontWeight: 500, color: "var(--ink)", margin: "0 0 10px" }}>
          Optimizing for Benchmark, Ignoring Security
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {[
            { title: "Naive Speedup", desc: "Caches responses without checking tenant IDs (+1000% speed, massive IDOR breach)." },
            { title: "Silent Weakening", desc: "Removes defensive timeouts or lock boundaries to avoid mock test failures." },
            { title: "Unchecked Deployment", desc: "Code ships straight to production because raw synthetic benchmarks look green." },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                padding: "8px 10px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.25)",
                fontSize: "12px",
                color: "var(--ink2)",
              }}
            >
              <span style={{ color: "var(--fail)", fontWeight: 700, flexShrink: 0 }}>✕</span>
              <div>
                <strong style={{ color: "var(--ink)", display: "block" }}>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Box 2: With ProofStack (Deterministic Guard) */}
      <div
        style={{
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid rgba(127, 174, 122, 0.3)",
          background: "linear-gradient(180deg, rgba(127, 174, 122, 0.05) 0%, rgba(14, 14, 12, 0.4) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--pass)",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(127, 174, 122, 0.12)",
              border: "1px solid rgba(127, 174, 122, 0.25)",
            }}
          >
            ProofStack Deterministic Engine
          </span>
          <span style={{ fontSize: "12px", color: "var(--pass)" }}>Zero-Compromise</span>
        </div>

        <h3 style={{ fontSize: "16px", fontWeight: 500, color: "var(--ink)", margin: "0 0 10px" }}>
          The Model Proposes. Deterministic Code Decides.
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {[
            { title: "Rootless MicroVM Sandbox", desc: "No internet access, strict 60s CPU timeout and 1GB memory cap per candidate." },
            { title: "8 Invariant Verification Gates", desc: "IDOR oracles, ReDoS fuzzers, SQL safety, memory leak detectors all must pass." },
            { title: "Cryptographic SHA-256 Seal", desc: "Tamper-evident audit chain anchors every verdict with non-repudiable proof." },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                padding: "8px 10px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.25)",
                fontSize: "12px",
                color: "var(--ink2)",
              }}
            >
              <span style={{ color: "var(--pass)", fontWeight: 700, flexShrink: 0 }}>✓</span>
              <div>
                <strong style={{ color: "var(--ink)", display: "block" }}>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
