"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Stage {
  no: string;
  name: string;
  tool: string;
  time: string;
  detail: string;
  command: string;
}

const STAGES: Stage[] = [
  {
    no: "01",
    name: "Baseline Profile",
    tool: "cProfile + pyperf",
    time: "4.2s",
    detail: "Profiles pinned commit across 5,000 requests. Establishes p95 baseline (428ms), query frequency (5,001) and memory growth.",
    command: "proofstack profile --target orders.py --iterations 5000",
  },
  {
    no: "02",
    name: "Hypotheses Generation",
    tool: "Nemotron-3-Super 120B",
    time: "1.8s",
    detail: "Synthesizes three rival optimization strategies: (A) Redis in-memory cache, (B) SQL batch JOIN eager load, (C) async coroutine worker.",
    command: "nebius.chat.completions.create(model='nemotron-3-super')",
  },
  {
    no: "03",
    name: "Sandbox Probing",
    tool: "Firecracker MicroVM",
    time: "8.6s",
    detail: "Spins up 3 isolated rootless microVM sandboxes with network=none, 1GB RAM cap, and 60-second kill switch.",
    command: "microvm exec --jail --network=none candidate_b.py",
  },
  {
    no: "04",
    name: "Patch Synthesis",
    tool: "Nemotron-3.5-Lightning",
    time: "1.1s",
    detail: "Synthesizes hardened patch for Candidate B. AST boundary verified to ensure no lockfile changes or weakened types.",
    command: "proofstack synth --candidate B --enforce-types",
  },
  {
    no: "05",
    name: "Verdict & Ledger Seal",
    tool: "8-Gate Sentinel + SHA-256",
    time: "0.4s",
    detail: "Executes G0-G7 invariant checks. Signs non-repudiable audit block #4 into the immutable SHA-256 ledger chain.",
    command: "proofstack seal --block 4 --hash-algo sha256",
  },
];

export default function PipelineVisual() {
  const [selected, setSelected] = useState<number>(0);

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
      {/* Horizontal Steps Navigator */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          position: "relative",
        }}
      >
        {STAGES.map((s, idx) => {
          const isCurrent = selected === idx;
          return (
            <motion.div
              key={s.no}
              onClick={() => setSelected(idx)}
              whileHover={{ y: -2 }}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                border: `1px solid ${isCurrent ? "rgba(233, 229, 218, 0.4)" : "var(--line)"}`,
                background: isCurrent ? "rgba(233, 229, 218, 0.08)" : "rgba(10, 10, 9, 0.6)",
                cursor: "pointer",
                transition: "all 0.25s ease",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: isCurrent ? "var(--ink)" : "var(--ink3)" }}>
                  STAGE {s.no}
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    color: "var(--ink3)",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  {s.time}
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginBottom: "3px" }}>
                {s.name}
              </div>

              <div style={{ fontSize: "11px", color: "var(--ink2)", fontFamily: "var(--f-mono)" }}>
                {s.tool}
              </div>

              {isCurrent && (
                <motion.div
                  layoutId="pipelinePill"
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: "14px",
                    right: "14px",
                    height: "2px",
                    background: "var(--ink)",
                    borderRadius: "1px",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Stage Detail Visualizer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: "calc(20 * var(--u))",
            padding: "18px 22px",
            borderRadius: "10px",
            background: "rgba(10, 10, 9, 0.8)",
            border: "1px solid var(--line)",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: "var(--pass)" }}>
                ● STAGE {STAGES[selected].no} INSPECTOR
              </span>
              <span style={{ color: "var(--ink3)", fontSize: "11px" }}>·</span>
              <span style={{ fontSize: "12px", color: "var(--ink2)" }}>{STAGES[selected].tool}</span>
            </div>

            <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.7, margin: "0 0 12px" }}>
              {STAGES[selected].detail}
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "var(--ink2)" }}>
                Duration: {STAGES[selected].time}
              </span>
              <span style={{ fontSize: "11px", fontFamily: "var(--f-mono)", padding: "3px 8px", borderRadius: "4px", background: "rgba(127,174,122,0.12)", color: "var(--pass)" }}>
                Status: Deterministic
              </span>
            </div>
          </div>

          {/* Terminal Box */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "8px",
              background: "#050504",
              border: "1px solid rgba(233, 229, 218, 0.12)",
              fontFamily: "var(--f-mono)",
              fontSize: "11px",
              color: "var(--ink)",
              overflowX: "auto",
            }}
          >
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5F56" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <div style={{ color: "var(--ink3)", marginBottom: "4px" }}># Command Line Execution</div>
            <div style={{ color: "var(--ink)", wordBreak: "break-all" }}>
              $ {STAGES[selected].command}
            </div>
            <div style={{ color: "var(--pass)", marginTop: "8px" }}>
              ✓ Completed with exit code 0
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
